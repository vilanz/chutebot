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
  const channelRuleIds = await getAllRules()
    .then((rules) => rules.filter((r) => r.tag === channelId))
    .then((rules) => rules.map((x) => x.id));
  const deleteResult = await twitterNewAPI.post("/tweets/search/stream/rules", {
    delete: {
      ids: channelRuleIds,
    },
  });
  const deleteErrors = deleteResult.data?.errors;
  if (deleteErrors) {
    throw new Error(`failed to delete a rule: ${JSON.stringify(deleteErrors)}`);
  }
};

export const addChannelRules = async (
  channelId: Snowflake,
  rule: string
): Promise<void> => {
  const addResult = await twitterNewAPI.post("/tweets/search/stream/rules", {
    add: [
      {
        value: rule,
        tag: channelId,
      },
    ],
  });
  // TODO standardize handling errors
  const addErrors = addResult.data?.errors;
  if (addErrors) {
    throw new Error(`failed to add a rule: ${JSON.stringify(addErrors)}`);
  }
};

export const resetChannelRules = async (
  channelId: Snowflake,
  rule: string
): Promise<void> => {
  await deleteChannelRules(channelId);
  await addChannelRules(channelId, rule);
};
