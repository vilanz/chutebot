import { Message, MessageReaction, Snowflake, User } from "discord.js";
import { secondsToMs } from "../utils";
import { getChannel } from "./channels";
import { discordClient } from "./client";
import { BOTSPAM_CHANNEL, BR_TEAMS_CHANNEL, GUILD, OWNER_USER } from "./consts";

export const isMessageInCorrectGuild = (message: Message): boolean =>
  message.guild?.id === GUILD;

export const isMessageIn = (message: Message, channelId: Snowflake): boolean =>
  message.channel.id === channelId;

export const isMessageInBotspam = (message: Message): boolean =>
  isMessageIn(message, BOTSPAM_CHANNEL);

export const isMessageInFootball = (message: Message): boolean =>
  isMessageIn(message, BR_TEAMS_CHANNEL);

export const isMessageByOwner = (message: Message): boolean =>
  message.author.id === OWNER_USER;

export const sendBotspamMessage = async (content: string): Promise<void> => {
  const botspamChannel = getChannel(BOTSPAM_CHANNEL);
  if (botspamChannel) {
    await botspamChannel.send(content);
  }
};

export const waitForUserReaction = async (
  authorId: Snowflake,
  message: Message,
  reactions: string[]
): Promise<number | null> => {
  const isCorrectReactionFromUser = (r: MessageReaction, user: User) =>
    !!r.emoji.name && reactions.includes(r.emoji.name) && user.id === authorId;

  reactions.forEach((R) => message.react(R));

  return message
    .awaitReactions({
      filter: isCorrectReactionFromUser,
      max: 1,
      time: secondsToMs(20),
    })
    .then((r) => r.first()?.emoji.name ?? null)
    .then((emoji) => {
      if (emoji === null) {
        return null;
      }
      return reactions.findIndex((r) => r === emoji);
    });
};

export const dmMeError = async (err: any): Promise<void> => {
  const me = discordClient.users.cache.get(OWNER_USER)!;
  const stringifiedError = err
    ? JSON.stringify(err, Object.getOwnPropertyNames(err), 2).slice(0, 3999)
    : "eita";
  await me.send(stringifiedError);
};

export const parseChannelMention = (message: string): Snowflake | null => {
  const matches = message.match(/^<#!?(\d+)>$/);

  if (!matches) {
    return null;
  }

  return matches[1] as Snowflake;
};
