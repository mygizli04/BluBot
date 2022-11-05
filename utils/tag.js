const fs = require('fs')
const config = require('./config')

function ensureDatabase() {
  const exists = fs.existsSync('./databases/tags.json')
  if (!exists) fs.writeFileSync('./databases/tags.json', '{}')
  try {
    JSON.parse(fs.readFileSync('./databases/tags.json'))
  } catch {
    fs.writeFileSync('./databases/tags.bak.json', fs.readFileSync('./databases/tags.json'))
    console.log('Your tags database was corrupted, so we had to reset it. You can find a backup in ./databases/tags.bak.json')
    fs.writeFileSync('./databases/tags.json', '{}')
  }
}

function writeDatabase(data) {
  ensureDatabase()
  fs.writeFileSync('./databases/tags.json', JSON.stringify(data))
}

function getDatabase() {
  ensureDatabase()
  return JSON.parse(fs.readFileSync('./databases/tags.json'))
}

function generateEmbed(name, content, image) {
  return {
    title: name,
    description: content,
    color: config.getColor('accent'),
    image: {
      url: image
    }
  }
}

module.exports = {
  add: async (name, content, image) => {
    ensureDatabase()
    const database = getDatabase()
    if (database[name]) return
    database[name] = {
      name,
      content,
      image
    }
    writeDatabase(database)
  },
  remove: name => {
    ensureDatabase()
    const database = getDatabase()
    delete database[name]
    writeDatabase(database)
  },
  modify: (name, content, image, faqitem) => {
    ensureDatabase()
    const database = getDatabase()
    if (!database[name]) database[name] = {}
    const item = database[name]
    item.name = name || item.name
    item.content = content || item.content
    item.image = image || item.image
    item.faqitem = faqitem ?? item.faqitem
    writeDatabase(database)
  },
  get: name => {
    ensureDatabase()
    return getDatabase()[name]
  },
  getAll: () => {
    ensureDatabase()
    return getDatabase()
  },
  updateFAQList: async client => {
    if (!config.get().channels.faq) return
    ensureDatabase()
    const database = getDatabase()
    const guild = await client.guilds.fetch(config.get().guildId)
    const channel = await guild.channels.fetch(config.get().channels.faq)
    const messages = await channel.messages.fetch({ limit: 100 })
    const botMessages = messages.filter(m => m.author.id === client.user.id).toJSON()
    await channel.bulkDelete(botMessages)

    const embeds = Object.values(database)
      .filter(t => t.faqitem === true)
      .map(({ name, content, image }) => generateEmbed(name, content, image))
    if (embeds.length === 0) return
    const chunks = []
    for (let i = 0; i < embeds.length; i += 10) chunks.push(embeds.slice(i, i + 10))
    chunks.forEach(embeds => channel.send({ embeds }))
  }
}
