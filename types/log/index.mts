import { BanPunishmentInfo, KickPunishmentInfo, LockPunishmentInfo, MessageDeletePunishmentInfo, MessageEditPunishmentInfo, PhishPunishmentInfo, PurgePunishmentInfo, TimeoutPunishmentInfo, UnBanPunishmentInfo, UnlockPunishmentInfo, UnTimeoutPunishmentInfo } from "./info/index.mjs";
import { ChannelTemplateInfo, MessageTemplateInfo, ModerateTemplateInfo } from "./template/info.mjs";

export type PunishmentInfo = BanPunishmentInfo | UnBanPunishmentInfo | KickPunishmentInfo | TimeoutPunishmentInfo | UnTimeoutPunishmentInfo | MessageDeletePunishmentInfo | MessageEditPunishmentInfo | PurgePunishmentInfo | LockPunishmentInfo | UnlockPunishmentInfo | PhishPunishmentInfo;

export type PunishmentType = "ban" | "unban" | "kick" | "timeout" | "untimeout" | "messageDelete" | "messageEdit" | "purge" | "lock" | "unlock" | "phish";

export type TemplateType = "moderate" | "message" | "channel";

export type TemplateInfo = ModerateTemplateInfo | MessageTemplateInfo | ChannelTemplateInfo;