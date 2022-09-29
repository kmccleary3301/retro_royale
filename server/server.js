/*
  Websocket server with express.js and express-ws.js
  (https://www.npmjs.com/package/express-ws)
  Serves an index page from /public. That page makes
  a websocket client back to this server.

  created 17 Jan 2021
  by Tom Igoe
*/


let global_port = 3128;
var express = require('express');			    // include express.js
// a local instance of express:
var server = express();
// instance of the websocket server:
var wsServer = require('express-ws')(server);
// list of client connections:
var clients = new Array;
var clients_hash = new Array;

// serve static files from /public:
server.use('/', express.static('public'));

// this runs after the server successfully starts:
function serverStart() {
  var port = this.address().port;
  console.log('Server listening on port ' + port);
}

function handleClient(thisClient, request) {
  console.log("New Connection");        // you have a new client
  clients.push(thisClient);    // add this client to the clients array
  function endClient() {
    // when a client closes its connection
    // get the client's position in the array
    // and delete it from the array:
    var position = clients.indexOf(thisClient);
    broadcast("rmv_player:"+position);
    clients.splice(position, 1);
    console.log("connection closed");
  }

  // if a client sends a message, print it out:


  function clientResponse(data) {
    var lines = data.split("\n");
    var index = clients.indexOf(thisClient);
    for (let i in lines) {
      var line_pieces = lines[i].split(":");
      var flag = line_pieces[0]
      if (line_pieces.length > 1) {
        var message = line_pieces[1];
      }

      if (flag == "connected") {
        console.log("connected recieved");
        thisClient.send("connected");
        var pos_message = index + "," + (100+400*Math.random()) + "," + (100+400*Math.random()) + ",0,1"
        var message = "player_count:" + clients.length + "\n" +
                      "assigned_id:" + index + "\n" +
                      "pos_player:" + pos_message;
        thisClient.send(message);
        for (let i in clients) {
          if (i != index) {
            clients[i].send("new_player:" + pos_message);
          }
        }
      } else if (flag == "my_pos") {
        var message_make = "pos_player:"+index+","+message;
        for (let c in clients) {
          if (c != index) {
            clients[c].send(message_make);
          }
        }
      }
      
    }
    
    console.log(request.connection.remoteAddress + ': ' + data);
    //broadcast(data);
  }

  // set up client event listeners:
  thisClient.on('message', clientResponse);
  thisClient.on('close', endClient);

}
// This function broadcasts messages to all webSocket clients
function broadcast(data) {
  // iterate over the array of clients & send data to each
  for (let c in clients) {
    clients[c].send(data);
  }
}

// start the server:
server.listen(process.env.PORT || global_port, serverStart);
// listen for websocket connections:
server.ws('/', handleClient);


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
