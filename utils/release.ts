import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType, Client, TextChannel, APIEmbed, resolveColor, HexColorString, MessageComponentBuilder, MessageActionRowComponent, ButtonComponent, TextInputBuilder, MessageActionRowComponentBuilder } from 'discord.js';
import { default as axios } from 'axios';
import fs from 'fs/promises';
import { getConfig } from '../types/config.js';
import type { Endpoints } from "@octokit/types";
import { Release } from '../types/releases/index.js';

const config = await getConfig();

function generateEmbed(data: NonNullable<Awaited<ReturnType<typeof getRelease>>>): {embed: APIEmbed, buttons: ActionRowBuilder<MessageActionRowComponentBuilder>} {
  const embed: APIEmbed = {
    color: config.customization?.accent ? resolveColor(config.customization?.accent as HexColorString) : undefined,
    title: `New ${data.type}! ${data.previous?.version ? `${data.previous.version} ➜ ` : ''}${data.version}`,
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
  const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder().setURL(`https://github.com/utmapp/UTM/releases/tag/${data.version}`).setLabel(`Releases for ${data.version}`).setStyle(ButtonStyle.Link),
    new ButtonBuilder().setURL(`https://github.com/utmapp/UTM/`).setLabel(`UTM on GiHub`).setStyle(ButtonStyle.Link)
  )
  return { embed, buttons }
}

async function getLastStoredRelease(): Promise<Release | null> {
  try {
    const data = JSON.parse(await fs.readFile('./databases/releases.json', 'utf-8'))
    return data
  }
  catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }

    // Just telling typescript to assume that err has a property "code" of type "string"
    if (!(err as Error & Record<"code", string>).code) {
      throw err;
    }

    if ((err as Error & Record<"code", string>).code !== 'ENOENT') {
      throw err;
    }

    return null;
  }
}

async function getRelease() {
  const data = await axios.get<Endpoints["GET /repos/{owner}/{repo}/releases"]["response"]["data"]>(`https://api.github.com/repos/utmapp/utm/releases`) // error handling? // haha, nope! throw it and fix it when it becomes an issue
  const latest = data.data[0]
  const previous = await getLastStoredRelease();
  const current = {
    date: new Date(latest.published_at ?? 0).getTime() / 1000, // not sure when published_at would be null, so just make it 0 why not
    version: latest.tag_name
  }
  if (previous === null || previous.date === current.date) return null
  await fs.writeFile('./databases/releases.json', JSON.stringify(current))
  return {
    ...current,
    type: latest.prerelease ? 'prerelease' : 'release',
    previous
  }
}

export async function startCheckLoop(client: Client) {
  if (!config.channels?.releases) {
    console.error('No releases channel configured, skipping release check')
    return;
  }
  const guild = await client.guilds.fetch(config.guildId)
  const channel = await guild.channels.fetch(config.channels.releases)

  if (!channel) {
    console.error('Releases channel not found, skipping release check')
    return;
  }

  const current = await getLastStoredRelease()
  client.user!.setActivity({
    type: ActivityType.Watching,
    name: `UTM ${current?.version ?? ''}`
  })

  async function check() {
    const data = await getRelease()
    if (!data) return
    client.user!.setActivity({
      type: ActivityType.Watching,
      name: `UTM ${data.version}`
    })
    const { embed, buttons } = generateEmbed(data)
    const message = await (channel as TextChannel).send({ embeds: [embed], components: [buttons] })
    message.crosspost()
  }
  check()
  setInterval(check, 600000)
}
