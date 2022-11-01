import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, resolveColor, SlashCommandBuilder } from 'discord.js';
import axios from "axios";

import { getConfig } from '../types/config.mjs';
import Command from '../types/command.mjs';
const { customization } = await getConfig();
const accent = customization?.accent;

function checkCommandType (interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Define a word with Urban Dictionary!')
    .addStringOption(option => option.setName('query').setDescription('Word to search for').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!checkCommandType(interaction)) {
      return interaction.reply({
        content: 'This command is only available as a slash command.',
        ephemeral: true
      })
    }

    interaction.deferReply()
    
    // my api ;)
    const api = 'https://urbanapi.up.railway.app'
    const query = interaction.options.getString('query')
    // TODO: Get types for this
    const res = await axios.get(`${api}/define/${query}`)
    if (!res?.data?.success) return interaction.editReply('An error has occured!')
    if (res.status === 404) return interaction.editReply('Could not find that word!')
    const embed = {
      color: accent ? resolveColor(accent as HexColorString) : undefined,
      title: res.data.result[0].word,
      description: res.data.result[0].description
    }
    return interaction.editReply({ embeds: [embed] })
  }
}

export default command;