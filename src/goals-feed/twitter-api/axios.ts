import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { fromUnixTime } from "date-fns";
import { env } from "../../core/env";
import { logger } from "../../core/log";

const throwOnErrors = (instance: AxiosInstance) =>
  instance.interceptors.response.use(
    (response) => {
      logger.info("twitter res %s %s", response.config.url, response.status);
      return response;
    },
    (error) => {
      logger.info("twitter err %s", error?.response?.status);
      return Promise.reject(error);
    }
  );

const BEARER_TOKEN_HEADER = {
  Authorization: `Bearer ${env.TWITTER_BEARER_TOKEN}`,
};

export const twitterNewAPI = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: BEARER_TOKEN_HEADER,
});
throwOnErrors(twitterNewAPI);

// needed to get a video's MP4 URL
export const twitterOldAPI = axios.create({
  baseURL: "https://api.twitter.com/1.1",
  headers: BEARER_TOKEN_HEADER,
});
throwOnErrors(twitterOldAPI);

export const mapAxiosData = (res: AxiosResponse) => res.data;

const logResponseRateLimit = (res: AxiosResponse) => {
  const resetUnixTime = res.headers["x-rate-limit-reset"];
  logger.info(
    "rate limit info for %s: %s remaining out of %s (reset in %s)",
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
