import { ReadStream } from "fs";
import { logger } from "../../core/log";
import { twitterNewAPI } from "./axios";

// TODO get a better type
export type TweetStream = ReadStream;

export const getTweetStream = async (): Promise<TweetStream | null> => {
  const res = await twitterNewAPI.get<ReadStream>(`/tweets/search/stream`, {
    responseType: "stream",
    headers: {
      "User-Agent": "v2FilterStreamJS",
    },
    timeout: 31000,
  });

  if (res.status !== 200) {
    logger.warn(
      "Couldn't get tweet stream (%s %s)",
      res.status,
      res.statusText
    );
    return null;
  }

  return res.data;
};
