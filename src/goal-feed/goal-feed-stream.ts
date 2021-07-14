/* eslint-disable max-classes-per-file */
import { Snowflake, TextChannel } from "discord.js";
import { logger } from "../core/log";
import {
  TweetStream,
  resetChannelRules,
  getTweetStream,
  deleteChannelRules,
  getAllRules,
  sendTweetToSubbedChannels,
} from "./twitter-api";
import { waitSeconds } from "../core/utils";
import { getChannel } from "../core/discord";

class StreamKilledError extends Error {}
class StreamRestartedError extends Error {}

class GoalFeedStream {
  private tweetStream: TweetStream | null = null;

  private reconnectTimeout: number = 0;

  streamUp(): boolean {
    return !!this.tweetStream && !this.tweetStream.destroyed;
  }

  async subscribeToChannel(channelId: Snowflake, rule: string): Promise<void> {
    await resetChannelRules(channelId, rule);
  }

  async unsubscribeToChannel(channelId: Snowflake): Promise<void> {
    await deleteChannelRules(channelId);
  }

  async getSubbedChannels(): Promise<
    { ch: TextChannel | null; rule: string }[]
  > {
    const allRules = await getAllRules();
    return Promise.all(
      allRules.map(async (rule) => ({
        ch: await getChannel(rule.tag as Snowflake),
        rule: rule.value,
      }))
    );
  }

  async streamTweets(): Promise<void> {
    if (this.streamUp()) {
      logger.warn("already had a tweet stream up");
      return;
    }

    logger.info("starting to stream tweets");

    this.tweetStream = await getTweetStream();

    const reconnectToTweetStream = async () => {
      const sleepDuration = 2 ** this.reconnectTimeout;
      logger.warn(
        "tweet stream scheduled to restart in %d seconds",
        sleepDuration
      );

      await waitSeconds(sleepDuration);

      this.reconnectTimeout += 1;
      this.destroyTweetStream(new StreamRestartedError());
    };

    this.tweetStream?.on("error", async (err) => {
      if (err instanceof StreamKilledError) {
        logger.info("successfully killed tweet stream");
        return;
      }
      if (err instanceof StreamRestartedError) {
        logger.info("tweet stream will restart");
        await this.streamTweets();
        return;
      }
      logger.error("tweet stream error", err);
      await reconnectToTweetStream();
    });

    this.tweetStream?.on("data", async (buffer: Buffer) => {
      await sendTweetToSubbedChannels({
        buffer,
        reconnect: reconnectToTweetStream,
      });
    });
  }

  killTweetStream() {
    this.destroyTweetStream(new StreamKilledError());
  }

  private destroyTweetStream(error: Error): void {
    this.tweetStream?.destroy(error);
  }
}

export const goalFeedStream = new GoalFeedStream();
