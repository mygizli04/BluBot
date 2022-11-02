import { AuditLogEvent, Events } from 'discord.js';
import Event from '../types/event.js';
import log from '../utils/log.js';
import sleep from '../utils/sleep.js';

const event: Event = {
  event: Events.MessageDelete,
  async listener(message) {
    if (!message.guild) return
    await sleep(1000) // I feel like this has a story behind it lol
    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete
    })
    const deletionLog = fetchedLogs.entries.first()
    const { executor, target } = deletionLog || {}
    if (target?.id === message.author.id && (deletionLog && (deletionLog.createdAt > message.createdAt)))
      log(message.guild, 'messageDelete', {
        moderator: executor ?? undefined,
        content: message.content,
        channel: message.channel,
        target: message.author
      })
    else
      log(message.guild, 'messageDelete', {
        content: message.content,
        channel: message.channel,
        target: message.author
      })
  }
}

export default event;