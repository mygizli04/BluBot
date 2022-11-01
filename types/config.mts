import fs from "fs/promises"

export interface FullConfig extends Config {
    guildId: string,
    token: string
}

export interface Config {
    guildId: string | null,
    token: string | null,
    customization?: CustomizationConfig,
    modRoles: number[],
    channels: ChannelsConfig;
}

export function validateConfig (config: Config): config is Config {
    if (typeof config.guildId !== "string" && config.guildId !== null) return false;
    if (typeof config.token !== "string" && config.token !== null) return false;
    if (config.customization && !validateCustomizationConfig(config.customization)) return false;
    if (!Array.isArray(config.modRoles)) return false;
    if (config.modRoles.length > 0 && config.modRoles.some(r => typeof r !== "number")) return false;
    if (typeof config.channels !== "object") return false;

    return true;
}

export interface CustomizationConfig {
    accent?: string,
    colors?: ColorCustomizationConfig;
}

export function validateCustomizationConfig (config: CustomizationConfig): config is CustomizationConfig {
    if (typeof config.accent !== "string" && config.accent !== undefined) return false;
    if (config.colors && !validateColorCustomizationConfig(config.colors)) return false;

    return true;
}

export interface ColorCustomizationConfig {
    good?: string,
    medium?: string,
    bad?: string;
}

export function validateColorCustomizationConfig (config: ColorCustomizationConfig): config is ColorCustomizationConfig {
    if (typeof config.good !== "string" && config.good !== undefined) return false;
    if (typeof config.medium !== "string" && config.medium !== undefined) return false;
    if (typeof config.bad !== "string" && config.bad !== undefined) return false;

    return true;
}

export interface ChannelsConfig {
    logs: number | null;
}

export function validateChannelsConfig (config: ChannelsConfig): config is ChannelsConfig {
    if (typeof config.logs !== "number" && config.logs !== null) return false;

    return true;
}

export async function getConfig(): Promise<FullConfig> {
    const config = JSON.parse(await fs.readFile("./config.json", "utf-8"));

    if (!validateConfig(config)) throw new Error("Invalid config");

    return config as FullConfig;
}