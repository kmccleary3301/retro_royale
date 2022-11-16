class board_game_player { 
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
		this.coins = 0;
		this.stars = 0;
		this.x = x;
		this.y = y;
		this.move = 0;
		this.speed = 5;
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
		this.current_tile_index = 0;
		this.previous_tile_index = 0;
		this.last_update = millis()/1000;
		this.name = "temp name";
		this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];
	}
	
	draw() {
		push();


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

	update_data(x, y, move, speed, facing, current_tile_index, previous_tile_index, name, coins, stars){
		//if (sprite != null) {this.spriteSheet = }
		if (x != null) { this.x = x; }
		if (y != null) { this.y = y; }
		if (move != null) { this.move = move; }
		if (speed != null) { this.speed = speed; }
		if (facing != null) { this.update_facing(facing); }
		if (current_tile_index != null) { this.current_tile_index = current_tile_index; }
		if (previous_tile_index != null) { this.previous_tile_index = previous_tile_index; }
	  if (name != null) { this.name = name; }
	  if (coins != null) {this.coins = coins; }
	  if (stars != null) {this.stars = stars; }
	}
	
	make_data_raw(){
		return this.x+","+this.y+","+this.move+","+this.speed+","+this.facing+","+this.current_tile_index+","+
						  this.previous_tile_index+","+this.name+","+this.coins+","+this.stars;
	}
	  
  make_data(player_index){
		return "pos_player:"+player_index+","+this.make_data_raw();
	}
}

class board_game_tile {
	constructor(sprite, tile_x, tile_y, tile_type, tile_access_directions) {
		this.sprite_anim = new sprite_animation_object(sprite, 100, 40, 40,
			{
				"empty": {
					"row": 0,
					"row_length": 1
				},
				"gain_coins": {
					"row": 1,
					"row_length": 1
				},
				"lose_coins": {
					"row": 2,
					"row_length": 1
				},
				"versus": {
					"row": 3,
					"row_length": 1
				},
				"trap": {
					"row": 4,
					"row_length": 1
				},
				"star": {
					"row": 5,
					"row_length": 1
				}
			});
		this.tile_x = tile_x;
		this.tile_y = tile_y;
		this.x = 80 + 160*this.tile_x;
		this.y = 80 + 160*this.tile_y;
		this.type = tile_type;
		this.directions = tile_access_directions;
		this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];
		this.connected_tiles = {
			"right" : {
				"connected" : 0,
				"is_child": 0,
				"is_parent": 0,
				"tile_id": 0
			},
			"left": {
				"connected" : 0,
				"is_child": 0,
				"is_parent": 0,
				"tile_id": 0
			},
			"up": {
				"connected" : 0,
				"is_child": 0,
				"is_parent": 0,
				"tile_id": 0
			},
			"down": {
				"connected" : 0,
				"is_child": 0,
				"is_parent": 0,
				"tile_id": 0
			},
		};
		this.sprite_anim.change_animation(this.type);
	}

	draw() {
		push();
		this.sprite_anim.draw(this.x, this.y, true);
		pop();

	}

	make_child(direction, id) {
		this.connected_tiles[direction]["connected"] = 1;
		this.connected_tiles[direction]["is_child"] = 1;
		this.connected_tiles[direction]["tile_id"] = id;
	}

	make_parent(direction, id) {
		this.connected_tiles[direction]["connected"] = 1;
		this.connected_tiles[direction]["is_parent"] = 1;
		this.connected_tiles[direction]["tile_id"] = id;
	}

	check_child (direction) {
		return (this.connected_tiles[direction]["connected"] && this.connected_tiles[direction]["is_child"]); 
	}

	update_data(tile_x, tile_y, x, y, type, r1, r2, r3, 
						r4, l1, l2, l3, l4, u1, u2, u3, u4, d1, d2, d3, d4) {
		if (tile_x != null) { this.tile_x = tile_x; }
		if (tile_y != null) { this.tile_y = tile_y; }
		if (x != null) { this.x = x; }
		if (y != null) { this.y = y; }
		if (type != null) {this.type = type; }
		var connected_tiles_array = [[r1, r2, r3, r4], [l1, l2, l3, l4], [u1, u2, u3, u4], [d1, d2, d3, d4]];
		for (let i in Object.keys(this.connected_tiles)) {
			var key_1 = Object.keys(this.connected_tiles)[i];
			for (let j in Object.keys(this.connected_tiles[key_1])) {
				var key_2 = Object.keys(this.connected_tiles[key_1])[j];
				if (connected_tiles_array[i][j] != null) { this.connected_tiles[key_1][key_2] = connected_tiles_array[i][j]; }
			}
		}
	}

	make_data_raw() {
		str_make = this.tile_x + ","+this.tile_y+","+this.x+","+this.y+","+this.type;
		for (let i in this.connected_tiles) {
			for (let j in this.connected_tiles[i]) { str_make += ","+this.connected_tiles[i][j]; }
		}
	}

	make_data(tile_id){
		return "tile_pos:"+tile_id+","+this.make_data_raw();
	}
}

