import { ChatInputCommandInteraction, ContextMenuCommandBuilder, Interaction, MessageContextMenuCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder | ContextMenuCommandBuilder;

    execute(interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction): Promise<void>;
}

export interface SlashCommand {
    data: SlashCommandBuilder

    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface ContextMenuCommand {
    data: ContextMenuCommandBuilder

    execute(interaction: MessageContextMenuCommandInteraction): Promise<void>;
}