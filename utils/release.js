const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js')
const { default: axios } = require('axios')
const fs = require('fs')
const config = require('./config')

function generateEmbed(data) {
  const embed = {
    color: config.getColor('accent'),
    title: `New ${data.type}! ${data.previous.version} ➜ ${data.version}`,
    fields: [
      {
        name: 'Release Date',
        value: `<t:${data.date}>\n<t:${data.date}:R>`
      },
      {
        name: 'Changelog',
        value: `https://github.com/utmapp/UTM/releases/tag/${data.version}`
      }
    ]
  }
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setURL(`https://github.com/utmapp/UTM/releases/tag/${data.version}`).setLabel(`Releases for ${data.version}`).setStyle(ButtonStyle.Link),
    new ButtonBuilder().setURL(`https://github.com/utmapp/UTM/`).setLabel(`UTM on GiHub`).setStyle(ButtonStyle.Link)
  )
  return { embed, buttons }
}

function getCurrent() {
  if (!fs.existsSync('./databases/releases.json')) fs.writeFileSync('./databases/releases.json', '{}')
  return JSON.parse(fs.readFileSync('./databases/releases.json'))
}

async function getRelease() {
  const data = await axios.get(`https://api.github.com/repos/utmapp/utm/releases`).catch(() => null) // error handling?
  if (!data) return
  const latest = data.data[0]
  const previous = getCurrent()
  const current = {
    date: new Date(latest.published_at) / 1000,
    version: latest.tag_name
  }
  if (previous.date === current.date) return null
  fs.writeFileSync('./databases/releases.json', JSON.stringify(current))
  return {
    ...current,
    type: latest.prerelease ? 'prerelease' : 'release',
    previous
  }
}

module.exports = {
  async startCheckLoop(client) {
    const guild = await client.guilds.fetch(config.get().guildId)
    const channel = await guild.channels.fetch(config.get().channels.releases)
    const current = getCurrent()
    client.user.setActivity({
      type: ActivityType.Watching,
      name: `UTM ${current.version}`
    })

    async function check() {
      const data = await getRelease()
      if (!data) return
      client.user.setActivity({
        type: ActivityType.Watching,
        name: `UTM ${data.version}`
      })
      const { embed, buttons } = generateEmbed(data)
      const message = await channel.send({ embeds: [embed], components: [buttons] })
      message.crosspost()
    }
    check()
    setInterval(check, 600000)
  }
}
