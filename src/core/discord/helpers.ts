import {
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

const getFootbalGuild = () => discordClient.guilds.fetch(GUILD);

export const getUserById = (id: string) =>
  getFootbalGuild().then((g) => g.members.fetch(id as Snowflake));

export const getChannel = (channelId: Snowflake) =>
  getFootbalGuild().then(
    (g) => g.channels.fetch(channelId) as Promise<TextChannel>
  );

export const isMessageInBotspam = (message: Message) =>
  message.channel.id === BOTSPAM_CHANNEL;

export const isMessageInFootball = (message: Message) =>
  message.channel.id === BR_TEAMS_CHANNEL;

export const isMessageByOwner = (message: Message) =>
  message.author.id === OWNER_USER;

export const sendBotspamMessage = (content: string) =>
  getChannel(BOTSPAM_CHANNEL).then((ch) => ch.send(content));

export const dmMeError = (err: any) =>
  discordClient.users
    .fetch(OWNER_USER)
    .then((me) =>
      me.send(err ? JSON.stringify(err) : "boa to gostando de ver")
    );

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
