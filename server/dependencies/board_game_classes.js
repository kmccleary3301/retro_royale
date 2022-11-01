class board_game_player { 
	constructor(x, y, face) {
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

	update_data(x, y, move, speed, facing, current_tile_index, previous_tile_index, name){
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


module.exports = {board_game_player, board_game_tile};