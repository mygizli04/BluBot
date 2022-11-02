import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.mjs';
import log from '../utils/log.mjs';

import { getConfig } from '../types/config.mjs';
import Command from '../types/command.mjs';
const { customization } = await getConfig();
const accent = customization?.accent;

function checkCommandType (interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Revokes the ban for a member.')
    .addUserOption(option => option.setName('target').setDescription('User to unban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the unban')) as SlashCommandBuilder,
  async execute(interaction) {
    if (!checkUserPerms(interaction as Interaction)) {
      return interaction.reply({
        content: 'You do not have permission to do that!',
        ephemeral: true
      })
    }

    if (!checkCommandType(interaction)) {
      return interaction.reply({
        content: 'This command is only available as a slash command.',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('target')
    const reason = interaction.options.getString('reason') || 'N/A'
    await interaction.guild!.members.unban(target!)
    await interaction.reply({
      embeds: [
        {
          title: `${target!.tag} unbanned.`,
          color: accent ? resolveColor(accent as HexColorString) : undefined,
        }
      ],
      ephemeral: true
    })
    log(interaction.guild!, 'unban', {
      target: target!,
      moderator: interaction.user,
      reason
    })
  }
}

export default command;