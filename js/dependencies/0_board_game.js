class board_game_player {
	constructor(spriteSheet, x, y, face) {
		
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
	}
	
	draw() {
		//if (this.move == 0) { this.sprite_anim.stop(); }
		if (this.move) {
			console.log("facing: "+this.facing);
			if (this.facing < 1) {
				console.log("changing x: "+this.y);
				this.x = this.x + this.speed * (1-this.facing*2);
			} else {
				console.log("changing y: "+this.x);
				this.y = this.y + this.speed * ((this.facing-2)*2-1);
			}
		}
		this.sprite_anim.draw(this.x-50, this.y-50, true);
	}
  
	get_pos_string(){
	  var string_make = str(this.x)+","+str(this.y)+","+str(this.move)+","+str(this.facing);
	  return string_make;
	}
	
	update_facing(facing) {
		if (facing == this.facing) { return; }
		this.facing = facing;
		if (facing == 0 || facing == 1) {
			this.sprite_anim.flip(int(facing));
			this.sprite_anim.change_animation("left_right");
		} else if (facing == 2) {
			this.sprite_anim.flip(false);
			this.sprite_anim.change_animation("up");
		} else if (facing == 3) {
			this.sprite_anim.flip(false);
			this.sprite_anim.change_animation("down");
		}
	}

	update_moving(value) {
		if (value == this.move) { return; }
		if (value) {
			this.move = 1;
			this.sprite_anim.start();
		} else {
			this.move = 0;
			this.sprite_anim.stop();
		}
	}

	update_data(sprite, x, y, move, speed, facing, fruit_holding, fruit_id){
	  //if (sprite != null) {this.spriteSheet = }
	  if (x != null) { this.x = x; }
	  if (y != null) { this.y = y; }
	  if (move != null) { this.move = move; }
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
	  var string_make = "pos_player:"+player_index+","+this.x+","+this.y+","+this.move+","+
						this.speed+","+this.facing+","+this.fruit_holding+","+this.fruit_held_id;
	  return string_make;
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

		//4 values for each below represent east, west, north, south
		this.connected_tiles = [0, 0, 0, 0]; //if tile is connected, boolean
		this.connected_is_child = [0, 0, 0, 0]; //stores if tile
		this.connected_tile_ids = [0, 0, 0, 0]; //ids of connected tiles
	}

	draw() {
		/*
		tile types: 0 - empty (light blue)
		1 - lose coins (red)
		2 - gain coins (green)
		3 - random game (purple)
		4 - trap (orange)
		5 - star
		*/
		if (this.type == 0) { fill(0, 0, 125); }
		else if (this.type == 1) { fill(250, 0, 0); }
		else if (this.type == 2) { fill(0, 250, 0); }
		else if (this.type == 3) { fill(180, 0, 180); }
		else if (this.type == 4) { fill(255, 78, 0); }
		else if (this.type == 5) { fill(255, 255, 0); }
		g_cam.ellipse(this.x, this.y, 100, 100);

		if (this.connected_tiles[0] && this.connected_is_child[0]) {
			
		}

	}

	make_child(direction, id) {
		this.connected_tiles[direction] = 1;
		this.connected_is_child[direction] = 1;
		this.connected_tile_ids[direction] = id;
	}

	make_parent(direction, id) {
		this.connected_tiles[direction] = 1;
		this.connected_is_child[direction] = 0;
		this.connected_tile_ids[direction] = id;
	}

	check_child (direction) { 
		console.log(this.connected_tiles+":::"+this.connected_is_child+":::"+this.connected_tile_ids);
		console.log("direction "+direction+"->"+this.connected_tiles[direction]+","+this.connected_is_child[direction]+","+this.connected_tile_ids[direction]);
		return (this.connected_is_child[direction] && this.connected_tiles[direction]); 
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
		console.log("center is "+height/2);
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
			sum = 0;
			var index_current = 0, target = Math.random();
			while (sum < target) {
				sum += element_weights[index_current];
				index_current++;
			}
			this.display_list[this.display_list.length] = elements[index_current-1];
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
		this.camera_scale = 1;
		this.players = [];
		this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
		this.green_sprite_2 = loadImage("media/sprites/spelunky_simple.png");
		this.tiles = [];
		this.event_timer_start = millis()/1000;
		this.event_timer = 0;
		this.arrow_keys = [39, 37, 38, 40];
		this.tile_grid_dimensions = [50, 50];
		this.make_board_layout_preset_1();
		this.players[0] = new board_game_player(this.green_sprite_2, 0, 0, 3);
		this.players[0].x = this.tiles[0].x;
		this.players[0].y = this.tiles[0].y;
		this.user_player_index = 0;		//Player controlled by the client
		this.turning_player_index = 0; 	//Player currently rolling dice
		this.animation_info = [0, 0, 0, 0, 0, 0] //boolean, player_id, tile_start, tile_end, start_time, direction.
		this.animation_element;
		//this.board_template = loadImage('media/board_templates/test_template_1.png');
		//console.log("width -> "+this.board_template.width);
		parse_board_image("media/board_templates/test_template_1.png");
	}

	this.make_board_layout_preset_1 = function() {
		this.tiles[0] = new board_game_tile(0, 25, 0, [1]);
		for (i = 1; i < 49; i++) {
			this.tiles[i] = new board_game_tile(i, 25, 1+Math.floor(Math.random()*4), [1]);
			this.pair_tiles(i-1, i, 0);
		}
		this.tiles[49] = new board_game_tile(49, 25, 5, [1]);
		this.pair_tiles(48, 49, 0);
		this.tiles[50] = new board_game_tile(2, 24, 4, [1]);
		this.pair_tiles(2, 50, 2)
	}

	this.draw = function() {
		translate(0, 0);
		this.event_timer = millis()/1000 - this.event_timer_start;
		g_cam.x = this.players[this.turning_player_index].x;
		g_cam.y = this.players[this.turning_player_index].y;
		g_cam.scale = 1.2;
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
	}

	this.start_tile_animate = function(player_id, direction) {
		if (!this.tiles[this.players[player_id].current_tile_index].check_child(direction)) 
		{ console.log("child failed"); return; }
		this.players[player_id].update_facing(direction);
		this.players[player_id].update_moving(true);
		this.players[player_id].speed = 2;
		this.animation_info[0] = 1;
		this.animation_info[1] = player_id;
		this.animation_info[2] = this.players[player_id].current_tile_index;
		this.animation_info[3] = this.tiles[this.players[player_id].current_tile_index].connected_tile_ids[direction];
		this.animation_info[4] = millis()/1000;
		this.animation_info[5] = direction;
	}

	this.pair_tiles = function(parent, child, flow_direction) {
		var reverse_direction = flow_direction - (flow_direction%2) + ((flow_direction+1)%2);
		this.tiles[parent].make_child(flow_direction, child);
		this.tiles[child].make_parent(reverse_direction, parent);
	}

	this.animate_walking = function() {
		this.players[this.animation_info[1]].draw();
		var check_end = false;
		if (this.animation_info[5] == 0) {
			if (this.players[this.animation_info[1]].x >= this.tiles[this.animation_info[3]].x) {
				check_end = true;
			}
		} else if (this.animation_info[5] == 1) {
			if (this.players[this.animation_info[1]].x <= this.tiles[this.animation_info[3]].x) {
				check_end = true;
			}
		} else if (this.animation_info[5] == 2) {
			if (this.players[this.animation_info[1]].y <= this.tiles[this.animation_info[3]].y) {
				check_end = true;
			}
		} else if (this.animation_info[5] == 3) {
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

	this.key_pressed = function(keycode) {
		for (let i in this.arrow_keys){
			if (keycode == this.arrow_keys[i]){
				if (this.animation_info[0]) { return; }
				this.start_tile_animate(this.turning_player_index, i);
			}
		}
	}

	this.key_released = function(keycode) {
		return;
	}

	this.mouse_pressed = function() {
		return;
	}

	this.mouse_released = function() {
		return;
	}

	this.read_network_data = function(flag, message) {
		return
	}
}