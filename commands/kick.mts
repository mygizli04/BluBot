import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.mjs';
import directMessage from '../utils/directMessage.mjs';
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
    .setName('kick')
    .setDescription('Kick a member.')
    .addUserOption(option => option.setName('target').setDescription('User to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the kick')) as SlashCommandBuilder,
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
      })
    }

    const target = interaction.options.getUser('target')
    const reason = interaction.options.getString('reason') || 'N/A'
    const member = await interaction.guild!.members.fetch({ user: target!, force: true })
    if (!member)
      return interaction.reply({
        content: "I can't find that user!",
        ephemeral: true
      })
    if (!member.kickable)
      return interaction.reply({
        content: "I can't kick that user!",
        ephemeral: true
      })
    await interaction.reply({
      embeds: [
        {
          title: `${target!.tag} kicked.`,
          color: accent ? resolveColor(accent as HexColorString): undefined
        }
      ],
      ephemeral: true
    })
    const dm = await directMessage(interaction.guild!, target!, 'kick', {
      reason,
      moderator: {
        id: interaction.user.id
      }
    })
    if (!dm)
      await interaction.followUp({
        content: 'I could not message that user!',
        ephemeral: true
      })
    await member.kick(reason)
    log(interaction.guild!, 'kick', {
      target: target!,
      moderator: interaction.user,
      reason
    })
  }
}

export default command;