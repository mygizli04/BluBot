import { APIEmbed, Guild, HexColorString, resolveColor, TextChannel } from 'discord.js';
import { PunishmentInfo, PunishmentType, TemplateInfo, TemplateType } from '../types/log/index.js';

import { getConfig } from '../types/config.js';
import { Template } from '../types/log/template/index.js';
import { validateChannelTemplateInfo, validateMessageTemplateInfo, validateModerateTemplateInfo } from '../types/log/template/info.js';
import { validateBanPunishmentInfo, validateKickPunishmentInfo, validateLockPunishmentInfo, validateMessageDeletePunishmentInfo, validateMessageEditPunishmentInfo, validatePhishPunishmentInfo, validatePurgePunishmentInfo, validateTimeoutPunishmentInfo, validateUnBanPunishmentInfo, validateUnlockPunishmentInfo, validateUnTimeoutPunishmentInfo } from '../types/log/info/index.js';

const { customization, channels } = await getConfig();
const colors = customization?.colors;
const logs = channels?.logs;

function getTemplate (name: TemplateType, info: TemplateInfo): Template {
  switch (name) {
    case 'moderate':
      if (!validateModerateTemplateInfo(info)) throw new Error('Invalid moderate template info');
      return {
        title: '',
        fields: [
          {
            name: 'User',
            value: `<@${info.target?.id}>`
          },
          {
            name: 'Reason',
            value: info.reason || 'N/A'
          },
          {
            name: 'Responsible Moderator',
            value: `<@${info.moderator?.id}>`
          },
          {
            name: 'Time',
            value: `<t:${Math.floor(Date.now() / 1000)}:f>\n<t:${Math.floor(Date.now() / 1000)}:R>`
          }
        ]
      };
    case 'message':
      if (!validateMessageTemplateInfo(info)) throw new Error('Invalid message template info');

      return {
        title: '',
        fields: [
          {
            name: 'User',
            value: `<@${info.target?.id}>`
          },
          {
            name: 'Message',
            value: info.content || "Unknown"
          },
          {
            name: 'Channel',
            value: `<#${info.channel?.id}>`
          },
          {
            name: 'Time',
            value: `<t:${Math.floor(Date.now() / 1000)}:f>\n<t:${Math.floor(Date.now() / 1000)}:R>`
          }
        ]
      };
    case 'channel':
      if (!validateChannelTemplateInfo(info)) throw new Error('Invalid channel template info');

      return {
        title: '',
        fields: [
          {
            name: 'Channel',
            value: `<#${info.channel?.id}>`
          },
          {
            name: 'Responsible Moderator',
            value: `<@${info.moderator?.id}>`
          },
          {
            name: 'Time',
            value: `<t:${Math.floor(Date.now() / 1000)}:f>\n<t:${Math.floor(Date.now() / 1000)}:R>`
          }
        ]
      };
    default:
      throw new Error('Invalid template type');
  }
}

