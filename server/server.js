//var current_state = new dev_room();
//var current_state_flag = "dev_room";



var sessions = {
  "temp": undefined
};

let width = 600;
let height = 600;

let global_port = 3128;
//let tick_interval = 35; //in milliseconds
var random_seed = Math.floor(Math.random()*100000);
//var tick_function_ids = [];

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
var Jimp = require("jimp");
var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');

var {game_1_player, game_1_fruit, game_1_endzone} = 
        require("./dependencies/fruit_game_classes");
var {board_game_player, board_game_tile, dice_element, select_random_element} = 
        require("./dependencies/board_game_classes");
var {game_2_ball, ball_game_player} =
        require("./dependencies/ball_game_classes");
var {fighting_game_player} =
        require("./dependencies/fighting_game_classes");
var {flappy_bird_pipe, flappy_bird_player} =
        require("./dependencies/flappy_bird_classes");
var {game_end_screen_player} =
        require("./dependencies/game_end_screen_classes");
var {parse_board_from_image, swap_new_direction, pixel, linked_pixel} =
        require("./dependencies/board_from_image");

Jimp.read("./media/board_layouts/test_template_1.png", (err, img) => {
  if (err) throw err;
  /*console.log("pixel -> "+Jimp.intToRGBA(img.getPixelColor(0, 0)));
  
  console.log("pixel -> "+JSON.stringify(Jimp.intToRGBA(img.getPixelColor(0, 0))));
  */

  var list_make = parse_board_from_image(img);
});

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
const PoissonDiskSampling = require('poisson-disk-sampling');
var app = express();
var clients = new Array;
var clients_info = new Array;

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(global_port);
var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({ server: httpsServer });

