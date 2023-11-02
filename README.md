# ECW game engine concept

ECW stands for Entity-Component-World. It's based on ECS but
focuses systems without a real-time update loop.

Game is available here (mobile screen or touch emulation only):

https://game-preview-85dfd.web.app/

## Why

This project started as an ordinary implementation of
ECS pattern but evolved into an attempt to make ECS 
design pattern suitable for turn-based games.

Goals:
1. Make system so that code modification doesn't lead to rewriting any abstraction
2. Systemize game rules into meaningful code blocks
3. Make API to simplify research of game behavior


This demo shows ECW engine proof of concept
1. `src/ecw` — engine source
2. `src/game` — game logic 

Next step is to solve UI-Engine communication problems:
1. Scene management
2. Animations
3. IO
4. Canvas + WebGL

Code which interacts with UI needs a great 
restructuring and refactoring.

## How it works

### Components

C_Tag
```js
export class Hero extends C_Tag {}
```

C_Primitive
```ts
export class Power extends C_Primitive<number> {}
```

C_Object — acts like a python dict
```ts
interface IRoundData {
    poins: number,
    level: number
}
export class RoundData extends C_Object<IRoundData> {}
```

C_Enum — makes querying much easier
```ts
enum TEAMS {
    A, B
}

export class Team extends C_Enum<number> {}
const a = world.createEntity(new Team(TEAMS.A))
const b = world.createEntity(new Team(TEAMS.A))
const c = world.createEntity(new Team(TEAMS.B))
const d = world.createEntity(new Team(TEAMS.B))

world.q(Team)
// returns [a, b, c, d]

world.q(new Team(TEAMS.A))
// returns [a, b]

world.q(new Team(TEAMS.B))
// returns [c, d]
```

### Creating World

```js
const world = new World()
```

### Working with Entities

Create/kill an Entity.
Add/remove Components.
```js
const ent = world.createEntity(
    // primitives
	new A(5),
	new B("hello"),
    // objects
	new C({is_active: true, element: "div"}),
)

world.killEntity(ent)
ent.remove(A)
ent.add(new A(9))
```


Query Entities with components A, B and C.
```ts
world.q(A, B, C).forEach(ent => {
	// do something
	console.log(ent.get(A))
})
```

Unlike ECS, you can get any Component of a queried entity.
```js
world.createEntity(new A(), new B(7))
world.createEntity(new A(), new B(6), new C(9))
world.q(A).forEach(ent => {
    console.log(ent.get(A))
    console.log(ent.get(B))
    if (ent.has(C))
        console.log(ent.get(C))
})
```

Query a single Entity with Components A, B, C.
```js
world.qo(A, B, C)
```


Change value of components.
```js
world.q(A, B, C).forEach(ent => {
	// primitive
	ent.modify(A).add(8)
	ent.modify(A).sub(8)
	ent.modify(A).set(8)

	// object
	ent.get(C).element = "p"
})
```

## Local math

This project also features a way to simplify querying entities
organized into a two-dimensional grid.

```js

// given a 3x3 grid
const filters = [
    new CardFilter().and(
        (ent) => ent.get(Value) === 6
    ).and(
        (ent) => ent.get(Team) === TEAMS.A
    ),
    new CardFilter().and(
        (ent) => ent.get(Team) === TEAMS.B
    )
]

const pattern = [
    [0, 0], [0, 1], [0, 2]
]
select(filters, pattern).forEach(ent => {
    // returns entities from the first row
    // which are either from team A with value of 6
    // or from team B
})
```

Relative pattern querying.
```js

const pattern_around = [[0, 1], [0, -1], [1, 0], [-1, 0]]
relative(ent_target, [], pattern_around).forEach(ent => {
    // returns entities which are around ent_target
    ent.modify(Value).sub(value)
})
```