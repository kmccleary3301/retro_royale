//browser start :  browser-sync start --server -f -w
//Run this command to get a live debug environment in browser
//This will refresh everytime you save a file in vs code.
var repo_address = "";
var current_state = new main_menu(), current_state_flag = "main_menu";
var font_set, font_size_scaling, connected_to_server;
var game_bounds, g_cam;

/*
P5 has several default functions.
These include, but are not limited to:
preload(), setup(), draw(), keyPressed(), keyReleased, mousePressed(), and mouseReleased().
preload() and setup() run once on startup, but can be called again.
draw() runs every time the frame is updated, and is an active rendering function.
The others listed are named after the events that activate them, and relate to user input.

Since we've written games as classes, each game will have its own corresponding function to each of these.
For instance, fruitgame has its own draw function, as well as a setup() that initializes local game variables.
Since the current game is stored in the variable current_state, the actual default functions which are 
listed below can simply call current_state's respective function (i.e. current_state.setup()).
*/


function preload() {  //This is a default p5 function which executes on load. Since games are written as functions, I've given each
  return;
}

function setup() {
  console.log(millis());
  createCanvas(windowWidth, windowHeight); //Enables the canvas size. These are stored in global variables named width and height.
  background(50, 50, 50); //Declares the background color via RGB.
  g_cam = new g_camera(width/2, height/2, 1);
  connected_to_server = false;      //This variable is for referencing if the server is connected or no. We'll add features like auto-reconnect.
  font_set =[loadFont("media/fonts/Inconsolata.ttf"),
                loadFont("media/fonts/Alpharush.ttf"),
                loadFont("media/fonts/PublicPixel.ttf"),
              loadFont("media/fonts/videogame.ttf"),
              loadFont("media/fonts/videogame.ttf")];
  font_size_scaling = [1, 1.2, 0.5, 1, 0.8];
  make_socket();
  current_state.setup();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (current_state.window_resize !== undefined) {
    current_state.window_resize();
  }
}

function keyPressed() { //Event function that triggers upon user pressing a key on their keyboard.
  if (current_state.key_pressed !== undefined) {
    current_state.key_pressed(keyCode); 
  }
  windowResized()
}

function keyReleased() {  //Event function that triggers upon user releasing a key on their keyboard.
  if (current_state.key_released !== undefined) {
    current_state.key_released(keyCode);
  }
}

function mousePressed() {
  if (current_state.mouse_pressed !== undefined) {
   current_state.mouse_pressed(); 
  }
}

function mouseReleased() { 
  if (current_state.mouse_released !== undefined) {
    current_state.mouse_released();
  }
}

function mouseWheel(event) {
  console.log("mouse_wheel called; delta -> "+event.delta);
  if (current_state.mouse_wheel !== undefined) {
    current_state.mouse_wheel(event.delta);
  }
}

function draw() { //Global frame render function.
  background(200, 200, 200);
  current_state.draw();
}

function swap_current_state(flag) { //Global function for changing current_state
  console.log("SWAP STATE: "+flag);
  if (flag == "main_menu") { current_state = new main_menu(); }
  else if (flag == "load_screen") { current_state = new load_screen(); }
  else if (flag == "fruit_game") { current_state = new fruitGame(); }
  else if (flag == "purgatory") { current_state = new purgatory(); }
  else if (flag == "test_game") {current_state = new test_game();}
  else if (flag == "board_game") { current_state = new board_game();}
  else if (flag == "load_room") { current_state = new load_room(); }
  else if (flag == "dev_room") {current_state = new dev_room(); }
  else if (flag == "ball_game") { current_state = new ball_game(); }
  else if (flag == "fighting_game") { current_state = new fighting_game(); }
  else if (flag == "flappy_bird") { current_state = new flappy_bird(); }
  else if (flag == "session_menu") { current_state = new session_menu(); }
  else if (flag == "game_end_screen") { current_state = new game_end_screen(); }
  else { return; }
  current_state.setup();
  current_state_flag = flag;
}

function template_game() {
  this.setup = function() {
    return;
  }

  this.draw = function() {
    return;
  }

  this.key_pressed = function(keycode) {
    return;
  }

  this.key_released = function(keycode) {
    return;
  }

  this.mouse_pressed = function() {
    return;
  }

  this.mouse_released = function() {
    return;
  }

  this.read_network_data = function(flag, message) {
    return;
  }
}