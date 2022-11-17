import { CommandInteraction, Interaction } from "discord.js";
import { Command } from "../types/command.js";
import checkUserPerms from "../utils/checkUserPerms.js";

/**
 * Only allow the command to run if the user is a moderator.
 */
export function moderatorOnly(rejectMessage = 'You do not have permission to do that!') {
  return function (target: Command, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (interaction: CommandInteraction) {
      if (!checkUserPerms(interaction as Interaction)) {
        interaction.reply({
          content: rejectMessage,
          ephemeral: true
        });
        return;
      }

      originalMethod(interaction);
    };

    return descriptor;
  };
}