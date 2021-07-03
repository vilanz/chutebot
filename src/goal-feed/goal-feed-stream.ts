/* eslint-disable class-methods-use-this */
import { Snowflake, TextChannel } from "discord.js";
import { logger } from "../core/log";
import {
  TweetStream,
  getTweetVideoUrl,
  resetChannelRules,
  getTweetStream,
  getChannelRules,
} from "./twitter-api";
import { waitSeconds } from "../core/utils";
import { getChannel } from "../core/discord";

export const STREAM_STOPPED_BY_COMMAND = "stopped with c!goalfeed stop";
const STREAM_RESTARTED = "restarted";

export class GoalFeedStream {
  private channelSubscriptions = new Set<Snowflake>();

  private tweetStream: TweetStream | null = null;

  destroyTweetStream(reason: string): void {
    this.tweetStream?.destroy(new Error(reason));
  }

  streamUp(): boolean {
    return !!this.tweetStream && !this.tweetStream.destroyed;
  }

  resetChannelRules(channel: TextChannel, rule: string): Promise<void> {
    return resetChannelRules(channel.id, rule);
  }

  subscribeToChannel(channel: TextChannel): void {
    this.channelSubscriptions.add(channel.id);
  }

  unsubscribeToChannel(channel: TextChannel): void {
    this.channelSubscriptions.delete(channel.id);
  }

  async getSubbedChannels(): Promise<{ ch: TextChannel; rule: string }[]> {
    const subbedChannelRules = await getChannelRules([
      ...this.channelSubscriptions,
    ]);
    return Promise.all(
      subbedChannelRules
        .filter((rule) => !!rule.tag)
        .map(async (rule) => ({
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

    let reconnectTimeout = 0;
    const reconnectToTweetStream = async () => {
      reconnectTimeout += 1;

      const sleepDuration = 2 ** reconnectTimeout;
      logger.warn("tweet stream in will sleep for %s seconds", {
        streamUp: this.streamUp,
      });
      await waitSeconds(sleepDuration);
      this.destroyTweetStream(STREAM_RESTARTED);

      await this.streamTweets();
    };

    this.tweetStream?.on("error", async (err) => {
      const reason = err?.message;
      if (reason === STREAM_STOPPED_BY_COMMAND) {
        logger.info("successfully stopped tweet stream!");
        return;
      }
      logger.error("streaming error (likely a timeout or restart)", err);
      await reconnectToTweetStream();
    });

    this.tweetStream?.on("data", async (buffer: Buffer) => {
      let json: any;
      try {
        json = JSON.parse(buffer.toString());
      } catch (e) {
        // just a heartbeat signal, it's fine
        return;
      }

      // TODO type this correctly

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { connection_issue, data, matching_rules } = json;

      const matchedChannels = [...this.channelSubscriptions].filter(
        (channelId) =>
          matching_rules.some((rule: any) => rule.tag === channelId)
      );

      if (!matchedChannels.length) {
        logger.warn("tweet did not match any channel", { json });
        return;
      }

      if (connection_issue) {
        logger.error("connection issue with a tweet stream", { json });
        await reconnectToTweetStream();
        return;
      }

      if (!data) {
        logger.error("likely tweet stream authentication error: %s", json);
        return;
      }

      const tweetTextWithoutSpaces = data.text
        .replace(/https:\/\/t\.co\/\w+/g, "")
        .replace(/^[ ]+|[ ]+$/g, "");

      const mp4Url = await getTweetVideoUrl(data.id);

      await Promise.all(
        matchedChannels.map(async (channelId) => {
          const channel = await getChannel(channelId);
          await channel.send(`**${tweetTextWithoutSpaces}** ${mp4Url}`);
        })
      );
    });
  }
}
