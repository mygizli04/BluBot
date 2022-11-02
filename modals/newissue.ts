import axios from "axios";
import checkUserPerms from '../utils/checkUserPerms.js';
import { APIEmbed, HexColorString, resolveColor } from 'discord.js';

import { getConfig } from "../types/config.js";
import Modal from "../types/modal.js";
const { customization, githubToken } = await getConfig();
const accent = customization?.accent;

const modal: Modal = {
  id: 'newissue',
  async execute (interaction) {
    if (!githubToken) {
      interaction.reply({
        content: 'GitHub integration is currently disabled.',
        ephemeral: true
      });
      return;
    }

    if (!checkUserPerms(interaction)) {
      interaction.reply({
        content: 'You do not have permission to do that!',
        ephemeral: true
      });
      return;
    }

    const messageId = interaction.fields.fields.find(f => f.customId === 'messageId')!.value;
    const issueMessage = await interaction.channel!.messages.fetch(messageId).catch(() => null);
    if (!issueMessage) {
      interaction.reply({
        content: 'I could not find that message!',
        ephemeral: true
      });
      return;
    }

    const title = interaction.fields.fields.find(f => f.customId === 'title')!.value;
    const extraInfo = interaction.fields.fields.find(f => f.customId === 'extrainfo')!.value;
    const attachments = issueMessage.attachments.map(a => `[${a.name}](${a.url})`);
    const imageTypes = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
    const thumbnail = issueMessage.attachments.filter(f => f.name && imageTypes.includes(f.name.split('.')[0])).first();
    const res = await axios(`https://api.github.com/repos/UTMDiscordBot/testing/issues`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        // this token got reset so don't waste your time ;)
        // Editor's note: Definetely intentionally reset
        Authorization: githubToken
      },
      data: {
        title: title,
        body: `${issueMessage.content}${attachments.length !== 0 ? `<br><h2>Attachments:</h2>${attachments.join('<br>')}` : ''}${extraInfo.length !== 0 ? `<br><h2>Extra Information:</h2>${extraInfo}` : ''
          }<br><details><summary><h2>Issuer and moderator</h2></summary>Issuer: ${issueMessage.author.tag}<br>Moderator: ${interaction.user.tag}</details>`
      }
    }).catch(() => null);
    if (!res || !res.data) {
      interaction.reply({
        content: 'I could not access the GitHub API!',
        ephemeral: true
      });
      return;
    }
    const embed: APIEmbed = {
      color: accent ? resolveColor(accent as HexColorString) : undefined,
      title: 'Created a new issue!',
      thumbnail: thumbnail ? {
        url: thumbnail.url
      } : undefined,
      fields: [
        {
          name: 'Title',
          value: title
        },
        {
          name: 'Body',
          value: `${issueMessage.content}${extraInfo.length !== 0 ? `\n\n**Extra Information:**\n${extraInfo}` : ''}`
        },
        {
          name: 'Attachments',
          value: attachments.length !== 0 ? attachments.join('\n') : 'None'
        },
        {
          name: 'Link',
          value: res.data.html_url || 'Unknown'
        }
      ],
      footer: {
        text: 'Report any bugs or issues to BluDood#0001'
      }
    };
    await interaction.reply({
      embeds: [embed]
    });
  }
};

export default modal;