import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder, TextChannel } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.js';
import log from '../utils/log.js';

import { getConfig } from '../types/config.js';
const { customization } = await getConfig();
const accent = customization?.accent;

import Command from '../types/command.js';

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
      interaction.reply({
        content: 'You do not have permission to do that!',
        ephemeral: true
      });
      return;
    }

    if (!checkCommandType(interaction)) {
      interaction.reply({
        content: 'This command is only available as a slash command.',
        ephemeral: true
      });
      return;
    }

    const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel
    if (!channel) {
      interaction.reply('I cannot access that channel!');
      return;
    }
    if (!channel.permissionsFor(interaction.guild!.roles.everyone).has('SendMessages')) {
      interaction.reply('This channel is already locked!');
      return;
    }
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