import { Interaction, PermissionFlagsBits } from "discord.js";
import { getConfig } from "../types/config.js";

const { modRoles } = await getConfig();

export default (interaction: Interaction) => {
  if (!interaction.inCachedGuild()) return false;
  const roles = interaction.member?.roles.cache.map(r => r.id);
  if (roles.some(id => modRoles.includes(parseInt(id))) || interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  return false;
};
