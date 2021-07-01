import { mapAxiosData, twitterNewAPI } from "./axios";

interface TwitterRule {
  value: string;
  id: string;
}

interface TwitterRuleResponse {
  data: TwitterRule[];
}

export const addRules = (rules: TwitterRule[]) =>
  twitterNewAPI.post("/tweets/search/stream/rules", {
    add: rules,
  });

export const deleteAllRules = async () => {
  const allRules = await twitterNewAPI
    .get("/tweets/search/stream/rules")
    .then(mapAxiosData)
    .then((t: TwitterRuleResponse) => t.data);

  if (allRules?.length) {
    const allRuleIds = allRules.map((x) => x.id);
    await twitterNewAPI.post("/tweets/search/stream/rules", {
      delete: {
        ids: allRuleIds,
      },
    });
  }
};
