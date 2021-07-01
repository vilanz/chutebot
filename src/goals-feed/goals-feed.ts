import { logger } from "../core/log";
import { BR_FOOTBALL_CHANNEL_ID, getChannel } from "../core/discord";
import {
  addRules,
  deleteAllRules,
  mapAxiosData,
  twitterOldAPI,
} from "./twitter-api";
import { waitSeconds } from "../core/utils";
import { getTweetStream, TweetStream } from "./twitter-api/stream-tweets";

const streamTweets = async (tweetStream: TweetStream) => {
  const brazilianFootballChannel = await getChannel(BR_FOOTBALL_CHANNEL_ID);

  let timeout = 0;
  const reconnectToTweetStream = async () => {
    timeout += 1;

    const sleepDuration = 2 ** timeout;
    logger.warn("will sleep for %s seconds", sleepDuration);
    await waitSeconds(sleepDuration);

    streamTweets(tweetStream);
  };

  tweetStream.on("error", (err) => {
    logger.error("streaming error (likely a timeout)", err);
    reconnectToTweetStream();
  });

  tweetStream.on("data", async (buffer: Buffer) => {
    try {
      const json = JSON.parse(buffer.toString());

      if (json.connection_issue) {
        logger.error("Connection issue: %s", json);
        await reconnectToTweetStream();
        return;
      }

      if (!json.data) {
        logger.error("Likely authentication error: %s", json);
        return;
      }

      const tweetId = json.data.id;
      await twitterOldAPI
        .get(`/statuses/show/${tweetId}.json`)
        .then(mapAxiosData)
        .then((d: any) => {
          const media = d.extended_entities?.media?.[0];
          if (!media) {
            return;
          }

          const variants = media.video_info?.variants;
          if (!variants) {
            return;
          }

          const mp4 = variants
            .filter((x: any) => x.content_type === "video/mp4")
            .reduce((max: any, curr: any) =>
              max.bitrate > curr.bitrate ? max : curr
            );
          if (!mp4) {
            return;
          }

          let msg = json.data.text;
          try {
            msg = msg
              .replace(/https:\/\/t\.co\/\w+/g, "")
              .replace(/^[ ]+|[ ]+$/g, "");
          } catch (e) {
            logger.error(e);
          }

          brazilianFootballChannel.send(`**${msg}** ${mp4.url}`);
        });
    } catch (e) {
      // heartbeat signal, it's fine
    }
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

  await streamTweets(tweetStream);
};
