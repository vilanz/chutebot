import axios, { AxiosResponse } from "axios";
import { env } from "../../core/env";
import { logger } from "../../core/log";

const BEARER_TOKEN_HEADER = {
  Authorization: `Bearer ${env.TWITTER_BEARER_TOKEN}`,
};

export const twitterNewAPI = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: BEARER_TOKEN_HEADER,
});

// needed to get a video's MP4 URL
export const twitterOldAPI = axios.create({
  baseURL: "https://api.twitter.com/1.1",
  headers: BEARER_TOKEN_HEADER,
});

export const mapAxiosData = (res: AxiosResponse) => res.data;

twitterNewAPI.interceptors.response.use((response) => {
  logger.info(
    "Rate limit remaining for Twitter v2: %s",
    response.headers["x-rate-limit-remaining"]
  );
  return response;
});
