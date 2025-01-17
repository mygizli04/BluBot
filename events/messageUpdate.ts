import { Events } from 'discord.js';
import Event from '../types/event.js';
import log from '../utils/log.js';

const event: Event = {
  event: Events.MessageUpdate,
  async listener(oldMessage, newMessage) {
    if (oldMessage.content === newMessage.content) return
    if (!newMessage.guild) return;
    log(newMessage.guild, 'messageEdit', {
      oldMessage: oldMessage.content,
      content: newMessage.content,
      target: newMessage.author,
      channel: newMessage.channel
    })
  }
}

export default event;