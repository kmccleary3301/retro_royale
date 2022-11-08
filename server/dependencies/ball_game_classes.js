function seed_random(seed) {
	var x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

class game_2_ball {
	constructor(spriteSheet, x, y, face) {
		this.temp_sprite_sheet = spriteSheet;
		this.sprite_anim = new sprite_animation_object(spriteSheet, 100, 80, 80,
			{
				"left_right": {
					"row": 0,
					"row_length": 6
				},
				"down": {
					"row": 1,
					"row_length": 6
				},
				"up": {
					"row": 2,
					"row_length": 6
				}
			});
		this.radius = 50;
		this.x = 0;
		this.y = 0;
		this.move = 0;
		this.dx = 1;
		this.dy = 1;
		this.speed = 300;
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
		this.current_tile_index = 0;
		this.previous_tile_index = 0;
		this.last_update = Date.now()/1000;
	}

	update(seed_random, random_seed) {
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
		
	}


	make_data(id) {
		var str_make = "ball_pos:";
		str_make += id + "," + this.x + "," + this.y + "," + this.dx + ","
							+ this.dy + "," + this.speed;
		return str_make;
	}

draw() {
	//if (this.move == 0) { this.sprite_anim.stop(); }
	if (this.move) {
		if (this.facing == "left") { this.x -= this.speed * (millis()/1000 - this.last_update); }
		else if (this.facing == "right") { this.x += this.speed * (millis()/1000 - this.last_update); }
		else if (this.facing == "up") { this.y -= this.speed * (millis()/1000 - this.last_update); }
		else if (this.facing == "down") { this.y += this.speed * (millis()/1000 - this.last_update); }
		this.last_update = millis()/1000;
	}
	text_make(0, 20, 0, 1);
	fill(0, 0, 255);
	g_cam.text(this.name, this.x, this.y+60);
	this.sprite_anim.draw(this.x, this.y, true);
	pop();
 }
}


class ball_game_player {
  constructor(x, y, face) {
    this.sx = 0;
    this.x = x;
    this.y = y;
    this.move = 0;
    this.speed = 5;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    this.isDead = 0;

  }

  get_pos_string(){
	var string_make = str(this.x)+","+str(this.y)+","+str(this.move)+","+str(this.facing);
	return string_make;
  }
  
  update_facing(facing) {
	  if (facing == this.facing) { return; }
	  this.facing = facing;
	  if (facing == "left" || facing == "right") {
		  this.sprite_anim.change_animation("left_right");
		  if (facing == "left") { this.sprite_anim.flip(1); }
		  else { this.sprite_anim.flip(0); }
	  } else if (facing == "up") {
		  this.sprite_anim.flip(0);
		  this.sprite_anim.change_animation("up");
	  } else if (facing == "down") {
		  this.sprite_anim.flip(0);
		  this.sprite_anim.change_animation("down");
	  }
  }

  update_moving(value) {
	  if (value == this.move) { return; }
	  if (value) {
		  this.move = 1;
		  this.last_update = millis()/1000;
		  this.sprite_anim.start();
	  } else {
		  this.move = 0;
		  this.sprite_anim.stop();
	  }
  }

  update_data(sprite, x, y, move, speed, facing, current_tile_index, previous_tile_index, name){
	//if (sprite != null) {this.spriteSheet = }
	if (x != null) { this.x = x; }
	if (y != null) { this.y = y; }
	if (move != null) { this.move = move; }
	if (speed != null) { this.speed = speed; }
	if (facing != null) { this.update_facing(facing); }
	if (current_tile_index != null) { this.current_tile_index = current_tile_index; }
	if (previous_tile_index != null) { this.previous_tile_index = previous_tile_index; }
	  if (name != null) { this.name = name; }
  }

  make_data_raw(){
	return this.x+","+this.y+","+this.move+","+this.speed+","+this.facing+","+this.current_tile_index+","+
					  this.previous_tile_index+","+this.name;
  }

  make_data(player_index){
	return "pos_player:"+player_index+","+this.make_data_raw();
  }
}


module.exports = {game_2_ball, ball_game_player};
