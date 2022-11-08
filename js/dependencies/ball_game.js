var seed_get = 1;

function seed_random(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

class game_2_ball {
  constructor() {
      this.radius = 35;
      this.x = 0;
      this.y = 0;
      this.dx = 1;
      this.dy = 1;
      this.speed = 300;
      this.last_update = millis()/1000;
    }
  }
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
      this.next_turning_player_index = 0;
      this.animation_info = [0, 0, 0, 0, 0, 0]; //boolean, player_id, tile_start, tile_end, start_time, direction.
      this.animation_queue = [];
      this.current_turn = 1;
      this.current_turn_moves = 0;
  
      this.buttons = {
        "overlay" : []
      };
      this.current_button_menu = "overlay";
      this.buttons["overlay"][0] = new button(50, 50, 50, 50, [255, 78, 0], [10, 10, 10], "Center");
      this.buttons["overlay"][1] = new button(50, 125, 50, 50, [255, 78, 0], [10, 10, 10], "Menu");
  
      //image_process("media/board_templates/test_template_1.png", parse_board_from_image);
      this.make_board_layout_preset_1();
    
  
    draw();{
      //console.log("drawing ball");
      fill(30, 0, 20);
      stroke(255);
      ellipse(this.x, this.y, this.radius);
      //console.log("drawing - "+str(this.x)+","+str(this.y));
      this.x += this.dx*this.speed*(millis()/1000 - this.last_update);
      this.y += this.dy*this.speed*(millis()/1000 - this.last_update);
      if (this.x < 0 || this.x >= 500) {
        var adjust_factor = Math.max(0, Math.min(this.x, 500)) - this.x;
        adjust_factor /= this.dx;
        this.x += this.dx*adjust_factor;
        this.y += this.dy*adjust_factor;
        
        this.dx *= -1;
        this.dx -= 0.3*seed_random(seed_get+this.dx);
      }
      if (this.y < 0 || this.y >= 500) {
        var adjust_factor = Math.max(0, Math.min(this.y, 500)) - this.y;
        adjust_factor /= this.dy;
        this.x += this.dx*adjust_factor;
        this.y += this.dy*adjust_factor;
        this.dy *= -1;
        this.dy += 0.3*seed_random(seed_get+this.dy+0.1);
      }
      var factor = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
      this.dy /= factor;
      this.dx /= factor;
      this.last_update = millis()/1000;
    }
  }
  

    update_data(x, y, dx, dy, speed); {
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.speed = speed;
    }
  



function ball_game() {
  this.setup = function() {
    this.players = [];
    this.balls = [];
    this.main_player_index;
    this.arrow_keys = [39, 37, 38, 40];
    this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
    imageMode(CENTER);
    this.players[0] = new game_1_player(this.greenSprite, 200, 200, 0);
    this.main_player_index = 0;
  }

  this.key_pressed = function(keycode) {
    for (i=0;i<4;i++){
      if (keycode == this.arrow_keys[i]){
        this.players[this.main_player_index].facing = i;
        this.players[this.main_player_index].move = 1;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        return;
      }
    }
  }

  this.key_released = function(keycode) {
    for (i=0;i<4;i++){
      if(keycode == this.arrow_keys[i] && this.players[this.main_player_index].facing == i) {
        this.players[this.main_player_index].move = 0;
      }
    }
    send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
  }

  this.mouse_pressed = function() { return; }
  this.mouse_released = function() { return; }

  this.draw = function() {
    background(200, 200, 200);
    fill(0, 0, 0);

    text_make(0, 200, 0, 2);
    textAlign(CENTER, CENTER);
    text("balls", width/2, height/2);
    for (let i in this.players) {
      this.players[i].draw();
    }
    for (let i in this.balls) { this.balls[i].draw(); }
    
    
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
			} else if (this.turning_player_index == this.user_player_index) {
				var walkable_directions = this.check_walkable_directions(this.user_player_index);
				console.log("Checking walkable directions: "+walkable_directions);
				if (walkable_directions.length == 1) {
					send_data("move_tile_direction:"+walkable_directions[0]);
				}
			}
			
		}
	}
  this.read_network_data = function(flag, message) {
    if (flag == "player_count") {
      for (j=this.players.length; j < parseInt(message); j++){
        this.players[j] = new game_1_player(this.greenSprite, 300, 300, 1);
      }
    } else if (flag == "assigned_id") {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") {
      this.read_in_player_position(message);
    } else if (flag == "new_player") {
      this.players[parseInt(message)] = new game_1_player(this.greenSprite, 300, 300, 0);
    } else if (flag == "rmv_player") {
      var player_index = parseInt(message);
      this.players.splice(player_index, 1);
      if (this.main_player_index > player_index) {
        this.main_player_index -= 1;
      }
    } else if (flag == "ball_pos") {
      this.read_in_ball_position(message);
    } else if (flag == "random_seed") {
      seed_get = parseInt(message);
    }
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

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new game_1_player(this.greenSprite, 300, 200, 0); }
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
  }

  this.read_in_ball_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0], [1, 2, 3, 4, 5]);
    if (p_vals[0] >= this.balls.length) { this.balls[p_vals[0]] = new game_2_ball(); }
    this.balls[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5]);
  }

}