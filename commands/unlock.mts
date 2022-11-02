import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder, TextChannel } from 'discord.js';
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
    .setName('unlock')
    .setDescription('Unlock a channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to unlock')) as SlashCommandBuilder,
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

    const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel
    if (!channel) return interaction.reply('I cannot access that channel!')
    if (channel.permissionsFor(interaction.guild!.roles.everyone).has('SendMessages')) return interaction.reply('This channel is not locked!')
    try {
      channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
        SendMessages: null
      })
      await interaction.reply({
        embeds: [
          {
            title: `#${channel.name} unlocked.`,
            color: accent ? resolveColor(accent as HexColorString) : undefined,
          }
        ]
      })
      log(interaction.guild!, 'unlock', {
        channel,
        moderator: interaction.user
      })
    } catch (error) {
      console.log(error)
      interaction.reply('I cannot unlock that channel!')
    }
  }
}

export default command;