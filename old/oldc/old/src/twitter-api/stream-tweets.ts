import { Http2Stream } from "http2";
import { mapAxiosData, twitterNewAPI } from "./axios";

export type TweetStream = Http2Stream;

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
