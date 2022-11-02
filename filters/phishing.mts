import axios from "axios";

export default async function check (message: string) {
  const matches = message.match(/(http|https)(:\/\/)[a-zA-Z0-9\-\.]+/gm);
  if (!matches) return null;
  const detected = [];
  for (let match of matches) {
    const domain = match.split('://')[1];
    const phish = await axios.get(`https://phish.sinking.yachts/v2/check/${domain}`);
    if (!phish.data) continue;
    detected.push(match);
  }
  return detected;
}
