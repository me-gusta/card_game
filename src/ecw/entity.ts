import type {Component} from "./component";

export type EntityId = number

export interface Entity {
    id: number
    add: (...components: any[]) => void
    has: (type: typeof Component<any>) => boolean
    get: (type: typeof Component<any>) => any
    modify: (type: typeof Component<any>) => any
    remove: (any) => any
}