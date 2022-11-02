import Command from "../types/command.js";

import { ContextMenuCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder } from '@discordjs/builders';
import { ApplicationCommandType, TextInputStyle } from 'discord-api-types/payloads/v10';
import checkUserPerms from '../utils/checkUserPerms.js';
import { CommandInteraction, Interaction, MessageContextMenuCommandInteraction } from "discord.js";

import { getConfig } from "../types/config.js";
const { githubToken } = await getConfig();

function checkCommandType(interaction: CommandInteraction): interaction is MessageContextMenuCommandInteraction {
  return interaction.commandType === ApplicationCommandType.Message;
}

const command: Command = {
  data: new ContextMenuCommandBuilder().setName('Add to GitHub Issue').setType(ApplicationCommandType.Message),
  async execute(interaction) {
    if (!githubToken) {
      interaction.reply({
        content: 'GitHub integration is currently disabled.',
        ephemeral: true
      });
      return;
    }
    
    if (!checkUserPerms(interaction as Interaction)) {
      interaction.reply({
        content: 'You do not have permission to do that!',
        ephemeral: true
      });
      return;
    }

    if (!checkCommandType(interaction)) {
      interaction.reply({
        content: 'This command can only be used in a message context menu!',
        ephemeral: true
      });
      return;
    }

    const modal = new ModalBuilder().setCustomId('addmessage').setTitle('Add message to GitHub Issue')
    const id = new TextInputBuilder().setCustomId('id').setLabel('Issue ID').setStyle(TextInputStyle.Short)
    const extra = new TextInputBuilder().setCustomId('extrainfo').setLabel('Extra information').setStyle(TextInputStyle.Paragraph).setRequired(false)
    const messageId = new TextInputBuilder()
      .setCustomId('messageId')
      .setLabel('Message ID (do not change)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(17)
      .setMaxLength(20)
      .setValue(interaction.targetMessage.id)
      .setRequired(true)
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(id), new ActionRowBuilder<TextInputBuilder>().addComponents(extra), new ActionRowBuilder<TextInputBuilder>().addComponents(messageId))
    interaction.showModal(modal)
  }
}


export default command;