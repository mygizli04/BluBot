import { ApplicationCommandType, ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import directMessage from '../utils/directMessage.js';
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
    .setName('timeout')
    .setDescription('Time out a member.')
    .addUserOption(option => option.setName('target').setDescription('User to timeout').setRequired(true))
    .addStringOption(option => option.setName('duration').setDescription('Duration for the timeout (s, m, h, d, w, M, y)').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the timeout')) as SlashCommandBuilder,
  async execute (interaction) {
    if (!checkCommandType(interaction)) {
      interaction.reply({
        content: 'This command is only available as a slash command.',
        ephemeral: true
      });
      return;
    }

    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') ?? 'N/A';
    const member = await interaction.guild!.members.fetch({ user: target!, force: true }).catch(() => null);
    if (!member) {
      interaction.reply({
        content: "I can't find that user!",
        ephemeral: true
      });
      return;
    }
    if (!member.moderatable) {
      interaction.reply({
        content: "I can't timeout that user!",
        ephemeral: true
      });
      return;
    }
    const durationUnits = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
      w: 604800000,
      M: 2592000000,
      y: 31536000000
    };
    const unitNames = {
      s: 'second',
      m: 'minute',
      h: 'hour',
      d: 'day',
      w: 'week',
      M: 'month',
      y: 'year'
    };
    const [amount, unit] =
      interaction.options
        .getString('duration')!
        .match(/([0-9]+)([a-zA-Z]{1})/)
        ?.splice(1) || [];

    const parsedAmount = parseInt(amount);

    if (!durationUnits[unit as keyof typeof unitNames]) {
      interaction.reply({
        content: `${unit} is not a valid unit!`,
        ephemeral: true
      });
      return;
    }
    const duration = parsedAmount * durationUnits[unit as keyof typeof unitNames];
    await interaction.reply({
      embeds: [
        {
          title: `${target!.tag} timed out.`,
          color: accent ? parseInt(accent) : undefined,
        }
      ],
      ephemeral: true
    });
    const dm = await directMessage(interaction.guild!, target!, 'timeout', {
      reason,
      moderator: interaction.user,
      duration: `Duration: ${parsedAmount} ${unitNames[unit as keyof typeof unitNames]}${parsedAmount === 1 ? '' : 's'}`
    });
    if (!dm)
      await interaction.followUp({
        content: 'I could not message that user!',
        ephemeral: true
      });
    await member.timeout(duration, reason);
    log(interaction.guild!, 'timeout', {
      target: target!,
      moderator: interaction.user,
      reason,
      duration: `${amount} ${unitNames[unit as keyof typeof unitNames]}${parsedAmount === 1 ? '' : 's'}`
    });
  }
};

export default command;