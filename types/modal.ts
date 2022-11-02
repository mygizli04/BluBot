import type { ModalSubmitInteraction } from "discord.js";

export default interface Modal {
    id: string,
    execute(interaction: ModalSubmitInteraction): Promise<void>
}