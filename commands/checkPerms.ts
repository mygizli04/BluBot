import { ChatInputCommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.js';

import { getConfig } from '../types/config.js';
import { SlashCommand } from '../types/command.js';
import { moderatorOnly } from '../decorators/authorizedOnly.js';
const { customization } = await getConfig();
const accent = customization?.accent;

class Command implements SlashCommand {
  data = new SlashCommandBuilder().setName('check').setDescription('Check if are allowed to moderate using this bot.');

  @moderatorOnly("You are not allowed to moderate using this bot.")
  async execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({
      embeds: [
        {
          title: `You are allowed to moderate using this bot!`,
          color: accent ? resolveColor(accent as HexColorString): undefined
        }
      ]
    });
    return;
  }
}

export default new Command();