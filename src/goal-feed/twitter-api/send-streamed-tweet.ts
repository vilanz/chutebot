import { Snowflake } from "discord.js";
import { getChannel } from "../../core/discord/helpers";
import { logger } from "../../core/log";
import { TwitterRule } from "./stream-rules";
import { getTweetVideoUrl } from "./twitter-video";

interface HandleTweetStreamData {
  buffer: Buffer;
  subbedChannels: Set<Snowflake>;
  reconnect: () => Promise<void>;
}

interface TweetStreamBufferError {
  errors: Array<{
    disconnect_type: string;
    detail: string;
  }>;
}

interface TweetStreamBufferConnectionIssue {
  connection_issue: string;
  detail: string;
}

interface TweetStreamBufferData {
  data: {
    id: string;
    text: string;
  };
  matching_rules: TwitterRule[];
}

type TweetStreamBufferJSON =
  | TweetStreamBufferConnectionIssue
  | TweetStreamBufferData
  | TweetStreamBufferError;

const isConnectionIssue = (
  bufferJSON: TweetStreamBufferJSON
): bufferJSON is TweetStreamBufferConnectionIssue =>
  !!(bufferJSON as TweetStreamBufferConnectionIssue).connection_issue;

const isErrors = (
  bufferJSON: TweetStreamBufferJSON
): bufferJSON is TweetStreamBufferError =>
  !!(bufferJSON as TweetStreamBufferError).errors?.length;

export const sendTweetToSubbedChannels = async ({
  buffer,
  subbedChannels,
  reconnect,
}: HandleTweetStreamData): Promise<void> => {
  const bufferStr = buffer.toString();
  if (bufferStr === "\r\n") {
    // heartbeat signal
    return;
  }

  const json: TweetStreamBufferJSON = JSON.parse(buffer.toString());

  if (isConnectionIssue(json)) {
    logger.error("connection issue with a tweet stream", { json });
    await reconnect();
    return;
  }

  if (isErrors(json)) {
    logger.error("tweet stream error", { json });
    return;
  }

  const matchedChannels = [...subbedChannels].filter((channelId) =>
    json.matching_rules.some((rule: any) => rule.tag === channelId)
  );

  if (!matchedChannels.length) {
    logger.warn("tweet did not match any channel", { json });
    return;
  }

  const tweetTextWithoutSpaces = json.data.text
    .replace(/https:\/\/t\.co\/\w+/g, "")
    .replace(/^[ ]+|[ ]+$/g, "");

  const mp4Url = await getTweetVideoUrl(+json.data.id);
  if (!mp4Url) {
    return;
  }

  await Promise.all(
    matchedChannels.map(async (channelId) => {
      const channel = await getChannel(channelId);
      await channel.send(`**${tweetTextWithoutSpaces}** ${mp4Url}`);
    })
  );
};
