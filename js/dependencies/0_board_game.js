function board_game() {
	this.setup = function() {
		pop();
		test_reset_draw_settings();
		send_data("loading_board_game");
		//reset();
		this.vid_font = loadFont('media/fonts/videogame.ttf');
		this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];
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
		this.pause_check = false;
		this.user_roll = false;
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
		this.turn_done = false;
		this.next_turning_player_index = 0;
		this.animation_info = [0, 0, 0, 0, 0, 0]; //boolean, player_id, tile_start, tile_end, start_time, direction.
		this.animation_queue = [];
		this.current_turn = 1;
		this.current_turn_moves = 0;
		this.buttons = {
			"overlay" : []
		};
		this.current_button_menu = "overlay";
		this.buttons["overlay"][0] = new button(75, 50, 100, 50, this.blue, [10, 10, 10], "Center", true);
		this.buttons["overlay"][1] = new button(75, 125, 100, 50, this.blue, [10, 10, 10], "Scores", true);
		this.buttons["overlay"][2] = new button(75, 200, 100, 50, this.blue, [10, 10, 10], "Home", true);

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

	this.adjust_current_menu = function() {
		var max_text_size = this.buttons[this.current_button_menu][0].calculate_max_text_size();
		for (let i in this.buttons[this.current_button_menu]) {
			var new_size = this.buttons[this.current_button_menu][i].calculate_max_text_size();
			if (new_size < max_text_size) { max_text_size = new_size; }
		}
		for (let i in this.buttons[this.current_button_menu]) {
			this.buttons[this.current_button_menu][i].text_size = max_text_size;
		}
	}

	this.draw = function() {
		push();
		this.adjust_current_menu();
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
		else {
			if (this.turning_player_index == this.user_player_index && 
				this.current_turn_moves > 0 && !this.pause_check &&
				this.animation_queue[0] === undefined && !this.turn_done) {
				var walkable_directions = this.check_walkable_directions(this.user_player_index);
				console.log("Checking walkable directions: "+walkable_directions);
				if (walkable_directions.length == 1) {
					send_data("move_tile_direction:"+walkable_directions[0]);
					this.pause_check = true;
				}
			}
		}

		if (this.animation_queue[0] !== undefined) { 
			//this.buttons["overlay"][2] = undefined;
			if (this.buttons["overlay"][3] !== undefined) {
				this.buttons["overlay"].splice(3, 1);
			}
			this.animation_queue[0].draw(); 
			if (this.animation_queue[0].expired) {
				if (this.animation_queue[1] === undefined) {
					this.animation_queue = [];
					if (this.turning_player_index == this.user_player_index && this.current_turn_moves <= 0 && this.turn_done) {
						this.turn_done = false;
					}
					this.turning_player_index = this.next_turning_player_index;
				} else {
					this.animation_queue.splice(0, 1);
					this.animation_queue[0].start_time = millis()/1000; 
				}
			}
		} else { 
			if (this.user_roll && this.buttons["overlay"][3] === undefined) {
				this.buttons["overlay"][3] = new button(960, 440, 100, 100, this.blue, [10, 10, 10], "Roll", true);
			}
			if (!this.user_roll && this.current_turn_moves <= 0 && this.turn_done) {
				send_data("end_turn");
				this.turn_done = false;
			}
		}

		for (let i in this.buttons[this.current_button_menu]) { this.buttons[this.current_button_menu][i].draw(); }
		pop();
	}

	this.draw_leaderboard = function() {
		push();
		fill(255, 78, 0);
		stroke(5);
		rectmode(CENTER);
		rect(width/2, height/2, width*0.7, height*0.7);
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
			this.players[this.animation_info[1]].previous_tile_index = this.players[this.animation_info[1]].current_tile_index;
			this.players[this.animation_info[1]].current_tile_index = this.animation_info[3];
			this.animation_info[0] = 0;
			this.reset_event_timer();
			if (this.current_turn_moves <= 0) {
				this.tile_event_trigger(this.tiles[this.animation_info[3]].type);
				if (this.turning_player_index == this.user_player_index) {
					send_data("begin_tile_event");
				}
			} else if (this.turning_player_index == this.user_player_index) {
				var walkable_directions = this.check_walkable_directions(this.user_player_index);
				console.log("Checking walkable directions: "+walkable_directions);
				if (walkable_directions.length == 1) {
					send_data("move_tile_direction:"+walkable_directions[0]);
				}
			}
			
		}
	}

	this.tile_event_trigger = function(tile_type) {
		/*
		if (this.current_turn_moves > 0) { return; }
		if (tile_type == 0) {			//Empty tile
			return;
		} else if (tile_type == 1) { 	//Lose coins
			this.animation_queue.splice(0, 0, new message_display_element("Lose coins", 5));
		} else if (tile_type == 2) { 	//Gain coins
			this.animation_queue.splice(0, 0, new message_display_element("Gain coins", 5));
		} else if (tile_type == 3) { 	//Random game
			//this.animation_element = new message_display_element("Random Game", 5);
			this.animation_queue.splice(0, 0, new message_display_element("Random game", 3));
			this.animation_queue.splice(1, 0, new dice_display_element(20, ["5A", "5B", "5C", "5D"], [5, 5, 5, 5], 10));
		} else if (tile_type == 4) { 	//Trap
			this.animation_queue.splice(0, 0, new message_display_element("Trap", 5));
		} else if (tile_type == 5) { 	//Star
			this.animation_queue.push(new message_display_element("Star", 5));
		}
		return;
		*/
		if (this.turning_player_index == this.user_player_index) { this.turn_done = true; }
	}

	this.reset_event_timer = function() { this.event_timer_start = millis()/1000; }
	
	this.check_walkable_directions = function(player_id) {
		var current_tile_id = this.players[player_id].current_tile_index;
		var previous_tile_id = this.players[player_id].previous_tile_index;
		var connected_tile_ids = [];
		for (let i in this.tiles[current_tile_id].connected_tiles) {
			if (this.tiles[current_tile_id].connected_tiles[i]["connected"] && 
				this.tiles[current_tile_id].connected_tiles[i]["is_child"] &&
				this.tiles[current_tile_id].connected_tiles[i]["tile_id"] != previous_tile_id) {
				connected_tile_ids[connected_tile_ids.length] = i;
			}
		}
		return connected_tile_ids;
	}

	this.key_pressed = function(keycode) {
		console.log("KEY PRESSED: "+keycode);
		console.log("User_player_index: "+this.user_player_index);
		if (this.user_player_index != this.turning_player_index || this.animation_queue.length > 0) { return; }
		if (this.current_turn_moves <= 0) { return; }
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
		var dx = this.camera_center_coordinates[0] - this.players[this.turning_player_index].x, 
			dy = this.camera_center_coordinates[1] - this.players[this.turning_player_index].y;
		if (Math.sqrt(dx*dx+dy*dy) < 60) { this.center_on_player = true; }
		for (let i in this.buttons[this.current_button_menu]) {
			if (this.buttons[this.current_button_menu][i].pressed) {
				this.buttons[this.current_button_menu][i].pressed = 0;
				console.log("pressed "+i);
				this.button_press(i);
			}
		}
		return;
	}

	this.mouse_wheel = function(delta) {
		this.camera_scale += 0.1*delta;
		this.camera_scale = Math.max(0.5, Math.min(this.camera_scale, 3));
	}

	this.button_press = function(code) {
		if (this.current_button_menu == "overlay") {
			console.log("code ->"+code);
			switch(int(code)) {
				case 0:
					console.log("button_pressed"); 
					this.toggle_camera_center_on_player(); 
					break;
				case 1:
					console.log("button_press 1");
					break;
				case 2:
					socket.close();
					swap_current_state("main_menu");
					break;
				case 3:
					console.log("Roll called");
					this.user_roll = false;
					send_data("begin_dice");
					this.buttons["overlay"].splice(3, 1);
					break;
				default:
					break;
			}
		}
	}

	this.read_network_data = function(flag, message) {
		switch (flag) {
			case 'player_move_tile':
				this.read_in_tile_movement(message);
				break;
			case 'tile_pos':
				this.read_in_tile_data(message);
				break;
			case 'pos_player':
				this.read_in_player_data(message);
				break;
			case 'assigned_id':
				console.log("HELLO UPI");
				this.user_player_index = parseInt(message);
				console.log("user_player_index: "+this.user_player_index);
				break;
			case 'rmv_player':
				this.player_removed(message);
				break;
			case 'turning_player':
				this.update_turning_player(parseInt(message));
				break;
			case 'reset_tiles':
				this.tiles = [];
				break;
			case 'current_turn':
				this.update_turn(parseInt(message));
				break;
			case 'dice_roll_turn':
				this.read_in_dice_roll(message);
				break;
			case 'current_turn_moves':
				this.current_turn_moves = parseInt(message);
				break;
			case 'your_roll':
				this.user_roll = true;
				break;
			case 'tile_event_trigger':
				this.tile_event_trigger(message);
				break;
		}
	}

	this.update_turn = function(turn) {
		if (turn != this.current_turn || this.current_turn == 1) {
			console.log("New turn, adding animation element");
			//var turns_remaining = this.max_turns
			//this.animation_queue.push(new message_display_element("Turn "+turn, 3));
		}
		this.current_turn = turn;
	}

	this.update_turning_player = function(player_id) {
		console.log("player_id: "+player_id);
		this.animation_queue[this.animation_queue.length] = new message_display_element(this.players[player_id].name+"'s turn", 3);
		this.next_turning_player_index = player_id;
	}

	this.read_in_tile_movement = function(data) {
		this.pause_check = false;
		p_vals = convert_data_string(data, [0], [], [1]);
		this.start_tile_animate(p_vals[0], p_vals[1]);
		this.current_turn_moves--;
	}

	this.read_in_tile_data = function(data) {
		p_vals = convert_data_string(data, [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], [], [5]);
		if (p_vals[0] >= this.tiles.length) { this.tiles[p_vals[0]] = new board_game_tile(p_vals[1], p_vals[2], p_vals[5], []); }
		this.tiles[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], 
										p_vals[8], p_vals[9], p_vals[10], p_vals[11], p_vals[12], p_vals[13], p_vals[14], 
										p_vals[15], p_vals[16], p_vals[17], p_vals[18], p_vals[19], p_vals[20], p_vals[21]);
	}

	this.read_in_player_data = function(data) {
		p_vals = convert_data_string(data, [0, 6, 7, 9, 10], [1, 2, 3, 4], [5, 8]);
		if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new board_game_player(this.green_sprite_2, p_vals[1], p_vals[2], p_vals[5]); }
		this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8], p_vals[9], p_vals[10]);
	}

	this.read_in_dice_roll = function(data) {
		p_vals = convert_data_string(data, [1], [], [0]);
		if (p_vals[0] == 'ints') {p_vals = convert_data_string(data, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [], [0]); }
		else if (p_vals[0] == 'strings') {
			p_vals = convert_data_string(data, [], [], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		}
		this.animation_queue.splice(0, 0, new dice_display_element(15, [1, 2, 3, 4, 5, 6], [1, 1, 1, 1, 1, 1]));
		this.animation_queue[0].update_elements(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], 
												p_vals[6], p_vals[7], p_vals[8], p_vals[9], p_vals[10]);
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