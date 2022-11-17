import Modal from '../types/modal.js';
import * as tag from '../utils/tag.js';

const modal: Modal = {
  id: 'add-tag',
  async execute(interaction) {
    const name = interaction.fields.fields.find(f => f.customId === 'name')!.value
    const content = interaction.fields.fields.find(f => f.customId === 'content')!.value
    const image = interaction.fields.fields.find(f => f.customId === 'image')?.value
    if (await tag.get(name)) {
      interaction.reply({ content: `A tag with the name ${name} already exists.`, ephemeral: true });
      return;
    }

    tag.add(name, content, image)
    interaction.reply({ content: `Added tag ${name}.`, ephemeral: true })
  }
}

export default modal;