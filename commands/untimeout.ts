import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, resolveColor, SlashCommandBuilder } from 'discord.js';
import directMessage from '../utils/directMessage.js';
import log from '../utils/log.js';

import { getConfig } from '../types/config.js';
import { SlashCommand } from '../types/command.js';
import { moderatorOnly } from '../decorators/authorizedOnly.js';
const { customization } = await getConfig();
const accent = customization?.accent;

function checkCommandType (interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove the timeout a member.')
    .addUserOption(option => option.setName('target').setDescription('User to remove timeout for').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the timeout removal')) as SlashCommandBuilder;

  @moderatorOnly()
  async execute (interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('target')!;
    const reason = interaction.options.getString('reason') || 'N/A';
    const member = await interaction.guild!.members.fetch({ user: target, force: true }).catch(() => null);
    if (!member) {
      interaction.reply({
        content: "I can't find that user!",
        ephemeral: true
      });
      return;
    }
    if (!member.moderatable) {
      interaction.reply({
        content: "I can't remove the timeout for that user!",
        ephemeral: true
      });
      return;
    }
    await interaction.reply({
      embeds: [
        {
          title: `Removed timeout for ${target.tag}.`,
          color: accent ? resolveColor(accent as HexColorString) : undefined,
        }
      ],
      ephemeral: true
    });
    const dm = await directMessage(interaction.guild!, target, 'untimeout', {
      reason,
      moderator: interaction.user
    });
    if (!dm)
      await interaction.followUp({
        content: 'I could not message that user!',
        ephemeral: true
      });
    await member.timeout(null, reason);
    log(interaction.guild!, 'untimeout', {
      target,
      moderator: interaction.user,
      reason
    });
  }
}

export default new Command();