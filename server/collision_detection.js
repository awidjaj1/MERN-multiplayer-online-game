function AABB_Colliding(rect1, rect2){
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

function get_direction(axis, value){
    if(axis === 'x')
        return value > 0? 'e': 'w';
    else
        return value > 0? 's': 'n';   
}

const checkCollision = (player, possible_tiles, possible_tiles_ids, direction) => {
    Object.keys(player.context).forEach((key) => player.context[key] = false);
    const gridHitbox = {x:0,y:0,width:grid_size,height:grid_size};
    const playerHitbox = {x: player.x, y: player.y, width: player.width, height: player.height};

    //only one direction at a time, even for diagonal (i.e. we move in an L shape). This could make
    //the character move around an object when moving diagonally, but it shouldn't be an issue if the
    //movement steps are small enough
    
    //IF WE COLLIDE WITH A HITBOX CONSIDER THE FOLLOWING:
    //if direction is north, want to get the maximum y-coordinate (given by hitbox.y + hitbox.height)
    //else if direction is east, want to get the minimum x-coordinate (given by hitbox.x)
    //else if direction is south, want to get the minimum y-coordinate (given by hitbox.y)
    //else if direction is west, want to get the maximum x-coordinate (given by hitbox.x + hitbox.width)
    let extract_coord = null;
    let coord = null;

    let measure = Math.min;
    let extend = false;
    if(direction === 'n' || direction === 'w'){
        measure = Math.max;
        extend = true;
    }
    if(direction === 'n' || direction === 's'){
        extract_coord = (hitbox) => hitbox.y + extend*hitbox.height;
    }else{
        extract_coord = (hitbox) => hitbox.x + extend*hitbox.width;
    }

    for(const i in possible_tiles){
        const {x,y} = possible_tiles[i];
        const [ground_id, object_id] = possible_tiles_ids[i];

        const groundHitbox = {...gridHitbox, x:gridHitbox.x + x, y: gridHitbox.y + y};

        //check there is floor below player's feet (if we care for collisions)
        if(player.collidable && AABB_Colliding(groundHitbox, playerHitbox) && !ground_id){
            coord = measure(extract_coord(groundHitbox), coord || extract_coord(groundHitbox));
        }

        //check for ground elevation hitboxes
        if(specialTiles[ground_id]){
            const gid = getFirstGid(ground_id);
            const tileWidth = gidToTilesetMap[gid].tileWidth;
            const tileHeight = gidToTilesetMap[gid].tileHeight;
            const offsetX = grid_size - tileWidth;
            const offsetY = grid_size - tileHeight;

            specialTiles[ground_id].forEach(({hitbox, properties}) => {
                const tileHitbox = {...hitbox, x:hitbox.x + x + offsetX, y:hitbox.y + y + offsetY};
                if(AABB_Colliding(tileHitbox, playerHitbox)){
                    if(properties.type === "collision" && player.collidable){
                        coord = measure(extract_coord(tileHitbox), coord || extract_coord(tileHitbox));
                    }else if(properties.type === "climb_up"){
                        //discovered top half of ladder while on higher elevation
                        player.context.near_ladder = true;
                    }else if(properties.type === "climb_down"){
                        //discovered lower half of ladder while on higher elevation
                        player.context.near_ladder = true;
                        player.elevation--;
                    }
                }
            })
        }

        //check for object elevation hitboxes
        if(specialTiles[object_id]){
            const gid = getFirstGid(object_id);
            const tileWidth = gidToTilesetMap[gid].tileWidth;
            const tileHeight = gidToTilesetMap[gid].tileHeight;
            const offsetX = grid_size - tileWidth;
            const offsetY = grid_size - tileHeight;
            for(const {hitbox, properties} of specialTiles[object_id]){
                const tileHitbox = {...hitbox, x:hitbox.x + x + offsetX, y:hitbox.y + y + offsetY};

                if(AABB_Colliding(tileHitbox, playerHitbox)){
                    if(properties.type === "collision" && player.collidable){
                        coord = measure(extract_coord(tileHitbox), coord || extract_coord(tileHitbox));
                    }else if(properties.type === "climb_up"){
                        //discovered top half of ladder while on lower elevation
                        player.context.near_ladder = true;
                        player.elevation++;
                    }else if(properties.type === "climb_down"){
                        //discovered lower half of ladder while on lower elevation
                        player.context.near_ladder = true;
                    }
                }
            }
        }
    }

    return coord;
}