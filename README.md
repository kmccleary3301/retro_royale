# retro_royale
Multiplayer P5 project


This is a P5.js game styled after mario party.

Game is multiplayer with internet connectivity, and a server-side component.

# Setup

Install Node.js from https://nodejs.org/en/

In vscode, make a new folder for the project, and pull from this repository.

Open a terminal and run the following command:
>  npm install -g browser-sync

In order to start the server, run the following commands in a terminal:
>  cd server
>  
>  npm install   #only do this the first time, it will install dependencies for server.js
>  
>  node server.js

To run the client, make a new terminal and run this command:
>  browser-sync start --server -f -w

This will open a live session in a browser at localhost:3000

This session will auto refresh every time you save a file in vscode

