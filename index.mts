import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import fs from 'fs';
import deploy from './utils/deploy.mjs';
import bconsole from './console.mjs';

import Command from "./types/command.mjs"
import Modal from './types/modal.mjs';
import Event from './types/event.mjs';

import { getConfig, configPath } from './types/config.mjs';

if (!fs.existsSync(configPath)) {
  console.log("Looks like you haven't set up the bot yet! Please run 'npm run setup' and try again.")
  process.exit()
}

if (!fs.existsSync('./databases')) fs.mkdirSync('./databases')

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const commands = new Collection<string, Command>()
const modals = new Collection<string, Modal>()

const commandFiles = fs.readdirSync('./out/commands').filter(file => file.endsWith('.mjs'))
const modalFiles = fs.readdirSync('./out/modals').filter(file => file.endsWith('.mjs'))

for (const file of commandFiles) {
  const command: Command = (await import(`./commands/${file}`)).default
  commands.set(command.data.name, command)
}

for (const file of modalFiles) {
  const modal: Modal = (await import(`./modals/${file}`)).default
  modals.set(modal.id, modal)
}

bconsole.init(process.argv[2])
client.once(Events.ClientReady, async c => {
  bconsole.motd(c.user.tag)
  deploy(c.user.id)
})

for (const eventFile of fs.readdirSync('./out/events').filter(file => file.endsWith('.mjs'))) {
  const event: Event = (await import(`./events/${eventFile}`)).default
  // Since there is only a few events I know they will work so ok to type them as any
  client.on(event.event, event.listener as any)
}

client.on(Events.Error, error => {
  console.log(error)
})

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName)
    if (command) {
      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
      }
    }
  } else if (interaction.isModalSubmit()) {
    const modal = modals.get(interaction.customId)
    if (modal) {
      try {
        await modal.execute(interaction)
      } catch (error) {
        console.error(error)
      }
    }
  }
})

const { token } = await getConfig();
client.login(token)
