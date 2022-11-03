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
		this.x = x;
		this.y = y;
		this.move = 0;
		this.speed = 5;
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
		this.current_tile_index = 0;
		this.previous_tile_index = 0;
		this.last_update = millis()/1000;
		this.name = "temp name";
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

class board_game_tile {
	constructor(tile_x, tile_y, tile_type, tile_access_directions) {
		this.tile_x = tile_x;
		this.tile_y = tile_y;
		this.x = 80 + 160*this.tile_x;
		this.y = 80 + 160*this.tile_y;
		this.type = tile_type;
		this.directions = tile_access_directions;
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
	}

	draw() {
		push();
		if (this.type == 0) { fill(0, 0, 125); }
		else if (this.type == 1) { fill(250, 0, 0); }
		else if (this.type == 2) { fill(0, 250, 0); }
		else if (this.type == 3) { fill(180, 0, 180); }
		else if (this.type == 4) { fill(255, 78, 0); }
		else if (this.type == 5) { fill(255, 255, 0); }
		stroke(50);
		strokeWeight(5);
		g_cam.ellipse(this.x, this.y, 100, 100);

		for (let i in Object.keys(this.connected_tiles)) {
			var key = Object.keys(this.connected_tiles)[i];
			//if (!(this.connected_tiles[key]["is_child"])) { continue; }

			var angle;
			if (key == "left") { angle = Math.PI*(1); }
			else if (key == "right") { angle = 0; }
			else if (key == "up") { angle = Math.PI/2; }
			else if (key == "down") { angle = Math.PI*3/2; }

			/*
			var x1 = 110*Math.cos(angle), y1 = 110*Math.sin(angle);
			var x2 = x1 + 20*Math.cos(angle+Math.pi/2), y2 = y1 + 20*Math.sin(angle + Math.pi/2);
			var x3 = (x1+x2)/2 + 20*Math.cos(angle), y3 = (y1+y2)/2 + 20*Math.sin(angle);
			x1 += this.x; x2 += this.x; x3 += this.x;
			y1 += this.y; y2 += this.y; y3 += this.y;

			fill(0, 0, 0);
			g_cam.triangle(x1, y1, x2, y2, x3, y3);
			*/
		}
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
	}

	draw() {
		this.current_time = millis()/1000 - this.start_time;
		text_make(1, 50,  0, 2);
		var text_position_x = sigmoid_array([width*2, width/2, -width], [0, 1.5, 3], [1.5, 3], this.current_time),
				box_position_x = sigmoid_array([-width, width/2, width*2], [0, 1.5, 3], [1.5, 3], this.current_time),
				box_width = 350, box_height = 100;
		fill(255, 78, 0);
		rect(box_position_x - box_width/2, height/2 - box_height/2, box_width, box_height);
		var r_color = rainbow_gradient(this.current_time);
		fill(r_color[0], r_color[1], r_color[2]);
		textAlign(CENTER, CENTER);
		text(this.string, text_position_x, height/2);
		if (this.current_time > this.expire) { this.expired = true; }
	}
}

class dice_display_element {
	constructor(expiration_time, elements, element_weights) {
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
		this.expire = expiration_time;
		this.expired = false;
		this.chosen_value = this.display_list[Math.round(this.display_list.length/4 + 1)];
		this.next_display_element = false;
		console.log("display list: "+str(this.display_list));
	}

	draw() {
		this.current_time = millis()/1000 - this.start_time;
		var dice_length = this.expire*5/6;
		text_make(1, 50,  0, 2);
		var r_color = rainbow_gradient(this.current_time);
		fill(r_color[0], r_color[1], r_color[2]);
		textAlign(CENTER, CENTER);
		if (this.current_time < dice_length*0.8) {
			for (let i in this.display_list) {
				var x1 = this.current_time;
				//if (this.current_time > dice_length-3) { x1 += (x1-(dice_length-3))^3; }
				var position = Math.exp(-(10/dice_length)*x1+2);
				var text_y_pos = height*(0.5+position)+2*height*(i-2)/this.display_list.length;
				text_y_pos += (this.display_list.length%4)*height/(2*this.display_list.length);
				text_y_pos = text_y_pos%(height*2)-height*0.5;
				text(this.display_list[i], width/2, text_y_pos);
			}
		} else {
			fill(255, 78, 0);
			if (this.current_time%0.5 < 0.25) {
				rect(width/2 - 15*this.chosen_value.length, height/2 - 50, 30*this.chosen_value.length, 100);
			}
			fill(r_color[0], r_color[1], r_color[2]);
			text(this.chosen_value, width/2, height/2);
		}
		if (this.current_time > this.expire) { this.expired = true; }
	}
}

