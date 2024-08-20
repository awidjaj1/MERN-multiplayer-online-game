const BLINK_START = 0;
const BLINK_END = 7;
const DASH_START = 8;
const DASH_END = 15;

export class ActionState{
    static STATES = {
        BLINK_S: 0,
        BLINK_N: 1,
        BLINK_E: 2,
        BLINK_SE: 3,
        BLINK_NE: 4,
        BLINK_W: 5,
        BLINK_SW: 6,
        BLINK_NW: 7,
        DASH_S: 8,
        DASH_N: 9,
        DASH_E: 10,
        DASH_SE: 11,
        DASH_NE: 12,
        DASH_W: 13,
        DASH_SW: 14,
        DASH_NW: 15,
    };
    
    static DIRECTIONS = {
        S: 0,
        N: 1,
        E: 2,
        SE: 3,
        NE: 4,
        W: 5,
        SW: 6,
        NW: 7
    };

    constructor(state, startFrame, endFrame){
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        this.state = state;
    }

    handleInput(inputs, player){

    }

    enter(player){
    
    }

    exit(player){

    }
}

class DirectionalActionState extends ActionState{
    constructor(direction, state, startFrame, endFrame){
        super(state, startFrame, endFrame);
        this.direction = direction;
    }

    handleInput(inputs, player){
        
            
    }
}

class Blink extends DirectionalActionState{
    constructor(direction, state){
        super(direction, state, BLINK_START, BLINK_END);
    }
    
    enter(player){

    }
}

class Blink_N extends Blink{

}