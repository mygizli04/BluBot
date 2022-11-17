import { ClientEvents, Events, GuildMember, MessageReaction } from 'discord.js';
import * as reactionroles from '../utils/reactionroles.js';
import Event from '../types/event.js';

class MessageReactionRemoveEvent implements Event {
  event: keyof ClientEvents = Events.MessageReactionAdd;

  async listener(reaction: MessageReaction, user: GuildMember) {
    // I'll assume at least one of (reaction.emoji.id || reaction.emoji.name) isn't null?
    const found = await reactionroles.get((reaction.emoji.id || reaction.emoji.name)!, reaction.message.id)
    if (found) {
      const member = await reaction.message.guild!.members.fetch(user.id)
      if (member) member.roles.remove(found.role)
    }
  }
}

export default new MessageReactionRemoveEvent();