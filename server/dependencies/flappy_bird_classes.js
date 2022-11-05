class flappy_bird_pipe {
	constructor(x,y, pipeWidth) {
		this.pipeWidth = pipeWidth;
		this.x = x;
		this.y = y;
	}
	make_data() {
		return "pipe:"+this.x+","+this.y+","+this.pipeWidth;
	}
}

class flappy_bird_player {
  constructor(x, y, face) {
    this.sx = 0;
    this.x = x;
    this.y = y;
    this.xVelocity = 400; //pixels per second
    this.velocity = 0;
		this.acceleration = -130; //pixels per second per second
    this.move = 0;
    this.speed = 5;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    this.fruit_holding = 0;
    this.fruit_held_id = 0;
  }

  jump() {
    this.velocity = 1100;
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
}//player advances through x and pipes are stationary
//when the pipes can't be seen, don't draw them

module.exports = {flappy_bird_pipe, flappy_bird_player};