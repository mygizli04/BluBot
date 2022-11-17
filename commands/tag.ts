import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ChatInputCommandInteraction, APIEmbed, resolveColor, HexColorString } from 'discord.js';
import * as tag from '../utils/tag.js';

import { getConfig } from '../types/config.js';
const config = await getConfig();

import type { SlashCommand } from '../types/command';
import { moderatorOnly } from '../decorators/authorizedOnly.js';
import { nonFalsy } from '../decorators/nonNull.js';

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Manage tags')
    .addSubcommand(subcommand => subcommand.setName('add').setDescription('Add a tag'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a tag')
        .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subcommand => subcommand.setName('list').setDescription('List all tags'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('get')
        .setDescription('Get a tag')
        .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true))
        .addUserOption(option => option.setName('mention').setDescription('User to mention'))
        .addBooleanOption(option => option.setName('preview').setDescription('Send tag as a preview instead of displaying it publicly'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit')
        .setDescription('Edit a tag')
        .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('faqtoggle')
        .setDescription('Toggle specified item to appear on the FAQ list')
        .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true))
    ) as SlashCommandBuilder;

  @moderatorOnly()
  async add (interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = new ModalBuilder().setTitle('Add a tag').setCustomId('add-tag');

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setPlaceholder('Name')
      .setLabel('Name')
      .setMinLength(1)
      .setMaxLength(99)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const contentInput = new TextInputBuilder()
      .setCustomId('content')
      .setPlaceholder('Content')
      .setLabel('Content')
      .setMinLength(1)
      .setMaxLength(2000)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const imageInput = new TextInputBuilder()
      .setCustomId('image')
      .setLabel('Image')
      .setPlaceholder('Image URL')
      .setMinLength(1)
      .setMaxLength(2000)
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput), new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput), new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput));

    await interaction.showModal(modal);
  }

  @moderatorOnly()
  async remove (interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name')!;
    if (!tag.get(name)) {
      interaction.reply({ content: `A tag with the name ${name} does not exist.`, ephemeral: true });
      return;
    }

    tag.remove(name);
    interaction.reply({ content: `Removed tag ${name}.`, ephemeral: true });
    tag.updateFAQList(interaction.client);
  }

  async list (interaction: ChatInputCommandInteraction): Promise<void> {
    const tagList = Object.keys(tag.getAll());
      if (tagList.length === 0) {
        interaction.reply({ content: 'There are no tags.', ephemeral: true })
        return;
      }

      const embed: APIEmbed = {
        title: `Tags in ${interaction.guild!.name}`,
        description: `**${tagList.join('\n')}**`,
        color: config.customization?.accent ? resolveColor(config.customization.accent as HexColorString) : undefined,
        footer: {
          text: `${tagList.length} tag${tagList.length === 1 ? '' : 's'}`
        }
      };
      interaction.reply({ embeds: [embed], ephemeral: true });
    }

  async get (interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name')!;
    const user = interaction.options.getUser('mention');
    const preview = interaction.options.getBoolean('preview');
    const foundTag = await tag.get(name);

    if (!foundTag) {
      // Shhhh, you didn't see anything.
      // i certainly did not ;)
      // Sorry for changing this again the lack of the question mark was really getting to me!
      // might add my own one too then :)
      if (name === 'sbeve is amazing')  {
        interaction.reply({ content: 'I know, right?!', ephemeral: true });
        return; 
      }
      if (name === 'bludood is the best') {
        interaction.reply({ content: 'very true', ephemeral: true });
        return;
      }

      interaction.reply({ content: `A tag with the name ${name} does not exist.`, ephemeral: true });
      return;
    }

    const embed: APIEmbed = {
      title: name,
      description: foundTag.content,
      color: config.customization?.accent ? resolveColor(config.customization.accent as HexColorString) : undefined,
      image: foundTag.image ? {
        url: foundTag.image
      } : undefined
    };
    user ? interaction.reply({ content: `<@${user.id}>, take a look at this!`, embeds: [embed] }) : interaction.reply({ embeds: [embed], ephemeral: preview ?? false });
  }

  @moderatorOnly()
  async edit (interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name')!;
    const foundTag = await tag.get(name);
    if (!foundTag) {
      interaction.reply({ content: `A tag with the name ${name} does not exist.`, ephemeral: true });
      return;
    }

    const modal = new ModalBuilder().setTitle('Edit a tag').setCustomId('edit-tag');

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setPlaceholder('Name')
      .setLabel('Name')
      .setMinLength(1)
      .setMaxLength(99)
      .setRequired(true)
      .setStyle(TextInputStyle.Short)
      .setValue(name);

    const contentInput = new TextInputBuilder()
      .setCustomId('content')
      .setPlaceholder('Content')
      .setLabel('Content')
      .setMinLength(1)
      .setMaxLength(2000)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph)
      .setValue(foundTag.content);

    const imageInput = new TextInputBuilder()
      .setCustomId('image')
      .setLabel('New image')
      .setPlaceholder('New image URL')
      .setMinLength(1)
      .setMaxLength(2000)
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setValue(foundTag.image ?? "");

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput), new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput), new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput));

    await interaction.showModal(modal);
  }

  @moderatorOnly()
  @nonFalsy(config.channels?.faq, "An FAQ channel has not been configured. Please report this to the bot owner.")
  async faqtoggle(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name')!;
    const foundTag = await tag.get(name);
    if (!foundTag) {
      interaction.reply({ content: `A tag with the name ${name} does not exist.`, ephemeral: true });
      return;
    }
    const wasFAQItem = foundTag.faqitem || false;
    tag.modify(name, null, null, wasFAQItem ? false : true);
    interaction.reply({ content: wasFAQItem ? `Removed tag ${name} from the FAQ list.` : `Added tag ${name} to the FAQ list.`, ephemeral: true });
    tag.updateFAQList(interaction.client);
  }

  async execute (interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "add":
        return await this.add(interaction);
      case "remove":
        return await this.remove(interaction);
      case "list":
        return await this.list(interaction);
      case "get":
        return await this.get(interaction);
      case "edit":
        return await this.edit(interaction);
      case "faqtoggle":
        return await this.faqtoggle(interaction);
    }
  }
}

export default new Command();