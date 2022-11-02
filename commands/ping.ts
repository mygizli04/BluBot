import { SlashCommandBuilder } from 'discord.js';
import Command from '../types/command.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
  async execute(interaction) {
    interaction.reply(`Pong! (${interaction.client.ws.ping}ms)`);
    return;
  }
}

export default command;