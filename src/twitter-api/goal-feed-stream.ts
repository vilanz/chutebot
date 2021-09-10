/* eslint-disable max-classes-per-file */
import { Snowflake } from "discord.js";
import { logger } from "../log";
import { waitSeconds } from "../utils";
import { sendBotspamMessage } from "../discord";
import {
  deleteChannelRules,
  getAllRules,
  resetChannelRules,
  TwitterRule,
} from "./stream-rules";
import { getTweetStream, TweetStream } from "./stream-tweets";
import { sendTweetToSubbedChannels } from "./send-streamed-tweet";

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
      logger.warn("[tweet stream] tried to start stream but it was already up");
      return;
    }

    logger.info("[tweet stream] starting");

    this.tweetStream = await getTweetStream();

    const reconnectToTweetStream = async () => {
      const sleepDuration = 2 ** this.reconnectTimeout;
      await sendBotspamMessage(
        `Deu pau na stream de gols, reconexão em ${sleepDuration} segundos 👀`
      );

      logger.warn("[tweet stream] restarting in %d seconds", sleepDuration);

      await waitSeconds(sleepDuration);

      this.reconnectTimeout += 1;

      this.destroyTweetStream();
      await this.streamTweets();
    };

    this.tweetStream?.on("error", async (err) => {
      logger.error("[tweet stream] stream error", err);
      await reconnectToTweetStream();
    });

    this.tweetStream?.on("data", async (buffer: Buffer) => {
      await sendTweetToSubbedChannels({
        buffer,
        reconnect: reconnectToTweetStream,
      });
    });

    this.tweetStream?.on("close", async () => {
      logger.info("[tweet stream] closed");
    });
  }

  killTweetStream() {
    this.destroyTweetStream();
  }

  private destroyTweetStream(): void {
    this.tweetStream?.destroy();
  }
}

export const goalFeedStream = new GoalFeedStream();
