import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder } from 'discord.js';
import Command from '../types/command.mjs';

import { getConfig } from '../types/config.mjs';
const { customization } = await getConfig();
const accent = customization?.accent;

import checkUserPerms from '../utils/checkUserPerms.mjs';
import directMessage from '../utils/directMessage.mjs';
import log from '../utils/log.js';

function checkCommandType(interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member.')
    .addUserOption(option => option.setName('target').setDescription('User to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the ban'))
    .addNumberOption(option => option.setName('deletedays').setDescription('Days to delete messages')) as SlashCommandBuilder,

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

    const target = interaction.options.getUser('target')!
    const reason = interaction.options.getString('reason') || 'N/A'
    const days = interaction.options.getNumber('deletedays') || 0
    const member = await interaction.guild!.members.fetch({ user: target, force: true }).catch(() => null)
    if (!member)
      return interaction.reply({
        content: "I can't find that user!",
        ephemeral: true
      })
    if (!member.bannable)
      return interaction.reply({
        content: "I can't ban that user!",
        ephemeral: true
      })
    await interaction.reply({
      embeds: [
        {
          title: `${target.tag} banned.`,
          color: resolveColor(accent as HexColorString)
        }
      ],
      ephemeral: true
    })
    const dm = await directMessage(interaction.guild!, target, 'ban', {
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
    await member.ban({ deleteMessageSeconds: days * 60 * 60 * 24, reason: reason })
    log(interaction.guild, 'ban', {
      target: {
        id: target.id,
        tag: target.tag
      },
      moderator: {
        id: interaction.user.id
      },
      reason
    })
  }
}

export default command;