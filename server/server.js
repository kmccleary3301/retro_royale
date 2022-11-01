// spawn in ball on server side
// tick function runs a function every few milliseconds, tick interval and tick function, which can be moving the ball according to its position
var current_state = new purgatory();
var current_state_flag = "purgatory";
let width = 600;
let height = 600;
var balls = [];

let global_port = 3128;
let tick_interval = 200; //in milliseconds
var random_seed = Math.floor(Math.random()*100000);
var tick_function_ids = [];

/*
var express = require('express');	// include express.js
var server = express(); // a local instance of express
var wsServer = require('express-ws')(server); // instance of the websocket server
var clients = new Array;  // list of client connections:
var clients_hash = new Array;

// serve static files from /public:
server.use('/', express.static('public'));
*/
// this runs after the server successfully starts:

var fs = require('fs');
var https = require('https');
var ip = require('ip');
var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
const PoissonDiskSampling = require('poisson-disk-sampling');
var app = express();
var clients = new Array;
var client_session_ids = new Array;

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(global_port);
var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({ server: httpsServer });
//current_state.setup();
//process.nextTick(() => {console.log("tick");});

function tick_function() { current_state.tick_function(); }

tick_function_ids[0] = setInterval(tick_function, tick_interval);

function seed_random(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function game_start() {
  console.log("Game Reset");
  current_state = new purgatory();
  current_state.setup();
}

function server_start() {
  game_start();
  console.log('Server address: ' + ip.address());
  console.log('Server port:    ' + global_port);
  console.log("Initializing game");
  console.log("Current game: "+current_state_flag);
  console.log(Date.now());
}

server.on('open', function open() {console.log("server started");});

server.on('connection', function connection(thisClient) {
  console.log("New Connection");        // you have a new client
  console.log("clients length "+clients.length);
  clients.push(thisClient);
  console.log("clients length "+clients.length);
  console.log("user connecting");
  
                    
  thisClient.on('close', function(msg){         //Triggers on a client disconnect
    var position = clients.indexOf(thisClient); //Gets clients position in array
    clients.splice(position, 1);                //Removes client from global client array
    current_state.user_disconnected(position);  //Triggers current_state's user disconnect function.
    console.log("connection closed, client: "+position);
  });

  thisClient.on('message', function incoming(data) { //Activates when a client sends data in.
    console.log(data);
    var lines = data.split("\n");             //Packets may contain multiple commands, separated by newline
    var index = clients.indexOf(thisClient);  //grabs the index of the client that sent it in
    for (let i in lines) {                    //Processes each individual command in the packet
      var line_pieces = lines[i].split(":");  //Commands are formatted as flag:data, flag indicating what to activate.
      var flag = line_pieces[0],  
          message = null;
      if (line_pieces.length > 1) {           //Some commands are just a flag, this accounts for that.
        message = line_pieces[1];             
      }
      if (flag == 'connected') { thisClient.send("connected"); } //This only constitutes a hello, establishes that the connection was made
      if (flag == 'load_game') { thisClient.send("current_game:"+current_state_flag); }
      //In the unique case that the server is issuing the current state, the current state doesn't deal with that.
      current_state.read_network_data(flag, message, index);  //Passes the flag, message, and sender id to current_state's network trigger.
    }
  });
});


function broadcast(data) {  //Send a message to all connected clients
  for (let c in clients) {
    clients[c].send(data);
  }
}

function broadcast_exclusive(data, excluded_clients_array) {  //Send a message to all clients excluding a passed array.
  if (excluded_clients_array.length > 1) {
    for (let c in clients) { if (!(excluded_clients_array.includes(c))) { clients[c].send(data); } }
  }
  else {  //For whatever reason javascript treats an array of 1 as an element, so array.includes doesn't work. This accounts for that.
    for (let c in clients) { if (c != excluded_clients_array) { clients[c].send(data); } }
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

function swap_current_state(state_flag) {
  if (state_flag == "fruit_game") { current_state = new fruitGame(); }
  else if (state_flag == "purgatory") { current_state = new purgatory(); }
  else { return; } // failsafe for invalid flags
  current_state.setup();
  current_state_flag = state_flag;
  broadcast("current_game:"+state_flag);
  for (i = 1; i < tick_function_ids.length; i++) { clearInterval(tick_function_ids[i]); }
}



class game_2_ball {
  constructor() {
    this.radius = 50;
    this.x = 0;
    this.y = 0;
    this.dx = 1;
    this.dy = 1;
    this.speed = 300;
    this.last_update = Date.now()/1000;
  }

  update() {
    //console.log("x1:"+this.x+","+this.y+","+this.dx+","+this.dy);
    this.x += this.dx*this.speed*(Date.now()/1000 - this.last_update);
    //console.log("x2:"+this.x+","+this.y+","+this.dx+","+this.dy);
    this.y += this.dy*this.speed*(Date.now()/1000 - this.last_update);
    if (this.x < 0 || this.x >= 500) {
      var adjust_factor = Math.max(0, Math.min(this.x, 500)) - this.x;
      adjust_factor /= this.dx;
      this.x += this.dx*adjust_factor;
      //console.log("x3:"+this.x+","+this.y+","+this.dx+","+this.dy);
      this.y += this.dy*adjust_factor;

      this.dx *= -1;
      this.dx -= 0.3*seed_random(random_seed+this.dx);
    }
    if (this.y < 0 || this.y >= 500) {
      var adjust_factor = Math.max(0, Math.min(this.y, 500)) - this.y;
      adjust_factor /= this.dy;
      this.x += this.dx*adjust_factor;
      //console.log("x4:"+this.x+","+this.y+","+this.dx+","+this.dy);
      this.y += this.dy*adjust_factor;
      this.dy *= -1;
      this.dy += 0.3*seed_random(random_seed+this.dy+0.1);
    }
    var factor = Math.sqrt(Math.pow(this.dx, 2)+Math.pow(this.dy, 2));
    this.last_update = Date.now()/1000;
    //console.log("updating ball:"+this.x+","+this.y);
    for (let i in this.players) {
      if(players[i].isDead = 1)
      {
        //change sprite to deadSprite
      }
    }
  }

  make_data(id) {
    var str_make = "ball_pos:";
    str_make += id + "," + this.x + "," + this.y + "," + this.dx + ","
              + this.dy + "," + this.speed;
    return str_make;
  }
}

class game_1_player {
  constructor(x, y, face) {
    this.sx = 0;
    this.x = x;
    this.y = y;
    this.move = 0;
    this.speed = 5;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    this.isDead = 0;

  }

  make_data(player_index){
    var string_make = "pos_player:"+player_index+","+this.x+","+this.y+","+this.move+","+
                      this.speed+","+this.facing+","+this.fruit_holding+","+this.fruit_held_id;
    return string_make;
  }

  update_data(sprite, x, y, move, speed, facing, fruit_holding, fruit_id){
    if (x != null) { this.x = x; }
    if (y != null) { this.y = y; }
    if (move != null) { this.move = move; }
    if (speed != null) { this.speed = speed; }
    if (facing != null) { this.facing = facing; }
    if (fruit_holding != null) { this.fruit_holding = fruit_holding; }
    if (fruit_id != null) { this.fruit_held_id = fruit_id; }
  }
}

class game_1_fruit {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = ~~size;
    this.held = 0
    this.scored = 0;
    this.player_holding_id = 0;
    if ((size < 5) || (size > 15)) {
      size = Math.min(15, Math.max(0, 5));
    }
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
    if (x != null) {this.x = x;}
    if (y != null) {this.y = y;}
    if (size != null) {this.size = size;}
    if (held != null) {this.held = held;}
    if (scored != null) {this.scored = scored;}
    if (player_holding_id != null) {this.player_holding_id = player_holding_id;}
  }

  make_data(index) {
    var str_make = "pos_fruit:"+index+","+this.x+","+this.y+","+
                    this.size+","+this.held+","+this.scored+","+this.player_holding_id;
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

  update_data(x, y, width, height, score){
    if (!isNaN(x)) { this.x = x; }
    if (!isNaN(y)) { this.y = y; }
    if (!isNaN(width)) { this.width = width; }
    if (!isNaN(height)) { this.height = height; }
    if (!isNaN(score)) { this.score = score; }
  }

  make_data(index){
    return "upd_endzone:"+index+","+this.x+","+this.y+","+this.width+","+this.height+","+this.score;
  }
}

function fruitGame() {
  this.setup = function() {
    this.fruits_count = 800;
    this.remove_percentage_of_fruits = 0.2;
    this.players = [];
    this.fruits = [];
    this.endzones = [];
    this.game_active = 0;
    this.game_length = 30.000;
    this.start_time = Date.now()/1000;
    this.current_time = this.game_length;
    this.game_dimensions = [2000, 1000];
    for (i=0; i < clients.length; i++) {
      this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), 1);
    }
    var p = new PoissonDiskSampling({
      shape: [this.game_dimensions[0], this.game_dimensions[1]],
      minDistance: 20,
      maxDistance: 30,
      tries: 3
    });
    var poisson_points = p.fill();
    console.log("Poisson points: "+poisson_points[0]);
    console.log("made "+poisson_points.length+" poisson points");
    this.endzones[0] = new game_1_endzone(0, 100, this.game_dimensions[1]/2-100, this.game_dimensions[1]/2+100);
    this.endzones[1] = new game_1_endzone(this.game_dimensions[0]-100, this.game_dimensions[0], 
                                          this.game_dimensions[1]/2-100, this.game_dimensions[1]/2+100);
    //The following code removes fruits that are generated in an endzone.
    for (i=0; i < poisson_points.length; i++) { //counts downwards because we will be removing indices
      for (let j in this.endzones) {
        if (this.endzones[j].check_placement(poisson_points[i][0], poisson_points[i][1])) {
          poisson_points.splice(i, 1);
          break;
        }
      }
    }
    while (poisson_points.length > this.fruits_count) {
      poisson_points.splice(Math.floor(Math.random()*poisson_points.length), 1);
    }
    console.log("Generated "+poisson_points.length+" fruits ( targeted: "+this.fruits_count+")");
    for (i = 0; i < poisson_points.length; i++) {
      this.fruits[i] = new game_1_fruit(poisson_points[i][0], poisson_points[i][1], 3+Math.random()*12);
    }
  }
  
  this.tick_function = function() { this.game_update(); }

  this.game_update = function() {
    this.current_time = this.game_length - (Date.now()/1000 - this.start_time);
    if (this.current_time < 0 && this.game_active != 2) {
      if (this.game_active == 0) {
        this.game_active = 1;
        this.game_length = 60;
        this.start_time = Date.now()/1000;
        this.current_time = this.game_length;
      } else if (this.game_active == 1) {
        this.game_active = 2;
        this.game_length = 20;
        this.start_time = Date.now()/1000;
      }
      broadcast("game_state:"+this.game_active+","+this.current_time+","+this.game_length);
    }
  }

  this.read_network_data = function(flag, message, usr_id) {
    console.log(flag+":"+message);
    this.game_update();
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    } else if (flag == "pos_fruit") {
      var fruit_id = this.read_in_fruit_position(message);
      //if (this.fruits[fruit_id].scored) { broadcast('pop_fruit:'+fruit_id); }
      broadcast_exclusive(this.fruits[usr_id].make_data(fruit_id), [usr_id]);
    } else if (flag == "upd_endzone") {
      var endzone_id = this.read_in_endzone_data(message);
      broadcast_exclusive(this.endzones[endzone_id].make_data(endzone_id), [usr_id]);
    }
  }

  this.user_loaded = function(usr_id) {
    clients[usr_id].send("load_recieved");
    this.players[usr_id] = new game_1_player(600*Math.random(), 600*Math.random(), 1);
    broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    clients[usr_id].send(this.make_everything());
    broadcast("game_state:"+this.game_active+","+this.current_time+","+this.game_length);
  }

  this.user_disconnected = function(usr_id) {
    broadcast("rmv_player:"+usr_id);
    if (!(this.players[usr_id])) { return; }
    if (this.players[usr_id].fruit_holding == 1) {
      this.fruits[this.players[usr_id].fruit_held_id].drop();
    } 
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    for (let i in this.fruits) { str_make += this.fruits[i].make_data(i) + "\n"; }
    for (let i in this.endzones) { str_make += this.endzones[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    return p_vals[0];
  }

  this.read_in_fruit_position = function(data_string) {
    p_vals = convert_data_string(data_string, [0, 3, 4, 5, 6], [1, 2]);
    this.fruits[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6]);
    return p_vals[0];
  }

  this.read_in_endzone_data = function(data_string) {
    p_vals = convert_data_string(data_string, [0, 5], [1, 2, 3, 4]);
    this.endzones[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5]);
    return p_vals[0];
  }
}

