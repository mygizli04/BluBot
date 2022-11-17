import { ChatInputCommandInteraction, Interaction, SlashCommandBuilder, TextChannel } from 'discord.js';
import { moderatorOnly } from '../decorators/authorizedOnly.js';
import { SlashCommand } from '../types/command';

class Command implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Echo a message as the bot user')
    .addStringOption(option => option.setName('message').setDescription('Message to echo').setRequired(true))
    .addChannelOption(option => option.setName('channel').setDescription('Channel to echo to')) as SlashCommandBuilder;

    @moderatorOnly()
    async execute(interaction: ChatInputCommandInteraction) {  
      const message = interaction.options.getString('message', true);
      const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel;
      const sent = await channel.send(message);
  
      if (!sent) {
        interaction.reply({
          content: 'I could not send a message to that channel!',
          ephemeral: true
        });
        return;
      }
  
      interaction.reply({
        content: `Successfully echoed that message to <#${channel.id}>`,
        ephemeral: true
      });
      return;
    }
}

export default new Command();