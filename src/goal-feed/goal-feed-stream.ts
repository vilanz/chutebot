/* eslint-disable class-methods-use-this */
import { Snowflake, TextChannel } from "discord.js";
import { logger } from "../core/log";
import {
  TweetStream,
  resetChannelRules,
  getTweetStream,
  deleteChannelRules,
  getAllRules,
} from "./twitter-api";
import { waitSeconds } from "../core/utils";
import { getChannel } from "../core/discord";
import { sendTweetToSubbedChannels } from "./twitter-api/send-streamed-tweet";

export const STREAM_STOPPED_BY_COMMAND = "stopped with c!goalfeed stop";
const STREAM_RESTARTED = "restarted";

export class GoalFeedStream {
  private tweetStream: TweetStream | null = null;

  destroyTweetStream(reason: string): void {
    this.tweetStream?.destroy(new Error(reason));
  }

  streamUp(): boolean {
    return !!this.tweetStream && !this.tweetStream.destroyed;
  }

  async subscribeToChannel(channel: TextChannel, rule: string): Promise<void> {
    await resetChannelRules(channel.id, rule);
  }

  async unsubscribeToChannel(channel: TextChannel): Promise<void> {
    await deleteChannelRules(channel.id);
  }

  async getSubbedChannels(): Promise<{ ch: TextChannel | null; rule: string }[]> {
    const allRules = await getAllRules();
    return Promise.all(
      allRules
        .map(async (rule) => ({
          ch: await getChannel(rule.tag as Snowflake).catch(() => null),
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

    let reconnectTimeout = 0;
    const reconnectToTweetStream = async () => {
      reconnectTimeout += 1;

      const sleepDuration = 2 ** reconnectTimeout;
      logger.warn("tweet stream will restart in %s seconds", sleepDuration);
      await waitSeconds(sleepDuration);
      this.destroyTweetStream(STREAM_RESTARTED);

      await this.streamTweets();
    };

    this.tweetStream?.on("error", async (err) => {
      const reason = err?.message;
      if (reason === STREAM_STOPPED_BY_COMMAND) {
        logger.info("successfully stopped tweet stream");
      } else if (reason === STREAM_RESTARTED) {
        logger.info("stream will restart");
      } else {
        logger.error("streaming error (likely a timeout or restart)", err);
        await reconnectToTweetStream();
      }
    });

    this.tweetStream?.on("data", async (buffer: Buffer) => {
      await sendTweetToSubbedChannels({
        buffer,
        reconnect: () => this.streamTweets(),
      });
    });
  }
}
