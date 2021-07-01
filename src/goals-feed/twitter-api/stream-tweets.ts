import { AxiosError } from "axios";
import { IncomingMessage } from "http";
import { ReadStream } from "fs";
import { logger } from "../../core/log";
import { mapAxiosData, twitterNewAPI } from "./axios";

export type TweetStream = IncomingMessage;

export const getTweetStream = async (): Promise<TweetStream | null> => {
  try {
    return await twitterNewAPI
      .get<ReadStream>(`/tweets/search/stream`, {
        responseType: "stream",
        headers: {
          "User-Agent": "v2FilterStreamJS",
        },
        timeout: 31000,
      })
      .then(mapAxiosData);
  } catch (err) {
    const axiosErr = err as AxiosError;
    const { response } = axiosErr;
    logger.error(
      "Couldn't get tweet stream (%s %s)",
      response?.status,
      response?.status
    );
    return null;
  }
};
