class game_1_player {
	constructor(spriteSheet, x, y, face) {
		this.spriteSheet = spriteSheet;
		this.sx = 0;        //Frame counter for when the player is moving.
		this.x = x;
		this.y = y;
		this.move = 0;      //Whether or not player is moving. Int is more convenient than boolean for network messages.
		this.speed = 5;     // Player movement speed
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for East West North South respectively
		this.sprite_row = 0;
		this.fruit_holding = 0;
		this.fruit_held_id = 0;
		this.bounds = [0, 2000, 0, 1000];
	}

	draw() {
		push();
		g_cam.translate(this.x, this.y);
		if (this.move == 1){
			if (this.facing < 2){
				scale(1-this.facing*2, 1);  
				g_cam.image(this.spriteSheet, null, null, 100, 100, 80*(this.sx+1), 0, 80, 80);
				this.x = this.x + this.speed * (1-this.facing*2);
			} else if (this.facing == 2) {
				g_cam.image(this.spriteSheet, null, null, 100, 100, 80*(this.sx), 400, 80, 80);
				this.y = this.y - this.speed;
			} else if (this.facing == 3) {
				g_cam.image(this.spriteSheet, null, null, 100, 100, 480 + 80*(this.sx), 400, 80, 80);
				this.y = this.y + this.speed;
			}

			this.x = Math.min(this.bounds[1]-40, Math.max(this.bounds[0]+40, this.x));    //Prevents the player from leaving the game boundaries.
			this.y = Math.min(this.bounds[3]-40, Math.max(this.bounds[2]+40, this.y));   

		}
		else {
			if (this.facing < 2){
				scale(1-this.facing*2, 1);  
				g_cam.image(this.spriteSheet, null, null, 100, 100, 0, 0, 80, 80);
			} else if (this.facing == 2) {
				g_cam.image(this.spriteSheet, null, null, 100, 100, 0, 400, 80, 80);
			} else if (this.facing == 3) {
				g_cam.image(this.spriteSheet, null, null, 100, 100, 480, 400, 80, 80);
			}
		}
		
		if (frameCount % 6 == 0) {
			this.sx = (this.sx + 1) % 6;
		}

		pop();
	}

	grab_fruit(fruit_id, size){
		this.fruit_holding = 1;
		this.fruit_held_id = fruit_id;
		this.speed = 15/size;
	}

	drop_fruit(){
		this.speed = 5;
		this.fruit_holding = 0;
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

	make_data_raw(){
		return this.x+","+this.y+","+this.move+","+
						this.speed+","+this.facing+","+this.fruit_holding+","+this.fruit_held_id;
	}

	make_data(player_index){
		var string_make = "pos_player:"+player_index+","+this.x+","+this.y+","+this.move+","+
											this.speed+","+this.facing+","+this.fruit_holding+","+this.fruit_held_id;
		return string_make;
	}
}

class game_1_fruit {

	/*
	network commands:
	make_fruit:x,y,size
	upd_fruit:x,y,size,held,scored,player_holding_id //from server

	*/

	constructor(spriteSheet, x, y, size) {
		this.spriteSheet = spriteSheet;
		this.x = x;
		this.y = y;
		this.size = int(size);
		this.held = 0;
		this.scored = 0;
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
		g_cam.translate(this.x, this.y);
		g_cam.image(this.spriteSheet, null, null, 20, 20, 20*(this.sprite_select), 0, 20, 20);
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
			this.held = 1;
			this.player_holding_id = player_index;
		}
	}

	drop() {
		this.held = 0;
	}

	update_data(x, y, size, held, scored, player_holding_id) {
		if (!(isNaN(x)) && x != null) {this.x = x;}
		if (!(isNaN(y)) && y != null) {this.y = y;}
		if (!(isNaN(size)) && size != null) {this.size = size;}
		if (!(isNaN(held)) && held != null) {this.held = held;}
		if (!(isNaN(scored)) && scored != null) {this.scored = scored;}
		if (!(isNaN(player_holding_id)) && player_holding_id != null) {this.player_holding_id = player_holding_id;}
		if (this.size > 12) { this.sprite_select = 3; }
		else if (this.size > 10) { this.sprite_select = 2; } 
		else if (this.size > 7) { this.sprite_select = 1; } 
		else { this.sprite_select = 0; }
	}

	make_data(index) {
		var str_make = "pos_fruit:"+str(index)+","+str(this.x)+","+str(this.y)+","+
										str(this.size)+","+str(this.held)+","+str(this.scored)+","+str(this.player_holding_id);
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
		push();
		text_make(0, 30, 0, 1);
		fill(255, 204, 0);
		g_cam.rect(this.x, this.y, this.width, this.height);
		fill(0, 0, 0);
		g_cam.text(str(this.score), this.x, this.y);
		pop();
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
		return "upd_endzone:"+str(index)+","+str(this.x)+","+str(this.y)+","+str(this.width)+","+str(this.height)+","+str(this.score);
	}

}