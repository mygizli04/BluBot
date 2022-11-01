import { BanDMInfo, KickDMInfo, TimeoutDMInfo, UnTimeoutDMInfo } from "./info/info.mjs";

export type DMInfo = BanDMInfo | KickDMInfo | TimeoutDMInfo | UnTimeoutDMInfo;

export type DMType = "ban" | "kick" | "timeout" | "untimeout";