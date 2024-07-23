const STATES = {
    IDLE_N: 0,
    IDLE_NE: 1,
    IDLE_E: 2,
    IDLE_SE: 3,
    IDLE_S: 4,
    IDLE_SW: 5,
    IDLE_W: 6,
    IDLE_NW: 7
}

const DIRECTIONS = {
    N: 0,
    NE: 1,
    E: 2,
    SE: 3,
    S: 4,
    SW: 5,
    W: 6,
    NW: 7
}

class State{
    constructor(state){
        this.state = state;
    }
}

class DirectionalState extends State{
    constructor(direction){
        this.direction = direction;
    }
}

export class Idle_N extends DirectionalState{
    constructor(){
        super(DIRECTIONS.N)
    }

    enter(player){

    }

    handleInput(input, player){
        switch(input.lastKey){
            case DIRECTIONS.N:
                break;
            case DIRECTIONS.NE:
                player.setState(STATES.IDLE_NE);
                break;
            case DIRECTIONS.E:
                player.setState(STATES.IDLE_E);
                break;
            case DIRECTIONS.SE:
                player.setState(STATES.IDLE_SE);
                break;
            case DIRECTIONS.S:
                player.setState(STATES.IDLE_S);
                break;
            case DIRECTIONS.SW:
                player.setState(STATES.IDLE_SW);
                break;
            case DIRECTIONS.W:
                player.setState(STATES.IDLE_W);
                break;
            case DIRECTIONS.NW:
                player.setState(STATES.IDLE_NW);
                break;
        }
    }
}

export class Climbing extends State{

}