function getEmbed (name: PunishmentType, info: TemplateInfo): APIEmbed {
  switch (name) {
    case 'ban': {
      if (!validateBanPunishmentInfo(info)) throw new Error('Invalid ban punishment info');
      const embed: APIEmbed = getTemplate('moderate', info);
      embed.title = `Banned ${info.target.tag}`;
      embed.color = resolveColor(colors?.bad as HexColorString ?? '#f45450');
      return embed;
    }
    case 'unban': {
      if (!validateUnBanPunishmentInfo(info)) throw new Error('Invalid unban punishment info');
      const embed: APIEmbed = getTemplate("moderate", info);
      embed.title = `Unbanned ${info.target.tag}`;
      embed.color = resolveColor(colors?.good as HexColorString ?? '#36c84b');
      return embed;
    }
    case 'kick': {
      if (!validateKickPunishmentInfo(info)) throw new Error('Invalid kick punishment info');
      const embed: APIEmbed = getTemplate("moderate", info);
      embed.title = `Kicked ${info.target.tag}`;
      embed.color = resolveColor(colors?.bad as HexColorString ?? '#f45450');
      return embed;
    }
    case 'timeout': {
      if (!validateTimeoutPunishmentInfo(info)) throw new Error('Invalid timeout punishment info');
      const embed: APIEmbed = getTemplate("moderate", info);
      embed.title = `Timed out ${info.target.tag}`;
      embed.color = resolveColor(colors?.bad as HexColorString ?? '#f45450');
      embed.fields!.splice(2, 0, {
        name: 'Duration',
        value: `${info.duration}`
      });
      return embed;
    }
    case 'untimeout': {
      if (!validateUnTimeoutPunishmentInfo(info)) throw new Error('Invalid untimeout punishment info');
      const embed: APIEmbed = getTemplate("moderate", info);
      embed.title = `Removed timeout for ${info.target.tag}`;
      embed.color = resolveColor(colors?.good as HexColorString ?? '#36c84b');
      return embed;
    }
    case 'messageDelete': {
      if (!validateMessageDeletePunishmentInfo(info)) throw new Error("Invalid message delete punishment info");
      const embed: APIEmbed = getTemplate("message", info);
      embed.title = `Message deleted by ${info.moderator ? 'moderator' : 'user'}`;
      embed.color = resolveColor(colors?.bad as HexColorString ?? '#f45450');
      if (info.moderator) {
        embed.fields!.splice(3, 0, {
          name: 'Responsible Moderator',
          value: `<@${info.moderator.id}>`
        });
      }
      return embed;
    }
    case 'messageEdit': {
      if (!validateMessageEditPunishmentInfo(info)) throw new Error("Invalid message edit punishment info");
      const embed: APIEmbed = getTemplate("message", info);
      embed.title = 'Message edited';
      embed.color = resolveColor(colors?.medium as HexColorString ?? '#fdbc40');
      embed.fields!.splice(1, 0, {
        name: 'Old Message',
        value: info.oldMessage
      });
      return embed;
    }
    case 'purge': {
      if (!validatePurgePunishmentInfo(info)) throw new Error("Invalid purge punishment info");
      const embed: APIEmbed = getTemplate("channel", info);
      embed.title = `Purged ${info.amount} message${info.amount === 1 ? '' : 's'}${info.target ? ` by ${info.target.tag}` : ''}`;
      embed.color = resolveColor(colors?.medium as HexColorString ?? '#fdbc40');
      if (info.target)
        embed.fields!.splice(0, 0, {
          name: 'User',
          value: `<@${info.target.id}>`
        });
      return embed;
    }
    case 'lock': {
      if (!validateLockPunishmentInfo(info)) throw new Error("Invalid lock punishment info");
      const embed: APIEmbed = getTemplate("channel", info);
      embed.title = `Locked #${info.channel.name}`;
      embed.color = resolveColor(colors?.medium as HexColorString ?? '#fdbc40');
      return embed;
    }
    case 'unlock': {
      if (!validateUnlockPunishmentInfo(info)) throw new Error("Invalid unlock punishment info");
      const embed: APIEmbed = getTemplate("channel", info);
      embed.title = `Unlocked #${info.channel.name}`;
      embed.color = resolveColor(colors?.good as HexColorString ?? '#36c84b');
      return embed;
    }
    case 'phish': {
      if (!validatePhishPunishmentInfo(info)) throw new Error("Invalid phish punishment info");
      const embed: APIEmbed = getTemplate("message", info);
      embed.title = `Deleted phishing site by ${info.target.tag}`;
      embed.color = resolveColor(colors?.bad as HexColorString ?? '#f45450');
      embed.fields!.splice(3, 0, {
        name: 'Harmful Site',
        value: info.site
      });
      return embed;
    }
  }
}

export default async function log (guild: Guild, type: PunishmentType, info: PunishmentInfo) {
  if (!logs) return;

  const embed = getEmbed(type, info);

  if (!embed) throw new Error("No embed found!");

  ((await guild.channels.fetch(logs.toString())) as TextChannel).send({embeds: [embed]})
}
