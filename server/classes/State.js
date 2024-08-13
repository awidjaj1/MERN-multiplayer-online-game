const WALK_START = 0;
const WALK_END = 7;
const IDLE_START = 8;
const IDLE_END = 24;
const CLIMB_START = 25;
const CLIMB_END = 30;
const CLIMB_IDLE_START = 31;
const CLIMB_IDLE_END = 47;
const WALK_SPEED = 0.15;
const CLIMB_SPEED = 0.05;
const IDLE_SPEED = 0;


export class State{
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
class DirectionalState extends State{
    constructor(direction, state, startFrame, endFrame){
        super(state, startFrame, endFrame);
        this.direction = direction;
    }

    handleInput(inputs, player){
        if(player.context.near_ladder)
            if(inputs.w)
                return player.setState(State.STATES.CLIMB_N);
            else if(inputs.s)
                return player.setState(State.STATES.CLIMB_S);

        if(inputs.w)
            if(inputs.d)
                return player.setState(State.STATES.WALK_NE);
            else if(inputs.a)
                return player.setState(State.STATES.WALK_NW);
            else
                return player.setState(State.STATES.WALK_N);
        else if(inputs.s)
            if(inputs.d)
                return player.setState(State.STATES.WALK_SE);
            else if(inputs.a)
                return player.setState(State.STATES.WALK_SW);
            else
                return player.setState(State.STATES.WALK_S);
        else if(inputs.d)
            return player.setState(State.STATES.WALK_E);
        else if(inputs.a)
            return player.setState(State.STATES.WALK_W);
        else
            return false; //no input was caught
            
    }
}

class Walk extends DirectionalState{
    constructor(direction, state){
        super(direction, state, WALK_START, WALK_END)
    }

    enter(player){
        player.entity.frameX = WALK_START;
        player.entity.frameY = this.direction;
    }
}
class Idle extends DirectionalState{
    constructor(direction, state){
        super(direction, state, IDLE_START, IDLE_END)
    }

    enter(player){
        player.entity.frameX = IDLE_START;
        player.entity.frameY = this.direction;
        player.velocity.x = IDLE_SPEED;
        player.velocity.y = IDLE_SPEED;

    }
}
class Climb extends DirectionalState{
    constructor(direction, state){
        super(direction, state, CLIMB_START, CLIMB_END);
    }
    
    enter(player){
        player.entity.frameX = CLIMB_START;
        player.entity.frameY = this.direction;
        player.velocity.x = IDLE_SPEED;
    }
}
class Climb_Idle extends DirectionalState{
    constructor(direction, state){
        super(direction, state, CLIMB_IDLE_START, CLIMB_IDLE_END);
    }

    enter(player){
        player.entity.frameX = CLIMB_IDLE_START;
        player.entity.frameY = this.direction;
        player.velocity.x = IDLE_SPEED;
        player.velocity.y = IDLE_SPEED;
    }

    handleInput(inputs, player){
        //it is given that if you're in this state, player is near ladder
        if(!inputs.w && !inputs.s && (inputs.d || inputs.a))
            return;
        super.handleInput(inputs, player);
    }
}

export class Climb_N extends Climb{
    constructor(){
        super(State.DIRECTIONS.N, State.STATES.CLIMB_N);
    }

    enter(player){
        super.enter(player);
        player.velocity.y = -CLIMB_SPEED;
    }

    handleInput(inputs, player){
        if(player.context.near_ladder && !inputs.w && !inputs.s)
            player.setState(State.STATES.CLIMB_IDLE_N);
        else
            if(!super.handleInput(inputs, player))
                player.setState(State.STATES.IDLE_N);
            
    }
}
export class Climb_S extends Climb{
    constructor(){
        super(State.DIRECTIONS.S, State.STATES.CLIMB_S);
    }

    enter(player){
        super.enter(player);
        player.velocity.y = CLIMB_SPEED;
    }


