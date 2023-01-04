#   Retro Royale
Multiplayer P5 project

[Play it Here](https://kmccleary3301.github.io/retro_royale/)

This is a browser-based multiplayer board game written with [P5.js](https://p5js.org/), [Tone.js](https://tonejs.github.io/), and [Node.js.](https://nodejs.org/en/)

Authors:
*   Kyle McCleary       &nbsp;(Lead Developer)  &nbsp;kmccl24@lsu.edu

*   Jake Kinchen        &nbsp;(Lead Artist, Minigame Developer)

*   James Power         &nbsp;(Minigame Developer)

*   Lydia Parsa         &nbsp;(Minigame Developer)

*   Enjolie Watson      &nbsp;(Minigame Developer)

*   Brandon Braswell    &nbsp;(Minigame Developer)

Server hosts can be selected from the main menu.
Note that only the frontend is hosted here.
While we have hosted servers elsewhere, there is not
currently an official server running the backend.

#   Backend Setup
To run the backend, simply install Node.js [here](https://nodejs.org/en/).
Next, clone this repository to a folder of your choosing.
Finally, run the following commands:

>   cd *path-to-repo*
>   cd server
>   node server.js

To connect, simply enter the address listed in the terminal into the server select from the main menu.

#   Playing
Once the backend is running and selected on the client, connect from the main menu.
Once in the session menu, you can either enter the ID of an existing session or create a new one.
Upon doing the latter, this will spawn you in a dev room. If you are the host, you will have a menu of games
to spawn into. Other players can connect to the session at any point, and the host is able to start
the game at any time.
