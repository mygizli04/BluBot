import fs from 'fs/promises';
import { readFileSync } from "fs";
import exists from './asyncFileExists.js';
import { ReactionRole, validateReactionRole } from '../types/reactionroles/index.js';
import { Client, TextChannel } from 'discord.js';

/**
 * Ensures that the database passed is valid and returns the parsed database
 * Use getDatabase() if you only want to get the database!
 * 
 * @param {string?} file The file to check, if not provided it will read the database file
 * 
 * Returns the parsed database if it is valid, otherwise returns null
 */
async function ensureDatabase (file = readFileSync("./databases/reactionroles.json", "utf-8")): Promise<ReactionRole[] | null> {
  try {
    // Bite me lol
    var parsed: ReactionRole[] = JSON.parse(file);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed)) return null;
  for (const reactionRole of parsed) {
    if (!validateReactionRole(reactionRole)) return null;
  }

  return parsed;
}

/**
 * The cached database, use getDatabase() if you want to get the database
 */
let db: ReactionRole[];

/**
 * Saves the database to the file
 * @param data The data to save
 */
async function writeDatabase (data: string | ReactionRole[]) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }

  if (await ensureDatabase(data) === null) {
    throw new Error('Invalid database');
  }

  return fs.writeFile('./databases/reactionroles.json', data);
}

/**
 * Gets the database, if it is not cached it will cache it
 * @returns The database
 */
export async function getDatabase(): Promise<ReactionRole[]> {
  if (db) return db;
  if (!await exists('./databases/reactionroles.json')) {
    await fs.writeFile('./databases/reactionroles.json', '[]');
    return [];
  }

  const raw = await fs.readFile('./databases/reactionroles.json', "utf-8");
  let ensured = await ensureDatabase(raw);
  if (ensured === null) {
    console.error('Your reaction role database was corrupted, so we had to reset it. You can find a backup in ./databases/reactionroles.bak.json');
    // Could probably optimize by using Promise.all() but probably not worth it
    await fs.writeFile('./databases/reactionroles.bak.json', raw);
    await fs.writeFile('./databases/reactionroles.json', '[]');
    return [];
  }

  return ensured;
}

export async function add(emoji: unknown, messageID: string, role: unknown, channel: string, emojiName: unknown, client: Client) {
  const database = await getDatabase();
  const foundIndex = database.findIndex(d => d.messageID == messageID);
  if (foundIndex === -1)
    database.push({
      messageID: messageID,
      channelID: channel,
      roles: [
        {
          emoji,
          role,
          emojiName
        }
      ]
    });
  else {
    database[foundIndex].roles.push({
      emoji,
      role,
      emojiName
    });
  }
  await (await client.channels.fetch(channel) as TextChannel).messages.fetch(messageID);
  writeDatabase(database);
}

export async function remove (emoji: unknown, messageID: string) {
  const database = await getDatabase();
  const index = database.findIndex(d => d.messageID == messageID);
  if (index === -1) return; // Oooohh silently erroring out I can't see what could ever go wrong lol
  const roleIndex = database[index].roles.findIndex(r => r.emoji == emoji);
  if (roleIndex === -1) return;
  database[index].roles.splice(roleIndex, 1);
  if (database[index].roles.length === 0) database.splice(index, 1);
  writeDatabase(database);
}

export async function get(emoji: unknown, messageID: string) {
  const database = await getDatabase();
  const found = database.find(d => d.messageID == messageID);
  const roleFound = found?.roles.find(r => r.emoji == emoji);
  return roleFound;
}

/**
 * @deprecated Use getDatabase() instead. This function is an alias for it anyway.
 */
export async function getAll() {
  return getDatabase();
}

/**
 * Cache all reaction role messages in the database
 * 
 * @param client The client to cache the messages for
 */
export async function cacheAll(client: Client): Promise<void> {
  const database = await getDatabase();

  const promises: Promise<void>[] = [];

  const fetchFunction = async ({channelID, messageID}: ReactionRole) => {
    const channel = await client.channels.fetch(channelID) as TextChannel | null;

    if (channel === null) {
      console.error(`Channel ${channelID} in the reaction role not found, skipping`);
      return;
    }

    await channel.messages.fetch(messageID);
  }

  for (const reactionRole of database) {
    promises.push(fetchFunction(reactionRole));
  }

  await Promise.all(promises);
}
