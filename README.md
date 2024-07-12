# MERN-multiplayer-online-game

## Deployment
Not currently deployed.

## Game engine
Doesn't use one. I wanted to use this project to learn as much as possible.

## Rendering
Uses HTML canvas in a webworker because otherwise rendering slows down the main thread's event handlers.

## Networking
Uses socket io web sockets.

## API calls
Uses Express routes.

## UI Design and Style
Uses MUI for the theme and React to maintain state. Global state is maintained via React redux persist. This allows users to persist their login state if they dont log out.

## Authentication
Uses JSON web tokens where the unique id is the id used by the database. Currently JWT is stored client-side in the local storage, which I've heard some people say is okay and others say is not okay. Open to suggestions.

## Database
Uses Atlas's free cluster. On user disconnect, player meta data is saved to the database. Plan to have timed updates as well (like update every 30 minutes, which would reduce the damage caused by a server failure).

## Asset storage
Uploaded profile pictures and game assets are stored in the server directory. If deployed, it would probably be best to store uploaded profile pictures to some cloud storage.

## Map 
I drew the tiles myself using Aseprite and created the map using Tiled. Terrains, automap, and collisions are some of Tiled's features that I used. I will most likely overhaul all the art soon for a more simplistic style. 

## Chunking
Since I want the map to be arbitrarily large (but reasonable enough to fit in the server's memory), I send the client chunks on a need-to-know basis. Currently the client keeps track of what chunk it's on and the 8 surrounding chunks. Once the client moves off its chunk, it requests for more chunks. This can be optimized.

## Collision detection
Originally the plan was to use a quadtree for both dynamic and static collision detection, but after some more thought I decided to use grids. Grids are easier to code and maintain, also I feel like since the map is already stored as a grid I can use that for static collisions and then use another grid (with bigger cells) for dynamic collisions. Also, originally I had uses convex polygons to outlined the collision boundaries in Tiled, but then I swapped to rectangular hitboxes because I'm not sure if SAT would be too "heavy" and (multiple) rectangular hitboxes are good enough for now.

## Gameplay/Story
Not yet decided. But I hope to make it so that users can kill enemies or other players for gold, and then use that gold to purchase gear and weapons.

## Performance
Currently the game runs at ~60fps which is the limit of requestAnimationFrame() so that's good. The server runs at a tick rate of 60 ticks/second. However, in the code tick rate is set to 70 because for some reason setting it to 60 gives unstable delta times.