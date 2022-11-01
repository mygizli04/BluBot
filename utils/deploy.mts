import sleep from './sleep.mjs';

import fs from "fs";
import crypto from "crypto";
import { Routes, REST } from 'discord.js';
import { getConfig } from '../types/config.mjs';

const { guildId, token } = await getConfig();

export default (id: string) => {
  const commands = []
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`)
    commands.push(command.data.toJSON())
  }
  const commandsHash = crypto.createHash('sha256').update(JSON.stringify(commands)).digest('hex')
  if (!fs.existsSync('./databases/commandsHash.txt')) fs.writeFileSync('./databases/commandsHash.txt', '')
  if (fs.readFileSync('./databases/commandsHash.txt', 'utf-8') === commandsHash) return
  fs.writeFileSync('./databases/commandsHash.txt', commandsHash)

  const rest = new REST({ version: '9' }).setToken(token)

  rest
    .put(Routes.applicationGuildCommands(id, guildId), { body: commands })
    .then(() =>
      // so it doesn't interfere with the console animation
      sleep(1000).then(() => console.log('Successfully updated guild commands.'))
    )
    .catch(console.error)
}
