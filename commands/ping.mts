import { SlashCommandBuilder } from 'discord.js';
import Command from '../types/command.mjs';

const command: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
  async execute(interaction) {
    return interaction.reply(`Pong! (${interaction.client.ws.ping}ms)`)
  }
}

export default command;