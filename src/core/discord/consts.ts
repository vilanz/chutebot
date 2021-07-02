import { Snowflake } from "discord.js";
import { argv } from "../env";

const stagingTestChannel = "846499603187761205";

const prodOrStaging = (prod: Snowflake, staging: Snowflake) =>
  argv.staging ? staging : prod;

export const GUILD = prodOrStaging("299991824091709440", "846499603187761202");

export const TEST_CHANNEL = prodOrStaging(
  "859287929934184458",
  stagingTestChannel
);
export const NATIONAL_TEAMS_CHANNEL = prodOrStaging(
  "427146453811462144",
  stagingTestChannel
);
export const BR_TEAMS_CHANNEL = prodOrStaging(
  "300674662529105940",
  stagingTestChannel
);
export const BOTSPAM_CHANNEL = prodOrStaging(
  "330398983195197440",
  stagingTestChannel
);

export const OWNER_USER = "201823723156668417";
