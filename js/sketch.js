//browser start :  browser-sync start --server -f -w
//Run this command to get a live debug environment in browser
//This will refresh everytime you save a file in vs code.
var current_state = new fruitGame();  //Games are stored as functions in the style of a class. This is how we'll organize multiple nested games.


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
  current_state.preload();
}

function setup() {
  createCanvas(600, 600); //Enables the canvas size. These are stored in global variables named width and height.
  background(50, 50, 50); //Declares the background color via RGB.

  let connected_to_server = false;      //This variable is for referencing if the server is connected or no. We'll add features like auto-reconnect.
  let global_port = 3128;
  let server_address = "ws://localhost:"+str(global_port);   //The host server address, written here so it can be easily changed. 

  socket = new WebSocket(server_address); //Declares the websocket for connecting to host server.
  socket.onopen = (event) => { open_socket(); };                  //Sets function trigger for websocket being opened
  socket.onmessage = (event) => { process_message(event.data); }; //Sets function trigger for websocket recieving data

  current_state.setup();
}

function open_socket() {
  socket.send("connected");
  connected_to_server = true;
}

function process_message(data) {          //Event function to process data recieved from the server through the websocket.
  current_state.read_network_data(data);  //Feeds to current_state's local data recieved function.
}


function send_data(data) {  //Global function to send data to server.
  if (connected_to_server) { socket.send(data); }
}

function keyPressed() { //Event function that triggers upon user pressing a key on their keyboard.
  current_state.key_pressed(keyCode); 
}

function keyReleased() {  //Event function that triggers upon user releasing a key on their keyboard.
  current_state.key_released(keyCode);
}

function draw() { //Global frame render function.
  background(200, 200, 200);
  current_state.draw();
}

class game_1_player {
  constructor(spriteSheet, x, y, face) {
    this.spriteSheet = spriteSheet;
    this.sx = 0;
    this.x = x;
    this.y = y;
    this.move = 0;
    this.speed = 5;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    this.sprite_row = 0;
    this.fruit_holding = false;
    this.fruit_held_id = 0;
  }
  
  draw() {
    push();
    translate(this.x, this.y);

    if (this.move == 1){
      if (this.facing < 2){
        scale(1-this.facing*2, 1);  
        image(this.spriteSheet, 0, 0, 100, 100, 80*(this.sx+1), 0, 80, 80);
        this.x = this.x + this.speed * (1-this.facing*2);
      } else if (this.facing == 2) {
        image(this.spriteSheet, 0, 0, 100, 100, 80*(this.sx), 400, 80, 80);
        this.y = this.y - this.speed;
      } else if (this.facing == 3) {
        image(this.spriteSheet, 0, 0, 100, 100, 480 + 80*(this.sx), 400, 80, 80);
        this.y = this.y + this.speed;
      }

      this.x = Math.min(width-40, Math.max(40, this.x));
      this.y = Math.min(height-40, Math.max(40, this.y));

    }
    else {
      if (this.facing < 2){
        scale(1-this.facing*2, 1);  
        image(this.spriteSheet, 0, 0, 100, 100, 0, 0, 80, 80);
      } else if (this.facing == 2) {
        image(this.spriteSheet, 0, 0, 100, 100, 0, 400, 80, 80);
      } else if (this.facing == 3) {
        image(this.spriteSheet, 0, 0, 100, 100, 480, 400, 80, 80);
      }
    }

    if (frameCount % 6 == 0) {
      this.sx = (this.sx + 1) % 6;
    }

    
    //this.x += this.speed*this.move;
    
    pop();
  }

  grab_fruit(fruit_id, size){
    this.fruit_holding = true;
    this.fruit_held_id = fruit_id;
    this.speed = 15/size;
  }

  drop_fruit(){
    this.speed = 5;
    this.fruit_holding = false;
  }

  get_pos_string(){
    var string_make = str(this.x)+","+str(this.y)+","+str(this.move)+","+str(this.facing);
    return string_make;
  }

  update_data(sprite, x, y, move, speed, facing, fruit_holding, fruit_id){
    //if (sprite != null) {this.spriteSheet = }
    console.log("move:"+str(move));
    if (x != null) { this.x = x; console.log("x: "+str(x));}
    console.log("update line 1");
    if (y != null) { this.y = y; console.log("y: "+str(y));}
    if (move != null) { this.move = move; console.log("move: "+str(move));}
    if (speed != null) { this.speed = speed; console.log("speed: "+str(speed));}
    if (facing != null) { this.facing = facing; console.log("facing: "+str(facing));}
    if (fruit_holding != null) { this.fruit_holding = fruit_holding; console.log("fr_holding: "+str(fruit_holding));}
    if (fruit_id != null) { this.fruit_held_id = fruit_id; }
  }



}

