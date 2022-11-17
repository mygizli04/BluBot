import { AutocompleteInteraction } from "discord.js";

export interface AutoComplete {
    /**
     * The name of the to-be autocompleted command.
     */
    id: string,

    execute(interaction: AutocompleteInteraction): Promise<void>;
}