function seed_random(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function end_session(session_id) {
  if (sessions[session_id] === undefined) { return; }
  setTimeout(function(){ 
    for (let i in sessions[session_id].clients) {
      sessions[session_id].remove_client(sessions[session_id].clients[i]);
    }
    sessions[session_id].clear_all_intervals();
    delete sessions[session_id]; 
  }, 10000);
}

function game_start() {
  console.log("Game Reset");
  current_state = new dev_room();
  current_state.setup();
  current_state_flag = "dev_room";
}

function server_start() {
  //game_start();
  console.log('Server address: ' + ip.address());
  console.log('Server port:    ' + global_port);
  console.log("Initializing server");
  //console.log("Current game: "+current_state_flag);
  console.log(Date.now());
}

server.on('open', function open() {console.log("server started");});

server.on('connection', function connection(thisClient) {
  console.log("New Connection");        // you have a new client
  console.log("clients length "+clients.length);
  clients.push(thisClient);
  console.log("clients length "+clients.length);
  console.log("user connecting");
  clients_info.push(new client_info());
  thisClient.send("request_info");
  //console.log("Client ip: "+JSON.stringify(thisClient));
  
  console.log("Client ip: "+JSON.stringify(thisClient._socket.remoteAddress));


  thisClient.on('close', function(msg){         //Triggers on a client disconnect
    var position = clients.indexOf(thisClient); //Gets clients position in array
    if (clients_info[position].session_id !== undefined) {
      var session_id = clients_info[position].session_id;
      sessions[session_id].remove_client(thisClient);
    }
    clients.splice(position, 1);                //Removes client from global client array
    clients_info.splice(position, 1);
    for (i = position; i < clients.length; i++) { clients[i].test_position--; }
    //current_state.user_disconnected(position);  //Triggers current_state's user disconnect function.
    console.log("connection closed, client: "+position);
  });

  thisClient.on('message', function incoming(data) { //Activates when a client sends data in.
    var lines = data.split("\n");             //Packets may contain multiple commands, separated by newline
    var index = clients.indexOf(thisClient);  //grabs the index of the client that sent it in
    var session_id = clients_info[index].session_id;
    for (let i in lines) {                    //Processes each individual command in the packet
      console.log(lines[i]);
      var line_pieces = lines[i].split(":");  //Commands are formatted as flag:data, flag indicating what to activate.
      var flag = line_pieces[0],  
          message = null;
      if (line_pieces.length > 1) {           //Some commands are just a flag, this accounts for that.
        message = line_pieces[1];             
      }
      if (session_id === undefined || session_id == null) {
        if (flag == 'connected') { thisClient.send("connected"); } //This only constitutes a hello, establishes that the connection was made
        //else if (flag == 'load_game') { thisClient.send("current_game:"+current_state_flag); }
        else if (flag == 'user_info') { clients_info[index].name = message; thisClient.send("request_session"); continue; }
        else if (flag == 'game_connect') { thisClient.send("request_session"); continue; }
        else if (flag == 'create_session') {
          console.log("creating_session_called -> "+message);
          if (sessions[message] !== undefined || message.length == 0) {
            thisClient.send("session_warning:session already exists");
          } else {
            clients_info[index].session_id = message;
            console.log("sessions -> "+Object.keys(sessions));
            sessions[message] = new game_session(message);
            sessions[message].setup();
            console.log("sessions -> "+Object.keys(sessions));
            thisClient.send("session_created:"+message+"\nassigned_session:"+message);
            sessions[message].push_client(thisClient, clients_info[index]);
          }
        } else if (flag == 'join_session') {
          if (sessions[message] === undefined) {
            thisClient.send("session_warning:session doesn't exist");
          } else {
            clients_info[index].session_id = message;
            thisClient.send("assigned_session:"+message);
            sessions[message].push_client(thisClient, clients_info[index]);
          }
        }
      } else if (sessions[session_id] !== undefined) {
        if (flag == 'leave_session') {
          sessions[session_id].remove_client(thisClient);
          clients_info[index].session_id = null;
        } else {
          sessions[session_id].read_network_data(flag, message, thisClient);
        }
      }
      //In the unique case that the server is issuing the current state, the current state doesn't deal with that.
      //current_state.read_network_data(flag, message, index);  //Passes the flag, message, and sender id to current_state's network trigger.
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
  console.log("ERROR: THIS IS DEPRECATED");
  if (state_flag == "fruit_game") { current_state = new fruitGame(); }
  else if (state_flag == "purgatory") { current_state = new purgatory(); }
  else if (state_flag == "load_room") { current_state = new load_room(); }
  else if (state_flag == "board_game") {current_state = new board_game(); }
  else if (state_flag == "ball_game") { current_state = new ball_game(); }
  else if (state_flag == "dev_room") { current_state = new dev_room(); }
  else if (state_flag == "fighting_game") { current_state = new fighting_game(); }
  else if (state_flag == "flappy_bird") { current_state = new flappy_bird(); }
  else if (state_flag == "game_end_screen") {current_state = new game_end_screen(); }
  else { return; } // failsafe for invalid flags

  for(let i in this.tick_function_ids) {
    if(i > 0)
      this.tick_function_ids.splice(i,1);
  }

  current_state.setup();
  current_state_flag = state_flag;
  broadcast("current_game:"+state_flag);
}

function start_board_game(message) {
  swap_current_state("board_game");
  var p_vals = convert_data_string(message, [0]);
  current_state.max_turns = p_vals[0];
  broadcast("start_board_game");
}

class game_session {
  constructor(session_id) {
    this.tick_function_ids = [];
    this.session_id = session_id;
    console.log("this.session_id -> "+this.session_id);
    this.clients = [];
    this.clients_info = [];
    this.current_state;
    this.current_state_flag;
    this.board_game;
    this.tick_function_ids[0] = setInterval(this.tick_function, 1000);
  }

  setup() {
    this.current_state = new dev_room();
    this.current_state_flag = "dev_room";
    //this.current_state.set_session_id(this.session_id);
    this.current_state.setup(this.session_id);
  }

  tick_function() {
    try {
      if (this.current_state.tick_function !== undefined) {
        this.current_state.tick_function();
      }
    } catch (TypeError) {
      return;
    }
  }

  swap_current_state(state_flag) {
    console.log("session ("+this.session_id+") swapping state to "+state_flag);
    if (this.current_state_flag == "board_game") { this.board_game = this.current_state; }
    this.clear_all_intervals();
    this.broadcast("current_game:"+state_flag);
    if (state_flag == "fruit_game") { this.current_state = new fruitGame(); }
    else if (state_flag == "purgatory") { this.current_state = new purgatory(); }
    else if (state_flag == "load_room") { this.current_state = new load_room(); }
    else if (state_flag == "board_game") { 
      if (this.board_game === undefined) {
        this.board_game = new board_game();
        this.board_game.setup(this.session_id);
      } else {
        this.board_game.read_in_minigame_results(this.current_state.game_result_json);
      }
      this.current_state = this.board_game;
    }
    else if (state_flag == "ball_game") { this.current_state = new ball_game(); }
    else if (state_flag == "dev_room") { this.current_state = new dev_room(); }
    else if (state_flag == "fighting_game") { this.current_state = new fighting_game(); }
    else if (state_flag == "flappy_bird") { this.current_state = new flappy_bird(); }
    else if (state_flag == "game_end_screen") {
      var game_results = this.current_state.game_result_json; 
      this.current_state = new game_end_screen(); 
    }
    else { return; } // failsafe for invalid flags
    //this.current_state.session_id = this.session_id;
    if (state_flag != "board_game") {
      if (state_flag == "game_end_screen") {
        this.current_state.setup(this.session_id, game_results);
      } else {
        this.current_state.setup(this.session_id);
      }
    } else if (state_flag == 'board_game' && this.current_state_flag == 'game_end_screen') {
      this.current_state.second_setup();
    }
    this.current_state_flag = state_flag;
  }

  broadcast(data) {  //Send a message to all connected clients
    for (let c in this.clients) {
      this.clients[c].send(data);
    }
  }
  
  broadcast_exclusive(data, excluded_clients_array) {  //Send a message to all clients excluding a passed array.
    if (excluded_clients_array.length > 1) {
      for (let c in this.clients) { if (!(excluded_clients_array.includes(c))) { this.clients[c].send(data); } }
    }
    else {  //For whatever reason javascript treats an array of 1 as an element, so array.includes doesn't work. This accounts for that.
      for (let c in this.clients) { if (c != excluded_clients_array) { this.clients[c].send(data); } }
    }
  }

  read_network_data(flag, message, client_in) {
    var index = this.clients.indexOf(client_in);
    if (index == -1) { return; }
    if (flag == 'connected') { this.clients[index].send("connected"); } //This only constitutes a hello, establishes that the connection was made
    //if (flag == 'load_game') { this.clients[index].send("current_game:"+this.current_state_flag); }
    if (flag == 'user_info') { this.clients_info[index].name = message;return; }
    //In the unique case that the server is issuing the current state, the current state doesn't deal with that.
    this.current_state.read_network_data(flag, message, index);
  }

  push_client(client, client_info) {
    this.clients[this.clients.length] = client;
    this.clients_info[this.clients_info.length] = client_info;
    this.clients[this.clients.length-1].send("remove_inputs");
    this.clients[this.clients.length-1].send("current_game:"+this.current_state_flag);
    this.clients[this.clients.length-1].send("please work v0.5");
    this.clients_info[this.clients_info.length-1].color = this.clients_info.length-1;
    client.send("Please work");
    this.broadcast("HELLO");
    this.current_state.user_loaded(this.clients.length-1);
  }

  remove_client(client) {
    var index = this.clients.indexOf(client);
    this.clients.splice(index, 1);
    this.clients_info.splice(index, 1);
    this.current_state.user_disconnected(index);
    if (this.clients.length == 0) {
      end_session(this.session_id);
    }
  }

  append_interval_id(set_int_returned) {
    this.tick_function_ids[this.tick_function_ids.length] = set_int_returned;
  }

  clear_all_intervals() {
    for (let i in this.tick_function_ids) {
      clearInterval(this.tick_function_ids[i]);
    }
    this.tick_function_ids = [];
  }
}

class client_info {
  constructor() {
    this.connected_to_game;
    this.session_id;
    this.latency;
    this.name;
    //0,1,2,3
    this.color;

    if (arguments.length >= 1) { this.update_info(arguments); } 

    //temporary variable to store the 1st, 2nd, 3rd, 4th place of a player
    //by default, it has the flag variable -1
    this.placeInGame = -1;
  }

  update_info() {
    if (arguments.length >= 1) { this.connected_to_game = arguments[0]; }
    if (arguments.length >= 2) { this.session_id = arguments[1]; }
    if (arguments.length >= 3) { this.latency = arguments[2]; }
    if (arguments.length >= 4) { this.name = arguments[3]; }
  }
}

function fruitGame() {
  this.setup = function(session_id) {
    this.session_id = session_id;
    this.fruits_count = 250;
    this.remove_percentage_of_fruits = 0.2;
    this.players = [];
    this.fruits = [];
    this.endzones = [];
    this.game_active = 0;
    this.game_length = 5.000;
    this.start_time = Date.now()/1000;
    this.current_time = this.game_length;
    this.game_dimensions = [2000, 1000];
    this.endzones[0] = new game_1_endzone(100, this.game_dimensions[1]/2, 200, 400, 0);
    this.endzones[1] = new game_1_endzone(this.game_dimensions[0]-100, this.game_dimensions[1]/2, 200, 400, 1);
    if (sessions[this.session_id] !== undefined) {
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new game_1_player(this.endzones[i%2].x, this.endzones[i%2].y, "down", i%4);
      }
      for (let i in sessions[this.session_id].clients)
      this.user_loaded(i);
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

    var self = this;
    var int_id = setInterval(function(){ self.tick_function(); }, 100);
    sessions[this.session_id].append_interval_id(int_id);
    for (let i in sessions[this.session_id].clients) {
      sessions[this.session_id].clients[i].send(this.make_everything());
    }

    this.game_result_json = {};
    
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

        for (let i in this.players) {
          this.game_result_json[sessions[this.session_id].clients_info[i].name] = {
            "player_id": i,
            "coins_added": Math.floor(this.endzones[i%2].score/20)
          }
          if (this.endzones[i%2].score > this.endzones[(i+1)%2].score) {
            this.game_result_json[sessions[this.session_id].clients_info[i].name]["coins_added"] += 15;
          }
        }

        this.game_active = 2;
        this.game_length = 20;
        this.start_time = Date.now()/1000;
        var self = this;
        setTimeout(function(){ sessions[self.session_id].swap_current_state("game_end_screen"); }, 100);
      }
      sessions[this.session_id].broadcast("game_state:"+this.game_active+","+this.current_time+","+this.game_length);
    }
    for (let i in this.players) {
      this.players[i].x = Math.max(0, Math.min(this.players[i].x, this.game_dimensions[0]));
      this.players[i].y = Math.max(0, Math.min(this.players[i].y, this.game_dimensions[1]));
    }
  }

  this.read_network_data = function(flag, message, usr_id) {
    //console.log(flag+":"+message);
    this.game_update();
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    } else if (flag == "pos_fruit") {
      var fruit_id = this.read_in_fruit_position(message);
      //if (this.fruits[fruit_id].scored) { broadcast('pop_fruit:'+fruit_id); }
      sessions[this.session_id].broadcast_exclusive(this.fruits[usr_id].make_data(fruit_id), [usr_id]);
    } else if (flag == "upd_endzone") {
      var endzone_id = this.read_in_endzone_data(message);
      sessions[this.session_id].broadcast_exclusive(this.endzones[endzone_id].make_data(endzone_id), [usr_id]);
    }
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    this.players[usr_id] = new game_1_player(this.endzones[usr_id%2].x, this.endzones[usr_id%2].y, "down", usr_id%4);
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + this.players.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
    sessions[this.session_id].broadcast("game_state:"+this.game_active+","+this.current_time+","+this.game_length);
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
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
    p_vals = convert_data_string(data_string, [0, 3, 6, 7], [1, 2, 4], [5]);
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

class game_2_player {
  constructor(x, y, face) {
    this.sx = 0;
    this.x = 200;//80;
    this.y = 450 - y * 90;
    this.move = 0;
    this.speed = 5;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    this.fruit_holding = 0;
    this.fruit_held_id = 0;

    //data fields for MY players
		//
		//previous_key_pressed holds the previous key that the player pressed,
		//in the form of the keycode [39,37] representing EW
    //(at first, it holds the value 38 as a flag variable, so that
    // the user can press left or right to start moving)
		this.previous_key_pressed = 40;
		//
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

function purgatory() {
  this.setup = function(session_id) {
    this.session_id = session_id;
    this.whoWon; //holds the index of the player that won the game

    this.game_length = 30.000;
    this.start_time = Date.now()/1000;
    this.current_time = this.game_length;

    this.current_time = 0;
    this.players = [];
    this.game_result_json = {};
    this.game_over = 0;

    var sentence_data = fs.readFileSync('./data/sentence_data.txt', 'utf8');
    sentence_data = sentence_data.split("\n");
    this.chosen_sentence = sentence_data[Math.round(Math.random()*(sentence_data.length-1))];
    console.log("chosen sentence:"+this.chosen_sentence);

    //for (i=0; i < clients.length; i++) {
    //  console.log("client #"+i);
    //  this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), 1);
    //}

    //data fields for MY game
		//
		//
		//
    if (sessions[this.session_id] !== undefined) {
      console.log("session found, making players");
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new game_2_player(null, this.numberOfPlayers, 3);
      }
      for (let i in sessions[this.session_id].clients) {
        this.user_loaded(i);
      }
    }
    this.numberOfPlayers = 0;

    // var int_id = setInterval(function(){ self.tick_function(); }, 100);
    // sessions[this.session_id].append_interval_id(int_id);
  }

  this.tick_function = function() { 
    //this.current_time = Date.now()/1000 - this.start_time;
    //if (this.current_time >= 5) { swap_current_state("fruit_game"); }
    if(this.whoWon != null) {
      sessions[this.session_id].broadcast("Won:"+whoWon);
    }
    this.current_time = this.game_length - (Date.now()/1000 - this.start_time);
    sessions[this.session_id].broadcast("game_state:"+this.current_time+","+this.game_length);
  }

  this.read_network_data = function(flag, message, usr_id) {
    console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    } else if (flag == "debug") {
      console.log("Client sent: "+message);
    } else if (flag == "get_index") {
      sessions[this.session_id].clients[usr_id].send("index:"+usr_id);
      sessions[this.session_id].clients[usr_id].send("player_count:" + clients.length);
    } else if (flag == "get_names") {
      sessions[this.session_id].broadcast("Name of:"+usr_id+","+clients_info[usr_id].name);
    } else if (flag == "finished_sentence") {
      this.player_finished(usr_id);
    }
  }

  this.player_finished = function(player_id) {
    var place = 1 + Object.keys(this.game_result_json).length;
    this.game_result_json[sessions[this.session_id].clients_info[player_id].name] = {
      "player_id": player_id,
      "coins_added": 65 - 15*place
    }
    if (place == 1) {
      var self = this;
      setTimeout(function(){self.end_game(); }, 15000);
    }
    else if (Object.keys(this.game_result_json).length == this.players.length) {
      var self = this;
      setTimeout(function(){self.end_game(); }, 2000);
    }
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    //upon construction, every player in my game is given the same x
    //value. so i pass it as null to make things simpler.
    //constructor for MY game players
    this.players[usr_id] = new game_2_player(null, this.players.length, 3);
    this.numberOfPlayers++;
    console.log("Client "+usr_id+" loaded:"+this.players[usr_id].make_data());
    //
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
  }

  this.end_game = function() {
    if (this.game_over) { return; }
    for (let i in this.players) {
      if (this.game_result_json[sessions[this.session_id].clients_info[i].name] === undefined) {
        var place = 1 + Object.keys(this.game_result_json).length;
        this.game_result_json[sessions[this.session_id].clients_info[i].name] = {
          "player_id": i,
          "coins_added": 65 - 15*place
        }
      }
    }
    var self = this;
    setTimeout(function(){sessions[self.session_id].swap_current_state("game_end_screen"); }, 2000);
    this.game_over = 1;
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
    this.numberOfPlayers--;
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    str_make += "keyboard_sentence:"+this.chosen_sentence+"\n";
    return str_make;
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    if(this.players[p_vals[0]] === undefined) {this.players[p_vals[0]] = new game_2_player(null, this.numberOfPlayers, 3);}
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    if(p_vals[1] > 1700) {
      whoWon = p_vals[0];
    }
    return p_vals[0];
  }
}

/*function purgatory() {
  this.setup = function(session_id) {
    this.session_id = session_id;
    console.log("purgatory session id ->"+this.session_id);
    this.start_time = Date.now()/1000;
    this.current_time = 0;
    this.players = [];
    if (sessions[this.session_id] !== undefined) {
      console.log("purgatory setup - session identified");
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), 1, i%4);
      }
    } else {
      console.log("purgatory setup - session doesn't exist");
    }
  }

  this.tick_function = function() { 
    this.current_time = Date.now()/1000 - this.start_time;
    if (this.current_time >= 5) { swap_current_state("fruit_game"); }
  }

  this.read_network_data = function(flag, message, usr_id) {
    //console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    }
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    this.players[usr_id] = new game_1_player(600*Math.random(), 600*Math.random(), 1, usr_id%4);
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + this.players.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
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
}*/

function load_room() {
  this.setup = function(session_id) {
    this.session_id = session_id;
    this.start_time = Date.now()/1000;
    this.current_time = 0;
    this.start_game = false;
    this.players = [];
    if (sessions[this.session_id] !== undefined) {
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), "left", i%4);
      }
    }
    this.host_id = 0;
    this.start_message = "";
  }

  this.tick_function = function() {
    this.current_time = Date.now()/1000 - this.start_time;
    if (this.start_game && this.current_time >= 10) { 
      start_board_game(this.start_message); 
    }
  }

  this.read_network_data = function(flag, message, usr_id) {
    //console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    } else if (flag == "start_game" && usr_id == this.host_id) {
      this.start_game = true;
      this.start_message = message;
      this.start_time = Date.now()/1000;
      sessions[this.session_id].broadcast("host_started_game:"+0);
    }
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    this.players[usr_id] = new game_1_player(600*Math.random(), 600*Math.random(), "down", usr_id%4);
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
    if (this.start_game) { sessions[this.session_id].clients[usr_id].send("host_started_game:"+this.current_time); }
    if (usr_id == this.host_id) { sessions[this.session_id].clients[usr_id].send("assigned_host"); }
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 6, 7], [1, 2, 4], [5]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    return p_vals[0];
  }
}

