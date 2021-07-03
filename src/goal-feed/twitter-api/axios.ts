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

export const mapAxiosData = <T>(res: AxiosResponse<T>) => res.data;

const logResponseData = (res: AxiosResponse) => {
  const resetUnixTime = res.headers["x-rate-limit-reset"];
  logger.info("twitter request", {
    url: res.config.url,
    method: res.config.method,
    data: res.data,
    status: res.status,
    rateLimitLimit: res.headers["x-rate-limit-limit"],
    rateLimitRemaining: res.headers["x-rate-limit-remaining"],
    rateLimitReset: resetUnixTime
      ? fromUnixTime(resetUnixTime).toISOString()
      : "n/a",
  });
};

twitterNewAPI.interceptors.response.use(
  (response) => {
    logResponseData(response);
    return response;
  },
  (err) => {
    const axiosErr = err as AxiosError;
    if (axiosErr.isAxiosError && axiosErr.response) {
      logResponseData(axiosErr.response);
    }
    return err;
  }
);
