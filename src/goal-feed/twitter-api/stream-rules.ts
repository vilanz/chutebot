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

export const addChannelRule = (channelId: Snowflake, rule: string) =>
  twitterNewAPI.post("/tweets/search/stream/rules", {
    add: [
      {
        value: `${rule} has:videos`,
        tag: channelId,
      },
    ],
  });

export const deleteChannelRules = async (
  channelId: Snowflake
): Promise<void> => {
  const rules = await getChannelRules([channelId]);

  if (rules?.length) {
    const ruleIds = rules.map((x) => x.id);
    // TODO check if response said it's actually deleted
    await twitterNewAPI.post("/tweets/search/stream/rules", {
      delete: {
        ids: ruleIds,
      },
    });
  }
};

export const resetChannelRules = async (
  channelId: Snowflake,
  rule: string
): Promise<void> => {
  await deleteChannelRules(channelId);
  if (rule.trim()) {
    // TODO check if response said it's actually added
    await addChannelRule(channelId, rule);
  }
};
