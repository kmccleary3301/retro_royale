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

class bird_pipe_2 {
  constructor(x_offset, pipe_width, pipe_gap_y_pos) {
    this.x = x_offset;
    this.x_offset = x_offset;
    this.pipe_width = pipe_width;
    this.pipe_gap_y_pos = pipe_gap_y_pos;
    this.last_update = Date.now()/1000;
  }

  update() {
    this.x -= 200*(Date.now()/1000 - this.last_update);
		this.last_update = Date.now()/1000;
  }

  make_data_raw() {
    return this.x_offset+","+this.x+","+this.pipe_width+","+this.pipe_gap_y_pos;
  }

  make_data() {
    if (arguments[0] === undefined) {
      return "pipe_pos:"+this.make_data_raw();
    } else {
      return "pipe_pos:"+arguments[0]+","+this.make_data_raw();
    }
  }
}

class flappy_bird_player_2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.last_jump = Date.now()/1000;
    this.y_on_last_jump = this.y;
    this.acceleration = -100;
    //this.acceleration = 0;
    this.hasJumped = false;
  }

  make_data_raw() {
    return this.x+","+this.y+","+this.last_jump+","+this.y_on_last_jump+","+this.acceleration;
  }

  make_data(){
    if (arguments[0] === undefined) {
      return "pos_player:"+this.make_data_raw();
    } else {
      return "pos_player:"+arguments[0]+","+this.make_data_raw();
    }
  }

  update_data(x, y, last_jump, y_on_last_jump, acceleration){
    if (x != null) { this.x = x; }
    if (y != null) { this.y = y; }
    if (last_jump != null) { this.last_jump = last_jump; }
    if (y_on_last_jump != null) { this.y_on_last_jump = y_on_last_jump; }
    if (acceleration != null) { this.acceleration = acceleration; }
  }
}

class flappy_bird_player {
  constructor(x, y, face) {
    this.sx = 0;
    this.x = x;
    this.y = y;
    this.xVelocity = 400; //pixels per second
    this.velocity = 0;
		this.acceleration = -125; //pixels per second per second
    //this.acceleration = 0;
    this.move = 0;
    this.speed = 5;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    //this measures whether the player has jumped, and when to start dropping them
    this.hasJumped = false;
    this.fruit_holding = 0;
    this.fruit_held_id = 0;
  }

  jump() {
    this.velocity = 900;
    //this.velocity = 10;
  }

  make_data(player_index){
    var string_make = "pos_player:"+player_index+","+this.x+","+this.y+","+this.move+","+
                      this.speed+","+this.facing+","+this.fruit_holding+","+this.fruit_held_id+
                      ","+this.velocity;
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

module.exports = {flappy_bird_pipe, flappy_bird_player, bird_pipe_2, flappy_bird_player_2};