class game_1_fruit {
  constructor(spriteSheet, x, y, size) {
    this.spriteSheet = spriteSheet;
    this.x = x;
    this.y = y;
    this.size = int(size);
    this.held = false;
    this.scored = false;
    this.player_holding_id = 0;
    this.sprite_select = 0;
    if ((size < 5) || (size > 15)) {
      size = Math.min(15, Math.max(0, 5));
    }

    if (size > 12) {
      this.sprite_select = 3;
    } else if (size > 10) {
      this.sprite_select = 2;
    } else if (size > 7) {
      this.sprite_select = 1;
    }
  }

  draw() {
    if (this.scored) {
      return;
    }
    push();
    translate(this.x, this.y);
    image(this.spriteSheet, 0, 0, 20, 20, 20*(this.sprite_select), 0, 20, 20);
    pop();
  }

  update_position(x, y) {
    this.x = x;
    this.y = y;
  }

  check_grabbed(x, y, player_index) {
    if (this.held || this.scored) {
      return;
    }
    var player_x_norm = Math.abs(x - this.x),
        player_y_norm = Math.abs(y - this.y);
    if ((player_x_norm <= 40) & (player_y_norm <= 40)) {
      this.held = true;
      this.player_holding_id = player_index;
    }
  }

  drop() {
    this.held = false;
  }

  update_data(x, y, size, held, scored, player_holding_id) {
    if (x != null) {this.x = x;}
    if (y != null) {this.y = y;}
    if (size != null) {this.size = size;}
    if (held != null) {this.held = held;}
    if (scored != null) {this.scored = scored;}
    if (player_holding_id != null) {this.player_holding_id = player_holding_id;}
  }
}

class game_1_endzone {
  constructor(x1, x2, y1, y2) {
    this.x = x1;
    this.y = y1;
    this.width = x2 - x1;
    this.height = y2 - y1;  
    this.score = 0;
  }

  draw(){
    fill(255, 204, 0);
    rect(this.x, this.y, this.width, this.height);

    fill(0, 0, 0);
    text(str(this.score), this.width/2+this.x, this.height/2+this.y);
  }

  check_placement(x, y){
    x -= this.x;
    y -= this.y;
    if ((x >= 0) && (x <= this.width) && (y >= 0) && (y <= this.height)) {
      return true;
    }
    return false;
  }
}

