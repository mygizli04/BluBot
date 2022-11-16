import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder, TextChannel, PermissionsBitField } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.js';
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
    .setName('unlock')
    .setDescription('Unlock a channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to unlock')) as SlashCommandBuilder;

    @authorizedOnly()
    async execute(interaction: ChatInputCommandInteraction) {
      const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel;
      if (!channel) {
        interaction.reply('I cannot access that channel!');
        return;
      }
      if (channel.permissionsFor(interaction.guild!.roles.everyone).has(PermissionsBitField.Flags.SendMessages)) {
        interaction.reply('This channel is not locked!');
        return;
      }
      try {
        channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
          [Number(PermissionsBitField.Flags.SendMessages)]: null
        });
        await interaction.reply({
          embeds: [
            {
              title: `#${channel.name} unlocked.`,
              color: accent ? resolveColor(accent as HexColorString) : undefined,
            }
          ]
        });
        log(interaction.guild!, 'unlock', {
          channel,
          moderator: interaction.user
        });
      } catch (error) {
        console.log(error);
        interaction.reply('I cannot unlock that channel!');
      }
    }
}


export default new Command();