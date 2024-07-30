import { Idle_N, Idle_NE, Idle_E, Idle_SE, Idle_S, Idle_SW, Idle_W, Idle_NW,
    Walk_N, Walk_NE, Walk_E, Walk_SE, Walk_S, Walk_SW, Walk_W, Walk_NW,
    Climb_Idle_N, Climb_Idle_S, Climb_N, Climb_S
 } from "./State";

export default class PlayerWrapper extends EntityWrapper{
    constructor(player){
        super(player);
        this.states = [
            new Idle_N(), new Idle_NE(), new Idle_E(), new Idle_SE(), new Idle_S(), new Idle_SW(), new Idle_W(), new Idle_NW(),
            new Walk_N(), new Walk_NE(), new Walk_E(), new Walk_SE(), new Walk_S(), new Walk_SW(), new Walk_W(), new Walk_NW(),
            new Climb_Idle_N(), new Climb_Idle_S(), new Climb_N(), new Climb_S(),
        ]
        this.currentState = this.states[4];
        this.speedX = 0;
        this.speedY = 0;
        this.fps = 30;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;
    }

    update(input, dt){
        this.currentState.handleInput(input, this.player);
        if(this.frameTimer > this.frameInterval){
            this.player.frameX++;
            this.player.frameX %= this.player.maxFrame;
            this.frameTimer = 0; //could result in animation frame bleeding 
        }else{
            this.frameTimer += dt;
        }

        this.player.x += this.speedX * dt;
        this.player.y += this.speedY * dt;

    }

    setState(state){
        this.currentState.exit(this.player);
        this.currentState = this.states[state];
        this.currentState.enter(this.player);
    }

}