function game_end_screen() {
  this.setup = function(session_id, game_result_json) {
    this.session_id = session_id;
    this.game_result_json = game_result_json;
    this.start_time = Date.now()/1000;
    this.current_time = 0;
    this.timer_length = 20;
    this.start_game = false;
    this.players = [];
    if (sessions[this.session_id] !== undefined) {
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), "down", i%4);
      }
      for (let i in sessions[this.session_id].clients) {
        sessions[this.session_id].clients[i].send(this.make_everything());
        sessions[this.session_id].clients[i].send(this.game_result_json_to_string());
        sessions[this.session_id].clients[i].send("current_time:"+this.current_time);
      }
    }
    this.host_id = 0;
    this.start_message = "";
    var self = this;
    var int_id = setInterval(function(){ self.tick_function(); }, 200);
    sessions[this.session_id].append_interval_id(int_id);
  }

  this.tick_function = function() {
    //console.log("tick function, current_time -> "+this.current_time);
    this.current_time = Date.now()/1000 - this.start_time;
    if (this.current_time >= this.timer_length) { 
      sessions[this.session_id].swap_current_state("board_game");
    }
  }

  this.read_network_data = function(flag, message, usr_id) {
    //console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    } else if (flag == "start_game" && usr_id == this.host_id) {
      this.start_game = true;
      this.start_message = message;
      this.start_time = Date.now()/1000;
      sessions[this.session_id].broadcast("host_started_game:"+0);
    }
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    this.players[usr_id] = new game_1_player(600*Math.random(), 600*Math.random(), "down", usr_id%4);
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
    sessions[this.session_id].clients[usr_id].send(this.game_result_json_to_string());
    if (this.start_game) { sessions[this.session_id].clients[usr_id].send("host_started_game:"+this.current_time); }
    if (usr_id == this.host_id) { sessions[this.session_id].clients[usr_id].send("assigned_host"); }
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    str_make += "current_time:"+this.current_time;
    return str_make;
  }

  this.game_result_json_to_string = function() {
    var str_make = "game_result_json:";
    for (let i in this.game_result_json) {
      str_make += i+","+this.game_result_json[i]["player_id"] + ","+this.game_result_json[i]["coins_added"]+",";
    }
    return str_make.substring(0, str_make.length-1);
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 6, 7], [1, 2, 4], [5]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    return p_vals[0];
  }
}

