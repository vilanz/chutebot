import {
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

export const getUserById = async (id: string): Promise<GuildMember | null> =>
  getGuild()
    .members.fetch(id as Snowflake)
    .then((m) => m || null)
    .catch(() => null);

export const getChannel = (channelId: Snowflake): Promise<TextChannel | null> =>
  getGuild().channels.fetch(channelId) as Promise<TextChannel | null>;

export const isMessageInCorrectGuild = (message: Message) =>
  message.guild?.id === GUILD;

export const isMessageIn = (message: Message, channelId: Snowflake) =>
  message.channel.id === channelId;

// TODO remove these two
export const isMessageInBotspam = (message: Message) =>
  isMessageIn(message, BOTSPAM_CHANNEL);

export const isMessageInFootball = (message: Message) =>
  isMessageIn(message, BR_TEAMS_CHANNEL);

export const isMessageByOwner = (message: Message) =>
  message.author.id === OWNER_USER;

export const sendBotspamMessage = (content: string) =>
  getChannel(BOTSPAM_CHANNEL).then((ch) => ch?.send(content));

export const dmMeError = async (err: any) => {
  const me = await discordClient.users.fetch(OWNER_USER);
  await me.send(err ? JSON.stringify(err) : "eita");
};

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

export const waitForMessage = async (
  message: Message,
  seconds: number,
  filter: (message: Message) => boolean
): Promise<Message | null> =>
  message.channel
    .awaitMessages(filter, {
      max: 1,
      time: secondsToMs(seconds),
      errors: ["time"],
    })
    .then((ms) => ms.first()!)
    .catch(() => null);
