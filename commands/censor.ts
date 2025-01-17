import { ChatInputCommandInteraction, HexColorString, resolveColor, SlashCommandBuilder } from 'discord.js';
import fs from 'fs/promises';

import { getConfig } from '../types/config.js';
import { SlashCommand } from '../types/command.js';
import { moderatorOnly } from '../decorators/authorizedOnly.js';
const { customization } = await getConfig();
const accent = customization?.accent;

interface CensoredWord {
  user: string,
  word: string;
}

function validateCensoredWord (word: any): word is CensoredWord {
  if (typeof word.user !== "string") return false;
  if (typeof word.word !== "string") return false;

  return true;
}

try {
  await fs.access("./databases/censored.json");
}
catch {
  await fs.writeFile("./databases/censored.json", "[]");
}

const censored: CensoredWord[] = JSON.parse(await fs.readFile("./databases/censored.json", "utf-8"));

censored.forEach(word => {
  if (!validateCensoredWord(word)) {
    throw new Error("Cannot validate censored word database!");
  }
});

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('censor')
    .setDescription('Configure censored words')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a censored word')
        .addStringOption(option => option.setName('word').setDescription('The word to censor').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a censored word')
        .addStringOption(option => option.setName('word').setDescription('The word to remove').setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName('list').setDescription('List all censored words')) as SlashCommandBuilder;

  @moderatorOnly()
  async execute (interaction: ChatInputCommandInteraction) {
    const word = interaction.options.getString('word', true).toLowerCase();

    if (interaction.options.getSubcommand() === 'add') {
      if (censored.map(c => c.word).includes(word)) {
        interaction.reply({
          content: 'This word is already censored!',
          ephemeral: true
        });
        return;
      }
      censored.push({
        user: interaction.user.id,
        word
      });
      await fs.writeFile('./databases/censored.json', JSON.stringify(censored));
      interaction.reply({
        content: `Censored the word ${word}!`,
        ephemeral: true
      });
      return;
    } else if (interaction.options.getSubcommand() === 'remove') {
      const found = censored.find(c => c.word === word);
      if (!found) {
        interaction.reply({
          content: 'This word is not censored!',
          ephemeral: true
        });
        return;
      }
      const index = censored.indexOf(found);
      censored.splice(index, 1);
      await fs.writeFile('./databases/censored.json', JSON.stringify(censored));
      interaction.reply({
        content: `Removed censor for the word ${word}!`,
        ephemeral: true
      });
      return;
    } else if (interaction.options.getSubcommand() === 'list') {
      interaction.reply({
        embeds: [
          {
            title: 'Censored words',
            color: accent ? resolveColor(accent as HexColorString) : undefined,
            fields: censored.map(c => ({
              name: c.word,
              value: `Added by <@${c.user}>`
            }))
          }
        ],
        ephemeral: true
      });
      return;
    } else {
      interaction.reply('Invalid option.');
      return;
    }
  }
}

export default new Command();