import { CommandInteraction } from "discord.js";
import { getConfig } from "../types/config.js";

/**
 * Only allow the command to run if value is truthy.
 * 
 * Will respond with message if value is falsy and the command will not run.
 */
export function nonFalsy(value: any, message?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (interaction: unknown) {
            if (!value) {
                if (interaction instanceof CommandInteraction) {
                    interaction.reply({
                        content: message ?? "This command refused to run, but is missing a reply message. Please let the developer know.",
                        ephemeral: true
                    });
                    return;
                }
                else {
                    return;
                }
            }

            originalMethod(interaction);
        };

        return descriptor;
    };
}