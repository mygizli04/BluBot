import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder, TextChannel } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.mjs';
import log from '../utils/log.mjs';

import { getConfig } from '../types/config.mjs';
const { customization } = await getConfig();
const accent = customization?.accent;

import Command from '../types/command.mjs';

function checkCommandType (interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to lock')) as SlashCommandBuilder,
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

    const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel
    if (!channel) return interaction.reply('I cannot access that channel!')
    if (!channel.permissionsFor(interaction.guild!.roles.everyone).has('SendMessages')) return interaction.reply('This channel is already locked!')
    try {
      channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
        SendMessages: false
      })
      await interaction.reply({
        embeds: [
          {
            title: `#${channel.name} locked.`,
            color: accent ? resolveColor(accent as HexColorString): undefined
          }
        ]
      })
      log(interaction.guild!, 'lock', {
        channel,
        moderator: interaction.user
      })
    } catch (error) {
      console.log(error)
      interaction.reply('I cannot lock that channel!')
    }
  }
}

export default command;