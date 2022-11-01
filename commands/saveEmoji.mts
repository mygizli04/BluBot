import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import Command from '../types/command.mjs';

function checkCommandType (interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('saveemoji')
    .setDescription('Converts an emoji to an image.')
    .addStringOption(option => option.setName('emoji').setDescription('Emoji to convert').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!checkCommandType(interaction)) {
      return interaction.reply({
        content: 'This command is only available as a slash command.',
        ephemeral: true
      })
    }

    const emojiName = interaction.options.getString('emoji')!;
    const isCustom = emojiName.startsWith('<:') && emojiName.endsWith('>')
    const emoji = isCustom ? `https://cdn.discordapp.com/emojis/${emojiName.match(/[0-9]+/)![0]}.png` : `https://emojicdn.elk.sh/${emojiName}?style=apple`
    return interaction.reply(emoji)
  }
}

export default command;