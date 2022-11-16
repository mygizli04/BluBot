import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types/command.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
  async execute(interaction) {
    interaction.reply(`Pong! (${interaction.client.ws.ping}ms)`);
    return;
  }
}

export default command;