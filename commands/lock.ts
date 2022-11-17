import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder, TextChannel, PermissionsBitField } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.js';
import log from '../utils/log.js';

import { getConfig } from '../types/config.js';
const { customization } = await getConfig();
const accent = customization?.accent;

import { SlashCommand } from '../types/command.js';
import { moderatorOnly } from '../decorators/authorizedOnly.js';

function checkCommandType (interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to lock')) as SlashCommandBuilder;

  @moderatorOnly()
  async execute(interaction: ChatInputCommandInteraction) {
    const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel;
    if (!channel) {
      interaction.reply('I cannot access that channel!');
      return;
    }
    if (!channel.permissionsFor(interaction.guild!.roles.everyone).has(PermissionsBitField.Flags.SendMessages)) {
      interaction.reply('This channel is already locked!');
      return;
    }
    try {
      channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
        [Number(PermissionsBitField.Flags.SendMessages)]: false
      });
      await interaction.reply({
        embeds: [
          {
            title: `#${channel.name} locked.`,
            color: accent ? resolveColor(accent as HexColorString) : undefined
          }
        ]
      });
      log(interaction.guild!, 'lock', {
        channel,
        moderator: interaction.user
      });
    } catch (error) {
      console.log(error);
      interaction.reply('I cannot lock that channel!');
    }
  }
}

export default new Command();