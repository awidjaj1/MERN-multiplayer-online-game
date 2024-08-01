import { Idle_N, Idle_NE, Idle_E, Idle_SE, Idle_S, Idle_SW, Idle_W, Idle_NW,
    Walk_N, Walk_NE, Walk_E, Walk_SE, Walk_S, Walk_SW, Walk_W, Walk_NW,
    Climb_Idle_N, Climb_Idle_S, Climb_N, Climb_S
 } from "./State";

export default class PlayerWrapper extends EntityWrapper{
    static players = {};

    constructor(player){
        super(player);
        this.states = [
            new Idle_N(), new Idle_NE(), new Idle_E(), new Idle_SE(), new Idle_S(), new Idle_SW(), new Idle_W(), new Idle_NW(),
            new Walk_N(), new Walk_NE(), new Walk_E(), new Walk_SE(), new Walk_S(), new Walk_SW(), new Walk_W(), new Walk_NW(),
            new Climb_Idle_N(), new Climb_Idle_S(), new Climb_N(), new Climb_S(),
        ];
        this.context = {near_ladder: false, near_water: false};
        this.collidable = true;
        this.currentState = this.states[4];
        this.speedX = 0;
        this.speedY = 0;
        this.fps = 30;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;
        this.height = 16;
        this.width = 16;
    }

    update(inputs, map, dt){
        this.currentState.handleInput(inputs, this.player);
        if(this.frameTimer > this.frameInterval){
            this.player.frameX++;
            this.player.frameX %= this.player.maxFrame;
            this.frameTimer = 0; //could result in animation frame bleeding 
        }else{
            this.frameTimer += dt;
        }

        const newX = this.player.x + this.speedX * dt;
        const newY = this.player.y + this.speedY * dt;
        const grid_size = map.metadata.grid_size;

        const tile = {x: Math.floor(player.x/grid_size) * grid_size, y: Math.floor(player.y/grid_size) * grid_size};
        const possible_tiles = map.get_9x9(tile);
    
        const possible_tiles_ids = possible_tiles.map(({x,y}) => map.get_tiles(x,y, player.elevation));

        const attemptedHitboxes = [{x:newX,y:newY,width:grid_size,height:grid_size}];
        if(this.speedX && this.speedY)
            attemptedHitboxes.push({x:newX,y:player.y,width:grid_size,height:grid_size},
                {x:player.x,y:newY,width:grid_size,height:grid_size});
        newX = player.x;
        newY = player.y;

        for(const playerHitbox of attemptedHitboxes){
            if(checkCollision(this, possible_tiles, possible_tiles_ids)){
                newX = playerHitbox.x;
                newY = playerHitbox.y;
                break;
            }
        }
        player.x = newX;
        player.y = newY;

    }

    setState(state){
        if(state === player.currentState.state)
            return;
        this.currentState.exit(this.player);
        this.currentState = this.states[state];
        this.currentState.enter(this.player);
    }

}