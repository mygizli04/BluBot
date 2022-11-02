import { HexColorString, Interaction, resolveColor, SlashCommandBuilder } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.js';

import { getConfig } from '../types/config.js';
import Command from '../types/command.js';
const { customization } = await getConfig();
const accent = customization?.accent;

const command: Command = {
  data: new SlashCommandBuilder().setName('check').setDescription('Check if are allowed to moderate using this bot.'),
  async execute(interaction) {
    if (checkUserPerms(interaction as Interaction)) {
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
    interaction.reply({
      embeds: [
        {
          title: `You are not allowed to moderate using this bot.`,
          color: accent ? resolveColor(accent as HexColorString): undefined
        }
      ]
    });
    return;
  }
}

export default command;