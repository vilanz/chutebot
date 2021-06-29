import { Client, TextChannel } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { ReadStream } from "fs";
import { env } from "../env";
import { logger } from "../log";
import { TEST_CHANNEL_ID } from "../discord";

// TODO clean this terrible mess up

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
  logger.info("rate limit %s", response.headers["x-rate-limit-remaining"]);
  return response;
});

const sleep = async (delay: number) =>
  new Promise((resolve) => setTimeout(() => resolve(true), delay));

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
/*
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
*/

export const fetchTwitter = async (client: Client) => {
  await deleteRules();
  await addRules([
    {
      value: "from:FCYahoo has:videos",
      id: "goleada_info tweets",
    },
    /*
    {
      value: "cat has:videos",
      id: "will delete lol",
    },
    */
  ]);
  const guild = await client.guilds.fetch("299991824091709440");
  if (!guild) {
    logger.error("sem guild");
    return;
  }

  const channel = (await guild.channels.fetch(TEST_CHANNEL_ID)) as TextChannel;

  if (!channel) {
    logger.error("sem channel");
    return;
  }

  const res = await twitterApi.get<ReadStream>(`/tweets/search/stream`, {
    responseType: "stream",
    headers: {
      "User-Agent": "v2FilterStreamJS",
    },
    timeout: 31000,
  });

  if (res.status !== 200) {
    logger.warn("res status %s %s", res.status, res.statusText);
    return;
  }

  const stream = res.data;

  let timeout = 0;

  async function reconnect() {
    timeout += 1;
    await sleep(2 ** timeout * 1000);
    fetchTwitter(client);
  }

  stream.on("data", async (buffer: Buffer) => {
    try {
      const json = JSON.parse(buffer.toString());
      if (json.connection_issue) {
        logger.error("error %s", json);
        reconnect();
      } else if (json.data) {
        const tweetId = json.data.id;
        await twitter1Api
          .get(`/statuses/show/${tweetId}.json`)
          .then(mapData)
          .then((d: any) => {
            const media = d.extended_entities?.media?.[0];
            if (!media) {
              return;
            }
            const variants = media.video_info?.variants;
            if (!variants) {
              return;
            }
            const mp4 = variants.find(
              (x: any) => x.content_type === "video/mp4"
            );
            if (!mp4) {
              return;
            }
            const notif = `${json.data.text}\n${mp4.url}`;
            channel.send(notif);
          });
      } else {
        logger.error("authError %s", json);
      }
    } catch (e) {
      logger.error("heartbeat");
    }
  });

  stream.on("error", () => {
    logger.error("timeout error");
    reconnect();
  });
};
