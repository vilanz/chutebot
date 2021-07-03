import { Snowflake } from "discord.js";
import { mapAxiosData, twitterNewAPI } from "./axios";

interface TwitterRule {
  value: string;
  id: string;
  tag?: string;
}

interface TwitterRuleResponse {
  data: TwitterRule[];
}

export const getRulesByChannel = (channelId: Snowflake) =>
  twitterNewAPI
    .get(`/tweets/search/stream/rules`)
    .then(mapAxiosData)
    .then((t: TwitterRuleResponse) =>
      t.data?.filter((x) => x.tag === channelId)
    );

export const addRule = (channelId: Snowflake, rule: string) =>
  twitterNewAPI.post("/tweets/search/stream/rules", {
    add: [
      {
        value: `${rule} has:videos`,
        tag: channelId,
      },
    ],
  });

export const deleteRules = async (channelId: Snowflake) => {
  const rules = await getRulesByChannel(channelId);

  if (rules?.length) {
    const ruleIds = rules.map((x) => x.id);
    await twitterNewAPI.post("/tweets/search/stream/rules", {
      delete: {
        ids: ruleIds,
      },
    });
  }
};
