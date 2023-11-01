import type {EntityId} from "./entity"


export class Component<T> {
    value: T

    constructor(value: T) {
        this.value = value
    }

    getName(): string {
        return this.constructor.name
    }

    init(ent: EntityId): void {

    }

    delete(ent: EntityId): void {

    }
}

export class C_Tag extends Component<boolean> {
    constructor() {
        super(true)
    }
}


export class C_Enum<T> extends Component<T> {
    static isEnum = true
    isEnum: boolean = true

}

export class C_Primitive<T> extends Component<T> {

}

export class C_Object<T> extends Component<T> {

}

export class Var<T> {
    isVar = true
    value: any
    constructor(value: T) {
        this.value = value
    }

    set(value: T) {
        this.value = value
    }

    add(value: T) {
        this.value += value
    }

    sub(value: T) {
        // @ts-ignore
        this.value -= value
    }
}

export class C_Variable<T> extends Component<Var<T>> {
    declare value: Var<T>

    constructor(value: T) {
        super(new Var<T>(value))
    }
}