function purgatory() {
  this.setup = function() {
    this.start_time = Date.now()/1000;
    this.current_time = 0;
    this.add_last_time = Date.now()/1000;
    this.players = [];
    this.balls = [];
    for (i=0; i < clients.length; i++) {
      this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), 1);
      //this.balls[i] = new game_2_ball();
    }
    this.random_seed = Math.floor(Math.random()*100000);
    tick_function_ids[tick_function_ids.length] = setInterval(function() { current_state.tick_function_ball(); }, 20);
  }

  this.tick_function = function() { 
    this.current_time = Date.now()/1000 - this.start_time;
    //if (this.current_time >= 5) { swap_current_state("fruit_game"); }
    if (Date.now()/1000 - this.add_last_time > 10) {
      this.add_last_time = Date.now()/1000;
      this.balls[this.balls.length] = new game_2_ball();
      broadcast(this.balls[this.balls.length-1].make_data(this.balls.length-1));
      console.log("added ball "+this.balls);
      //broadcast(this.make_everything());
    }
    for (let i in this.balls) { 
      console.log("updating ball "+i);
      this.balls[i].update(); 
    }
    //broadcast(this.make_everything());
  }

  this.tick_function_ball = function() {
    //console.log("ball_tick_function 1");
    //console.log("players: "+this.players);
    for (let i in this.balls) { this.balls[i].update(); }
    var str_make = "";
    //console.log("ball_tick_function 2" + this.balls);

    for (let i in this.balls) { 
      //console.log("data for ball "+i);
      //console.log(this.balls[i].make_data(i)); 
      str_make += this.balls[i].make_data(i) + "\n";
    }
    for (let i in this.players){
      if (this.players[i].isDead) { continue; }
      for (let j in this.balls) {
        var dx= Math.abs(this.balls[j].x-(this.players[i].x));
        var dy= Math.abs(this.balls[j].y-(this.players[i].y));
        var distance = Math.sqrt(dx*dx + dy*dy);
        console.log("distance: "+distance);
          if (distance <= this.balls[j].radius){
            console.log("Player "+i+" is dead");
            this.players[i].isDead = 1; 
          }
      }
    }

    //console.log("ball_tick_function 3");
    broadcast(str_make);
  }

  this.read_network_data = function(flag, message, usr_id) {
    console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    }
  }

  this.user_loaded = function(usr_id) {
    clients[usr_id].send("load_recieved");
    this.players[usr_id] = new game_1_player(600*Math.random(), 600*Math.random(), 1);
    broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    clients[usr_id].send(this.make_everything()+"random_seed:"+random_seed);
  }

  this.user_disconnected = function(usr_id) {
    broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    for (let i in this.balls) { str_make += this.balls[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    if (p_vals[0] >= this.players.length) {this.players[p_vals[0]] = new game_1_player(0, 0, 1); }
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    return p_vals[0];
  }
}

server_start();
