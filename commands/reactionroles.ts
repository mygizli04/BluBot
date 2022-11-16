import { APIEmbed, ChatInputCommandInteraction, HexColorString, resolveColor, SlashCommandBuilder } from 'discord.js';
import * as reactionroles from '../utils/reactionroles';
import { getConfig } from '../types/config.js';
import { SlashCommand } from '../types/command';
import { authorizedOnly } from '../decorators/authorizedOnly';

const config = await getConfig();

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('reactionroles')
    .setDescription('Manage reaction roles')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a reaction role')
        .addRoleOption(option => option.setName('role').setDescription('Role to add').setRequired(true))
        .addStringOption(option => option.setName('emoji').setDescription('Emoji reaction').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('Link to message').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a reaction role')
        .addStringOption(option => option.setName('emoji').setDescription('Emoji reaction').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('Link to message').setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName('list').setDescription('List current reaction roles')) as SlashCommandBuilder;

  @authorizedOnly()
  async execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole('role');
    const emoji = interaction.options.getString('emoji') ? interaction.options.getString('emoji')?.split(':').pop()?.match(/[0-9]+/)?.[0] || interaction.options.getString('emoji') : undefined;
    const [_guildId, channelId, messageId] =
      interaction.options
        .getString('message')
        ?.match(/[0-9]+\/[0-9]+\/[0-9]+/)?.[0]
        .split('/') || [];
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'add') {
      if (!channelId || !messageId || !emoji) {
        interaction.reply({
          content: 'Invalid input',
          ephemeral: true
        });
        return;
      }
      const found = await reactionroles.get(emoji, messageId);
      if (found) {
        interaction.reply({
          content: 'That message and emoji combo already has a reaction role!',
          ephemeral: true
        });
        return;
      }
      reactionroles.add(emoji, messageId, role!.id, channelId, interaction.options.getString('emoji'), interaction.client);
      interaction.reply({
        content: `Added reaction role with emoji ${interaction.options.getString('emoji')}, [this message](${interaction.options.getString('message')}) and role <@&${role!.id}>`,
        ephemeral: true
      });
      return;
    } else if (subcommand === 'remove') {
      if (!messageId || !emoji) {
        interaction.reply({
          content: 'Invalid input',
          ephemeral: true
        });
        return;
      }
      const found = reactionroles.get(emoji, messageId);
      if (!found) {
        interaction.reply({
          content: 'That reaction role does not exist!',
          ephemeral: true
        });
        return;
      }
      reactionroles.remove(emoji, messageId);
      interaction.reply({
        content: `Removed reaction role with emoji ${interaction.options.getString('emoji')} from [this message](${interaction.options.getString('message')})`,
        ephemeral: true
      });
      return;
    } else if (subcommand === 'list') {
      const roles = await reactionroles.getDatabase();
      const embed: APIEmbed = {
        title: `Reaction roles in ${interaction.guild!.name}`,
        color: config.customization?.accent ? resolveColor(config.customization?.accent as HexColorString) : undefined,
        description: roles.map(r =>
              `[Jump to Message](https://discord.com/channels/${interaction.guild!.id}/${r.channelID}/${r.messageID})\n${r.roles.map(ro => `${ro.emojiName}: <@&${ro.role}>`).join('\n')}`
          ).join('\n\n')
      };
      interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
      return;
    }
  }
}

export default new Command();