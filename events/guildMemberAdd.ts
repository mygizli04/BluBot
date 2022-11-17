import { ClientEvents, Events, GuildMember, TextChannel } from 'discord.js';
import { nonFalsy } from '../decorators/nonNull.js';
import { getConfig } from '../types/config.js';
import Event from "../types/event.js";

const config = await getConfig();

class GuildMemberAddEvent implements Event {
  event: keyof ClientEvents = Events.GuildMemberAdd;
  
  @nonFalsy(config.channels?.welcome)
  async listener(member: GuildMember) {
    const channel = await member.guild.channels.fetch(config.channels!.welcome!) as TextChannel | null;
    if (!channel) return
    channel.send(`Hi <@${member.user.id}>, welcome to ${member.guild.name}!`)
  }
}

export default new GuildMemberAddEvent();
