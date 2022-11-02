import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, HexColorString, Interaction, resolveColor, SlashCommandBuilder, TextChannel } from 'discord.js';
import checkUserPerms from '../utils/checkUserPerms.js';
import log from '../utils/log.js';

import { getConfig } from '../types/config.js';
import Command from '../types/command.js';
const { customization } = await getConfig();
const accent = customization?.accent;

function checkCommandType (interaction: CommandInteraction): interaction is ChatInputCommandInteraction {
  return interaction.commandType === ApplicationCommandType.ChatInput;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge messages.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('channel')
        .setDescription('Purge messages by channel')
        .addNumberOption(option => option.setName('amount').setDescription('Amount of messages to purge (max 100)').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Channel to purge messages in'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('Purge messages by user')
        .addUserOption(option => option.setName('user').setDescription('User to purge messages for').setRequired(true))
        .addNumberOption(option => option.setName('amount').setDescription('Amount of messages to purge (max 100)').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Channel to purge messages in'))
    ) as SlashCommandBuilder,
  async execute(interaction) {
    if (!checkUserPerms(interaction as Interaction)) {
      interaction.reply({
        content: 'You do not have permission to do that!',
        ephemeral: true
      });
      return;
    }

    if (!checkCommandType(interaction)) {
      interaction.reply({
        content: 'This command is only available as a slash command.',
        ephemeral: true
      });
      return;
    }

    const amount = interaction.options.getNumber('amount')!;
    const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel
    const user = interaction.options.getUser('user')

    if (amount > 100) {
      interaction.reply('You can only purge up to 100 messages at once.');
      return;
    } 
    if (amount < 1) {
      interaction.reply('You must purge at least 1 message.');
      return;
    }

    const command = interaction.options.getSubcommand()
    if (command === 'channel') {
      await channel.bulkDelete(amount)
      await interaction.reply({
        embeds: [
          {
            title: `Purged ${amount} message${amount === 1 ? '' : 's'} in #${channel.name}!`,
            color: accent ? resolveColor(accent as HexColorString): undefined
          }
        ],
        ephemeral: true
      })
      log(interaction.guild!, 'purge', {
        moderator: interaction.user,
        channel: channel,
        amount
      })
      return;
    } else if (command === 'user') {
      const messages = await channel.messages.fetch({ limit: 100 })
      const userMessages = messages
        .filter(m => m.author.id === user!.id)
        .toJSON()
        .splice(0, amount)
      if (userMessages.length === 0) {
        interaction.reply('Could not find any messages by that user.');
        return;
      } 
      await channel.bulkDelete(userMessages)
      await interaction.reply({
        embeds: [
          {
            title: `Purged ${amount} message${amount == 1 ? '' : 's'} by ${user!.tag} in #${channel.name}!`,
            color: accent ? resolveColor(accent as HexColorString): undefined
          }
        ],
        ephemeral: true
      })
      log(interaction.guild!, 'purge', {
        target: user!,
        moderator: interaction.user,
        channel,
        amount
      })
      return
    }
  }
}

export default command;