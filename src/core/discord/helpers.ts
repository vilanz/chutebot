import {
  Message,
  MessageReaction,
  Snowflake,
  TextChannel,
  User,
} from "discord.js";
import { secondsToMs } from "../utils";
import { discordClient } from "./client";
import { FUTEBOL_GUILD } from "./consts";

const getFootbalGuild = () => discordClient.guilds
  .fetch(FUTEBOL_GUILD)

export const getUserById = (id: string) =>
  getFootbalGuild()
    .then(g => g.members.fetch(id as Snowflake))

export const waitForUserReaction = async (
  authorId: Snowflake,
  message: Message,
  reactions: string[]
): Promise<number | null> => {
  const isCorrectReactionFromUser = (r: MessageReaction, user: User) =>
    !!r.emoji.name && reactions.includes(r.emoji.name) && user.id === authorId;

  await Promise.all(reactions.map((R) => message.react(R)));

  return message
    .awaitReactions(isCorrectReactionFromUser, {
      max: 1,
      time: secondsToMs(15),
    })
    .then((r) => r.first()?.emoji.name ?? null)
    .then((emoji) => {
      if (emoji === null) {
        return null;
      }
      return reactions.findIndex((r) => r === emoji);
    });
};

export const getChannel = (channelId: Snowflake) =>
  getFootbalGuild()
    .then((g) => g.channels.fetch(channelId) as Promise<TextChannel>);
