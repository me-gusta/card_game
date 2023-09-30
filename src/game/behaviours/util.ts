import {Value} from "../components";

export const half_or_kill = (ent) => {
    if (ent.get(Value) === 1)
        ent.modify(Value).set(0)
    else
        ent.modify(Value).div(2)
}