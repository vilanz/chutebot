import { Message } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { ReadStream } from "fs";
import { env } from "../env";
import { logger } from "../log";

const twitter1Api = axios.create({
  baseURL: "https://api.twitter.com/1.1",
  headers: {
    Authorization: `Bearer ${env.TWITTER_BEARER_TOKEN}`,
  },
});

const twitterApi = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: {
    Authorization: `Bearer ${env.TWITTER_BEARER_TOKEN}`,
  },
});

twitterApi.interceptors.response.use((response) => {
  logger.info("rate limit", response.headers["x-rate-limit-remaining"]);
  return response;
});

const mapData = <T>(res: AxiosResponse<T>) => res.data;

interface TwitterRule {
  value: string;
  id: string;
}

const addRules = (rules: TwitterRule[]) =>
  twitterApi.post("/tweets/search/stream/rules", {
    add: rules,
  });

const deleteRules = async () => {
  const allRules = await twitterApi
    .get<{ data: TwitterRule[] }>("/tweets/search/stream/rules")
    .then(mapData);
  if (allRules.data) {
    await twitterApi.post("/tweets/search/stream/rules", {
      delete: {
        ids: allRules.data.map((x) => x.id),
      },
    });
  }
};

interface Tweet {
  data: {
    id: string;
    text: string;
    entities: any;
  };
  includes: {
    media: {
      url: string;
    }[];
  };
}

export const fetchTwitter = async (message: Message) => {
  await deleteRules();
  await addRules([
    /*
    {
      value: "gol from:goleada_info has:videos",
      id: "goleada_info tweets",
    },
    */
    {
      value: "cat has:videos",
      id: "will delete lol",
    },
  ]);

  const stream = await twitterApi
    .get<ReadStream>(`/tweets/search/stream`, {
      responseType: "stream",
      headers: {
        "User-Agent": "v2FilterStreamJS",
      },
      timeout: 20000,
    })
    .then(mapData);

  stream.on("data", async (buffer: Buffer) => {
    const dataStr = buffer.toString();
    try {
      const tweet = JSON.parse(dataStr) as Tweet;
      if (!tweet) {
        return;
      }
      const tweetId = tweet.data.id;
      await twitter1Api
        .get(`/statuses/show/${tweetId}.json`)
        .then(mapData)
        .then((d: any) => {
          const media = d.extended_entities?.media?.[0];
          if (!media) {
            console.log("video has no media");
            return;
          }
          const variants = media.video_info?.variants;
          if (!variants) {
            console.log("video has no variants");
            return;
          }
          const mp4 = variants.find((x: any) => x.content_type === "video/mp4");
          if (!mp4) {
            console.group("video has no mp4");
            return;
          }
          message.reply(mp4.url);
        });
    } catch (e) {
      console.log(e);
    }
  });
};
