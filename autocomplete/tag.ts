import { AutocompleteInteraction } from 'discord.js';
import { subcommands } from '../decorators/subcommands.js';
import { AutoComplete } from '../types/autocomplete.js';
import * as tag from '../utils/tag.js';

class TagAutoComplete implements AutoComplete {
  id = "tag";

  @subcommands('remove', 'get', 'edit', 'faqtoggle')
  async execute(interaction: AutocompleteInteraction) {
    const tags = await tag.getDatabase();
    const tagNames = Object.keys(tags).filter(name => name.toLowerCase().includes(interaction.options.getFocused().toLowerCase()))
    return interaction.respond(tagNames.map(tag => ({ name: tag, value: tag })))
  }
}

export default new TagAutoComplete();