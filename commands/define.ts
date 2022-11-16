import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, resolveColor, SlashCommandBuilder } from 'discord.js';
import axios from "axios";

import { getConfig } from '../types/config.js';
import { Command, SlashCommand } from '../types/command.js';
const { customization } = await getConfig();
const accent = customization?.accent;

interface QueryReply {
  success: boolean,
  amount: number,
  result: Result[]
}

interface Result {
  word: string,
  description: string
}

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Define a word with Urban Dictionary!')
    .addStringOption(option => option.setName('query').setDescription('Word to search for').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    interaction.deferReply()
    
    // https://guides.bludood.com/apis/urban-dictionary-api
    const api = 'https://urbanapi.up.railway.app'
    const query = interaction.options.getString('query')
    const res = await axios.get<QueryReply>(`${api}/define/${query}`)
    if (!res.data.success) {
      interaction.editReply('An error has occured!');
      return;
    }
    if (res.status === 404) {
      interaction.editReply('Could not find that word!');
      return;
    }
    const embed = {
      color: accent ? resolveColor(accent as HexColorString) : undefined,
      title: res.data.result[0].word,
      description: res.data.result[0].description
    }
    interaction.editReply({ embeds: [embed] });
    return;
  }
}

export default command;