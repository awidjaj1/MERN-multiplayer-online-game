import { Climb_N, Climb_S, Idle_E, Idle_N, Idle_NE, Idle_NW, Idle_S, Idle_SE, Idle_SW, Idle_W, Walk_E, Walk_N, Walk_NE, Walk_NW, Walk_S, Walk_SE, Walk_SW, Walk_W } from "./State";

export default class Entity{
    constructor(entity){
        this.name = entity.username; 
        this.level = entity.level; 
        this.x = entity.x; 
        this.y = entity.y;
        this.elevation = entity.elevation;
    }
}