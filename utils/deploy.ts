import sleep from './sleep.js';

import fs from "fs/promises";
import fileExists from "../utils/asyncFileExists.js";
import crypto from "crypto";
import { Routes, REST } from 'discord.js';
import { getConfig } from '../types/config.js';

const { guildId, token } = await getConfig();

export default async function deploy(id: string) {
  const commands = []
  const commandFiles = (await fs.readdir('./commands')).filter(file => file.endsWith('.js'))

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`)
    commands.push(command.data.toJSON())
  }
  const commandsHash = crypto.createHash('sha256').update(JSON.stringify(commands)).digest('hex')
  if (!await fileExists('./databases/commandsHash.txt')) await fs.writeFile('./databases/commandsHash.txt', '')
  if ((await fs.readFile('./databases/commandsHash.txt', 'utf-8')) === commandsHash) return
  fs.writeFile('./databases/commandsHash.txt', commandsHash)

  const rest = new REST({ version: '9' }).setToken(token)

  rest
    .put(Routes.applicationGuildCommands(id, guildId), { body: commands })
    .then(() =>
      // so it doesn't interfere with the console animation
      sleep(1000).then(() => console.log('Successfully updated guild commands.'))
    )
    .catch(console.error)
}
