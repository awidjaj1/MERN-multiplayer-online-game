export class ActionState{
    static STATES = {
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
        WALK_NW: 15,
        CLIMB_IDLE_N: 16,
        CLIMB_IDLE_S: 17,
        CLIMB_N: 18,
        CLIMB_S: 19,
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