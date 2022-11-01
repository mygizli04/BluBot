import type { CommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder } from "discord.js";

export default interface Command {
    data: ContextMenuCommandBuilder | SlashCommandBuilder

    execute(interaction: CommandInteraction): Promise<unknown>;
}