    handleInput(inputs, player){
        if(player.context.near_ladder && !inputs.w && !inputs.s)
            player.setState(State.STATES.CLIMB_IDLE_S);
        else
            if(!super.handleInput(inputs, player))
                player.setState(State.STATES.IDLE_S)
    }
}
export class Climb_Idle_N extends Climb_Idle{
    constructor(){
        super(State.DIRECTIONS.N, State.STATES.CLIMB_IDLE_N);
    }
}
export class Climb_Idle_S extends Climb_Idle{
    constructor(){
        super(State.DIRECTIONS.S, State.STATES.CLIMB_IDLE_S);
    }
}

export class Idle_N extends Idle{
    constructor(){
        super(State.DIRECTIONS.N, State.STATES.IDLE_N);
    }
}
export class Idle_NE extends Idle{
    constructor(){
        super(State.DIRECTIONS.NE, State.STATES.IDLE_NE);
    }
}
export class Idle_E extends Idle{
    constructor(){
        super(State.DIRECTIONS.E, State.STATES.IDLE_E);
    }
}
export class Idle_SE extends Idle{
    constructor(){
        super(State.DIRECTIONS.SE, State.STATES.IDLE_SE);
    }
}
export class Idle_S extends Idle{
    constructor(){
        super(State.DIRECTIONS.S, State.STATES.IDLE_S);
    }
}
export class Idle_SW extends Idle{
    constructor(){
        super(State.DIRECTIONS.SW, State.STATES.IDLE_SW);
    }
}
export class Idle_W extends Idle{
    constructor(){
        super(State.DIRECTIONS.W, State.STATES.IDLE_W);
    }

}
export class Idle_NW extends Idle{
    constructor(){
        super(State.DIRECTIONS.NW, State.STATES.IDLE_NW);
    }
}

export class Walk_N extends Walk{
    constructor(){
        super(State.DIRECTIONS.N, State.STATES.WALK_N);
    }

    enter(player){
        super.enter(player);
        player.velocity.x = IDLE_SPEED;
        player.velocity.y = -WALK_SPEED;
    }

    handleInput(inputs, player){

        //if no key is caught
        if(!super.handleInput(inputs, player))
            player.setState(State.STATES.IDLE_N);
    }
}
export class Walk_NE extends Walk{
    constructor(){
        super(State.DIRECTIONS.NE, State.STATES.WALK_NE);
    }

    enter(player){
        super.enter(player);
        player.velocity.x = WALK_SPEED * Math.SQRT1_2;
        player.velocity.y = -WALK_SPEED * Math.SQRT1_2;
    }

    handleInput(inputs, player){

        //if no key is caught
        if(!super.handleInput(inputs, player))
            player.setState(State.STATES.IDLE_NE);
    }
}
export class Walk_E extends Walk{
    constructor(){
        super(State.DIRECTIONS.E, State.STATES.WALK_E);
    }

    enter(player){
        super.enter(player);
        player.velocity.x = WALK_SPEED;
        player.velocity.y = IDLE_SPEED;
    }

    handleInput(inputs, player){

        //if no key is caught
        if(!super.handleInput(inputs, player))
            player.setState(State.STATES.IDLE_E);
    }
}
export class Walk_SE extends Walk{
    constructor(){
        super(State.DIRECTIONS.SE, State.STATES.WALK_SE);
    }

    enter(player){
        super.enter(player);
        player.velocity.x = WALK_SPEED* Math.SQRT1_2;
        player.velocity.y = WALK_SPEED* Math.SQRT1_2;
    }

    handleInput(inputs, player){
        //if no key is caught
        if(!super.handleInput(inputs, player))
            player.setState(State.STATES.IDLE_SE);
    }
}
export class Walk_S extends Walk{
    constructor(){
        super(State.DIRECTIONS.S, State.STATES.WALK_S);
    }

    enter(player){
        super.enter(player);
        player.velocity.x = IDLE_SPEED;
        player.velocity.y = WALK_SPEED;
    }

    handleInput(inputs, player){

        //if no key is caught
        if(!super.handleInput(inputs, player))
            player.setState(State.STATES.IDLE_S);
    }
}
export class Walk_SW extends Walk{
    constructor(){
        super(State.DIRECTIONS.SW, State.STATES.WALK_SW);
    }

    enter(player){
        super.enter(player);
        player.velocity.x = -WALK_SPEED* Math.SQRT1_2;
        player.velocity.y = WALK_SPEED* Math.SQRT1_2;
    }

    handleInput(inputs, player){

        //if no key is caught
        if(!super.handleInput(inputs, player))
            player.setState(State.STATES.IDLE_SW);
    }
}
export class Walk_W extends Walk{
    constructor(){
        super(State.DIRECTIONS.W, State.STATES.WALK_W);
    }

    enter(player){
        super.enter(player);
        player.velocity.x = -WALK_SPEED;
        player.velocity.y = IDLE_SPEED;
    }

    handleInput(inputs, player){

        //if no key is caught
        if(!super.handleInput(inputs, player))
            player.setState(State.STATES.IDLE_W);
    }
}
export class Walk_NW extends Walk{
    constructor(){
        super(State.DIRECTIONS.NW, State.STATES.WALK_NW);
    }

    enter(player){
        super.enter(player);
        player.velocity.x = -WALK_SPEED* Math.SQRT1_2;
        player.velocity.y = -WALK_SPEED* Math.SQRT1_2;
    }

    handleInput(inputs, player){

        //if no key is caught
        if(!super.handleInput(inputs, player))
            player.setState(State.STATES.IDLE_NW);
    }
}