function dev_room() {
  this.setup = function(session_id) {
    this.session_id = session_id;
    //if (arguments.length >= 1) { this.session_id = arguments[0]; }
    this.start_time = Date.now()/1000;
    this.current_time = 0;
    this.start_game = false;
    this.players = [];

    if (sessions[this.session_id] !== undefined) {
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new game_1_player(600*Math.random(), 600*Math.random(), "down", i%4);
      }
    }

    console.log("this.session_id -> "+this.session_id);
    console.log("sessions -> "+sessions);
    console.log("session keys ->"+Object.keys(sessions));
    this.host_id = 0;
    var self = this;
    var int_id = setInterval(function(){ self.tick_function(); }, 1000);
    sessions[this.session_id].append_interval_id(int_id);
  }

  this.tick_function = function() {
    //console.log("start time -> "+this.start_time);
    //console.log("dev_room tick called"); 
    return; 
  }

  this.read_network_data = function(flag, message, usr_id) {
    //console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    } else if (flag == "start_game" && usr_id == this.host_id) {
      sessions[this.session_id].swap_current_state(message);
    }
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    this.players[usr_id] = new game_1_player(600*Math.random(), 600*Math.random(), "down", usr_id%4);
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + sessions[this.session_id].clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
    if (usr_id == this.host_id) { sessions[this.session_id].clients[usr_id].send("assigned_host"); }
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 6, 7], [1, 2, 4], [5]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    return p_vals[0];
  }
}

function swap_new_direction(dir) {
  if (dir == "up") { return "down"; }
  if (dir == "down") { return "up"; }
  if (dir == "left") { return "right"; }
  if (dir == "right") { return "left"; }
}

