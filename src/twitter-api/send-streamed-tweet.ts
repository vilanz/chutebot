import { Snowflake, TextChannel } from "discord.js";
import { getChannel } from "../discord";
import { logger } from "../log";
import { TwitterRule } from "./stream-rules";

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
    logger.error("[tweet stream] stream connection issue", { json });
    await reconnect();
    return;
  }

  if ("errors" in json) {
    logger.error("[tweet stream] stream emitted an json with errors", { json });
    await reconnect();
    return;
  }

  // fxtwitter is the only one that works
  const tweetVideoUrl = `https://twitter.com/geosmina/status/${json.data.id}`;

  const matchedChannels = json.matching_rules
    .map((rule) => getChannel(rule.tag as Snowflake))
    .filter((c): c is TextChannel => c !== null);

  if (!matchedChannels.length) {
    logger.warn("[tweet stream] tweet did not match any channel", { json });
    return;
  }

  matchedChannels.forEach((channel) => {
    void channel.send(tweetVideoUrl);
  });
};
