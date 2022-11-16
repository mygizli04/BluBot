import fs from 'fs/promises';
import { readFileSync } from "fs";
import { getConfig } from '../types/config';
import exists from './asyncFileExists';
import { APIEmbed, Client, HexColorString, resolveColor, TextChannel } from 'discord.js';
import { Tag, TagDB, validateTag, validateTagDB } from '../types/tag';

const config = await getConfig();

/**
 * Ensures that the database passed is valid and returns the parsed database
 * Use getDatabase() if you only want to get the database!
 * 
 * @param {string?} file The file to check, if not provided it will read the database file
 * 
 * Returns the parsed database if it is valid, otherwise returns null
 */
async function ensureDatabase (file = readFileSync("./databases/tags.json", "utf-8")): Promise<TagDB | null> {
  try {
    // Bite me lol
    var parsed: TagDB = JSON.parse(file);
  } catch {
    return null;
  }

  if (!validateTagDB(parsed)) return null;

  return parsed;
}

/**
 * The cached database, use getDatabase() if you want to get the database
 */
let db: TagDB;

/**
 * Saves the database to the file
 * @param data The data to save
 */
async function writeDatabase (data: string | TagDB) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }

  if (await ensureDatabase(data) === null) {
    throw new Error('Invalid database');
  }

  return fs.writeFile('./databases/tags.json', data);
}

/**
 * Gets the database, if it is not cached it will cache it
 * @returns The database
 */
export async function getDatabase (): Promise<TagDB> {
  if (db) return db;
  if (!await exists('./databases/tags.json')) {
    await fs.writeFile('./databases/tags.json', '{}');
    return {};
  }

  const raw = await fs.readFile('./databases/tags.json', "utf-8");
  let ensured = await ensureDatabase(raw);
  if (ensured === null) {
    console.error('Your tags database was corrupted, so we had to reset it. You can find a backup in ./databases/tags.bak.json');
    // Could probably optimize by using Promise.all() but probably not worth it
    await fs.writeFile('./databases/tags.bak.json', raw);
    await fs.writeFile('./databases/tags.json', '{}');
    return {};
  }

  return ensured;
}

function generateEmbed(name: string, content: string, image: string): APIEmbed {
  return {
    title: name,
    description: content,
    color: config.customization?.accent ? resolveColor(config.customization.accent as HexColorString) : undefined,
    image: {
      url: image
    }
  };
}

export async function add(name: string, content: string, image: string, faqitem = false) {
  const database = await getDatabase();
  if (database[name]) return;
  database[name] = {
    name,
    content,
    image,
    faqitem
  };
  writeDatabase(database);
}

export async function remove(name: string) {
  const database = await getDatabase();
  delete database[name];
  await writeDatabase(database);
}

export async function modify(name: string, content: string | null, image: string | null, faqitem: boolean | null) {
  const database = await getDatabase();
  const item = database[name];
  if (!item) {
    throw new Error('Tag not found');
  }
  item.name = name || item.name;
  item.content = content || item.content;
  item.image = image || item.image;
  item.faqitem = faqitem ?? item.faqitem;
  writeDatabase(database);
}

export async function get(name: string) {
  return (await getDatabase())[name];
}

/**
 * @deprecated Use getDatabase() instead. This function is an alias for it anyway.
 */
export async function getAll() {
  return getDatabase();
}

export async function updateFAQList(client: Client) {
  if (!config.channels?.faq) return;
  const database = getDatabase();
  const guild = await client.guilds.fetch(config.guildId);
  const channel = await guild.channels.fetch(config.channels.faq) as TextChannel | null;

  if (!channel) {
    console.error('Could not find FAQ channel');
    return;
  }

  const messages = await channel.messages.fetch({ limit: 100 });
  const botMessages = messages.filter(m => m.author.id === client.user!.id).toJSON();
  await channel.bulkDelete(botMessages);

  const embeds = Object.values(database)
    .filter(t => t.faqitem === true)
    .map(({ name, content, image }) => generateEmbed(name, content, image));
  if (embeds.length === 0) return;
  const chunks = [];
  for (let i = 0; i < embeds.length; i += 10) chunks.push(embeds.slice(i, i + 10));
  chunks.forEach(embeds => channel.send({ embeds }));
}
