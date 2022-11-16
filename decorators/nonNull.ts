import { CommandInteraction } from "discord.js";
import { getConfig } from "../types/config";

const { githubToken } = await getConfig();

/**
 * Only allow the command to run if value is truthy.
 * 
 * Will respond with message if value is falsy and the command will not run.
 */
export function nonFalsy(value: any, message: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (interaction: CommandInteraction) {
            if (!value) {
                interaction.reply({
                    content: message,
                    ephemeral: true
                });
                return;
            }

            originalMethod(interaction);
        };

        return descriptor;
    };
}