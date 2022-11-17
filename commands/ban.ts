import { ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder } from 'discord.js';
import { moderatorOnly } from '../decorators/authorizedOnly.js';
import { SlashCommand } from '../types/command.js';

import { getConfig } from '../types/config.js';
const { customization } = await getConfig();
const accent = customization?.accent;

import directMessage from '../utils/directMessage.js';
import log from '../utils/log.js';

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member.')
    .addUserOption(option => option.setName('target').setDescription('User to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the ban'))
    .addNumberOption(option => option.setName('deletedays').setDescription('Days to delete messages')) as SlashCommandBuilder;

  @moderatorOnly()
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('target')!;
    const reason = interaction.options.getString('reason') || 'N/A';
    const days = interaction.options.getNumber('deletedays') || 0;
    const member = await interaction.guild!.members.fetch({ user: target, force: true }).catch(() => null);
    if (!member) {
      interaction.reply({
        content: "I can't find that user!",
        ephemeral: true
      });
      return;
    }
    if (!member.bannable) {
      interaction.reply({
        content: "I can't ban that user!",
        ephemeral: true
      });
      return;
    }
    await interaction.reply({
      embeds: [
        {
          title: `${target.tag} banned.`,
          color: resolveColor(accent as HexColorString)
        }
      ],
      ephemeral: true
    });
    const dm = await directMessage(interaction.guild!, target, 'ban', {
      reason,
      moderator: interaction.user
    });
    if (!dm)
      await interaction.followUp({
        content: 'I could not message that user!',
        ephemeral: true
      });
    await member.ban({ deleteMessageSeconds: days * 60 * 60 * 24, reason: reason });
    log(interaction.guild!, 'ban', {
      target,
      moderator: interaction.user,
      reason
    });
  }
}

export default new Command();