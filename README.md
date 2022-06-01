## TODO
* make board resizable
* multiple balls, collisions
* display chess pieces instead of a ball
* chess piece objects (position, collision ball radius, colour, weight, friction)
* game logic: turn order; wait for events
* game logic: piece disappears if it goes out of bounds
* winner is the person who knocks out the other person's king
* menu / interface.

## References
* Standard lichess pieces: https://github.com/lichess-org/lila/tree/master/public/piece/cburnett/
* Game loop stuff:
  - <https://dewitters.com/dewitters-gameloop/>
  - <http://higherorderfun.com/blog/2010/08/17/understanding-the-game-main-loop/>
  - <https://gafferongames.com/post/fix_your_timestep/>
  - <http://gamedevgeek.com/tutorials/managing-game-states-in-c/>

Game loop:

> Then we start the game loop. In this we update the logic of the game as many times as it's supposed to be updated the current loop. Each time the timer ticks, the logic is supposed to be updated, so we simply update as many times as there has been ticks since the last loop. We also keep track of how long the logic step is taking: if it starts taking too long, we break out of the logic loop and draw a frame. If the drawing takes more than one tick, it updates for every tick passed before drawing again. If the drawing takes less than a full tick, we rest until the full tick has passed, allowing for an efficient utilization of the CPU. 
* Elastic collisions: <https://en.wikipedia.org/wiki/Elastic_collision>
* Shotgun King game: <https://punkcake.itch.io/shotgun-king>