function board_game() {
	this.setup = function(session_id) {
    this.last_end_turn = Date.now()/1000;
    this.session_id = session_id;
    console.log("board game session_id -> "+this.session_id);
    Jimp.read("./media/board_layouts/final_template.png", (err, img) => {
      if (err) throw err;
      /*
      console.log("pixel -> "+Jimp.intToRGBA(img.getPixelColor(0, 0)));
      console.log("pixel -> "+JSON.stringify(Jimp.intToRGBA(img.getPixelColor(0, 0))));
      */
      var list_make = parse_board_from_image(img);
      this.make_board_from_image(list_make);
    });
    

		this.players = [];
		this.tiles = [];
		this.tile_grid_dimensions = [50, 50];
    this.game_action_store = "";
		
    this.max_turns = 20;
    this.current_turn = 1;
		this.turning_player_index = 0; 	//Player currently rolling dice
    this.current_turn_moves = 0;
    if (sessions[this.session_id] !== undefined) {
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new board_game_player(0, 0, 1);
        this.players[i].name = sessions[this.session_id].clients_info[i].name;
        sessions[this.session_id].clients[i].send("assigned_id:"+i);
      }
    }
    this.second_setup();
	}

  this.read_in_minigame_results = function(game_result_json) {
    for (let i in game_result_json) {
      this.players[game_result_json[i]["player_id"]].coins += game_result_json[i]["coins_added"];
      //if (game_result_json[i]["won_game"]) { this.players[game_result_json[i]["player_id"]].game_wins++; }
    }
    for (let i in this.players) {
      this.user_loaded(i);
    }
  }

	this.make_board_layout_preset_1 = function() {
		this.tiles[0] = new board_game_tile(0, 25, 0, [1]);
		for (i = 1; i < 49; i++) {
			this.tiles[i] = new board_game_tile(i, 25, 1+Math.floor(Math.random()*4), [1]);
			this.pair_tiles(i-1, i, "right");
			this.pair_tiles(i, i-1, "left");
		}
		this.tiles[49] = new board_game_tile(49, 25, 5, [1]);
		this.pair_tiles(48, 49, "right");
		this.pair_tiles(49, 48, "left");
		this.tiles[50] = new board_game_tile(2, 24, 4, [1]);
		this.pair_tiles(2, 50, "up");
		this.pair_tiles(50, 2, "down");
    for (let i in this.players) {
      this.players[i].x = this.tiles[0].x;
      this.players[i].y = this.tiles[0].y;
      this.user_loaded(i);
    }
	}

  this.make_board_from_image = function(pixel_list) {
    console.log("making board from image");
		this.tiles = [];
		for (let i in pixel_list) {
			var type = select_random_element(["empty", "lose_coins", "gain_coins", "trap", "versus"], [1, 1, 1, 1, 1]);
			if (pixel_list[i].compare_rgb(0, 0, 255)) { type = "empty"; }
			else if (pixel_list[i].compare_rgb(255, 255, 0)) { type = "star"; }
			else if (pixel_list[i].compare_rgb(255, 0, 255)) { type = "versus"; }
			else if (pixel_list[i].compare_rgb(255, 0, 0)) { type = "trap"; }
			this.tiles[i] = new board_game_tile(pixel_list[i].x, pixel_list[i].y, type, [1]);
		}
		for (let i in pixel_list) {
			for (let j in pixel_list[i].connected) {
				var c_id = pixel_list[i].connected[j];
				if (c_id != false) {
					this.pair_tiles(i, c_id, j);
					this.pair_tiles(c_id, i, swap_new_direction(j));
				}
			}
    }
    for (let i in this.players) {
      this.players[i].current_tile_index = 0;
      this.players[i].y = this.tiles[0].y;
      this.players[i].x = this.tiles[0].x;
    }
    sessions[this.session_id].broadcast("reset_tiles");
    sessions[this.session_id].broadcast(this.make_everything());
    for (let i in this.players) {
      sessions[this.session_id].clients[i].send("assigned_id:"+i);
    }
		
	}

  this.second_setup = function() {

    var self = this;
    var int_id = setInterval(function(){self.tick_function();}, 100);
    if (this.players.length == 0) { return; }
    sessions[this.session_id].append_interval_id(int_id);
    sessions[this.session_id].clients[this.turning_player_index].send("your_roll");
  }

  this.tick_function = function() {
    //console.log("boardgame tick function called");
    if (isNaN(this.turning_player_index)) { this.turning_player_index = 0; }
    return;
  }

	this.pair_tiles = function(parent, child, flow_direction) {
		var reverse_direction = swap_new_direction(flow_direction);
		this.tiles[parent].make_child(flow_direction, child);
		this.tiles[child].make_parent(reverse_direction, parent);
	}

  this.make_everything = function() {
    str_make = "";
    for (let i in this.tiles) { str_make += this.tiles[i].make_data(i)+"\n"; }
    for (let i in this.players) { str_make += this.players[i].make_data(i)+"\n"; }
    str_make += "turning_player:"+this.turning_player_index+"\ncurrent_turn:"+this.current_turn+"\n";
    str_make += "max_turns:"+this.max_turns+"\n";
    return str_make;
  }

  this.read_network_data = function(flag, message, usr_id) {
    //console.log(flag+":"+message);
    /*if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else */if (flag == "move_tile_direction" && usr_id == this.turning_player_index) {
      p_vals = convert_data_string(message, [1], [], [0]);
      this.move_player_to_tile(usr_id, p_vals[0], p_vals[1]);
    } else if (flag == "begin_dice" && usr_id == this.turning_player_index) {
      var dice_make = new dice_element([1, 2, 3, 4, 5, 6], [1, 1, 1, 1, 1, 1]);
      sessions[this.session_id].broadcast("dice_roll_turn:ints,"+dice_make.make_data());
      this.current_turn_moves = dice_make.chosen_value;
      sessions[this.session_id].broadcast("current_turn_moves:"+this.current_turn_moves);
    } else if (flag == "begin_tile_event" && usr_id == this.turning_player_index) {
      this.tile_event_action(this.tiles[this.players[this.turning_player_index].current_tile_index].type);
    } else if (flag == "end_turn" && usr_id == this.turning_player_index) {
      if (Date.now()/1000 - this.last_end_turn > 2) {
        console.log("end_turn:"+usr_id);
        this.end_turn(message);
        this.last_end_turn = Date.now()/1000;
      }
    }
  }

  this.end_turn = function(message) {
    if (this.current_turn_moves > 0 ) { return; }
    this.read_game_action();
    this.turning_player_index = (this.turning_player_index + 1) % this.players.length;
    if (this.turning_player_index == 0) {
      this.current_turn += 1;
      sessions[this.session_id].broadcast("current_turn:"+this.current_turn);
      if (this.current_turn >= this.max_turns) {
        sessions[this.session_id].broadcast("game_over");
      }
    }
    
    sessions[this.session_id].broadcast("turning_player:"+this.turning_player_index);
    console.log("Player: "+this.turning_player_index+", turn: "+this.current_turn);
    sessions[this.session_id].clients[this.turning_player_index].send("your_roll");
  }

  this.move_player_to_tile = function(usr_id, direction, tile_target_id) {
    if (this.current_turn_moves <= 0) { return; }
    if (!this.tiles[this.players[usr_id].current_tile_index].check_child(direction)) 
		{ console.log("child failed"); return; }
    if (this.tiles[this.players[usr_id].current_tile_index].connected_tiles[direction]["tile_id"] == this.players[usr_id].previous_tile_index) {
      return;
    }
    sessions[this.session_id].broadcast(this.players[usr_id].make_data(usr_id));
    this.players[usr_id].previous_tile_index = this.players[usr_id].current_tile_index;
    //this.players[usr_id].current_tile_index = this.tiles[this.players[usr_id].current_tile_index].connected_tiles[direction]["tile_id"];
    this.players[usr_id].current_tile_index = tile_target_id;
    console.log("ttid:"+tile_target_id);
    this.players[usr_id].x = this.tiles[this.players[usr_id].current_tile_index].x;
    this.players[usr_id].y = this.tiles[this.players[usr_id].current_tile_index].y;
    sessions[this.session_id].broadcast("player_move_tile:"+usr_id+","+direction);
    if (this.tiles[this.players[usr_id].current_tile_index].type == 'star') { 
      this.current_turn_moves = 0;
      broadcast("current_turn_moves:"+this.current_turn_moves);
    }
    else { this.current_turn_moves--; }
  }

  this.tile_event_action = function(tile_type) {
    sessions[this.session_id].broadcast("tile_event_trigger:"+tile_type);
    switch(tile_type) {
      case 'empty':
				break;
			case 'lose_coins':
				var coin_change = Math.max(this.players[this.turning_player_index].coins-3, 0) - 
                          this.players[this.turning_player_index].coins;
        this.game_action_store = "change_coins:"+this.turning_player_index+","+coin_change;
				break;
			case 'gain_coins':
				this.game_action_store = "change_coins:"+this.turning_player_index+","+3;
				break;
			case 'versus':
				var dice_make = new dice_element(["Fruit Frenzy", "Disco Dodgeball", "Sky Surprise", "Backroom Brawl", "Keyboard Krawler"], [1, 1, 1, 1, 1]);
        sessions[this.session_id].broadcast("dice_roll_turn:strings,"+dice_make.make_data());
        switch(dice_make.chosen_value) {
          case 'Fruit Frenzy':
            this.game_action_store = "swap_game:fruit_game";
            break;
          case 'Disco Dodgeball':
            this.game_action_store = "swap_game:ball_game";
            break;
          case 'Sky Surprise':
            this.game_action_store = "swap_game:flappy_bird";
            break;
          case 'Backroom Brawl':
            this.game_action_store = "swap_game:fighting_game";
            break;
          case 'Keyboard Krawler':
            this.game_action_store = "swap_game:purgatory";
            break;
        }
        
				break;
			case 'unlucky':
				break;
			case 'star':
				this.game_action_store = "add_star:"+this.turning_player_index;
				break;
    }
    sessions[this.session_id].broadcast(this.players[this.turning_player_index].make_data(this.turning_player_index))
  }

  this.read_game_action = function() {
    console.log("read game action called");
    if (this.game_action_store == '') { return; }
    else {
      console.log("game action store is nonempty");
      var pieces = this.game_action_store.split(":");
      var flag = pieces[0], message = pieces[1];
      this.game_action_store = "";
      switch(flag) {
        case 'swap_game':
          sessions[this.session_id].swap_current_state(message);
          break;
        case 'change_coins':
          p_vals = convert_data_string(message, [0, 1]);
          this.players[p_vals[0]].coins += p_vals[1];
          sessions[this.session_id].broadcast(this.players[p_vals[0]].make_data(p_vals[0]));
          break;
        case 'add_star':
          var p_id = parseInt(message);
          this.players[p_id].stars++;
          this.players[p_id].current_tile_index = 0;
          this.players[p_id].previous_tile_index = 0;
          sessions[this.session_id].broadcast(this.players[p_id].make_data(p_id));
          this.players[p_id].current_tile_index = 0;
          this.players[p_id].previous_tile_index = 0;
          this.players[p_id].x = this.tiles[0].x;
          this.players[p_id].y = this.tiles[0].y;
          sessions[this.session_id].broadcast(this.players[this.turning_player_index].make_data(this.turning_player_index));
          break;
      }
    }
  }

  this.start_versus_event = function() {
    return;
  }

  this.user_loaded = function(usr_id) {
    clients[usr_id].send("load_recieved");
    if (this.players[usr_id] === undefined) {
      this.players[usr_id] = new board_game_player(this.tiles[0].x, this.tiles[0].y, 1);
      this.players[usr_id].name = clients_info[usr_id].name;
      this.players[usr_id].x = this.tiles[0].x;
      this.players[usr_id].y = this.tiles[0].y;
    }
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send("reset_tiles");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
    console.log("player_info:"+this.players[usr_id].make_data_raw());
    if (this.turning_player_index == usr_id) {
      sessions[this.session_id].clients[this.turning_player_index].send("your_roll");
    }
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
    if (this.turning_player_index > usr_id) {
      this.turning_player_index--;
    } else if (this.turning_player_index == usr_id) {
      this.turning_player_index %= this.players.length;
    }
    sessions[this.session_id].broadcast("turning_player:"+this.turning_player_index);
  }

  this.read_in_player_position = function(message) {
    p_vals = convert_data_string(message, [0, 6, 7, 9, 10], [1, 2, 3, 4], [5, 8]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new board_game_player(0, 0, 1); }
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8], p_vals[9], p_vals[10]);
  }
}

