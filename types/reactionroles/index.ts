export interface ReactionRole {
    messageID: string,
    channelID: string,
    roles: {
        emoji: string,
        role: string,
        emojiName: unknown
    }[]
}

export function validateReactionRole(reactionRole: ReactionRole): reactionRole is ReactionRole {
    if (typeof reactionRole.messageID !== 'string') return false
    if (typeof reactionRole.channelID !== 'string') return false
    if (!Array.isArray(reactionRole.roles)) return false
    for (const role of reactionRole.roles) {
        if (!role.emoji) return false
        if (!role.role) return false
        if (!role.emojiName) return false
    }
    
    return true
}