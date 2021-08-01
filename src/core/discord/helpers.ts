import {
  Collection,
  Guild,
  GuildMember,
  Message,
  MessageReaction,
  Snowflake,
  TextChannel,
  User,
} from "discord.js";
import { secondsToMs } from "../utils";
import { discordClient } from "./client";
import { BOTSPAM_CHANNEL, BR_TEAMS_CHANNEL, GUILD, OWNER_USER } from "./consts";

// TODO split this file

const getGuild = (): Guild => discordClient.guilds.cache.get(GUILD)!;

export const prefetchAllUsers = () => getGuild().members.fetch();

export const getUsersByIds = async (
  ids: string[]
): Promise<Collection<Snowflake, GuildMember>> =>
  getGuild()
    .members.fetch()
    .then(
      (members) =>
        members.filter((u) => ids.includes(u.id)) as Collection<
          Snowflake,
          GuildMember
        >
    );

export const getChannel = (channelId: Snowflake): TextChannel | null =>
  (getGuild().channels.cache.get(channelId) as TextChannel) ?? null;

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

export const dmMeError = async (err: any): Promise<void> => {
  const me = await discordClient.users.fetch(OWNER_USER);
  const stringifiedError = err
    ? JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
    : "eita";
  await me.send(stringifiedError);
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

export const parseChannelMention = (message: string): Snowflake | null => {
  const matches = message.match(/^<#!?(\d+)>$/);

  if (!matches) {
    return null;
  }

  return matches[1] as Snowflake;
};
