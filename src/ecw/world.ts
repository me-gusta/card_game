//@ts-nocheck
import {C_Enum, Component} from "./component"
import type {Entity, EntityId} from "./entity"
import type {System} from "./system"
import {clamp, hashCode} from "../game/helpers";

export class World {
    _entityCounter: EntityId
    _components: Map<string, Set<EntityId>>
    _entities: Map<EntityId, Map<string, any>>
    _systems: System[]
    _deadEntities: Set<EntityId>

    _queryCache: Map<any, any>
    // _events: Map<string, any>
    _ticks: number
    _elapsed_ms: number
    _concentrators: Map<EntityId, Map<any, any>>

    constructor() {
        this._entityCounter = 0
        this._components = new Map()
        this._entities = new Map()
        this._systems = []
        this._deadEntities = new Set()
        this._queryCache = new Map()
        // this._events = new Map()
        this._ticks = 0
        this._elapsed_ms = 0
        this._concentrators = new Map()
        // this._queryOneComponentCache = new Map()
        return this
    }

    clearCache() {
        this._queryCache.clear()
        this._queryCache.clear()
    }


    killEntity(entity: Entity | EntityId): any {
        const entity_id: number = <number>((<Entity>entity).id || entity)
        // console.log('KILL REQUEST ENTITY', ent)
        this._deadEntities.add(entity_id)
        this._removeDeadEntities()
    }

    _removeDeadEntities() {
        for (const ent of this._deadEntities) {
            for (const [componentName, component] of this._entities.get(ent)) {
                // console.log('KILL ENTITY', ent)
                if (component.delete)
                    component.delete(ent)
                // delete entity from each of its component set
                const components = this._components.get(componentName)
                components.delete(ent)
                if (components.size === 0) {
                    this._components.delete(componentName)
                }
            }

            // delete entity
            this._entities.delete(ent)
        }
        if (this._deadEntities.size) {
            this.clearCache()
            this._deadEntities.clear()
        }
    }

    createEntity(...components: Component<any>[]): Entity {
        this._entityCounter += 1

        this._addComponents(this._entityCounter, components)

        // console.log('NEW ENTITY',this._entityCounter, this._entities.get(this._entityCounter))
        // return this._entityCounter
        return this.qe(this._entityCounter)
    }

    _addComponents(ent_id: EntityId, components: Component<any>[]) {
        for (const component of components) {
            const ent = this.addComponent(
                ent_id,
                component.constructor.name,
                component.value)
            // console.log(component.constructor.name, component, component instanceof C_Enum)
            if (component instanceof C_Enum)
                this.addComponent(
                    ent_id,
                    component.constructor.name + '.' + component.value,
                    true)

            component.init(ent)
        }
    }

    addComponent(ent: EntityId, componentType: string, value: any) {
        // const componentType = component.getName()

        // check if component type is known
        if (!this._components.has(componentType)) {
            this._components.set(componentType, new Set())
        }

        // add component
        const entitiesWithComponent = this._components.get(componentType)
        entitiesWithComponent?.add(ent)


        // Check if entity is known
        if (!this._entities.has(ent)) {
            this._entities.set(ent, new Map())
        }
        const entity = this._entities.get(ent)
        entity?.set(componentType, value)

        this.clearCache()

        return ent
    }

    removeComponent(ent: EntityId, type: typeof Component<any>) {
        if ((type as typeof C_Enum).isEnum) {
            this._removeComponent(ent, type.name + '.' + this._entities.get(ent).get(type.name))
        }
        this._removeComponent(ent, type.name)
    }

    _removeComponent(ent: EntityId, componentName: string) {
        const components = this._components.get(componentName)
        components.delete(ent)

        if (components.size === 0) {
            this._components.delete(componentName)
        }

        const entity = this._entities.get(ent)

        const component = entity.get(componentName)
        if (component.delete)
            component.delete(ent)

        entity.delete(componentName)
        if (entity.size === 0) {
            this._entities.delete(ent)
        }

        this.clearCache()
    }


    * _query(names: string[]): Iterable<any[]> {
        const sets: Set<EntityId>[] = []
        for (const name of names) {
            const entities = this._components.get(name)
            if (entities !== undefined) {
                sets.push(entities)
            } else {
                sets.push(new Set())
            }
        }
        for (const ent of intersect(sets)) {
            yield [ent, ...names.map((name) => this._entities.get(ent).get(name))]
        }
    }

