import { Message } from "discord.js";
import { logger } from "../core/log";
import { getChannel, BR_TEAMS_CHANNEL } from "../core/discord";
import { getTweetStream, TweetStream, getTweetVideoUrl } from "./twitter-api";
import { waitSeconds } from "../core/utils";

const STREAM_STOPPED_BY_COMMAND = "stopped with c!goalfeed stop";

export class GoalFeedStream {
  tweetStream: TweetStream | null = null;

  noStream(): boolean {
    return !this.tweetStream || this.tweetStream.destroyed;
  }

  async startGoalsFeed(message: Message) {
    this.tweetStream = await getTweetStream();
    await message.react("👍");
    await this.streamTweets();
  }

  async stopGoalsFeed(message: Message) {
    this.tweetStream?.destroy(new Error(STREAM_STOPPED_BY_COMMAND));
    if (this.tweetStream?.destroyed) {
      await message.react("👍");
    }
  }

  async streamTweets() {
    if (this.noStream()) {
      return;
    }

    logger.error("starting to stream tweets");

    const brazilianFootballChannel = await getChannel(BR_TEAMS_CHANNEL);

    let reconnectTimeout = 0;
    const reconnectToTweetStream = async () => {
      if (this.noStream()) {
        return;
      }

      reconnectTimeout += 1;

      const sleepDuration = 2 ** reconnectTimeout;
      logger.warn("tweet stream will sleep for %s seconds", sleepDuration);
      await waitSeconds(sleepDuration);
      this.tweetStream?.destroy(new Error("just reconnecting"));

      await this.streamTweets();
    };

    this.tweetStream?.on("error", async (err) => {
      if (err?.message === STREAM_STOPPED_BY_COMMAND) {
        logger.info("stopped tweet streaming successfully");
        return;
      }
      logger.error("streaming error (likely a timeout)", err);
      await reconnectToTweetStream();
    });

    this.tweetStream?.on("data", async (buffer: Buffer) => {
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

      await brazilianFootballChannel.send(
        `**${tweetTextWithoutSpaces}** ${mp4Url}`
      );
    });
  }
}
