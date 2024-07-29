export default class Player extends Entity{
    constructor(player){
        super(player);
        this.states = [
            new Idle_N(), new Idle_NE(), new Idle_E(), new Idle_SE(), new Idle_S(), new Idle_SW(), new Idle_W(), new Idle_NW(),
            new Walk_N(), new Walk_NE(), new Walk_E(), new Walk_SE(), new Walk_S(), new Walk_SW(), new Walk_W(), new Walk_NW(),
            new Climb_N(), new Climb_S(),
        ]
        this.state = this.states[4];
        this.speedX = 0;
        this.speedY = 0;
        this.fps = 60;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;

    }
}