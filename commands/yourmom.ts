import { HexColorString, resolveColor, SlashCommandBuilder } from 'discord.js';
import axios from "axios";
import { getConfig } from '../types/config.js';
import { SlashCommand } from '../types/command.js';

const { customization } = await getConfig();
const accent = customization?.accent;

interface Joke {
  joke: string
}

const command: SlashCommand = {
  data: new SlashCommandBuilder().setName('yourmom').setDescription("yo momma so phat she couldn't run this command"),
  async execute(interaction) {
    const joke = await axios.get<Joke>('https://api.yomomma.info');
    if (joke.data.joke)
      interaction.reply({
        embeds: [
          {
            title: joke.data.joke,
            color: accent ? resolveColor(accent as HexColorString) : undefined,
            footer: {
              text: `Powered by api.yomomma.info`
            }
          }
        ]
      })
    else {
      interaction.reply({
        embeds: [
          {
            title: 'Yo momma so phat she rolled over the cables and broke them',
            color: accent ? resolveColor(accent as HexColorString) : undefined,
            footer: {
              text: 'I was not able to fetch a joke from api.yomomma.info.'
            }
          }
        ]
      })
    }
  }
}

export default command;