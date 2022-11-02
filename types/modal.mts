import type { CommandInteraction, Interaction, ModalSubmitInteraction } from "discord.js";

export default interface Modal {
    id: string,
    execute(interaction: ModalSubmitInteraction): Promise<unknown>
}