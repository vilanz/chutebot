import { Client, TextChannel } from "discord.js";
import { ReadStream } from "fs";
import { logger } from "../core/log";
import { BR_FOOTBALL_CHANNEL_ID, FUTEBOL_GUILD } from "../core/discord";
import { addRules, deleteAllRules } from "./stream-rules";
import { mapAxiosData, twitterNewAPI, twitterOldAPI } from "./twitter-api";
import { waitSeconds } from "../core/utils";

// TODO clean this terrible mess up

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
  logger.info("restarting fetchTwitter");

  await deleteAllRules();
  await addRules([
    {
      value: "from:goleada_info has:videos",
      id: "goleada_info tweets",
    },
  ]);

  const guild = await client.guilds.fetch(FUTEBOL_GUILD);
  if (!guild) {
    logger.error("sem guild");
    return;
  }

  const channel = (await guild.channels.fetch(
    BR_FOOTBALL_CHANNEL_ID
  )) as TextChannel;
  if (!channel) {
    logger.error("sem channel");
    return;
  }

  const res = await twitterNewAPI.get<ReadStream>(`/tweets/search/stream`, {
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

    const sleepDuration = 2 ** timeout;
    logger.warn("will sleep for %s seconds", sleepDuration);
    await waitSeconds(sleepDuration);

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
        await twitterOldAPI
          .get(`/statuses/show/${tweetId}.json`)
          .then(mapAxiosData)
          .then((d: any) => {
            const media = d.extended_entities?.media?.[0];
            if (!media) {
              return;
            }

            const variants = media.video_info?.variants;
            if (!variants) {
              return;
            }

            const mp4 = variants
              .filter((x: any) => x.content_type === "video/mp4")
              .reduce((max: any, curr: any) =>
                max.bitrate > curr.bitrate ? max : curr
              );
            if (!mp4) {
              return;
            }

            let msg = json.data.text;
            try {
              msg = msg
                .replace(/https:\/\/t\.co\/\w+/g, "")
                .replace(/^[ ]+|[ ]+$/g, "");
            } catch (e) {
              logger.error(e);
            }

            channel.send(`**${msg}** ${mp4.url}`);
          });
      } else {
        logger.error("authError %s", json);
      }
    } catch (e) {
      // heartbeat
    }
  });

  stream.on("error", () => {
    logger.error("timeout error");
    reconnect();
  });
};
