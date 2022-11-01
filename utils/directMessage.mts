import { APIEmbed, APIUnavailableGuild, Guild, HexColorString, resolveColor, User } from "discord.js";
import { getConfig } from "../types/config.mjs";
import { DMInfo, DMType } from "../types/directMessage/index.mjs";
import { validateBanDMInfo, validateKickDMInfo, validateTimeoutDMInfo } from "../types/directMessage/info/info.mjs";
import { Template } from "../types/directMessage/template/index.mjs";

const { customization } = await getConfig();
const colors = customization?.colors;

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

function getEmbed(guild: Guild, type: DMType, info: DMInfo): APIEmbed {
  const template = getTemplate(info as any);

  switch (type) {
    case "ban": {
      if (!validateBanDMInfo(info)) throw new Error("Invalid ban info");
      const embed = {...template} as APIEmbed
      embed.title = `You have been banned in ${guild.name}!`
      embed.color = colors?.bad ? resolveColor(colors?.bad as HexColorString) : resolveColor('#f45450');
      return embed
    }
    case "kick": {
      if (!validateKickDMInfo(info)) throw new Error("Invalid kick info");
      const embed = {...template} as APIEmbed
      embed.title = `You have been kicked from ${guild.name}!`
      embed.color = colors?.bad ? resolveColor(colors?.bad as HexColorString) : resolveColor('#f45450');
      return embed
    }
    case "timeout": {
      if (!validateTimeoutDMInfo(info)) throw new Error("Invalid timeout info");
      const embed = {...template} as APIEmbed
      embed.title = `You have been timed out in ${guild.name}!`
      embed.color = colors?.medium ? resolveColor(colors?.medium as HexColorString) : resolveColor('#fdbc40')
      embed.fields!.splice(1, 0, {
        name: 'Duration',
        value: info.duration!
      })
      return embed
    }
    case "untimeout": {
      const embed = {...template} as APIEmbed
      embed.title = `Your timeout has been removed in ${guild.name}!`
      embed.color = colors?.good ? resolveColor(colors?.good as HexColorString) : resolveColor('#43b581')
      return embed
    }
  }
}

// duration in info only required if type is timeout
export default async function directMessage(guild: Guild, target: User, type: DMType, info: DMInfo): Promise<boolean> {
  const embed = getEmbed(guild, type, info)

  //const embed = types[type]
  if (!type) return false;
  const dm = await target.send({ embeds: [embed as APIEmbed] }).catch(() => null)
  return dm !== null ? true : false
}
