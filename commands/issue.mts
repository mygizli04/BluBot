import { ContextMenuCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder } from '@discordjs/builders';
import { ApplicationCommandType, TextInputStyle } from 'discord-api-types/payloads/v10';
import { CommandInteraction, Interaction, MessageContextMenuCommandInteraction } from 'discord.js';
import Command from '../types/command.mjs';
import checkUserPerms from '../utils/checkUserPerms.mjs';

import { getConfig } from "../types/config.mjs";
const { githubToken } = await getConfig();

function checkCommandType(interaction: CommandInteraction): interaction is MessageContextMenuCommandInteraction {
  return interaction.commandType === ApplicationCommandType.Message;
}


const command: Command = {
  data: new ContextMenuCommandBuilder().setName('Create GitHub Issue').setType(ApplicationCommandType.Message),
  async execute(interaction) {
    if (!githubToken) {
      return interaction.reply({
        content: 'Github integration is currently disabled.',
        ephemeral: true
      })
    }

    if (!checkUserPerms(interaction as Interaction)) {
      return interaction.reply({
        content: 'You do not have permission to do that!',
        ephemeral: true
      })
    }

    if (!checkCommandType(interaction)) {
      return interaction.reply({
        content: 'This command can only be used in a message context menu!',
        ephemeral: true
      })
    }

    const modal = new ModalBuilder().setCustomId('newissue').setTitle('New GitHub Issue')
    const title = new TextInputBuilder().setCustomId('title').setLabel('Issue title').setStyle(TextInputStyle.Short)
    const extra = new TextInputBuilder().setCustomId('extrainfo').setLabel('Extra information').setStyle(TextInputStyle.Paragraph).setRequired(false)
    const messageId = new TextInputBuilder()
      .setCustomId('messageId')
      .setLabel('Message ID (do not change)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(17)
      .setMaxLength(20)
      .setValue(interaction.targetMessage.id)
      .setRequired(true)
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(title), new ActionRowBuilder<TextInputBuilder>().addComponents(extra), new ActionRowBuilder<TextInputBuilder>().addComponents(messageId))
    interaction.showModal(modal)
  }
}

export default command;