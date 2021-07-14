import { Snowflake, TextChannel } from "discord.js";
import { getChannel, sendBotspamMessage } from "../../core/discord/helpers";
import { logger } from "../../core/log";
import { TwitterRule } from "./stream-rules";
import { getTweetVideoUrl } from "./twitter-video";

interface HandleTweetStreamData {
  buffer: Buffer;
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

export const sendTweetToSubbedChannels = async ({
  buffer,
  reconnect,
}: HandleTweetStreamData): Promise<void> => {
  const bufferStr = buffer.toString();
  if (bufferStr === "\r\n") {
    // heartbeat signal
    return;
  }

  const json: TweetStreamBufferJSON = JSON.parse(buffer.toString());

  if ("connection_issue" in json) {
    logger.error("connection issue with a tweet stream", { json });
    await reconnect();
    return;
  }

  if ("errors" in json) {
    logger.error("tweet stream error", { json });
    await sendBotspamMessage('Deu erro na stream ao ao buscar vídeos de gols 👀')
    return;
  }

  const tweetTextWithoutSpaces = json.data.text
    .replace(/https:\/\/t\.co\/\w+/g, "")
    .replace(/^[ ]+|[ ]+$/g, "");

  const mp4Url = await getTweetVideoUrl(json.data.id);
  if (!mp4Url) {
    return;
  }

  // TODO clean up this mess
  const matchedChannels: Array<TextChannel | null> = json
    .matching_rules
    .map(rule => getChannel(rule.tag as Snowflake))

  const validMatchedChannels: TextChannel[] = matchedChannels
    .filter(c => c !== null) as TextChannel[] // uuh why do I have to cast this lol

  if (!validMatchedChannels.length) {
    logger.warn("tweet did not match any channel", { json });
    return;
  }

  await Promise.all(
    validMatchedChannels.map(async (channel) => {
      await channel.send(`**${tweetTextWithoutSpaces}** ${mp4Url}`);
    })
  );
};
