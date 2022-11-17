export interface TagDB {
    [key: string]: Tag | undefined;
}

export function validateTagDB(tagDB: TagDB): boolean {
    for (const key of Object.keys(tagDB)) {
        if (!validateTag(tagDB[key]!)) return false;
    }
    return true;
}

export interface Tag {
    name: string,
    content: string,
    image?: string,
    faqitem: boolean
}

export function validateTag(tag: Tag): tag is Tag {
    if (typeof tag.name !== 'string') return false;
    if (typeof tag.content !== 'string') return false;
    if (typeof tag.image !== 'string') return false;
    if (typeof tag.faqitem !== 'boolean') return false;

    return true;
}