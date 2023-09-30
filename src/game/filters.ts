import {CardType, Value} from "./components";

class CardFilter {
    checks = []

    and(func) {
        if (func instanceof CardFilter) {
            this.checks.push(...func.checks)
        } else {
            this.checks.push(func)
        }
        return this
    }

    apply(ent) {
        for (let check of this.checks) {
            if (check(ent) === false)
                return false
        }
        return true
    }
}

const is_of_type = (type) => {
    const obj = new CardFilter()
    obj.and(
        (ent) => {
            return ent.get(CardType) === type
        }
    )
    return obj
}

const value_lt = (n) => {
    const obj = new CardFilter()
    obj.and(
        (ent) => {
            return ent.get(Value) < n
        }
    )
    return obj
}

export default {
    is_of_type,
    value_lt
}