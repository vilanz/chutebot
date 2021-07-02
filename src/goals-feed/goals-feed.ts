import { logger } from "../core/log";
import { getChannel, BR_TEAMS_CHANNEL } from "../core/discord";
import { addRules, deleteAllRules } from "./twitter-api";
import { waitSeconds } from "../core/utils";
import { getTweetStream, TweetStream } from "./twitter-api/stream-tweets";
import { getTweetVideoUrl } from "./twitter-api/twitter-video";

const streamTweets = async (tweetStream: TweetStream) => {
  const brazilianFootballChannel = await getChannel(BR_TEAMS_CHANNEL);

  let reconnectTimeout = 0;
  const reconnectToTweetStream = async () => {
    reconnectTimeout += 1;

    const sleepDuration = 2 ** reconnectTimeout;
    logger.warn("tweet stream will sleep for %s seconds", sleepDuration);
    await waitSeconds(sleepDuration);
    tweetStream.destroy(new Error("just reconnecting"));

    void streamTweets(tweetStream);
  };

  tweetStream.on("error", async (err) => {
    logger.error("streaming error (likely a timeout)", err);
    await reconnectToTweetStream();
  });

  tweetStream.on("data", async (buffer: Buffer) => {
    let json: any;
    try {
      json = JSON.parse(buffer.toString());
    } catch (e) {
      // heartbeat signal, it's fine
      return;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { connection_issue, data } = json;

    if (connection_issue) {
      logger.error("issue with connecting to a tweet stream: %s", json);
      await reconnectToTweetStream();
      return;
    }

    if (!data) {
      logger.error("likely authentication error: %s", json);
      return;
    }

    const tweetTextWithoutSpaces = data.text
      .replace(/https:\/\/t\.co\/\w+/g, "")
      .replace(/^[ ]+|[ ]+$/g, "");

    const mp4Url = await getTweetVideoUrl(data.id);

    void brazilianFootballChannel.send(
      `**${tweetTextWithoutSpaces}** ${mp4Url}`
    );
  });
};

export const streamGoalsFeed = async () => {
  await deleteAllRules();
  await addRules([
    {
      value: "from:goleada_info has:videos",
      id: "goleada_info tweets",
    },
  ]);

  const tweetStream = await getTweetStream();
  if (!tweetStream) {
    return;
  }

  void streamTweets(tweetStream);
};
