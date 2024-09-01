# MERN-multiplayer-online-game
# UPDATE: Progress has slowed down now that school started.
# TODO: Add dash and blink abilities. Add enemies.

## Deployment
Not currently deployed.

## Game engine
Doesn't use one. I wanted to use this project to learn as much as possible.

## Rendering
Uses HTML canvas in a webworker because otherwise rendering slows down the main thread's event handlers.

## Networking
Uses socket io web sockets.

## API calls
Uses Express routes and middleware. There is a catch-all route that returns index.html to ensure that no undesired resource is reached and because the app is a single page application, where client-side routes are handled by React router.

## UI Design and Style
Uses MUI for the theme and React to maintain state. Global state is maintained via React redux persist. This allows users to persist their login state if they dont log out.

## Authentication
Uses JSON web tokens where the unique id is the id used by the database. Currently JWT is stored client-side in the local storage, which I've heard some people say is okay and others say is not okay. Open to suggestions.

## Database
Uses Atlas's free cluster. On user disconnect, player meta data is saved to the database. Plan to have timed updates as well (like update every 30 minutes, which would reduce the damage caused by a server failure).

## Asset storage
Uploaded profile pictures and game assets are stored in the server directory. If deployed, it would probably be best to store uploaded profile pictures to some cloud storage.

## Art/Map design 
I drew the tiles myself using Aseprite and created the map using Tiled. Terrains, automap, and collisions are some of Tiled's features that I used. The tiles are 16x16 with some exceptions such as the ladder and tree tile. These tiles are larger than 16x16 for some 'hacky' reasons (such as allowing overlapping art without creating new layers).

## Mechanics/controls
Currently the only controls enabled are movement via WASD, and zooming via scroll wheel.

## Chunking
Since I want the map to be arbitrarily large (but reasonable enough to fit in the server's memory), I send the client chunks on a need-to-know basis. Currently the client keeps track of what chunk it's on and the 8 surrounding chunks. Once the client moves off its chunk, it requests for more chunks. This can be optimized.

## Collision detection
Originally the plan was to use a quadtree for both dynamic and static collision detection, but after some more thought I decided to use grids. Grids are easier to code and maintain, also I feel like since the map is already stored as a grid I can use that for static collisions and then use another grid (with bigger cells) for dynamic collisions. Also, originally I had uses convex polygons to outlined the collision boundaries in Tiled, but then I swapped to rectangular hitboxes because I'm not sure if SAT would be too "heavy" and (multiple) rectangular hitboxes (AABBs) are good enough for now.

## Collision resolution
After a collision is detected the player is displaced according to the furthermost edge of the intersected hitbox(s).

## Animation
The player is animated according to a sprite sheet that contains many different states such as walking, idle, and climbing. The states are managed through a finite state machine.

## Elevation
The map consists of many elevation levels. Each elevation level gets two layers: the ground layer and the object layer (though note each layer is a 'tile layer' in Tiled). A player can only interact with tiles on its current elevation. To transition between elevations there is a ladder tile which is placed on two adjacent elevations at once. Hence the player can both climb up and down the ladder (the ladder has hitboxes that changes the player's elevation).

## Gameplay/Story
Not yet decided. But I hope to make it so that users can kill enemies or other players for gold, and then use that gold to purchase gear and weapons.

## Performance
Currently the game runs at ~60fps which is the limit of requestAnimationFrame() so that's good. The server runs at a tick rate of 60 ticks/second. However, in the code tick rate is set to 70 because for some reason setting it to 60 gives unstable delta times.

## Screenshots
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/loginpage.png)
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/registerpage1.png)
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/registerpage2.png)
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/homepage.png)
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/account_settings.png)
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/on_ladder.png)
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/on_bridge.png)
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/below_bridge.png)
![alt text](https://github.com/awidjaj1/MERN-multiplayer-online-game/blob/main/screenshots/gameplay.png)
