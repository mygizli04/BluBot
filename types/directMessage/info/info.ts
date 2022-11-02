import { DMInfo } from "../index.js";
import { TemplateInfo, validateTemplateInfo } from "../template/info.js";

export type BanDMInfo = TemplateInfo;

export function validateBanDMInfo(info: any): info is BanDMInfo {
    if (!validateTemplateInfo(info)) return false;
    
    return true;
}

export type KickDMInfo = TemplateInfo;

export function validateKickDMInfo(info: any): info is KickDMInfo {
    if (!validateTemplateInfo(info)) return false;

    return true;
}

export interface TimeoutDMInfo extends TemplateInfo {
    duration: string
}

export function validateTimeoutDMInfo(info: any): info is TimeoutDMInfo {
    if (typeof info.duration !== "string") return false;
    if (!validateTemplateInfo(info)) return false;

    return true;
}

export type UnTimeoutDMInfo = TemplateInfo;

export function validateUnTimeoutDMInfo(info: any): info is UnTimeoutDMInfo {
    if (!validateTemplateInfo(info)) return false;

    return true;
}