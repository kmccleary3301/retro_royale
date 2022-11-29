class game_1_player {
	constructor(spriteSheet, x, y, face, color) {
		this.spriteColor = color;
		this.sprite_anim = new sprite_animation_object(spriteSheet, 50, 64, 64,
		{
			"left_right": {
				"row": 1+10*this.spriteColor,
				"row_length": 4
			},
			"down": {
				"row": 0+10*this.spriteColor,
				"row_length": 4
			},
			"standing" : {
				"row" : 1+10*this.spriteColor,
				"row_length": 1,
				"first_tile": 1
			},
			"up": {
				"row": 2+10*this.spriteColor,
				"row_length": 4
			}
		});
		this.sx = 0;        //Frame counter for when the player is moving.
		this.x = x;
		this.y = y;
		this.move = 0;      //Whether or not player is moving. Int is more convenient than boolean for network messages.
		this.speed = 400;     // Player movement speed
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for East West North South respectively
		this.sprite_row = color*640;
		this.fruit_holding = 0;
		this.fruit_held_id = 0;
		this.last_update = millis()/1000;
		this.bounds = [0, 2000, 0, 1000];
		this.frame_size = 64;
	}

	draw() {
		push();
    
		//if(this.move == 0) { this.sprite_anim.stop(); }
    if(this.isDead == 1){
      console.log("line 112");
      //this.update_anim("dead");
    }
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

  update_anim(animation) {
    if(animation == this.current_animation) {return;}
    if(animation == "dead")  
    {
      console.log("line 135");
      this.move = 0; 
      this.sprite_anim.stop(); 
    }
    else {this.move = 1; this.sprite_anim.start(); }
    this.sprite_anim.change_animation(animation);
    this.current_animation = animation;
    }
	
	update_facing(facing) {
		if (facing == this.facing) { return; }
		this.facing = facing;
		if (facing == "left" || facing == "right") {
			this.sprite_anim.change_animation("left_right");
			if (facing == "left") { this.sprite_anim.flip(1); }
			else { this.sprite_anim.flip(0); }
		} else if (facing == "up") {
			this.sprite_anim.flip(3);
			this.sprite_anim.change_animation("up");
		} else if (facing == "down") {
			this.sprite_anim.flip(4);
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

	grab_fruit(fruit_id, size){
		this.fruit_holding = 1;
		this.fruit_held_id = fruit_id;
		this.speed = 400/size;
	}

	drop_fruit(){
		this.speed = 400;
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
		if (move != null) { this.update_moving(move); }
		if (speed != null) { this.speed = speed; }
		if (facing != null) { this.update_facing(facing); }
		if (fruit_holding != null) { this.fruit_holding = fruit_holding; }
		if (fruit_id != null) { this.fruit_held_id = fruit_id; }
	}

	make_data_raw(){
		return this.x+","+this.y+","+this.move+","+
						this.speed+","+this.facing+","+this.fruit_holding+","+this.fruit_held_id;
	}

	make_data(player_index){
		var string_make = "pos_player:"+player_index+","+this.make_data_raw();
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
		this.record = loadImage(repo_address+"media/misc/record.png");
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
		//g_cam.image(this.spriteSheet, null, null, 20, 20, 20*(this.sprite_select), 0, 20, 20);
		g_cam.image(this.record, null, null, 20, 20);

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
	constructor(x1, y1, width, height) {
		this.x = x1;
		this.y = y1;
		this.width = width;
		this.height = height;  
		this.score = 0;
	}

	draw(){
		push();
		text_make(0, 30, 0, 1);
		//fill(255, 204, 0);
		rectMode
		stroke(0, 0, 0);
		g_cam.rect(this.x, this.y, this.width, this.height);
		fill(243, 199, 82);
		g_cam.text(str(this.score), this.x, this.y);
		pop();
	}

	check_placement(x, y){
		x -= this.x;
		y -= this.y;
		if ((Math.abs(x) <= this.width/2) && (Math.abs(y) <= this.height/2)) {
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

	make_data_raw() {
		return str(this.x)+","+str(this.y)+","+str(this.width)+","+str(this.height)+","+str(this.score)
	}

	make_data(index){
		return "upd_endzone:"+str(index)+","+this.make_data_raw();
	}

}