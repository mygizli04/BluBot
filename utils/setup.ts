import fs from 'fs'; // It's fine that this is sync since there's nothing else going on.

import { Config, validateConfig } from '../types/config.js';

const current: Config = {
  guildId: null,
  token: null,
  modRoles: [],
};

function readline () {
  if (!process.stdin.isTTY) {
    throw new Error("stdin is not a TTY! Make sure to run this from a terminal.");
  }

  return new Promise<string>(resolve => {
    process.stdin.once('data', d => {
      resolve(d.toString().trim());
    });
  });
}


if (fs.existsSync('config.json')) {
  console.log('Configuration file already exists! Overwrite? [y/N]');
  const overwrite = (await readline()).toLowerCase();
  if (overwrite === '' || overwrite === 'n') {
    console.log('Abort.');
    process.exit();
  }
}
console.log('Welcome to the BluBot setup!\nThis script will set up your bot with its token, guild, channels and roles.\nPress Enter to continue...');
await readline();
console.log('Please enter your Discord bot token:');
current.token = await readline();
console.log('Now enter the guild ID of your server. You can find this by enabling Developer Mode and right-clicking your guild.');
current.guildId = await readline();
console.log("That's a really nice server you got! Just kidding, i'm not sentient ;(\nWould you like to customize your bot with custom colors for embeds? [y/N]");
const customColors = (await readline()).toLowerCase();
if (customColors === 'y') {
  current.customization = { colors: {} };

  console.log('Alright. Please enter a HEX color you would like as an accent color. This will apply to generic embeds. Leave blank for default.');
  current.customization.accent = await readline();
  console.log('Now enter a HEX color you would like as a "good" color. This will apply to embeds which remove a moderation. Leave blank for default.');
  current.customization.colors!.good = await readline();
  console.log('Now enter a HEX color you would like as a "medium" color. This will apply to embeds which add a semi-fatal moderation like a kick or timeout. Leave blank for default.');
  current.customization.colors!.medium = await readline();
  console.log('Now enter a HEX color you would like as a "bad" color. This will apply to embeds which add a fatal moderation like a ban. Leave blank for default.');
  current.customization.colors!.bad = await readline();

  if (current.customization.accent === '') delete current.customization.accent;
  if (current.customization.colors!.good === '') delete current.customization.colors!.good;
  if (current.customization.colors!.medium === '') delete current.customization.colors!.medium;
  if (current.customization.colors!.bad === '') delete current.customization.colors!.bad;
}
if (customColors === "y") console.log("Alright, i'll use the default colors. ");
console.log("Could I also have your github token please? Leave blank for no github integration.");
current.githubToken = await readline();
console.log('Now, time to set up your moderation roles. Enter all your moderation role IDs here, separated by a comma.');
current.modRoles = (await readline()).split(',').map(r => parseInt(r.trim()));
if (!current.channels) current.channels = {};
console.log("Now enter the channel you'd like me to send welcome message to. Leave blank to disable.")
current.channels.welcome = (await readline()).trim()
console.log("Got that. Now enter the channel you'd like me to send logs to:");
current.channels.logs = await readline();
console.log("Alright, now enter what channel I should send UTM releases to:")
current.channels.releases = await readline();
console.log("And finally, enter the faq channel:")
current.channels.faq = await readline();
console.log(`
Guild ID: ${current.guildId}
Bot token: ${current.token}
Moderator Roles: ${current.modRoles.join(', ')}
Logging channel: ${current.channels.logs}
Welcome channel: ${current.channels.welcome}
Does this look correct? [Y/n]
  `);
const correct = (await readline()).toLowerCase();
if (!(correct === '' || correct === 'y')) {
  console.error('Abort.');
  process.exit(1);
}
if (!validateConfig(current)) {
  console.error('Invalid configuration! Please try again.');
  process.exit(1);
}
fs.writeFileSync('config.json', JSON.stringify(current));
console.log("Success! Install dependencies with the command 'npm install', compile the application with 'npm run transpile', and start the bot with 'npm start'!");
process.exit();
