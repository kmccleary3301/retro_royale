//browser start :  browser-sync start --server -f -w
//Run this command to get a live debug environment in browser
//This will refresh everytime you save a file in vs code.
//console.log(millis());
//var current_state = new fruitGame();  //Games are stored as functions in the style of a class. This is how we'll organize multiple nested games.
var repo_address = "";
var current_state = new fruitGame();

/* :) -Kyle M
-James
This is a change on master, testing auto pulls.
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
  //let current_state = new fruitGame();
  current_state.preload();
}

function setup() {
  console.log(millis());
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
  var lines = data.split("\n");
  for (let i in lines) {
    console.log("line "+str(i)+": "+lines[i]);
    var line_split = lines[i].split(":");
    var flag = line_split[0],
        message = null;
    if (line_split.length > 1) { message = line_split[1]; }
    current_state.read_network_data(flag, message);  //Feeds to current_state's local data recieved function.
  }
}

function convert_data_string(message, ints, floats, strings) {
  // Converts messages into an array of ints, floats, and strings according to passed indices for each.
  var message_split = message.split(",");
  var return_vals = [];
  for (let i in message_split) { return_vals[i] = NaN; }
  if (!(ints === undefined)) {
    for (let i in ints) {
      if (message_split[ints[i]] != "") { return_vals[ints[i]] = parseInt(message_split[ints[i]]); }
    }
  }
  if (!(floats === undefined)) {
    for (let i in floats) {
      if (message_split[floats[i]] != "") { return_vals[floats[i]] = parseInt(message_split[floats[i]]); }
    }
  }
  if (!(strings === undefined)) {
    for (let i in strings) { return_vals[strings[i]] = message_split[strings[i]]; }
  }
  return return_vals
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
    this.fruit_holding = 0;
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

    pop();
  }

  grab_fruit(fruit_id, size){
    this.fruit_holding = 1;
    this.fruit_held_id = fruit_id;
    this.speed = 15/size;
  }

  drop_fruit(){
    this.speed = 5;
    this.fruit_holding = 0;
  }

  get_pos_string(){
    var string_make = str(this.x)+","+str(this.y)+","+str(this.move)+","+str(this.facing);
    return string_make;
  }
  
  update_data(sprite, x, y, move, speed, facing, fruit_holding, fruit_id){
    //if (sprite != null) {this.spriteSheet = }
    if (x != null) { this.x = x; }
    if (y != null) { this.y = y; }
    if (move != null) { this.move = move; }
    if (speed != null) { this.speed = speed; }
    if (facing != null) { this.facing = facing; }
    if (fruit_holding != null) { this.fruit_holding = fruit_holding; }
    if (fruit_id != null) { this.fruit_held_id = fruit_id; }
  }

  make_data_raw(){
    return this.x+","+this.y+","+this.move+","+
            this.speed+","+this.facing+","+this.fruit_holding+","+this.fruit_held_id;
  }

  make_data(player_index){
    var string_make = "pos_player:"+player_index+","+this.x+","+this.y+","+this.move+","+
                      this.speed+","+this.facing+","+this.fruit_holding+","+this.fruit_held_id;
    return string_make;
  }
}

class game_1_fruit {

  /*
  network commands:
  make_fruit:x,y,size
  upd_fruit:x,y,size,held,scored,player_holding_id //from server

  */

  constructor(spriteSheet, x, y, size) {
    this.spriteSheet = spriteSheet;
    this.x = x;
    this.y = y;
    this.size = int(size);
    this.held = 0;
    this.scored = 0;
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
      this.held = 1;
      this.player_holding_id = player_index;
    }
  }

  drop() {
    this.held = 0;
  }

  update_data(x, y, size, held, scored, player_holding_id) {
    if (!(isNaN(x)) && x != null) {this.x = x;}
    if (!(isNaN(y)) && y != null) {this.y = y;}
    if (!(isNaN(size)) && size != null) {this.size = size;}
    if (!(isNaN(held)) && held != null) {this.held = held;}
    if (!(isNaN(scored)) && scored != null) {this.scored = scored;}
    if (!(isNaN(player_holding_id)) && player_holding_id != null) {this.player_holding_id = player_holding_id;}
    if (this.size > 12) { this.sprite_select = 3; }
    else if (this.size > 10) { this.sprite_select = 2; } 
    else if (this.size > 7) { this.sprite_select = 1; } 
    else { this.sprite_select = 0; }
  }

  make_data(index) {
    var str_make = "pos_fruit:"+str(index)+","+str(this.x)+","+str(this.y)+","+
                    str(this.size)+","+str(this.held)+","+str(this.scored)+","+str(this.player_holding_id);
    return str_make;
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
    push();
    textSize(30);
    fill(255, 204, 0);
    rect(this.x, this.y, this.width, this.height);
    fill(0, 0, 0);
    text(str(this.score), this.width/2+this.x, this.height/2+this.y);
    pop();
  }

  check_placement(x, y){
    x -= this.x;
    y -= this.y;
    if ((x >= 0) && (x <= this.width) && (y >= 0) && (y <= this.height)) {
      return true;
    }
    return false;
  }

  update_data(x, y, width, height, score){
    if (!isNaN(x)) { this.x = x; }
    if (!isNaN(y)) { this.y = y; }
    if (!isNaN(width)) { this.width = width; }
    if (!isNaN(height)) { this.height = height; }
    if (!isNaN(score)) { this.score = score; }
  }

  make_data(index){
    return "upd_endzone:"+str(index)+","+str(this.x)+","+str(this.y)+","+str(this.width)+","+str(this.height)+","+str(this.score);
  }

}

