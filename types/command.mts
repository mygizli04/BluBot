import { ContextMenuCommandBuilder, Interaction } from "discord.js";

export default interface Command {
    data: ContextMenuCommandBuilder;

    execute(interaction: Interaction): Promise<unknown>;
}