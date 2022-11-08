function seed_random(seed) {
	var x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
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
}

class ball_game_player {
  constructor(x, y, face, color, spriteSheet) {
    this.sx = 0;
    this.x = x;
    this.y = y;
    this.move = 0;
    this.speed = 5;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    this.isDead = 0;
	this.spriteColor = color;
	

  }

  make_data(player_index){
    var string_make = "pos_player:"+player_index+","+this.x+","+this.y+","+this.move+","+
                      this.speed+","+this.facing;
    return string_make;
  }

  update_data(sprite, x, y, move, speed, facing){
    if (x != null) { this.x = x; }
    if (y != null) { this.y = y; }
    if (move != null) { this.move = move; }
    if (speed != null) { this.speed = speed; }
    if (facing != null) { this.facing = facing; }


  }
  update_anim(animation) {
	if(animation == this.current_animation) {return;}
	if(animation == "dead") {this.move = 0; this.sprite_anim.stop(); }
	else {this.move = 1; this.sprite_anim.start(); }
	this.sprite_anim.change_animation(animation);
	this.current_animation = animation;
  }
}

module.exports = {game_2_ball, ball_game_player};