function fruitGame() {
  this.preload = function() {
    return;
  }

  this.setup = function() {
    this.fruits_count = 15;
    this.players = [];
    this.fruits = [];
    this.endzones = [];
    this.game_active = 0;
    this.game_length = 30.000;
    this.start_time;
    this.current_time = this.game_length;
    this.main_player_index;
    this.arrow_keys = [39, 37, 38, 40];  
    this.sounds = new Tone.Players({
      Fail : 'media/sounds/fail_sound.mp3',
      Win : 'media/sounds/win_sound.mp3',
      Hit : 'media/sounds/hit.mp3',
      Miss : 'media/sounds/miss.mp3'
    })
    this.sounds.toDestination();
    this.soundNames = ['Fail', 'Win', 'Hit', 'Miss']
    this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
    this.fruitSprite = loadImage(repo_address+"media/sprites/fruit_sprites.png");
    this.start_time = millis()/1000;
    inconsolata = loadFont(repo_address+"media/fonts/Inconsolata.ttf");
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
    this.end_message = "";
  }

  this.key_pressed = function(keycode) {
    for (i=0;i<4;i++){
      if (keycode == this.arrow_keys[i]){
        this.players[this.main_player_index].facing = i;
        this.players[this.main_player_index].move = 1;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        return;
      }
    }
    if (this.game_active != 1) { return; }
    if (keycode == 32) {
      if (this.players[this.main_player_index].fruit_holding == 1) {
        var fruit_id = this.players[this.main_player_index].fruit_held_id;
        this.players[this.main_player_index].drop_fruit();
        this.fruits[fruit_id].drop();
        for (i=0; i<this.endzones.length; i++) {
          var fr_x = this.fruits[fruit_id].x,
              fr_y = this.fruits[fruit_id].y;
          if (!(this.fruits[this.players[this.main_player_index].fruit_held_id].scored) &&
              this.endzones[i].check_placement(fr_x, fr_y)) {
            this.fruits[fruit_id].scored = 1;
            this.endzones[i].score += this.fruits[fruit_id].size;
            send_data(this.fruits[fruit_id].make_data(fruit_id)+"\n"+
                  this.players[this.main_player_index].make_data(this.main_player_index)+"\n"+
                  this.endzones[i].make_data(i));
            break;
          }
        }
        this.playSound("Miss");
        send_data(this.fruits[fruit_id].make_data(fruit_id)+"\n"+
                  this.players[this.main_player_index].make_data(this.main_player_index));
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

            send_data(this.fruits[i].make_data(i)+"\n"+
                      this.players[this.main_player_index].make_data(this.main_player_index));
            
            return;
          }
        }
      }
    }
  }

  this.key_released = function(keycode) {
    for (i=0;i<4;i++){
      if(keycode == this.arrow_keys[i] && this.players[this.main_player_index].facing == i) {
        this.players[this.main_player_index].move = 0;
      }
    }
    send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
  }

  this.draw = function() {
    if (this.game_active == 0) { this.draw_game_load(); }
    else if (this.game_active == 1) { this.draw_game_active(); }
    else if (this.game_active == 2) { this.draw_game_over(); }
  }

  this.draw_game_load = function() {
    background(200, 200, 200);
    fill(0, 0, 0);
    textSize(50);
    for (let i in this.players) {
      this.players[i].draw();
    }
    textAlign(CENTER, CENTER);
    text("Game starts in "+str(int(this.current_time)), width/2, height/2);
    this.current_time = this.game_length - (millis()/1000 - this.start_time);
    if (this.current_time < 0) {
      this.game_active = 1;
    }
  }

  this.draw_game_active = function() {
    background(200, 200, 200);
    fill(0, 0, 0);
    textSize(50);
    for (let i in this.endzones) { this.endzones[i].draw(); }
    for (let i in this.players) {
      if (this.players[i].fruit_holding == 1) {
        this.fruits[this.players[i].fruit_held_id].update_position(
          this.players[i].x, this.players[i].y
        );
      }
      this.players[i].draw();
    }
    for (let i in this.fruits){ this.fruits[i].draw(); }
    this.current_time = this.game_length - ((millis()/1000) - this.start_time);
    text("Time: "+str(int(this.current_time)), width/2, 50);
  }

  this.game_over = function() {
    var indices_winners = [0], max=0;
    for (let i in this.endzones) {
      if (this.endzones[i].score > max) {
        indices_winners = [i];
        max = this.endzones[i].score;
      } else if (this.endzones[i].score == max) {
        indices_winners[indices_winners.length] = i;
      }
    }
    if (indices_winners.length > 1) {
      this.end_message = "TIE\n";
      for (let i in indices_winners) {
        this.end_message += "Team "+str(indices_winners[i])+",";
      }
    } else {
      this.end_message = "TEAM "+str(indices_winners)+" WINS";
    }
    console.log(this.end_message);
    this.game_active = 2;
  }

  this.draw_game_over = function() {
    fill(255, 255, 255);
    rect(width*1/3, height*1/3, width*1/3, height*1/3);
    textSize(100);
    textAlign(CENTER, CENTER);
    fill(0, 0, 0);
    text(this.end_message, width/2, height/2);
  }
  
  this.playSound = function(whichSound='Fail') {
    this.sounds.player(whichSound).start();
  }

  this.pop_fruit = function(id) {}

  this.read_network_data = function(flag, message) {
    /*
    Server packets will be formatted as such

    new_player:id
    pos_player:3,500,200,3,1    (id, x_pos, y_pos, facing, moving, speed)
    rmv_player:3                deletes player from array

    multiple statements can be send, split by newline \n

    on connection
    assigned_id:3               tells client where they are in server array

    new_id:2                    if a player leaves, indices change, and the assignments will too
    */
    //console.log("Recieved:" + str(data_in));
    if (flag == "player_count") {
      for (j=this.players.length; j < parseInt(message); j++){
        this.players[j] = new game_1_player(this.greenSprite, 300, 300, 1);
      }
    } else if (flag == "assigned_id") {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") {
      this.read_in_player_position(message);
    } else if (flag == "new_player") {
      this.players[parseInt(message)] = new game_1_player(this.greenSprite, 300, 300, 0);
    } else if (flag == "rmv_player") {
      var player_index = parseInt(message);
      this.players.splice(player_index, 1);
      if (this.main_player_index > player_index) {
        this.main_player_index -= 1;
      }
    } else if (flag == "pos_fruit") {
      this.read_in_fruit_position(message);
    } else if (flag == "upd_endzone") {
      this.read_in_endzone_data(message);
    } else if (flag == "game_state") {
      this.read_in_game_state(message)
    } else if (flag == "pop_fruit") {
      this.fruits.splice(parseInt(message), 1);
    }
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
  }

  this.read_in_fruit_position = function(data_string) {
    p_vals = convert_data_string(data_string, [0, 3, 4, 5, 6], [1, 2]);
    if (p_vals[0] >= this.fruits.length) { this.fruits[p_vals[0]] = new game_1_fruit(this.fruitSprite, 0, 0, 0); }
    this.fruits[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6]);
    return p_vals[0];
  }

  this.read_in_endzone_data = function(data_string) {
    p_vals = convert_data_string(data_string, [0, 5], [1, 2, 3, 4]);
    if (p_vals[0] >= this.endzones.length) { this.endzones[p_vals[0]] = new game_1_endzone(0, 0, 0, 0); }
    this.endzones[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5]);
  }

  this.read_in_game_state = function(data_string) {
    p_vals = convert_data_string(data_string, [0], [1, 2]);
    if (this.game_active == 1 && p_vals[0] == 2) { this.game_over(); }
    this.current_time = p_vals[1];
    this.game_active = p_vals[0];
    this.game_length = p_vals[2];
    this.start_time = millis()/1000 - (this.game_length - this.current_time);
  }
}