class message_display_element {
	constructor(text_display, expiration_time) {
		this.string = text_display;
		this.start_time = millis()/1000;
		this.current_time = 0; 
		this.text_size = 50; //make this adaptable
		this.expire = expiration_time;
		this.expired = false;
		this.next_display_element = false;
		this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];
	}

	draw() {
		push();
		this.current_time = millis()/1000 - this.start_time;
		text_make(1, 50,  0, 2);
		var text_position_x = sigmoid_array([width*2, width/2, -width], [0, 1.5, 3], [1.5, 3], this.current_time),
				box_position_x = sigmoid_array([-width, width/2, width*2], [0, 1.5, 3], [1.5, 3], this.current_time),
				box_width = Math.max(350, 30*this.string.length), box_height = 100;
		fill(this.blue);
		rectMode(CENTER);
		rect(box_position_x, height/2, box_width, box_height);
		var r_color = rainbow_gradient(this.current_time);
		fill(r_color[0], r_color[1], r_color[2]);
		textAlign(CENTER, CENTER);
		text(this.string, text_position_x, height/2);
		if (this.current_time > this.expire) { this.expired = true; }
		pop();
	}
}

class dice_display_element {
	constructor(expiration_time, elements, element_weights, font) {
		var sum = 0;
		for (let i in element_weights) {sum += element_weights[i]};
		for (let i in element_weights) {element_weights[i] /= sum};
		this.display_list = [];
		for (i = 0; i < 10; i++) {
			this.display_list[i] = select_random_element(elements, element_weights);
		}
		this.start_time = millis()/1000;
		this.current_time = 0; 
		this.text_size = 50; //make this adaptable
		this.font = font;
		this.expire = expiration_time;
		this.expired = false;
		this.draw_offset = Math.random()-0.5;
		this.chosen_value = this.display_list[Math.round(this.display_list.length/4 + 1)];
		this.next_display_element = false;
		console.log("display list: "+str(this.display_list));
		this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];
		var eff_txt_size = 0.5*this.text_size*font_size_scaling[this.font];

		this.max_list_size = eff_txt_size*str(this.display_list[0]).length;
		for (let i in this.display_list) { 
			if (eff_txt_size*str(this.display_list[i]).length > this.max_list_size) { 
				this.max_list_size = eff_txt_size*str(this.display_list[i]).length; 
			}
		}
	}
	
	update_elements() {
		this.offset = arguments[0];
		for (let i in arguments) {
			if (i == 0) { continue; }
			this.display_list[i-1] = arguments[i];
		}
		this.chosen_value = this.display_list[Math.round(this.display_list.length/4 + 1)];
		var eff_txt_size = 0.5*this.text_size*font_size_scaling[this.font];
		this.max_list_size = eff_txt_size*str(this.display_list[0]).length;
		for (let i in this.display_list) { 
			if (eff_txt_size*str(this.display_list[i]).length > this.max_list_size) { 
				this.max_list_size = eff_txt_size*str(this.display_list[i]).length; 
			}
		}
	}

	draw() {
		push();
		this.current_time = millis()/1000 - this.start_time;
		var dice_length = this.expire*0.985;
		var breakpoint = dice_length*0.9;
		text_make(this.font, this.text_size,  0, 2);
		stroke(0, 0, 0);
		var r_color = rainbow_gradient(this.current_time);
		textAlign(CENTER, CENTER);
		if (this.current_time < breakpoint) {
			var t_cen = width/2 - Math.max(100, this.max_list_size)/2 - 5 - 5;
			fill(color(0, 0, 0));
			triangle(t_cen + 5*Math.cos(0), height/2+5*Math.sin(0),
					t_cen+5*Math.cos(Math.PI*2/3), height/2+5*Math.sin(Math.PI*2/3),
					t_cen+5*Math.cos(Math.PI*4/3), height/2+5*Math.sin(Math.PI*4/3));
			for (let i in this.display_list) {
				var time_element = this.current_time-1+Math.max(1, Math.exp(0.2*(this.current_time)));
				//if (this.current_time > dice_length-3) { x1 += (x1-(dice_length-3))^3; }
				var position = Math.exp(-(6.5/breakpoint)*time_element+2);
				var text_y_pos = height*(0.5+position)+2*height*(i-2)/this.display_list.length;
				text_y_pos += (this.display_list.length%4)*height/(2*this.display_list.length);
				text_y_pos += 2*height*this.draw_offset/this.display_list.length
				text_y_pos = text_y_pos%(height*2)-height*0.5;
				fill(r_color[0], r_color[1], r_color[2]);
				stroke(0, 0, 0);
				strokeWeight(1);
				text(this.display_list[i], width/2, text_y_pos);
				fill(color(0, 0, 0, 0));
				rectMode(CENTER);
				stroke(0, 0, 0);
				strokeWeight(5);
				rect(width/2, text_y_pos, Math.max(100, this.max_list_size), 2*height/this.display_list.length);
			}
		} else {
			fill(this.blue);
			var frequency = 0.3;
			var time_set = this.expire - breakpoint;
			if (true) {
				rectMode(CENTER);
				fill(this.blue);
				var factor_1 = Math.min(1, (this.current_time-breakpoint)*3/time_set);
				var factor_2 = Math.min(1, 1+(breakpoint+time_set*2/3-this.current_time)*3/time_set);
				factor_1 *= factor_2;
				factor_1 = Math.pow(factor_1, 3);
				factor_2 = Math.pow(factor_2, 3);
				rect(width/2, height/2, Math.max(100, this.max_list_size)*factor_1, 60*factor_1);
				text_make(this.font, factor_2*this.text_size,  0, 2);
			}
			fill(r_color[0], r_color[1], r_color[2]);
			text(this.chosen_value, width/2, height/2);
		}
		if (this.current_time > this.expire) { this.expired = true; }
		pop();
	}
}
