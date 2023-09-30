// import {world} from "../game/systems/create_world";

import {world} from "../game/create_world";

export interface TimerConfig {
    duration: number,
    autostart?: boolean
    autorestart?: boolean
    on_fire?: () => void
    on_tick?: (completion_percent: number) => void
    start_fire?: boolean
}

export class Timer {
    duration: number
    // on_fire: () => void
    // onTick?: (completion_percent: number) => void

    is_started: boolean = false
    start_time: number
    autorestart: boolean = false

    schedule_start: boolean = false

    constructor(start_time: number, cfg: TimerConfig) {
        this.duration = cfg.duration
        this.start_time = start_time

        // if (cfg.on_fire)
        //     this.on_fire = cfg.on_fire

        // if (cfg.on_tick)
        //     this.onTick = cfg.on_tick

        this.is_started = Boolean(cfg.autostart)
        this.autorestart = Boolean(cfg.autorestart)

        if (cfg.start_fire)
            cfg.on_fire()
    }

    tick(total_ticks: number, on_tick: (completion_percent: number) => void, on_fire: () => void) {
        if (this.schedule_start) {
            this.start_time = total_ticks
            this.is_started = true
            this.schedule_start = false
        }

        if (!this.is_started)
            return false
        const diff = total_ticks - this.start_time
        const is_finished = diff >= this.duration

        if (is_finished) {

            if (on_fire)
                on_fire()

            this.is_started = this.autorestart
            if (this.autorestart)
                this.start_time = total_ticks
        } else {
            if (on_tick)
                on_tick(Math.min(diff / this.duration, 1))
        }
        return is_finished
    }

    start() {
        this.start_time = world._elapsed_ms
        this.is_started = true
    }

    is_finished() {
        const total_ticks = world._elapsed_ms

        const diff = total_ticks - this.start_time
        return  diff >= this.duration
    }


    schedule() {
        this.schedule_start = true
    }

}
