import { ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandBuilder, Interaction } from "discord.js";
import checkUserPerms from "../utils/checkUserPerms";

/**
 * Only allow the command to run if the user is authorized.
 */
export function authorizedOnly(rejectMessage = 'You do not have permission to do that!') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
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