import { Idle_N, Idle_NE, Idle_E, Idle_SE, Idle_S, Idle_SW, Idle_W, Idle_NW,
    Walk_N, Walk_NE, Walk_E, Walk_SE, Walk_S, Walk_SW, Walk_W, Walk_NW,
    Climb_Idle_N, Climb_Idle_S, Climb_N, Climb_S, State
 } from "./State.js";

import EntityWrapper from "./Entity.js";

export default class PlayerWrapper extends EntityWrapper{
    static players = {};

    constructor(player){
        super(player);
        this.states = [
            new Idle_S(), new Idle_N(), new Idle_E(), new Idle_SE(), new Idle_NE(), new Idle_W(), new Idle_SW(), new Idle_NW(),
            new Walk_S(), new Walk_N(), new Walk_E(), new Walk_SE(), new Walk_NE(), new Walk_W(), new Walk_SW(), new Walk_NW(),
            new Climb_Idle_N(), new Climb_Idle_S(), new Climb_N(), new Climb_S(),
        ];
        this.context = {near_ladder: false, near_water: false};
        this.collidable = true;
        this.currentState = this.states[State.STATES.IDLE_S];
        this.velocity = {x: 0, y:0};
        this.fps = 30;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;
    }

    update(inputs, map, dt){
        this.currentState.handleInput(inputs, this);
        if(this.frameTimer > this.frameInterval){
            this.entity.frameX = this.entity.frameX === this.currentState.endFrame? this.currentState.startFrame: this.entity.frameX + 1;
            this.frameTimer = 0; //could result in animation frame bleeding 
        }else{
            this.frameTimer += dt;
        }

        const move = (axis) => {
            const grid_size = map.metadata.grid_size;
            if(this.velocity[axis]){
                this.entity.coords[axis] += this.velocity[axis] * dt;
                const tile = {x: Math.floor(this.entity.coords.x/grid_size) * grid_size, y: Math.floor(this.entity.coords.y/grid_size) * grid_size};
                const possible_tiles = map.collision.get_4x4(tile);
                const possible_tiles_ids = possible_tiles.map(({x,y}) => map.collision.get_tiles(x,y, this.entity.elevation));
                const coord = map.collision.checkCollisionStatic(this, possible_tiles, possible_tiles_ids, axis);
                if(coord){
                    this.entity.coords[axis] = coord;
                }
            }
        }
        move('x');
        move('y');

    }

    setState(state){
        if(state !== this.currentState.state){
            this.currentState.exit(this);
            this.currentState = this.states[state];
            this.currentState.enter(this);
        }
        return true;
    }

}