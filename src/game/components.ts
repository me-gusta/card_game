import {C_Enum, C_Immutable, C_Object, C_Tag} from "../esc/component";


export class GodLike extends C_Tag {
}

export class IsChosen extends C_Tag {
}

export class IsFaded extends C_Tag {
}


export class Enemy extends C_Tag {
}

export class Crate extends C_Tag {
}

export class InUpcomingPile extends C_Enum<number> {
}


export class InLootPile extends C_Tag {
}

export class OnBoard extends C_Enum<number> {
}

export class InHand extends C_Enum<number> {
}

export class SetupData extends C_Object<any> {
}

export class RoundData extends C_Object<any> {
}

export class PlayerData extends C_Object<any> {
}


export class LootId extends C_Immutable<number> {
}

export class EffectPoisoned extends C_Immutable<number> {

}

export class Value extends C_Immutable<number> {
}

export enum E_CardType {
    weapon = "weapon",
    food = "food",
    crate = "crate",
    mob = "mob",
    coin = "coin",
    empty = "empty"
}

export const CARD_TYPE_VALUABLE = [
    E_CardType.weapon,
    E_CardType.food,
    E_CardType.crate,
    E_CardType.coin,
]


export class CardType extends C_Enum<E_CardType> {
}

export class CardVariant extends C_Enum<string> {
}


export class OnSeveralTurn extends C_Object<any> {
}

export enum E_UI_COMMAND {
    confirm_any = 'confirm_any',
    choose_cards = 'choose_cards',
    nothing = 'nothing'
}


// Triggers
export class OnSwap extends C_Tag {}
export class OnSwapDisabled extends C_Tag {}
export class OnTurnEnd extends C_Tag {}
export class OnTurnStart extends C_Tag {}
export class OnCardAttacked extends C_Tag {}

export class RunData extends C_Object<any> {
}

export class GeneratorData extends C_Object<any> {
}

export class LevelData extends C_Object<any> {
}

export class DevData extends C_Object<any> {
}

export class LevelResults extends C_Object<any> {
}

export class SpellLib extends C_Tag {}