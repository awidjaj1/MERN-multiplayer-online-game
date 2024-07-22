export default class Entity{
    constructor(entity){
        this.name = entity.username; 
        this.level = entity.level; 
        this.x = entity.x; 
        this.y = entity.y;
        this.state = "idle";
        this.elevation = 0;
    }
}