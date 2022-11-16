import { CommandInteraction } from "discord.js";
import { getConfig } from "../types/config";

const { githubToken } = await getConfig();

/**
 * Only allow the command to run if github integration is enabled.
 */
export function githubOnly () {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (interaction: CommandInteraction) {
            if (!githubToken) {
                interaction.reply({
                    content: 'GitHub integration is currently disabled.',
                    ephemeral: true
                });
                return;
            }

            originalMethod(interaction);
        };

        return descriptor;
    };
}