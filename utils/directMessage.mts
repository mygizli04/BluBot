import { APIEmbed, Embed, Guild, User } from "discord.js";
import { getConfig } from "../types/config.mjs";

const { customization } = await getConfig();
const colors = customization?.colors;

interface Template {
  title: string,
  fields: Field[],
  color?: string
}

interface Field {
  name: string,
  value: string,
}

function getTemplate(info: {reason: string, moderator?: {id: string}}): Template {
  return {
    title: '',
    fields: [
      {
        name: 'Reason',
        value: info.reason || 'N/A'
      },
      {
        name: 'Moderator',
        value: `<@${info.moderator?.id}>`
      }
    ]
  }
}

export type PunishmentEmbedTypes = "ban" | "kick" | "timeout" | "untimeout"

function getType<T extends PunishmentEmbedTypes>(guild: Guild, type: T, info: T extends "timeout" ? Required<PunishmentMessageInfo> : PunishmentMessageInfo): Template {
  const template = getTemplate(info as any);

  return {
    ban: () => {
      const embed = {...template}
      embed.title = `You have been banned in ${guild.name}!`
      embed.color = colors?.bad ?? '#f45450'
      return embed
    },
    kick: () => {
      const embed = {...template}
      embed.title = `You have been kicked from ${guild.name}!`
      embed.color = colors?.bad ?? '#f45450'
      return embed
    },
    timeout: () => {
      const embed = {...template}
      embed.title = `You have been timed out in ${guild.name}!`
      embed.color = colors?.medium ?? '#fdbc40'
      embed.fields.splice(1, 0, {
        name: 'Duration',
        value: info.duration!
      })
      return embed
    },
    untimeout: () => {
      const embed = {...template}
      embed.title = `Your timeout has been removed in ${guild.name}!`
      embed.color = colors?.good ?? '#36c84b'
      return embed
    }
  }[type]();
}

export interface PunishmentMessageInfo {
  reason: string,
  moderator: {
    id: string
  },
  duration?: string,
  target?: User,
  channel?: {
    id: string
  }
}

// duration in info only required if type is timeout
export default async function directMessage<T extends PunishmentEmbedTypes>(guild: Guild, target: User, type: T, info: T extends "timeout" ? Required<PunishmentMessageInfo> : PunishmentMessageInfo): Promise<boolean> {
  const embed = getType(guild, type, info)

  //const embed = types[type]
  if (!type) return false;
  const dm = await target.send({ embeds: [embed as APIEmbed] }).catch(() => null)
  return dm !== null ? true : false
}
