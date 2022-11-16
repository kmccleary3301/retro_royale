class flappy_bird_pipe {
  constructor(x_offset, pipe_width, pipe_gap_y_pos, pipe_gap_width) {
    this.x = x_offset;
    this.x_offset = x_offset;
    this.pipe_width = pipe_width;
    this.pipe_gap_width = pipe_gap_width;
    this.pipe_gap_y_pos = pipe_gap_y_pos;
    this.last_update = Date.now()/1000;
  }

  update() {
    this.x -= 200*(Date.now()/1000 - this.last_update);
		this.last_update = Date.now()/1000;
  }

  make_data_raw() {
    return this.x_offset+","+this.x+","+this.pipe_width+","+this.pipe_gap_y_pos+","+this.pipe_gap_width;
  }

  make_data() {
    if (arguments[0] === undefined) {
      return "pipe_pos:"+this.make_data_raw();
    } else {
      return "pipe_pos:"+arguments[0]+","+this.make_data_raw();
    }
  }
}

class flappy_bird_player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.last_jump = Date.now()/1000;
    this.y_on_last_jump = this.y;
    this.acceleration = -100;
    this.is_dead = 0;
  }

  make_data_raw() {
    return this.x+","+this.y+","+this.last_jump+","+this.y_on_last_jump+","+this.acceleration+","+this.is_dead;
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


module.exports = {flappy_bird_pipe, flappy_bird_player};