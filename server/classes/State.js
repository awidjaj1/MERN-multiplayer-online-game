const STATES = {
    IDLE: 0,

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
    constructor(state, direction){
        this.state = state;
        this.direction = direction;
    }
}

export class Idle extends State{
    constructor(){
        super(STATES.IDLE, DIRECTIONS.S);
    }

    enter(player){

    }

    handleInput(input, player){

    }
}

export class Climbing extends State{
    
}