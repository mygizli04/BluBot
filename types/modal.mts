import type { Interaction } from "discord.js";

export default interface Modal {
    id: string,
    execute(interaction: Interaction): Promise<unknown>
}