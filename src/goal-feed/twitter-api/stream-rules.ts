import { Snowflake } from "discord.js";
import { mapAxiosData, twitterNewAPI } from "./axios";

export interface TwitterRule {
  value: string;
  id: string;
  tag?: string;
}

interface TwitterRuleResponse {
  data?: TwitterRule[];
}

// TODO filter by channel?
const getAllRules = (): Promise<TwitterRule[]> =>
  twitterNewAPI
    .get<TwitterRuleResponse>(`/tweets/search/stream/rules`)
    .then(mapAxiosData)
    .then((d) => d.data ?? []);

export const getChannelRules = (
  channelIds: Snowflake[]
): Promise<TwitterRule[]> =>
  getAllRules().then((rules) =>
    rules.filter((x) => x.tag && channelIds.includes(x.tag as Snowflake))
  );

export const deleteChannelRules = async (
  channelId: Snowflake
): Promise<void> => {
  await twitterNewAPI.post("/tweets/search/stream/rules", {
    delete: {
      ids: [channelId],
    },
  });
};

export const resetChannelRules = async (
  channelId: Snowflake,
  rule: string
): Promise<void> => {
  await twitterNewAPI.post("/tweets/search/stream/rules", {
    add: [
      {
        value: `${rule} has:videos`,
        tag: channelId,
      },
    ],
    delete: {
      ids: [channelId],
    },
  });
};
