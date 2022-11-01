import { HexColorString, ImageExtension, resolveColor, SlashCommandBuilder } from 'discord.js';
import Command from '../types/command.mjs';
import { getConfig } from '../types/config.mjs';

const { customization } = await getConfig();
let accent = customization?.accent;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Get your or another user's avatar")
    .addUserOption(option => option.setName('target').setDescription('User to show avatar for')) as SlashCommandBuilder,
  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user
    const avatar = (format: ImageExtension) => user.avatarURL({ extension: format })
    const pngAvatar = avatar('png');
    interaction.reply({
      embeds: [
        {
          title: `${user.username}'s avatar`,
          description: `Download as [png](${pngAvatar}), [jpeg](${avatar('jpeg')}) or [webp](${avatar('webp')}).`,
          color: accent ? resolveColor(accent as HexColorString): undefined,
          image: pngAvatar ? {
            url: pngAvatar
          } : undefined
        }
      ]
    })
  }
}

export default command;