    * _queryOneComponent(name: string): Iterable<any[]> {
        const entities = this._components.get(name) || new Set()

        for (const ent of entities) {
            yield [ent, this._entities.get(ent).get(name)]
        }
    }

    query(types: (typeof Component | Component<any>)[]) {
        const names = types.map(t => getName(t))
        // const namesForCache = names.join(' ')

        // let result = this._queryCache.get(namesForCache)
        // if (result !== undefined) {
        //     return result
        // }

        let result
        if (names.length === 1) {
            result = [...this._queryOneComponent(names[0])]
        } else {
            result = [...this._query(names)]
        }
        // this._queryCache.set(namesForCache, result)
        return result

    }

    qe(entity: Entity | EntityId): any {
        let entity_id
        let ent
        if (typeof entity == 'number') {
            entity_id = entity
            ent = {
                id: entity_id
            }
            ent['has'] = this.has(ent)
            ent['add'] = this.add(ent)
            ent['remove'] = this.remove(entity_id)
            ent['get'] = this.get(ent)
            ent['modify'] = this.modify(ent)
        } else {
            entity_id = entity.id
            ent = entity
        }
        // const entity_id: number = <number>((<Entity>entity).id || entity)



        this._entities.get(entity_id).forEach((comp, key) => {
            ent[key.toLowerCase()] = comp
        })

        return ent
    }

    qo(...types: (typeof Component<any> | Component<any>)[]): any {
        const result = this.query(types)
        if (result.length === 0)
            return
        return this.buildEntity(types, result[0])
    }

    q(...types: (typeof Component<any> | Component<any>)[]): any[] {
        const results = this.query(types)
        const entities = []
        for (const result of results) {
            entities.push(this.buildEntity(types, result))
        }
        return entities
    }

    has(ent) {
        return (type) => {
            const value = this._entities.get(ent.id).get(type.name)
            if (value === undefined)
                return false
            const name = type.name.toLowerCase()
            ent[name] = value
            if (isNaN(value) && 'isVar' in value)
                ent['_' + name] = value.value
            return true
        }
    }

    get(ent) {
        return (type) => {
            const value = this._entities.get(ent.id).get(type.name)
            if (value === undefined)
                return undefined
            // if (isNaN(value) && 'isVar' in value)
            //     return value.value
            return value
        }
    }

    add(ent) {
        return (...components: (typeof Component<any> | Component<any>)[]) => {
            for (let i = 0; i < components.length; i++) {
                const comp = components[i]
                if (!(comp instanceof Component)) {
                    components[i] = new comp()
                }
            }
            this._addComponents(ent.id, components)
            // components.forEach(c => {
            //     ent[getName(c).toLowerCase()] = c.value
            // })
        }
    }

    remove(ent_id: EntityId) {
        return (type: typeof Component<any>) => {
            this.removeComponent(ent_id, type)
        }
    }

    modify(ent) {
        return (type: typeof Component<any>) => {
            // const current_value = ent.get(type)
            const obj = {}
            obj['set'] = (value: any) => {
                this._entities.get(ent.id).set(type.name, value)
                return ent
            }
            obj['sub'] = (value: any) => {
                this._entities.get(ent.id).set(type.name, ent.get(type) - value)
                return ent
            }
            obj['add'] = (value: any) => {
                this._entities.get(ent.id).set(type.name, ent.get(type) + value)
                return ent
            }
            obj['div'] = (value: any) => {
                this._entities.get(ent.id).set(type.name, Math.floor(ent.get(type) / value))
                return ent
            }
            obj['mul'] = (value: any) => {
                this._entities.get(ent.id).set(type.name, Math.floor(ent.get(type) * value))
                return ent
            }
            return obj
        }
    }


