import { AuditLogEvent, Events } from 'discord.js';
import fs from 'fs';
import Event from '../types/event.mjs';
import log from '../utils/log.mjs';
import sleep from '../utils/sleep.mjs';

const event: Event = {
  event: Events.MessageDelete,
  async listener(message) {
    if (!fs.existsSync('./databases/deleted.txt')) fs.writeFileSync('./databases/deleted.txt', 'false', 'utf-8')
    if (fs.readFileSync('./databases/deleted.txt', 'utf-8') === 'true') {
      return fs.writeFileSync('./databases/deleted.txt', 'false', 'utf-8')
    }
    if (!message.guild) return
    await sleep(1000) // I feel like this has a story behind it lol
    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete
    })
    const deletionLog = fetchedLogs.entries.first()
    if (!deletionLog) return;
    const { executor, target } = deletionLog || {}
    if (target?.id === message.author.id && deletionLog.createdAt > message.createdAt)
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