function ball_game() {
  this.setup = function(session_id) {
    this.session_id = session_id;
    console.log("this.session_id -> "+this.session_id);
    this.start_time = Date.now()/1000;
    this.current_time = 0;
    this.add_last_time = Date.now()/1000-5;
    this.players = [];
    this.balls = [];
    this.game_over = 0;
    this.bounds = {"x":[0, 1536], "y":[0, 731]};
    this.bounds["center"] = [(this.bounds["x"][0]+this.bounds["x"][1])/2, (this.bounds["y"][0]+this.bounds["y"][1])/2];
    // this.condition;
    this.game_over = false;
    if (sessions[this.session_id] !== undefined) {
      console.log("session found, making players");
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new ball_game_player(1536/2, 730/2, "down", sessions[this.session_id].clients_info[i].name, i%4);
      }
      for (let i in sessions[this.session_id].clients) {
        this.user_loaded(i);
      }
    }
    this.random_seed = Math.floor(Math.random()*100000);
    console.log("session current_state ->"+sessions[this.session_id].current_state);
    var self = this;
    var int_id = setInterval(function(){self.tick_function();}, 100);
    sessions[this.session_id].append_interval_id(int_id);
    int_id = setInterval(function(){self.tick_function_ball()}, 100);
    sessions[this.session_id].append_interval_id(int_id);
    this.game_result_json = {};
  }

  this.tick_function = function() { 
    this.current_time = Date.now()/1000 - this.start_time;
    //console.log("start time -> "+this.start_time);
    //if (this.current_time >= 5) { swap_current_state("fruit_game"); }
    if (Date.now()/1000 - this.add_last_time > 10) {
      this.add_last_time = Date.now()/1000;
      this.balls[this.balls.length] = new game_2_ball(this.bounds);
      sessions[this.session_id].broadcast(this.balls[this.balls.length-1].make_data(this.balls.length-1));
      //broadcast(this.make_everything());
    }
    for (let i in this.balls) { 
      //console.log("updating ball "+i);
      this.balls[i].update(seed_random, random_seed); 
      sessions[this.session_id].broadcast(this.balls[i].make_data(i));
    }
    var players_alive = 0;
    for (let i in this.players) {if (this.players[i].isDead == 0) {players_alive++;}}
    if (players_alive <= 1 && !this.game_over) {
      console.log("game_over trigger called; players_alive -> "+players_alive);
      for (let i in this.players) {
        if (this.game_result_json[sessions[this.session_id].clients_info[i].name] === undefined) {
          this.game_result_json[sessions[this.session_id].clients_info[i].name] = {
            "player_id": i,
            "coins_added": Math.floor(this.current_time)
          }
        }
      }
      this.game_over = 1;
      var self = this;
      setTimeout(function(){sessions[self.session_id].swap_current_state("game_end_screen"); }, 2000);
    }

    //console.log("players alive -> "+players_alive);

    //broadcast(this.make_everything());
  }

  this.tick_function_ball = function() {
    //console.log("players: "+this.players);
    for (let i in this.balls) { 
      this.balls[i].update(seed_random, random_seed); 
      sessions[this.session_id].broadcast(this.balls[i].make_data(i));
    }
    var str_make = "";
    sessions[this.session_id].broadcast(str_make);
  }

  this.end_game = function(last_player_id) {
    for (let i in this.players) {
      this.game_result_json[sessions[this.session_id].clients_info[i].name] = {
        "player_id" : i,
        "coins_added" : 15
      }
      this.game_result_json[sessions[this.session_id].clients_info[last_player_id].name]["coins_added"] += 50;
      var self = this;
    }
    setTimeout(function(){ sessions[self.session_id].swap_current_state("game_end_screen");}, 2000);
  }

  this.read_network_data = function(flag, message, usr_id) {
    //console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    }
    else if (flag == "player_dead") {
      this.players[usr_id].isDead = 1;
      sessions[this.session_id].broadcast("player_dead:"+usr_id);
      this.game_result_json[sessions[this.session_id].clients_info[usr_id].name] = {
        "player_id": usr_id,
        "coins_added": this.current_time
      }
    }
  //  for(let i in this.players)
   // {
  //    condition = true;
 //     if(player[i].isDead == 0)
 //     {
 //       condition = false;
 //     }

    
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    if (usr_id >= this.players.length) {
      this.players[usr_id] = new ball_game_player(1536/2, 730/2, "down", sessions[this.session_id].clients_info[usr_id].name, usr_id%4);
    }
    console.log("player count -> "+this.players.length);
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything()+"random_seed:"+random_seed);
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    for (let i in this.balls) { str_make += this.balls[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 6], [1, 2, 4], [5, 7, 8]);
    if (p_vals[0] >= this.players.length) {this.players[p_vals[0]] = 
      new ball_game_player(1536/2, 730/2, "down", sessions[this.session_id].clients_info[usr_id].name, p_vals[0]%4); }
    this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
    return p_vals[0];
  }
}

