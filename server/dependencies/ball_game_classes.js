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
		this.speed = 100;
		this.last_update = Date.now()/1000;
	}

	update(seed_random, random_seed) {
		var bounce_flag = false;
      this.x += this.dx*this.speed*(Date.now()/1000 - this.last_update);
      this.y += this.dy*this.speed*(Date.now()/1000 - this.last_update);
      if (this.x < 0 || this.x >= 500) {
        var adjust_factor = Math.max(0, Math.min(this.x, 500)) - this.x;
        adjust_factor /= this.dx;
        var mid_time = -adjust_factor/this.speed;
        this.x += this.dx*adjust_factor;
        this.y += this.dy*adjust_factor;
        
        this.dx *= -1;
        this.dx -= 0.3*seed_random(random_seed+this.dx)-0.15;
        bounce_flag = true;
      }
      if (this.y < 0 || this.y >= 500) {
        var adjust_factor = Math.max(0, Math.min(this.y, 500)) - this.y;
        adjust_factor /= this.dy;
        var mid_time = -adjust_factor/this.speed;
        this.x += this.dx*adjust_factor;
        this.y += this.dy*adjust_factor;
        this.dy *= -1;
        this.dy += 0.3*seed_random(random_seed+this.dy+0.1)-0.15;
        bounce_flag = true;
        
      }
      if (bounce_flag) {
        var factor = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
        this.dy /= factor;
        this.dx /= factor;
        this.x += this.dx*this.speed*mid_time;
        this.y += this.dy*this.speed*mid_time;
      }
      this.last_update = Date.now()/1000;
		
	}

	make_data(id) {
		var str_make = "ball_pos:";
		str_make += id + "," + this.x + "," + this.y + "," + this.dx + ","
							+ this.dy + "," + this.speed;
		return str_make;
	}
}

class ball_game_player {
  constructor(x, y, face, color) {
    this.spriteColor = color;
	this.sx = 0;
    this.x = x;
    this.y = y;
	this.move = 0;
	this.speed = 300;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    this.isDead = 0;
	this.spriteColor = color;
	this.current_animation = "left_right";
  }

  update_data(x, y, move, speed, facing, is_dead, animation, name){
	//if (sprite != null) {this.spriteSheet = }
	if (x != null) { this.x = x; }
	if (y != null) { this.y = y; }
	if (move != null) { this.move = move; }
	if (speed != null) { this.speed = speed; }
  	if (is_dead != null) {this.isDead = this.is_dead; }
	if (facing != null) { this.facing = facing; }
	if (name != null) { this.name = name; }
	if (animation != null) {this.animation = animation;}
  }

  make_data_raw(){
	return this.x+","+this.y+","+this.move+","+this.speed+","+this.facing+","+this.isDead+","+this.animation+","+this.name;
  }

  make_data(player_index){
	return "pos_player:"+player_index+","+this.make_data_raw();
  }
  
}

module.exports = {game_2_ball, ball_game_player};