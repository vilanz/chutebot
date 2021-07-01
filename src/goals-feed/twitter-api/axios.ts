import axios, { AxiosError, AxiosResponse } from "axios";
import { fromUnixTime } from "date-fns";
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

const logResponseRateLimit = (res: AxiosResponse) => {
  const resetUnixTime = res.headers["x-rate-limit-reset"];
  logger.info(
    "rate limit info for %s: %s remaining out of %s (reset in %s seconds)",
    res.config.url,
    res.headers["x-rate-limit-remaining"],
    res.headers["x-rate-limit-limit"],
    resetUnixTime ? fromUnixTime(resetUnixTime).toISOString() : "n/a"
  );
};

twitterNewAPI.interceptors.response.use(
  (response) => {
    logResponseRateLimit(response);
    return response;
  },
  (err) => {
    const axiosErr = err as AxiosError;
    if (axiosErr.isAxiosError && axiosErr.response) {
      logResponseRateLimit(axiosErr.response);
    }
    return err;
  }
);
