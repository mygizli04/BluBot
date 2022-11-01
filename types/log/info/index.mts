import { Channel, TextChannel, User } from "discord.js";
import { ChannelTemplateInfo, MessageTemplateInfo, ModerateTemplateInfo, validateChannelTemplateInfo, validateMessageTemplateInfo, validateModerateTemplateInfo } from "../template/info.mjs";

export interface BanPunishmentInfo extends ModerateTemplateInfo {
    target: User
}

export function validateBanPunishmentInfo(info: any): info is BanPunishmentInfo {
    if (!validateModerateTemplateInfo(info)) return false;
    if (!(info.target instanceof User)) return false;

    return true;
}

export type UnBanPunishmentInfo = BanPunishmentInfo;

export function validateUnBanPunishmentInfo(info: any): info is UnBanPunishmentInfo {
    if (!validateBanPunishmentInfo(info)) return false;

    return true;
}

export type KickPunishmentInfo = BanPunishmentInfo;

export function validateKickPunishmentInfo(info: any): info is KickPunishmentInfo {
    if (!validateBanPunishmentInfo(info)) return false;

    return true;
}

export interface TimeoutPunishmentInfo extends BanPunishmentInfo {
    duration: number
}

export function validateTimeoutPunishmentInfo(info: any): info is TimeoutPunishmentInfo {
    if (typeof info.duration !== 'number') return false;
    if (!validateBanPunishmentInfo(info)) return false;

    return true;
}

export type UnTimeoutPunishmentInfo = BanPunishmentInfo;

export function validateUnTimeoutPunishmentInfo(info: any): info is UnTimeoutPunishmentInfo {
    if (!validateBanPunishmentInfo(info)) return false;

    return true;
}

export interface MessageDeletePunishmentInfo extends MessageTemplateInfo {
    moderator?: User
}

export function validateMessageDeletePunishmentInfo(info: any): info is MessageDeletePunishmentInfo {
    if (info.moderator && !(info.moderator instanceof User)) return false;
    if (!validateMessageTemplateInfo(info)) return false;

    return true;
}

export interface MessageEditPunishmentInfo extends MessageTemplateInfo {
    oldMessage: string
}

export function validateMessageEditPunishmentInfo(info: any): info is MessageEditPunishmentInfo {
    if (typeof info.oldMessage !== 'string') return false;
    if (!validateMessageTemplateInfo(info)) return false;

    return true;
}

export interface PurgePunishmentInfo extends ChannelTemplateInfo {
    amount: number,

    target?: User
}

export function validatePurgePunishmentInfo(info: any): info is PurgePunishmentInfo {
    if (typeof info.amount !== 'number') return false;
    if (info.target && !(info.target instanceof User)) return false;
    if (!validateChannelTemplateInfo(info)) return false;

    return true;
}

export interface LockPunishmentInfo extends ChannelTemplateInfo {
    channel: TextChannel
}

export function validateLockPunishmentInfo(info: any): info is LockPunishmentInfo {
    if (!info.channel) return false;
    if (!validateChannelTemplateInfo(info)) return false;

    return true;
}

export type UnlockPunishmentInfo = LockPunishmentInfo;

export function validateUnlockPunishmentInfo(info: any): info is UnlockPunishmentInfo {
    if (!validateLockPunishmentInfo(info)) return false;

    return true;
}

export interface PhishPunishmentInfo extends MessageTemplateInfo {
    target: User,
    site: string
}

export function validatePhishPunishmentInfo(info: any): info is PhishPunishmentInfo {
    if (typeof info.site !== 'string') return false;
    if (!validateMessageTemplateInfo(info)) return false;

    return true;
}