const WALK_START = 0;
const WALK_END = 8;
const IDLE_START = 8;
const IDLE_END = 25;
const WALK_SPEED = 0.35;
const CLIMB_SPEED = 0.15;
const IDLE_SPEED = 0;

const STATES = {
    IDLE_S: 0,
    IDLE_N: 1,
    IDLE_E: 2,
    IDLE_SE: 3,
    IDLE_NE: 4,
    IDLE_W: 5,
    IDLE_SW: 6,
    IDLE_NW: 7,
    WALK_S: 8,
    WALK_N: 9,
    WALK_E: 10,
    WALK_SE: 11,
    WALK_NE: 12,
    WALK_W: 13,
    WALK_SW: 14,
    WALK_NW: 15
}

export const KEYS = {
    PRESS_W: 0,
    PRESS_A: 1,
    PRESS_S: 2,
    PRESS_D: 3,
    RELEASE_W: 4,
    RELEASE_A: 5,
    RELEASE_S: 6,
    RELEASE_D: 7,
}

const DIRECTIONS = {
    S: 0,
    N: 1,
    E: 2,
    SE: 3,
    NE: 4,
    W: 5,
    SW: 6,
    NW: 7
}

class State{
    constructor(state){
        this.state = state;
    }
}

class DirectionalState extends State{
    constructor(direction, state){
        this.direction = direction;
        super(state);
    }
}

export class Idle_N extends DirectionalState{
    constructor(){
        super(DIRECTIONS.N, STATES.IDLE_N);
    }

    enter(player){
        player.maxFrame = IDLE_END;
        player.frameX = IDLE_START;
        player.frameY = this.direction;
        player.speedX = IDLE_SPEED;
        player.speedY = IDLE_SPEED;

    }

    handleInput(input, player){
        switch(input.lastKey){
            case DIRECTIONS.N:
                player.setState(STATES.WALK_N)
                break;
            case DIRECTIONS.NE:
                player.setState(STATES.WALK_NE);
                break;
            case DIRECTIONS.E:
                player.setState(STATES.WALK_E);
                break;
            case DIRECTIONS.SE:
                player.setState(STATES.WALK_SE);
                break;
            case DIRECTIONS.S:
                player.setState(STATES.WALK_S);
                break;
            case DIRECTIONS.SW:
                player.setState(STATES.WALK_SW);
                break;
            case DIRECTIONS.W:
                player.setState(STATES.WALK_W);
                break;
            case DIRECTIONS.NW:
                player.setState(STATES.WALK_NW);
                break;
        }
    }
}

export class Climbing extends State{

}