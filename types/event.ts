import { ClientEvents, Message } from "discord.js";

export default interface Event {
    event: keyof ClientEvents,
    listener: (...args: Message[]) => Promise<void>
}

export interface MessageCreateEvent extends Event {
    event: "messageCreate",
    listener: (message: Message) => Promise<void>
}

export interface MessageDeleteEvent extends Event {
    event: "messageDelete",
    listener: (message: Message) => Promise<void>
}

export interface MessageUpdateEvent extends Event {
    event: "messageUpdate",
    listener: (oldMessage: Message, newMessage: Message) => Promise<void>
}