function fruitGame() {
  this.fruits_count = 15;
  this.players = [];
  this.fruits = [];
  this.endzones = [];
  this.game_active = true;
  this.start_time = 30.000;
  this.current_time = this.start_time;
  this.main_player_index;
  this.arrow_keys = [39, 37, 38, 40];  
  this.sounds = new Tone.Players({
    Fail : 'media/fail_sound.mp3',
    Win : 'media/win_sound.mp3',
    Hit : 'media/hit.mp3',
    Miss : 'media/miss.mp3'
  })
  this.sounds.toDestination();
  this.soundNames = ['Fail', 'Win', 'Hit', 'Miss']

  this.preload = function() {
    this.greenSprite = loadImage("Green.png");
    this.fruitSprite = loadImage("fruit_sprites.png");
  }

  this.setup = function() {
    inconsolata = loadFont("Inconsolata.ttf");
    textFont(inconsolata);
    textSize(20);
    textAlign(CENTER, CENTER);
    fill(0, 0, 0);
    imageMode(CENTER);
    for (i=0; i < 15; i++) {
      this.fruits[i] = new game_1_fruit(this.fruitSprite, width*Math.random(), height*Math.random(), 3+Math.random()*12);
    }
    this.players[0] = new game_1_player(this.greenSprite, 200, 200, 0);
    this.endzones[0] = new game_1_endzone(0, 100, 200, 400);
    this.endzones[1] = new game_1_endzone(500, 600, 200, 400);
    this.main_player_index = 0;
  }

  this.key_pressed = function(keycode) {
    for (i=0;i<4;i++){
      if (keycode == this.arrow_keys[i]){
        this.players[this.main_player_index].facing = i;
        this.players[this.main_player_index].move = 1;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].get_pos_string());
        return;
      }
    }
    if (keycode == 32) {
      if (this.players[this.main_player_index].fruit_holding) {

        this.players[this.main_player_index].drop_fruit();
        this.fruits[this.players[this.main_player_index].fruit_held_id].drop();

        for (i=0; i<this.endzones.length; i++) {
          var fr_x = this.fruits[this.players[this.main_player_index].fruit_held_id].x,
              fr_y = this.fruits[this.players[this.main_player_index].fruit_held_id].y;
          if (!(this.fruits[this.players[this.main_player_index].fruit_held_id].scored) &&
              this.endzones[i].check_placement(fr_x, fr_y)) {
            this.fruits[this.players[this.main_player_index].fruit_held_id].scored = true;
            this.endzones[i].score += this.fruits[this.players[this.main_player_index].fruit_held_id].size;
            break;
          }
        }
        this.playSound("Miss");
      } else {
        for (i=0; i < this.fruits.length; i++) {
          this.fruits[i].check_grabbed(
            this.players[this.main_player_index].x, 
            this.players[this.main_player_index].y,
            this.main_player_index
          );
          if (this.fruits[i].held) {  
            this.players[this.main_player_index].grab_fruit(i, this.fruits[i].size);
            this.playSound("Hit");
            return;
          }
        }
      }
    }
    
    //send_data("hello");
  }

  this.key_released = function(keycode) {
    for (i=0;i<4;i++){
      if(keycode == this.arrow_keys[i] && this.players[this.main_player_index].facing == i) {
        this.players[this.main_player_index].move = 0;
      }
    }
    send_data("my_pos:"+this.players[this.main_player_index].get_pos_string());
  }

  this.draw = function() {
    background(200, 200, 200);
    fill(0, 0, 0);
    for (i=0; i<this.endzones.length; i++) {
      this.endzones[i].draw();
    }
    for (i=0; i<this.players.length; i++) {
      if (this.players[i].fruit_holding) {
        this.fruits[this.players[i].fruit_held_id].update_position(
          this.players[i].x, this.players[i].y
        );
      }
      this.players[i].draw()
    }
    for (i=0; i < this.fruits.length; i++){
      this.fruits[i].draw();
    }
    //socket.send(str(this.players[this.main_player_index].x)+","+
    //           str(this.players[this.main_player_index].y));

    if (this.game_active) {
      this.current_time = this.start_time - (millis()/1000);
      text("Time: "+str(int(this.current_time)), width/2+100, 20);
      if (this.current_time < 0) {
        this.game_active = false;
      }
    }
  }
  
  this.playSound = function(whichSound='Fail') {
    this.sounds.player(whichSound).start();
  }

  this.read_network_data = function(data_in) {
    /*
    Server packets will be formatted as such

    new_player:3,500,200,3,1    (id, x_pos, y_pos, facing, moving, speed) adds newly connected player
    pos_player:3,500,200,3,1    (id, x_pos, y_pos, facing, moving, speed)
    rmv_player:3                deletes player from array

    multiple statements can be send, split by newline \n

    on connection
    assigned_id:3               tells client where they are in server array

    new_id:2                    if a player leaves, indices change, and the assignments will too
    */
    //console.log("Recieved:" + str(data_in));
    var lines = data_in.split("\n");
    for (let i in lines) {
      console.log("line "+str(i)+": "+lines[i]);
      var line_split = lines[i].split(":");
      var flag = line_split[0],
          message = line_split[1];
      if (flag == "player_count") {
        this.players = [];
        for (j=this.players.length; j < parseInt(message); j++){
          this.players[j] = new game_1_player(this.greenSprite, 600*Math.random(), 600*Math.random(), 1);
        }
      } else if (flag == "assigned_id") {
        this.main_player_index = parseInt(message);
      } else if (flag == "pos_player") {
        this.read_in_player_position(message);
      } else if (flag == "new_player") {
        this.read_in_player_position(message);
      } else if (flag == "rmv_player") {
        var player_index = parseInt(message);
        this.players.splice(player_index, 1);
        if (this.main_player_index > player_index) {
          this.main_player_index -= 1;
        }
      }
    }
  }

  this.read_in_player_position = function(data_string) {
    var p_vals_string = data_string.split(",");
    var p_vals = [null, null, null, null, null];
    var ints = [0, 3, 4], floats = [1, 2];
    for (let i in ints)     { p_vals[ints[i]] = parseInt(p_vals_string[ints[i]])}
    for (let i in floats)   { p_vals[floats[i]] = parseFloat(p_vals_string[floats[i]]); }
    if (p_vals[0] >= this.players.length) {
      this.players[p_vals[0]] = new game_1_player(this.greenSprite, p_vals[1], p_vals[2], p_vals[3], p_vals[4]);
    }
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], null, p_vals[4], null, null);
  }

  this.read_in_fruit_positions = function(data_string) {
    return;
  }
}