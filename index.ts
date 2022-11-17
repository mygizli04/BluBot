import { Client, Collection, GatewayIntentBits, Events, ApplicationCommandType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import fs from 'fs/promises';
import fileExists from "./utils/asyncFileExists.js";
import deploy from './utils/deploy.js';
import bconsole from './utils/console.js';
import { cacheAll } from './utils/reactionroles.js';
import * as release from './utils/release.js';

import { Command } from "./types/command.js"
import Modal from './types/modal.js';
import Event from './types/event.js';

import { getConfig, configPath } from './types/config.js';
import { AutoComplete } from './types/autocomplete.js';


if (!await fileExists(configPath)) {
  console.log("Looks like you haven't set up the bot yet! Please run 'npm run setup' and try again.")
  process.exit()
}

if (!await fileExists('./databases')) await fs.mkdir('./databases')

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers]
});

const commands = new Collection<string, Command>();
const modals = new Collection<string, Modal>();
const autoCompletes = new Collection<string, AutoComplete>();

const commandFiles = (await fs.readdir('./out/commands')).filter(file => file.endsWith('.js'));
const modalFiles = (await fs.readdir('./out/modals')).filter(file => file.endsWith('.js'));
const autoCompleteFiles = (await fs.readdir('./out/autocomplete')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command: Command = (await import(`./commands/${file}`)).default
  commands.set(command.data.name, command)
}

for (const file of modalFiles) {
  const modal: Modal = (await import(`./modals/${file}`)).default
  modals.set(modal.id, modal)
}

for (const file of autoCompleteFiles) {
  const autoComplete: AutoComplete = (await import(`./autocomplete/${file}`)).default
  autoCompletes.set(autoComplete.id, autoComplete)
}

bconsole.init()
client.once(Events.ClientReady, async c => {
  bconsole.motd(c.user.tag)
  deploy(c.user.id)
  cacheAll(client)
  release.startCheckLoop(client)
})

for (const eventFile of (await fs.readdir('./out/events')).filter(file => file.endsWith('.js'))) {
  const event: Event = (await import(`./events/${eventFile}`)).default
  // Since there is only a few events I know they will work so ok to type them as any
  client.on(event.event, event.listener as any)
}

client.on(Events.Error, error => {
  console.log(error)
})

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isCommand()) {
    if (interaction.commandType !== ApplicationCommandType.Message && interaction.commandType !== ApplicationCommandType.ChatInput) {
      return;
    }

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
  else if (interaction.isAutocomplete()) {
    const autoComplete = autoCompletes.get(interaction.commandName)
    if (autoComplete) {
      try {
        await autoComplete.execute(interaction)
      }
      catch (error) {
        console.error(error)
      }
    }
  }
})

const { token } = await getConfig();
client.login(token)
