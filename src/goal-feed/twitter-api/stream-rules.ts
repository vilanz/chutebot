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

export const getAllRules = (): Promise<TwitterRule[]> =>
  twitterNewAPI
    .get<TwitterRuleResponse>(`/tweets/search/stream/rules`)
    .then(mapAxiosData)
    .then((d) => d.data ?? []);

export const deleteChannelRules = async (
  channelId: Snowflake
): Promise<void> => {
  const channelRules = await getAllRules()
    .then(rules => rules.filter(r => r.tag === channelId))
    .then(rules => rules.map(x => x.id))
  await twitterNewAPI.post("/tweets/search/stream/rules", {
    delete: {
      ids: [channelRules],
    },
  });
};

export const addChannelRules = async (
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
  });
};

export const resetChannelRules = async (
  channelId: Snowflake,
  rule: string
): Promise<void> => {
  await deleteChannelRules(channelId);
  await addChannelRules(channelId, rule)
};
