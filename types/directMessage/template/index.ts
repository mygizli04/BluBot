export interface Template {
    title: string,
    fields: Field[],
}

export interface Field {
    name: string,
    value: string
}