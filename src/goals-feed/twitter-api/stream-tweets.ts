import { IncomingMessage } from "http";
import { mapAxiosData, twitterNewAPI } from "./axios";

export type TweetStream = IncomingMessage;

export const getTweetStream = async (): Promise<TweetStream> =>
  twitterNewAPI
    .get<TweetStream>(`/tweets/search/stream`, {
      responseType: "stream",
      headers: {
        "User-Agent": "v2FilterStreamJS",
      },
      timeout: 31000,
    })
    .then(mapAxiosData);