function fighting_game() {
  this.setup = function(session_id) {
    this.session_id = session_id;
    this.start_time = Date.now()/1000;
    this.current_time = 0;
    this.floor = 570;
    this.players = [];
    this.current_time = 0;
    this.start_time = Date.now()/1000;
    this.round_length = 30;
    this.countdown_time = this.round_length;
    this.game_round = 1;
    this.game_over = 0;
    this.game_result_json = {};
    if (sessions[this.session_id] !== undefined) {
      for (let i in sessions[this.session_id].clients) {
        this.players[i] = new fighting_game_player(100+400*Math.random(), 0, 0, i);
      }
      sessions[this.session_id].broadcast(this.make_everything());
      for (let i in sessions[this.session_id].clients) {
        sessions[this.session_id].clients[i].send("assigned_id:"+i);
      }
    }
    var self = this;
    var int_id = setInterval(function(){self.tick_function();}, 200);
    sessions[this.session_id].append_interval_id(int_id);
  }

  this.read_network_data = function(flag, message, usr_id) {
    if (usr_id >= this.players.length) { this.user_loaded(usr_id); }
    //console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    }else if(flag == "attack"){
      this.attack(usr_id);
      sessions[this.session_id].broadcast_exclusive("attack:"+usr_id+","+this.players[usr_id].make_data_raw(), [usr_id]);
    }else if (flag == "hit"){
      this.attack_end(usr_id);
    }else if (flag == "debug") {
      console.log("debug:"+message);
    }
    else if (flag == "winner") {
      broadcast_exclusive("winner:"+message);
      
    }
    else if (flag == 'death') {
     // this.players[usr_id].isDead = 1;
      broadcast("death:"+usr_id);
      this.check_winner();
    }
  }

  //make a function that keeps an array of the dead players in order
  //when a player dies, add them to the array to determine placement
  this.leaderboard = function(){
    var dead = [];
    for (let i in this.players){
      if (this.players[i].isDead){
        dead.push(this.players[i]);
      }
  }}

  this.player_finished = function(player_id) {
    var place = 1 + Object.keys(this.game_result_json).length;
    this.game_result_json[sessions[this.session_id].clients_info[player_id].name] = {
      "player_id": player_id,
      "coins_added": 65 - 15*place
    }
    var sum_players_alive = 0;
    for (let i in this.players) {
      if (this.players[i].health > 0) { sum_players_alive += 1; }
    }
    if (sum_players_alive <= 1) {
      var self = this;
      setTimeout(function(){self.end_game(); }, 15000);
    }
    else if (Object.keys(this.game_result_json).length == this.players.length) {
      this.end_game();
    }
  }

  this.end_game = function() {
    if (this.game_over) { return; }
    var place = 1 + Object.keys(this.game_result_json).length;
    for (let i in this.players) {
      if (this.game_result_json[sessions[this.session_id].clients_info[i].name] === undefined) {
        this.game_result_json[sessions[this.session_id].clients_info[i].name] = {
          "player_id": i,
          "coins_added": 65 - 15*place
        }
      }
    }
    var self = this;
    setTimeout(function(){sessions[self.session_id].swap_current_state("game_end_screen"); }, 2000);
    this.game_over = 1;
  }

  //make a function to declare a winner
  this.check_winner = function(){
    var numAlive = 0;
    for (let i in this.players){
      if (this.players[i].isDead == 0){   //for each player, if they are not dead, add 1 to numAlive
        numAlive = numAlive + 1;
      }
    } 
    if (numAlive == 1){
      for (let i in this.players){
        if (this.players[i].isDead == 0){   //take the winning player's id and send it to the clients
          broadcast("winner:"+i);     //send the winner to the clients
          this.end_game(i);
          //this.leaderboard();        //this is where the leaderboard function would be called to determine placement
        }
      }
    }
  }

  this.tick_function = function() {
    //for(let i in this.players) {
      //console.log("Y position is: " + this.players[i].make_data(i));
      //sessions[this.session_id].broadcast_exclusive(this.players[i].make_data(i),[i]);
    //}
    this.current_time = Date.now()/1000 - this.start_time;
    this.countdown_time = this.round_length - this.current_time;
    if (this.countdown_time < 0) {
      this.game_round++;
      this.countdown_time = this.round_length;
      this.start_time = Date.now()/1000;
    }
    if (this.game_round == 4) {
      this.end_game();
    }
    var players_alive = this.players.length;
    var winner_id = 0;
    for (let i in this.players) { 
      if(this.players[i].health <= 0) { this.player_finished(i); }
    }
    if (players_alive <= 1) { this.end_game(winner_id); }
    sessions[this.session_id].broadcast("game_timer_info:"+this.current_time+","+this.countdown_time+","+this.game_round);
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    this.players[usr_id] = new fighting_game_player(100+Math.random()*400, 0, 0, usr_id%4);
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data_string) 
  { //format packet as pos_player: id, x, y, dx, dy, facing, health, isAttacking, isDucking
    p_vals = convert_data_string(data_string, [0, 5, 6, 7, 8], [1, 2, 3, 4], [9]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new fighting_game_player(100+Math.random()*400, 0, 0, p_vals[0]%4); }
    this.players[p_vals[0]].update_data( p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8], p_vals[9]); //just removed null as first argument in update_data, not sure if it's right
    return p_vals[0];
  }

  
  this.attack = function(usr_id){
    var player = this.players[usr_id];
    var hit_radius = 100;
    for (let i in this.players) {
      if (i != usr_id) {
        if(this.players[i].isDucking == 1){
          return;
        }
      var x_dist = this.players[i].x - this.players[usr_id].x,
          y_dist = this.players[i].y - this.players[usr_id].y;
      if (Math.sqrt(x_dist*x_dist + y_dist*y_dist) < hit_radius) {
        this.players[i].health -= 5;
        sessions[this.session_id].broadcast("hit:"+i+","+this.players[i].health);
        if (this.players[i].health <= 0) {
          var players_dead = 0;
          for (let i in this.players) {
            if (this.players[i].health <= 0) { players_dead++; }
          }

          this.game_result_json[sessions[this.session_id].clients_info[i].name] = {
            "player_id": i,
            "coins_added": 15 + players_dead*10
          }
        }
      }
    }
  }
  }
}

