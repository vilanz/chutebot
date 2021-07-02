import { Message } from "discord.js";
import { logger } from "../core/log";
import { getChannel, BR_TEAMS_CHANNEL } from "../core/discord";
import {
  addRules,
  deleteAllRules,
  getTweetStream,
  TweetStream,
  getTweetVideoUrl,
} from "./twitter-api";
import { waitSeconds } from "../core/utils";

// TODO not use a local variable for this
let tweetStream: TweetStream | null = null;

const streamTweets = async () => {
  if (!tweetStream || tweetStream.destroyed) {
    return;
  }

  const brazilianFootballChannel = await getChannel(BR_TEAMS_CHANNEL);

  let reconnectTimeout = 0;
  const reconnectToTweetStream = async () => {
    if (!tweetStream || tweetStream.destroyed) {
      return;
    }

    reconnectTimeout += 1;

    const sleepDuration = 2 ** reconnectTimeout;
    logger.warn("tweet stream will sleep for %s seconds", sleepDuration);
    await waitSeconds(sleepDuration);
    tweetStream.destroy(new Error("just reconnecting"));

    void streamTweets();
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

export const streamGoalsFeed = async (message: Message) => {
  await deleteAllRules();
  await addRules([
    {
      value: "from:goleada_info has:videos",
      id: "goleada_info tweets",
    },
  ]);

  tweetStream = await getTweetStream();
  void message.react("👍");

  void streamTweets();
};

export const stopGoalsFeed = async (message: Message) => {
  if (tweetStream && !tweetStream.destroyed) {
    tweetStream.destroy(new Error("matamo"));
    void message.react("👍");
  }
  tweetStream = null;
};
