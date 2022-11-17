import { ContextMenuCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder } from '@discordjs/builders';
import { ApplicationCommandType, TextInputStyle } from 'discord-api-types/payloads/v10';
import { CommandInteraction, Interaction, MessageContextMenuCommandInteraction } from 'discord.js';
import { ContextMenuCommand } from '../types/command.js';

import { moderatorOnly } from '../decorators/authorizedOnly.js';
import { githubOnly } from '../decorators/githubOnly.js';

function checkCommandType(interaction: CommandInteraction): interaction is MessageContextMenuCommandInteraction {
  return interaction.commandType === ApplicationCommandType.Message;
}

class Command implements ContextMenuCommand {
  data = new ContextMenuCommandBuilder().setName('Create GitHub Issue').setType(ApplicationCommandType.Message);

  @moderatorOnly()
  @githubOnly()
  async execute(interaction: MessageContextMenuCommandInteraction) {
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

export default new Command();