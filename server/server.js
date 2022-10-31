var current_state = new load_room();
var current_state_flag = "load_room";
let width = 600;
let height = 600;

let global_port = 3128;
let tick_interval = 200; //in milliseconds

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

var {game_1_player, game_1_fruit, game_1_endzone} = require("./dependencies/fruit_game_classes");

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

function tick_function() { current_state.tick_function(); }

setInterval(tick_function, tick_interval);

function game_start() {
  console.log("Game Reset");
  current_state = new load_room();
  current_state.setup();
  current_state_flag = "load_room";
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
    for (i = position; i < clients.length; i++) { clients[i].test_position--; }
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
}

function start_board_game(message) {
  swap_current_state("board_game");
  broadcast("start_board_game");
}

class client_info {
  constructor() {
    this.connected_to_game;
    this.session_id;
    this.latency;
    if (arguments.length >= 1) { this.update_info(arguments); } 
  }

  update_info() {
    if (arguments.length >= 1) { this.connected_to_game = arguments[0]; }
    if (arguments.length >= 2) { this.connected_to_game = arguments[1]; }
    if (arguments.length >= 3) { this.connected_to_game = arguments[2]; }
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
    this.players = [];
    for (i=0; i < clients.length; i++) {
      this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), 1);
    }
  }

  this.tick_function = function() { 
    this.current_time = Date.now()/1000 - this.start_time;
    if (this.current_time >= 5) { swap_current_state("fruit_game"); }
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
    clients[usr_id].send(this.make_everything());
  }

  this.user_disconnected = function(usr_id) {
    broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    return p_vals[0];
  }
}

function load_room() {
  this.setup = function() {
    this.start_time = Date.now()/1000;
    this.current_time = 0;
    this.start_game = false;
    this.players = [];
    for (i=0; i < clients.length; i++) {
      this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), 1);
    }
    this.host_id = 0;
  }

  this.tick_function = function() {
    this.current_time = Date.now()/1000 - this.start_time;
    if (this.start_game && this.current_time >= 30) { 
      start_board_game(); 
    }
  }

  this.read_network_data = function(flag, message, usr_id) {
    console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    } else if (flag == "start_game" && usr_id == this.host_id) {
      this.start_game = true;
      this.start_time = Date.now()/1000;
      broadcast("host_started_game:"+0);
    }
  }

  this.user_loaded = function(usr_id) {
    clients[usr_id].send("load_recieved");
    this.players[usr_id] = new game_1_player(600*Math.random(), 600*Math.random(), 1);
    broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    clients[usr_id].send(this.make_everything());
    if (this.start_game) { clients[usr_id].send("host_started_game:"+this.current_time); }
    if (usr_id == this.host_id) { clients[usr_id].send("assigned_host"); }
  }

  this.user_disconnected = function(usr_id) {
    broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    return p_vals[0];
  }
}

function board_game() {
  this.setup = function() {
    return;
  }
}


server_start();
