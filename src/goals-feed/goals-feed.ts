/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { Snowflake, TextChannel } from "discord.js";
import { logger } from "../core/log";
import {
  getTweetStream,
  TweetStream,
  getTweetVideoUrl,
  deleteRules,
  addRule,
} from "./twitter-api";
import { waitSeconds } from "../core/utils";

const STREAM_STOPPED_BY_COMMAND = "stopped with c!goalfeed stop";

const streamDown = (tweetStream: TweetStream | null): boolean =>
  !tweetStream || tweetStream.destroyed;

class ChannelGoalFeed {
  channel: TextChannel;

  tweetStream: TweetStream;

  constructor(channel: TextChannel, tweetStream: TweetStream) {
    this.channel = channel;
    this.tweetStream = tweetStream;
  }

  async resetRules(rule: string) {
    await deleteRules(this.channel.id);
    if (rule.trim()) {
      await addRule(this.channel.id, rule);
    }
  }

  async streamTweets() {
    if (streamDown(this.tweetStream)) {
      return;
    }

    logger.error("starting to stream tweets");

    let reconnectTimeout = 0;
    const reconnectToTweetStream = async () => {
      if (streamDown(this.tweetStream)) {
        return;
      }

      reconnectTimeout += 1;

      const sleepDuration = 2 ** reconnectTimeout;
      logger.warn(
        "tweet stream in %s will sleep for %s seconds",
        this.channel.id,
        sleepDuration
      );
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

      // TODO type this correctly
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { connection_issue, data, matching_rules } = json;

      if (!matching_rules.some((rule: any) => rule.tag === this.channel.id)) {
        return;
      }

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

      await this.channel.send(`**${tweetTextWithoutSpaces}** ${mp4Url}`);
    });
  }
}

export class GoalFeedStream {
  tweetStream: TweetStream | null = null;

  goalFeedMap = new Map<Snowflake, ChannelGoalFeed>();

  async addGoalFeedToChannel(channel: TextChannel): Promise<ChannelGoalFeed> {
    if (streamDown(this.tweetStream)) {
      logger.info(
        "starting tweet stream (destroyed: %s)",
        this.tweetStream?.destroyed
      );
      this.tweetStream = await getTweetStream();
    }

    const existingGoalFeed = this.goalFeedMap.get(channel.id);
    if (existingGoalFeed) {
      return existingGoalFeed;
    }

    const newGoalFeed = new ChannelGoalFeed(channel, this.tweetStream!);
    this.goalFeedMap.set(channel.id, newGoalFeed);
    return newGoalFeed;
  }
}
