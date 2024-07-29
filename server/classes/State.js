const WALK_START = 0;
const WALK_END = 8;
const IDLE_START = 8;
const IDLE_END = 25;
const CLIMB_START = 25;
const CLIMB_END = 31;
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
    WALK_NW: 15,
    CLIMB_N: 16,
    CLIMB_S: 17,
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

    handleInput(inputs, player){
        if(inputs.w)
            if(inputs.d)
                player.setState(STATES.WALK_NE);
            else if(inputs.a)
                player.setState(STATES.WALK_NW);
            else
                player.setState(STATES.WALK_N);
        else if(inputs.s)
            if(inputs.d)
                player.setState(STATES.WALK_SE);
            else if(inputs.a)
                player.setState(STATES.WALK_SW);
            else
                player.setState(STATES.WALK_S);
        else if(inputs.d)
            player.setState(STATES.WALK_E);
        else if(inputs.a)
            player.setState(STATES.WALK_W);
        else
            return false; //no input was caught

        return true; //input was caught
            
    }
}

class Walk extends DirectionalState{
    constructor(direction, state){
        super(direction, state)
    }

    enter(player){
        player.maxFrame = WALK_END;
        player.frameX = WALK_START;
        player.frameY = this.direction;
    }
}

class Idle extends DirectionalState{
    constructor(direction, state){
        super(direction, state)
    }

    enter(player){
        player.maxFrame = IDLE_END;
        player.frameX = IDLE_START;
        player.frameY = this.direction;
        player.speedX = IDLE_SPEED;
        player.speedY = IDLE_SPEED;

    }
}


export class Idle_N extends Idle{
    constructor(){
        super(DIRECTIONS.N, STATES.IDLE_N);
    }
}

export class Idle_NE extends Idle{
    constructor(){
        super(DIRECTIONS.NE, STATES.IDLE_NE);
    }
}

export class Idle_E extends Idle{
    constructor(){
        super(DIRECTIONS.E, STATES.IDLE_E);
    }
}

export class Idle_SE extends Idle{
    constructor(){
        super(DIRECTIONS.SE, STATES.IDLE_SE);
    }
}

export class Idle_S extends Idle{
    constructor(){
        super(DIRECTIONS.S, STATES.IDLE_S);
    }
}

export class Idle_SW extends Idle{
    constructor(){
        super(DIRECTIONS.SW, STATES.IDLE_SW);
    }
}

export class Idle_W extends Idle{
    constructor(){
        super(DIRECTIONS.W, STATES.IDLE_W);
    }

}

export class Idle_NW extends Idle{
    constructor(){
        super(DIRECTIONS.NW, STATES.IDLE_NW);
    }
}


export class Walk_N extends Walk{
    constructor(){
        super(DIRECTIONS.N, STATES.WALK_N);
    }

    enter(player){
        super.enter(player);
        player.speedX = IDLE_SPEED;
        player.speedY = -WALK_SPEED;
    }

    handleInput(inputs, player){
        //do not change state if moving north
        if(inputs.w && !inputs.d && !inputs.a)
            return;

        //if no key is caught
        if(!super.handleInput())
            player.setState(STATES.IDLE_N);
    }
}

export class Walk_NE extends Walk{
    constructor(){
        super(DIRECTIONS.NE, STATES.WALK_NE);
    }

    enter(player){
        super.enter(player);
        player.speedX = WALK_SPEED;
        player.speedY = -WALK_SPEED;
    }

    handleInput(inputs, player){
        //do not change state if moving north east
        if(inputs.w && inputs.d)
            return;

        //if no key is caught
        if(!super.handleInput())
            player.setState(STATES.IDLE_NE);
    }
}

export class Walk_E extends Walk{
    constructor(){
        super(DIRECTIONS.E, STATES.WALK_E);
    }

    enter(player){
        super.enter(player);
        player.speedX = WALK_SPEED;
        player.speedY = IDLE_SPEED;
    }

    handleInput(inputs, player){
        //do not change state if moving east
        if(inputs.d && !inputs.s && !inputs.w)
            return;

        //if no key is caught
        if(!super.handleInput())
            player.setState(STATES.IDLE_E);
    }
}

export class Walk_SE extends Walk{
    constructor(){
        super(DIRECTIONS.SE, STATES.WALK_SE);
    }

    enter(player){
        super.enter(player);
        player.speedX = WALK_SPEED;
        player.speedY = WALK_SPEED;
    }

    handleInput(inputs, player){
        //do not change state if moving south east
        if(inputs.s && inputs.d)
            return;

        //if no key is caught
        if(!super.handleInput())
            player.setState(STATES.IDLE_SE);
    }
}

export class Walk_S extends Walk{
    constructor(){
        super(DIRECTIONS.S, STATES.WALK_S);
    }

    enter(player){
        super.enter(player);
        player.speedX = IDLE_SPEED;
        player.speedY = WALK_SPEED;
    }

    handleInput(inputs, player){
        //do not change state if moving south
        if(inputs.s && !inputs.d && !inputs.a)
            return;

        //if no key is caught
        if(!super.handleInput())
            player.setState(STATES.IDLE_S);
    }
}

export class Walk_SW extends Walk{
    constructor(){
        super(DIRECTIONS.SW, STATES.WALK_SW);
    }

    enter(player){
        super.enter(player);
        player.speedX = -WALK_SPEED;
        player.speedY = WALK_SPEED;
    }

    handleInput(inputs, player){
        //do not change state if moving south west
        if(inputs.s && inputs.a)
            return;

        //if no key is caught
        if(!super.handleInput())
            player.setState(STATES.IDLE_SW);
    }
}

export class Walk_W extends Walk{
    constructor(){
        super(DIRECTIONS.W, STATES.WALK_W);
    }

    enter(player){
        super.enter(player);
        player.speedX = -WALK_SPEED;
        player.speedY = IDLE_SPEED;
    }

    handleInput(inputs, player){
        //do not change state if moving west
        if(inputs.a && !inputs.s && !inputs.w)
            return;

        //if no key is caught
        if(!super.handleInput())
            player.setState(STATES.IDLE_W);
    }
}

export class Walk_NW extends Walk{
    constructor(){
        super(DIRECTIONS.NW, STATES.WALK_NW);
    }

    enter(player){
        super.enter(player);
        player.speedX = -WALK_SPEED;
        player.speedY = WALK_SPEED;
    }

    handleInput(inputs, player){
        //do not change state if moving north west
        if(inputs.w && inputs.a)
            return;

        //if no key is caught
        if(!super.handleInput())
            player.setState(STATES.IDLE_NW);
    }
}



class Climb extends DirectionalState{
    constructor(direction, state){
        super(direction, state);
    }
    
    enter(player){
        player.maxFrame = CLIMB_END;
        player.frameX = CLIMB_START;
        player.frameY = this.direction;
        player.speedX = IDLE_SPEED;
        player.elevation++;
    }

    exit(player){
        player.elevation--;
    }


}

export class Climb_N extends Climb{
    constructor(){
        super(DIRECTIONS.N, STATES.CLIMB_N);
    }

    enter(player){
        super.enter(player);
        player.speedY = -CLIMB_SPEED;
    }

    handleInput(inputs, player){
        if(inputs.s)
            player.setState(STATES.CLIMB_S);
    }
}

export class Climb_S extends Climb{
    constructor(){
        super(DIRECTIONS.S, STATES.CLIMB_S);
    }

    enter(player){
        super.enter(player);
        player.speedY = CLIMB_SPEED;
    }

    handleInput(inputs, player){
        if(inputs.n)
            player.setState(STATES.CLIMB_N);
    }
}