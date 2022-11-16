import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.js';
import directMessage from '../utils/directMessage.js';
import log from '../utils/log.js';

import { getConfig } from '../types/config.js';
import { SlashCommand } from '../types/command.js';
import { authorizedOnly } from '../decorators/authorizedOnly.js';
const { customization } = await getConfig();
const accent = customization?.accent;

function checkCommandType (interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member.')
    .addUserOption(option => option.setName('target').setDescription('User to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the kick')) as SlashCommandBuilder;

  @authorizedOnly()
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'N/A';
    const member = await interaction.guild!.members.fetch({ user: target!, force: true });
    if (!member) {
      interaction.reply({
        content: "I can't find that user!",
        ephemeral: true
      });
      return;
    }
    if (!member.kickable) {
      interaction.reply({
        content: "I can't kick that user!",
        ephemeral: true
      });
      return;
    }
    await interaction.reply({
      embeds: [
        {
          title: `${target!.tag} kicked.`,
          color: accent ? resolveColor(accent as HexColorString) : undefined
        }
      ],
      ephemeral: true
    });
    const dm = await directMessage(interaction.guild!, target!, 'kick', {
      reason,
      moderator: interaction.user
    });
    if (!dm)
      await interaction.followUp({
        content: 'I could not message that user!',
        ephemeral: true
      });
    await member.kick(reason);
    log(interaction.guild!, 'kick', {
      target: target!,
      moderator: interaction.user,
      reason
    });
  }
}

export default new Command();