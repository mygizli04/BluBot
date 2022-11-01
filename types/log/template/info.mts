import { Channel, User } from "discord.js";

export interface ModerateTemplateInfo {
    target?: User,
    reason: string,
    moderator?: User
}

export function validateModerateTemplateInfo(info: any): info is ModerateTemplateInfo {
    if (typeof info.reason !== 'string') return false;
    if (info.target && !(info.target instanceof User)) return false;
    if (info.moderator && !(info.moderator instanceof User)) return false;
    return true;
}

export interface MessageTemplateInfo {
    target?: User,
    content: string,
    channel?: Channel
}

export function validateMessageTemplateInfo(info: any): info is MessageTemplateInfo {
    if (typeof info.content !== 'string') return false;
    if (info.target && !(info.target instanceof User)) return false;
    if (typeof info.channel !== "undefined" && typeof info.channel !== "object") return false;
    return true;
}

export interface ChannelTemplateInfo {
    channel?: Channel,

    moderator?: User
}

export function validateChannelTemplateInfo(info: any): info is ChannelTemplateInfo {
    if (typeof info.channel !== "undefined" && typeof info.channel !== "object") return false;
    if (info.moderator && !(info.moderator instanceof User)) return false;

    return true;
}