function flappy_bird() {
  //console.log("constructor called");
  this.setup = function(session_id) {
    this.session_id = session_id;
    this.start_time = Date.now()/1000;
    this.start_game_timer = 5;
    this.current_time = 0;
    this.players = [];
    this.pipe_interval = 800; //pixels between pipes to spawn;
    this.pipe_jump_gap_size = 250;

    this.game_result_json = {};
    this.numberOfPlayersDead = 0;
    this.pipe_counter = 0;

    this.pipes = [];
    for (i=0; i<10; i++) {
      this.pipes[i] = new flappy_bird_pipe(1000+this.pipe_interval*this.pipe_counter, 200, 
                                            200+Math.random()*300, this.pipe_jump_gap_size);
      this.pipe_counter++;
    }

    this.pipe_last_added = Date.now()/1000+5*500/200;

    if (sessions[this.session_id] !== undefined) {
      for (let i in sessions[this.session_id].clients) {
        //for every player except usr_id=0, a new flappy bird player is probably being generated
        if(this.players[i] == undefined) {
          this.players[i] = new flappy_bird_player(500, 250, 1);
          this.user_loaded(i);
        }
      }
      this.players_alive = this.players.length; 
    }
    this.set_player_y_positions;
    var self = this;
    var int_id = setInterval(function(){ self.tick_function(); }, 500);
    sessions[this.session_id].append_interval_id(int_id);
    this.game_over = 0;
  }

  this.set_player_y_positions = function() {
    var placement_gap = [100, 500];
    for (let i in this.players) {
      this.players[i].x = placement_gap[0] + (placement_gap[1]-placement_gap[0])*i/this.players.length;
    }
  }

  this.tick_function = function() { 
    this.current_time = Date.now()/1000 - this.start_time;

    if (this.pipes[0].x < -200) {
      this.pipes.splice(0, 1);
      this.pipes[this.pipes.length] = 
          new flappy_bird_pipe(this.pipes[this.pipes.length-1].x+this.pipe_interval, 200, 
                                200+Math.random()*300, this.pipe_jump_gap_size);
      this.pipe_counter++;
      this.pipe_last_added = Date.now()/1000;
    }

    for (let i in this.pipes) {
      this.pipes[i].update();
    }
    var str_make = "";
    
    for (let i in this.pipes) { str_make += this.pipes[i].make_data(i) + "\n"; }
    sessions[this.session_id].broadcast(str_make);
  }

  this.read_network_data = function(flag, message, usr_id) {
    //console.log(flag+":"+message);
    if (flag == "load_game") {
      this.user_loaded(usr_id);
    } else if (flag == "my_pos") {
      this.read_in_player_position(usr_id+","+message);
      sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
    } else if (flag == "jump_notice") {
      //sessions[this.session_id].broadcast_exclusive(this.players[usr_id].make_data(usr_id), [usr_id]);
      sessions[this.session_id].broadcast_exclusive("player_jump:"+usr_id, [usr_id]);
    } else if (flag == "dead_notice") {
      this.players[usr_id].is_dead = 1;
      this.game_result_json[sessions[this.session_id].clients_info[usr_id].name] = {
        "player_id" : usr_id,
        "coins_added" : 15+this.current_time
      }
      sessions[this.session_id].broadcast_exclusive("death:"+usr_id, [usr_id]);
      //sessions[this.session_id].broadcast("rmv_player:"+usr_id);
      this.players_alive == this.players.length;
      for (let i in this.players){
        console.log("player "+i+" dead -> "+this.players[i].is_dead)
        if (this.players[i].is_dead == 1) { this.players_alive--; }
      }
      console.log("player death; players alive: "+this.players_alive);
      if (this.players_alive <= 0 && !this.game_over) {
        this.game_over = 1;
        broadcast("end_game");
        var self = this;
        setTimeout(function(){ sessions[self.session_id].swap_current_state("game_end_screen");}, 3000);
      }
    } else if (flag == "debug") {
      console.log("client sent "+message);
    }
  }

  this.user_loaded = function(usr_id) {
    sessions[this.session_id].clients[usr_id].send("load_recieved");
    if (this.players[usr_id] === undefined) {
      this.players[usr_id] = new flappy_bird_player(500, 250);
      this.players_alive++;
    }
    this.set_player_y_positions();
    //console.log("A player loaded into da game "+usr_id);
    sessions[this.session_id].broadcast_exclusive("new_player:"+usr_id+"\n"+this.players[usr_id].make_data(usr_id), [usr_id]);
    sessions[this.session_id].clients[usr_id].send("player_count:" + clients.length + "\n" + "assigned_id:" + usr_id + "\n");
    sessions[this.session_id].clients[usr_id].send(this.make_everything());
  }

  this.user_disconnected = function(usr_id) {
    sessions[this.session_id].broadcast("rmv_player:"+usr_id);
    this.players.splice(usr_id, 1);
  }

  this.make_everything = function() {
    str_make = "";
    for (let i in this.players) { str_make += this.players[i].make_data(i) + "\n"; }
    for (let i in this.pipes) { str_make += this.pipes[i].make_data(i) + "\n"; }
    return str_make;
  }

  this.read_in_player_position = function(data) {
		p_vals = convert_data_string(data, [0], [1, 2, 3, 4, 5, 6], [7]);
		if (this.players[p_vals[0]] === undefined) {
			this.players[p_vals[0]] = new flappy_bird_player(500, 250);
      this.set_player_y_positions();
		}
		this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
	}

	this.read_in_pipe_position = function(data) { //format packet as pipe:x,y,pipeWidth
		p_vals = convert_data_string(data, [0], [1, 2, 3, 4, 5]);
		if (this.pipes[p_vals[0]] === undefined) {
			this.pipes[p_vals[0]] = new flappy_bird_pipe(10, 10, 10);
		}
		this.pipes[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5]);
	}
}

server_start();
