const { ContextMenuCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('@discordjs/builders')
const { ApplicationCommandType, TextInputStyle } = require('discord-api-types/payloads/v10')
const checkUserPerms = require('../utils/checkUserPerms')

module.exports = {
  data: new ContextMenuCommandBuilder().setName('Add to GitHub Issue').setType(ApplicationCommandType.Message),
  async execute(interaction) {
    if (!checkUserPerms(interaction))
      return interaction.reply({
        content: 'You do not have permission to do that!',
        ephemeral: true
      })
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
    modal.addComponents(new ActionRowBuilder().addComponents(id), new ActionRowBuilder().addComponents(extra), new ActionRowBuilder().addComponents(messageId))
    interaction.showModal(modal)
  }
}
