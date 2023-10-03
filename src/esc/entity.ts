import type {Component} from "./component";
import type {TimerConfig} from "./timer";
import type {Timer} from "./timer";
import type {ConcentratorConfig} from "./concentrator";

export type EntityId = number

export interface Entity {
    id: number
    add: (...components: any[]) => void
    has: (type: typeof Component<any>) => boolean
    get: (type: typeof Component<any>) => any
    modify: (type: typeof Component<any>) => any
    timer: (label: any, cfg?: TimerConfig) => Timer
    remove: (any) => any
    concentrator: (cfg: ConcentratorConfig) => boolean
}