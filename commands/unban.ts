import { ChatInputCommandInteraction, HexColorString, resolveColor, SlashCommandBuilder } from 'discord.js';
import log from '../utils/log.js';

import { getConfig } from '../types/config.js';
import { SlashCommand } from '../types/command.js';
import { moderatorOnly } from '../decorators/authorizedOnly.js';
const { customization } = await getConfig();
const accent = customization?.accent;

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Revokes the ban for a member.')
    .addUserOption(option => option.setName('target').setDescription('User to unban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the unban')) as SlashCommandBuilder;

  @moderatorOnly()
  async execute (interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'N/A';
    await interaction.guild!.members.unban(target!);
    await interaction.reply({
      embeds: [
        {
          title: `${target!.tag} unbanned.`,
          color: accent ? resolveColor(accent as HexColorString) : undefined,
        }
      ],
      ephemeral: true
    });
    log(interaction.guild!, 'unban', {
      target: target!,
      moderator: interaction.user,
      reason
    });
  }
}

export default new Command();