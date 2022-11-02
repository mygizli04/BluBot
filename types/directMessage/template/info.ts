import type { User } from "discord.js";

export interface TemplateInfo {
    reason: string,

    moderator: User
}

export function validateTemplateInfo(info: TemplateInfo): info is TemplateInfo {
    if (typeof info.reason !== "string") return false;
    if (!info.moderator) return false;
    
    return true;
}