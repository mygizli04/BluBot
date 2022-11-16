import { ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, SlashCommandBuilder } from "discord.js";

export type Command = SlashCommand | ContextMenuCommand;

export interface SlashCommand {
    data: SlashCommandBuilder

    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface ContextMenuCommand {
    data: ContextMenuCommandBuilder

    execute(interaction: MessageContextMenuCommandInteraction): Promise<void>;
}