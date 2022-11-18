class fighting_game_player {
	constructor(x, y, face, color) {
		this.spriteColor = color;
		this.sx = 0;
		this.x = x;
		this.y = y;
		this.dx = 0;
		this.dy = 0;
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
		this.health = 100;
		this.isAttacking = 0;
		this.isDucking = 0;
		this.current_animation = "standing";
	}

	make_data_raw() {
		return this.x+","+this.y+","+this.dx+","+this.dy+","+this.facing+","+this.health+","+this.isAttacking+","+this.isDucking;
	}

	make_data(player_index){
		var string_make = "pos_player:"+player_index+","+this.make_data_raw();
		return string_make;
	}

	update_data(x, y, dx, dy, facing, health, isAttacking, isDucking, animation) {
		if (x != null) { this.x = x; }
		if (y != null) { this.y = y; }
		if (dx != null) { this.dx = dx; } //copilot changed this to += from =, not sure if it's right
		if (dy != null) { this.dy = dy; } //copilot changed this to += from =, not sure if it's right
		if (facing != null) { this.facing = facing; }
		if (health != null) { this.health = health; }
		if (isAttacking != null) { this.isAttacking = isAttacking; }
		if (isDucking != null) { this.isDucking = isDucking; } 
		if (animation != null) { this.current_animation = animation; }
	}
}

module.exports = {fighting_game_player};