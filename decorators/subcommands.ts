import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { AutoComplete } from "../types/autocomplete";

/**
 * Declares that the command is an autocomplete command for subcommand of the arguments of this decorator.
 * 
 * Will not execute the command if the subcommand is not one of the specified.
 */
export function subcommands(...commands: string[]) {
    return function (target: AutoComplete, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (interaction: AutocompleteInteraction) {
            if (!commands.includes(interaction.options.getSubcommand())) return;

            originalMethod(interaction);
        };

        return descriptor;
    };
}