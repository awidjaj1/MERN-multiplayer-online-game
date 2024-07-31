function AABB_Colliding(rect1, rect2){
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}
const checkCollision = (playerHitbox, possible_tiles, possible_tiles_ids, direction) => {
    const ground_tile_hitbox = {x:0,y:0,width:grid_size,height:grid_size};

    //only one direction at a time, even for diagonal (i.e. we move in an L shape). This could make
    //the character move around an object when moving diagonally, but it shouldn't be an issue if the
    //movement steps are small enough
    
    //IF WE COLLIDE WITH A HITBOX CONSIDER THE FOLLOWING:
    //if direction is north, want to get the maximum y-coordinate (given by hitbox.y + hitbox.height)
    //else if direction is east, want to get the minimum x-coordinate (given by hitbox.x)
    //else if direction is south, want to get the minimum y-coordinate (given by hitbox.y)
    //else if direction is west, want to get the maximum x-coordinate (given by hitbox.x + hitbox.width)
    for(const i in possible_tiles){
        const {x,y} = possible_tiles[i];
        const [ground_id, object_id] = possible_tiles_ids[i];
        if(AABB_Colliding({...ground_tile_hitbox, x:ground_tile_hitbox.x + x, y: ground_tile_hitbox.y + y}, playerHitbox) && !ground_id){
            event.collided = true;
        }
        if(specialTiles[ground_id]){
            specialTiles[ground_id].forEach(({hitbox, properties}) => {
                if(properties.type === "collision" && AABB_Colliding(x,y,hitbox, playerHitbox)){
                    event.collided = true;
                }
            })
        }
        if(specialTiles[object_id]){
            const gid = getFirstGid(object_id);
            const tileWidth = gidToTilesetMap[gid].tileWidth;
            const tileHeight = gidToTilesetMap[gid].tileHeight;
            const offsetX = grid_size - tileWidth;
            const offsetY = grid_size - tileHeight;
            specialTiles[object_id].forEach(({hitbox, properties}) => {
                if(properties.type === "collision" && AABB_Colliding({...hitbox, x:hitbox.x + x + offsetX, y:hitbox.y + y + offsetY}, playerHitbox)){
                    event.collided = true;
                }else if(properties.type === "climb" && AABB_Colliding(x + offsetX,y + offsetY,hitbox, playerHitbox)){
                    event.newState = "climb"
                }
                
            })
        }
    }
    return event;
}