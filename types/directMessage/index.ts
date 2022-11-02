import { BanDMInfo, KickDMInfo, TimeoutDMInfo, UnTimeoutDMInfo } from "./info/info.js";

export type DMInfo = BanDMInfo | KickDMInfo | TimeoutDMInfo | UnTimeoutDMInfo;

export type DMType = "ban" | "kick" | "timeout" | "untimeout";