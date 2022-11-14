class game_1_player {
	constructor(x, y, face, color) {
		this.sx = 0;
		this.x = x;
		this.y = y;
		this.move = 0;
		this.speed = 5;
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
		this.fruit_holding = 0;
		this.fruit_held_id = 0;
    this.spriteColor = color;
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

module.exports = {game_1_player, game_1_fruit, game_1_endzone};