    buildEntity(types: (typeof Component<any> | Component<any>)[], result) {
        const ent = {
            id: result[0],
        }
        ent['has'] = this.has(ent)
        ent['add'] = this.add(ent)
        ent['remove'] = this.remove(result[0])
        ent['get'] = this.get(ent)
        ent['modify'] = this.modify(ent)

        // for (let i = 1; i < result.length; i++) {
        //     const type = types[i - 1]
        //     if ((type as C_Enum<any>).isEnum && (type as C_Enum<any>).value) {
        //         ent[type.constructor.name.toLowerCase()] = (type as C_Enum<any>).value
        //     }
        //     else {
        //         const value = result[i]
        //         const name = getName(type).toLowerCase()
        //         ent[name] = value
        //         if (value.isVar)
        //             ent['_' + name] = value.value
        //     }
        // }
        return ent
    }

    addSystem(system: System, priority: number = 0) {
        system.priority = priority
        system.world = this
        this._systems.push(system)
        this._systems.sort((a, b) => b.priority - a.priority)
        return this
    }

    process(args?: any) {
        this._ticks += 1//args.elapsedMS
        this._elapsed_ms += args.elapsedMS
        args.total_ms = this._ticks
        // console.log('Start process')
        this._removeDeadEntities()

        for (const system of this._systems) {
            system.process(args)
        }
    }

    process_measure_performance (args?: any) {
        this._ticks += 1
        this._elapsed_ms += args.elapsedMS
        args.total_ms = this._ticks
        // console.log('Start process')
        this._removeDeadEntities()

        const measures = {}
        for (const system of this._systems) {
            const startTime = performance.now()
            system.process(args)
            measures [system.constructor.name] =  performance.now() - startTime
        }
        if (this._ticks % 27 == 0) {
            console.log(measures)
        }
    }

    process_show_performance (args?: any) {
        this._ticks += 1
        this._elapsed_ms += args.elapsedMS
        args.total_ms = this._ticks
        // console.log('Start process')
        this._removeDeadEntities()


        if (this._ticks % 27 == 0) {
            let measures = ""
            const startTime = performance.now()
            for (const system of this._systems) {
                system.process(args)
            }
            measures += `${performance.now() - startTime}\n`
            document.querySelector('.measures').innerHTML = measures
            console.log(args.elapsedMS)
        } else {
            this.process(args)
        }
    }

    getEntity(ent: EntityId) {
        return this._entities.get(ent)
    }

    getComponentsFor(ent: EntityId, ...types: typeof Component[]) {
        try {
            if (types.length === 1) {
                return this._entities.get(ent).get(types[0].name).value
            } else {
                return types.map(type =>
                    this._entities.get(ent).get(type.name).value
                )
            }
        } catch (e) {
            console.log('ERROR WHILE GETTING COMPONENTS FOR ENTITY')
            console.log('requested components:', ...[types.map(t => t.name)])
            console.log('ent:', ent)
            console.log('available components:', this._entities.get(ent))
            return null
        }
    }

    hasEntity(ent) {
        return this._entities.has(ent)
    }

    hasComponents(ent, ...types: typeof Component[]) {
        if (types.length === 1) {
            return Boolean(this._entities.get(ent).get(types[0].name))
        } else {
            return types.map(type =>
                Boolean(this._entities.get(ent).get(type.name))
            )
        }
    }


    setup() {
        for (const system of this._systems) {
            console.log('setup', system)
            system.setup()
        }
    }

    // addEvent(name: string, data: any) {
    //     this._events.set(name, data)
    // }
    //
    // getEvent(name: string) {
    //     const result = this._events.get(name)
    //     if (name === 'mouseMove') {
    //         return result
    //     }
    //     this._events.delete(name)
    //     return result
    // }

    print() {
        this._entities.forEach((value, key) => {
            console.log('entity ' + key)
            console.log(Object.fromEntries(value))
        })

        console.log('components')
        console.log(Object.fromEntries(this._components))

    }
}


function intersect(sets: Set<EntityId>[]): Set<EntityId> {
    if (!sets.length) return new Set();
    const i = sets.reduce((m, s, i) => s.size < sets[m].size ? i : m, 0);
    const [smallest] = sets.splice(i, 1);
    const res: Set<EntityId> = new Set();
    for (let val of smallest)
        if (sets.every(s => s.has(val)))
            res.add(val);
    return res;
}

function getName(t) {
    if (t instanceof Component) {
        if ((t as C_Enum<any>).isEnum) {
            return t.constructor.name + '.' + t.value
        }
        return t.constructor.name
    } else {
        return t.name
    }
}