/* eslint-disable max-classes-per-file */
import { Snowflake } from "discord.js";
import { logger } from "../../core/log";
import { waitSeconds } from "../../core/utils";
import { sendBotspamMessage } from "../../core/discord";
import {
  deleteChannelRules,
  getAllRules,
  resetChannelRules,
  TwitterRule,
} from "./stream-rules";
import { getTweetStream, TweetStream } from "./stream-tweets";
import { sendTweetToSubbedChannels } from "./send-streamed-tweet";

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

  async getSubbedChannelRules(): Promise<TwitterRule[]> {
    return getAllRules();
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
      await sendBotspamMessage(
        `Deu pau na stream de gols, reconexão em ${sleepDuration} segundos 👀`
      );

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
