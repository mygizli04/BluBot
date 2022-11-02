import { Events } from 'discord.js';
import phishing from "../filters/phishing.mjs"
import Event from '../types/event.mjs';
import log from '../utils/log.mjs';

interface MessagedUser {
    time: number,
}

const messaged: {
  [key: string]: MessagedUser
} = {};

const event: Event = {
  event: Events.MessageCreate,
  async listener(message) {
    if (message.author.bot) return
    const phishingLinks = await phishing(message.content)
    if (phishingLinks && phishingLinks.length !== 0) {
      await message.delete()
      if (messaged[message.author.id]?.time > Date.now() / 1000) return
      message.author.send("Sorry, you can't send that link here!\nThe link was referring to a known phishing scam, so i deleted the message for you.")
      if (!messaged[message.author.id]) messaged[message.author.id] = {time: Date.now() / 1000 + 300}
      log(message.guild!, 'phish', {
        channel: message.channel,
        target: message.author,
        content: message.content,
        site: phishingLinks.join('\n')
      })
    }
  }
}
