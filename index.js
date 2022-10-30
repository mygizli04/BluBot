const { Client, Collection, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const deploy = require('./utils/deploy')
const bconsole = require('./console')

if (!fs.existsSync('./config.json')) {
  console.log("Looks like you haven't set up the bot yet! Please run 'npm run setup' and try again.")
  process.exit()
}

if (!fs.existsSync('./databases')) fs.mkdirSync('./databases')

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
})

client.commands = new Collection()
client.modals = new Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

for (const file of modalFiles) {
  const modal = require(`./modals/${file}`)
  client.modals.set(modal.id, modal)
}

bconsole.init()
client.once('ready', async c => {
  bconsole.motd(c.user.tag)
  deploy(c.user.id)
})

for (const eventFile of fs.readdirSync('./events').filter(file => file.endsWith('.js'))) {
  const event = require(`./events/${eventFile}`)
  client.on(event.event, event.listener)
}

client.on('unhandledRejection', error => {
  console.log(error)
})

client.on('error', error => {
  console.log(error)
})

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName)
    if (command) {
      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
      }
    }
  } else if (interaction.isModalSubmit()) {
    const modal = client.modals.get(interaction.customId)
    if (modal) {
      try {
        await modal.execute(interaction)
      } catch (error) {
        console.error(error)
      }
    }
  }
})

const { token } = require('./config.json')
client.login(token)