function board_game() {
	this.setup = function() {
		pop();
		test_reset_draw_settings();
		//reset();
		this.camera_scale = 1;
		this.players = [];
		this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
		this.green_sprite_2 = loadImage("media/sprites/spelunky_simple.png");
		this.tiles = [];
		this.event_timer_start = millis()/1000;
		this.event_timer = 0;
		this.center_on_player = true;
		this.starting_camera_coordinates = [0, 0];
		this.camera_center_coordinates = [0, 0];
		this.mouse_held = false;
		this.mouse_click_location = [0, 0];
		//this.arrow_keys = [39, 37, 38, 40];
		this.arrow_keys = {
			"left" : 37,
			"right" : 39,
			"up" : 38,
			"down" : 40
		};
		this.tile_grid_dimensions = [50, 50];
		this.make_board_layout_preset_1();
		this.players[0] = new board_game_player(this.green_sprite_2, 0, 0, 3);
		this.players[0].x = this.tiles[0].x;
		this.players[0].y = this.tiles[0].y;
		this.user_player_index = 0;		//Player controlled by the client
		this.turning_player_index = 0; 	//Player currently rolling dice
		this.animation_info = [0, 0, 0, 0, 0, 0]; //boolean, player_id, tile_start, tile_end, start_time, direction.
		this.animation_element;

		this.buttons = {
			"overlay" : []
		};
		this.current_button_menu = "overlay";
		this.buttons["overlay"][0] = new button(50, 50, 50, 50, [255, 78, 0], [10, 10, 10], "Center");
		this.buttons["overlay"][1] = new button(50, 125, 50, 50, [255, 78, 0], [10, 10, 10], "Menu");

		//image_process("media/board_templates/test_template_1.png", parse_board_from_image);
		this.make_board_layout_preset_1();
	}

	this.make_board_layout_preset_1 = function() {
		this.tiles[0] = new board_game_tile(0, 25, 0, [1]);
		for (i = 1; i < 49; i++) {
			this.tiles[i] = new board_game_tile(i, 25, 1+Math.floor(Math.random()*4), [1]);
			this.pair_tiles(i-1, i, "right");
			this.pair_tiles(i, i-1, "left");
		}
		this.tiles[49] = new board_game_tile(49, 25, 5, [1]);
		this.pair_tiles(48, 49, "right");
		this.pair_tiles(49, 48, "left");
		this.tiles[50] = new board_game_tile(2, 24, 4, [1]);
		this.pair_tiles(2, 50, "up");
		this.pair_tiles(50, 2, "down");
	}

	this.make_board_from_image = function(pixel_list) {
		this.tiles = [];
		for (let i in pixel_list) {
			var type = 1 + Math.floor(Math.random()*4);
			if (pixel_list[i].compare_rgb(0, 0, 255)) { type = 0; }
			else if (pixel_list[i].compare_rgb(255, 255, 0)) { type = 5; }
			else if (pixel_list[i].compare_rgb(255, 0, 255)) { type = 3; }
			else if (pixel_list[i].compare_rgb(255, 0, 0)) { type = 4; }
			this.tiles[i] = new board_game_tile(pixel_list[i].x, pixel_list[i].y, type, [1]);
		}
		for (let i in pixel_list) {
			for (let j in pixel_list[i].connected) {
				var c_id = pixel_list[i].connected[j];
				if (c_id != false) {
					this.pair_tiles(i, c_id, j);
					this.pair_tiles(c_id, i, swap_new_direction(j));
				}
			}
		}

		for (let i in this.players) {
			this.players[i].current_tile_index = 0;
			this.players[i].y = this.tiles[0].y;
			this.players[i].x = this.tiles[0].x;
		}
	}

	this.draw = function() {
		push();
		this.players[this.user_player_index].sprite_anim.rotation = this.event_timer*10;
		translate(0, 0);
		this.event_timer = millis()/1000 - this.event_timer_start;
		if (this.center_on_player) {
			this.camera_center_coordinates = [this.players[this.turning_player_index].x, this.players[this.turning_player_index].y];
		} else if(this.mouse_held) {
			this.camera_center_coordinates[0] = this.starting_camera_coordinates[0] - (mouseX - this.mouse_click_location[0])*g_cam.scale;
			this.camera_center_coordinates[1] = this.starting_camera_coordinates[1] - (mouseY - this.mouse_click_location[1])*g_cam.scale;
			this.mouse_click_location = [mouseX, mouseY];
		}
		g_cam.x = this.camera_center_coordinates[0];
		g_cam.y = this.camera_center_coordinates[1];
		g_cam.scale = this.camera_scale;
		for (let i in this.tiles) {
			this.tiles[i].draw();
		}
		for (let i in this.players) { this.players[i].draw(); }
		if (this.animation_info[0]) { this.animate_walking(); }
		if (this.animation_element) { 
			this.animation_element.draw(); 
			if (this.animation_element.expired) { 
				if (this.animation_element.next_display_element) {
					this.animation_element = this.animation_element.next_display_element;	
					this.animation_element.start_time = millis()/1000;	
				} else { this.animation_element = null; } 
			}
		}

		for (let i in this.buttons[this.current_button_menu]) { this.buttons[this.current_button_menu][i].draw(); }
		pop();
	}

	this.start_tile_animate = function(player_id, direction) {
		if (!this.tiles[this.players[player_id].current_tile_index].check_child(direction)) 
		{ console.log("child failed"); return; }
		this.players[player_id].update_facing(direction);
		this.players[player_id].update_moving(true);
		this.players[player_id].speed = 200;
		this.animation_info[0] = 1;
		this.animation_info[1] = player_id;
		this.animation_info[2] = this.players[player_id].current_tile_index;
		this.animation_info[3] = this.tiles[this.players[player_id].current_tile_index].connected_tiles[direction]["tile_id"];
		this.animation_info[4] = millis()/1000;
		this.animation_info[5] = direction;
	}

	this.pair_tiles = function(parent, child, flow_direction) {
		var reverse_direction = swap_new_direction(flow_direction);
		this.tiles[parent].make_child(flow_direction, child);
		this.tiles[child].make_parent(reverse_direction, parent);
	}

	this.animate_walking = function() {
		this.players[this.animation_info[1]].draw();
		var check_end = false;
		if (this.animation_info[5] == "right") {
			if (this.players[this.animation_info[1]].x >= this.tiles[this.animation_info[3]].x) {
				check_end = true;
			}
		} else if (this.animation_info[5] == "left") {
			if (this.players[this.animation_info[1]].x <= this.tiles[this.animation_info[3]].x) {
				check_end = true;
			}
		} else if (this.animation_info[5] == "up") {
			if (this.players[this.animation_info[1]].y <= this.tiles[this.animation_info[3]].y) {
				check_end = true;
			}
		} else if (this.animation_info[5] == "down") {
			if (this.players[this.animation_info[1]].y >= this.tiles[this.animation_info[3]].y) {
				check_end = true;
			}
		}
		if (check_end) {
			console.log("check_end is true");
			this.players[this.animation_info[1]].y = this.tiles[this.animation_info[3]].y;
			this.players[this.animation_info[1]].x = this.tiles[this.animation_info[3]].x;
			this.players[this.animation_info[1]].update_moving(false);
			this.players[this.animation_info[1]].current_tile_index = this.animation_info[3];
			this.tile_event_trigger(this.tiles[this.animation_info[3]].type);
			this.animation_info[0] = 0;
			this.reset_event_timer();
		}
	}

	this.tile_event_trigger = function(tile_type) {
		if (tile_type == 0) {			//Empty tile
			return;
		} else if (tile_type == 1) { 	//Lose coins
			this.animation_element = new message_display_element("Lose coins", 5);
		} else if (tile_type == 2) { 	//Gain coins
			this.animation_element = new message_display_element("Gain coins", 5);
		} else if (tile_type == 3) { 	//Random game
			//this.animation_element = new message_display_element("Random Game", 5);
			this.animation_element = new message_display_element("Random game", 3);
			this.animation_element.next_display_element = new dice_display_element(20, ["5A", "5B", "5C", "5D"], [5, 5, 5, 5], 10);
		} else if (tile_type == 4) { 	//Trap
			this.animation_element = new message_display_element("Trap", 5);
		} else if (tile_type == 5) { 	//Star
			this.animation_element = new message_display_element("Star", 5);
		}
		return;
	}

	this.reset_event_timer = function() { this.event_timer_start = millis()/1000; }


	/*
	this.key_pressed = function(keycode) {
		console.log("KEY PRESSED: "+keycode);
		for (let i in this.arrow_keys){
			if (keycode == this.arrow_keys[i]){
				if (this.animation_info[0]) { return; }
				this.start_tile_animate(this.turning_player_index, i);
			}
		}
	}
	*/

	this.key_pressed = function(keycode) {
		console.log("KEY PRESSED: "+keycode);
		if (this.user_player_index != this.turning_player_index) { return; }
		for (let i in this.arrow_keys){
			if (keycode == this.arrow_keys[i]){
				send_data("move_tile_direction:"+i);
			}
		}
	}

	this.key_released = function(keycode) {
		return;
	}

	this.mouse_pressed = function() {
		for (let i in this.buttons[this.current_button_menu]) {
			if (this.buttons[this.current_button_menu][i].check_press(mouseX, mouseY)) {
				return;
			}
		}
		this.center_on_player = false;
		this.mouse_click_location = [mouseX, mouseY];
		this.starting_camera_coordinates = this.camera_center_coordinates;
		this.mouse_held = true;
		return;
	}

	this.mouse_released = function() {
		this.mouse_held = false;
		for (let i in this.buttons[this.current_button_menu]) {
			if (this.buttons[this.current_button_menu][i].pressed) {
				this.button_press(i);
			}
			this.buttons[this.current_button_menu][i].pressed = 0;
		}
		return;
	}

	this.mouse_wheel = function(delta) {
		this.camera_scale += 0.1*delta;
		this.camera_scale = Math.max(0.5, Math.min(this.camera_scale, 3));
	}

	this.button_press = function(code) {
		if (this.current_button_menu == "overlay") {
			if (code == 0) { console.log("button_pressed"); this.toggle_camera_center_on_player(); }
		}
	}

	this.read_network_data = function(flag, message) {
		if (flag == "player_move_tile") {
			this.read_in_tile_movement(message);
		} else if (flag == "tile_pos") {
			this.read_in_tile_data(message);
		} else if (flag == "pos_player") {
			this.read_in_player_data(message);
		} else if (flag == "assigned_id") {
			this.user_player_index = parseInt(message);
		} else if (flag == "rmv_player") {
			this.player_removed(message);
		} else if (flag == "turning_player") {
			this.turning_player_index = parseInt(message);
		}
	}

	this.read_in_tile_movement = function(data) {
		p_vals = convert_data_string(data, [0], [], [1]);
		this.start_tile_animate(p_vals[0], p_vals[1]);
	}

	this.read_in_tile_data = function(data) {
		p_vals = convert_data_string(data, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
		if (p_vals[0] >= this.tiles.length) { this.tiles[p_vals[0]] = new board_game_tile(p_vals[1], p_vals[2], p_vals[5], []); }
		this.tiles[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], 
										p_vals[8], p_vals[9], p_vals[10], p_vals[11], p_vals[12], p_vals[13], p_vals[14], 
										p_vals[15], p_vals[16], p_vals[17], p_vals[18], p_vals[19], p_vals[20], p_vals[21]);
	}

	this.read_in_player_data = function(data) {
		p_vals = convert_data_string(data, [0, 6, 7], [1, 2, 3, 4], [5, 8]);
		if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new board_game_player(this.green_sprite_2, p_vals[1], p_vals[2], p_vals[5]); }
		this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
	}

	this.player_removed = function(data) {
		var player_id_in = parseInt(data);
		this.players.splice(player_id_in, 1);
		if (this.user_player_index >= player_id_in) {
			this.user_player_index--;
		}
		if (this.turning_player_index > player_id_in) {
			this.turning_player_index--;
		} else if (this.turning_player_index == player_id_in) {
			this.turning_player_index = this.user_player_index;
		}
	}

	this.toggle_camera_center_on_player = function() {
		if (arguments.length >= 1) { 
			if (arguments[0]) { this.center_on_player = 1; }
			else { this.center_on_player = 0; }
		} else {
			if (this.center_on_player) { this.center_on_player = 0; }
			else { this.center_on_player = 1; }
		}
		console.log("toggle center called: centered_on_player: "+this.center_on_player);
	}
}