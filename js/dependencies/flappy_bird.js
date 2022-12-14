class flappy_bird_pipe {
	constructor(sprite, x_offset, pipe_width, pipe_gap_y_pos, pipe_gap_width) {
		this.sprite = sprite;
		this.x_offset = x_offset;
		this.x;
		this.pipe_width = pipe_width;
		this.pipe_gap_width = pipe_gap_width;
		this.pipe_gap_y_pos = pipe_gap_y_pos;
		this.last_update = Date.now()/1000;
	}
	draw() {
		push();
		tint(255, 255);
		var rect_left_corner = this.x - this.pipe_width/2;
		translate(rect_left_corner, this.pipe_gap_y_pos-this.pipe_gap_width/2);
		scale(1, -1);
		imageMode(CORNERS);
		var image_height_1 = Math.floor(this.sprite.width*(this.pipe_gap_y_pos-this.pipe_gap_width/2)/this.pipe_width);
		noSmooth();
		image(this.sprite, 0, 0, this.pipe_width,this.pipe_gap_y_pos-this.pipe_gap_width/2, 0, 0, this.sprite.width, image_height_1);
		pop();
		push();
		tint(255, 255);
		var image_height_2 = Math.floor(this.sprite.width*(height-this.pipe_gap_y_pos+this.pipe_gap_width/2)/this.pipe_width);
		translate(rect_left_corner, this.pipe_gap_y_pos+this.pipe_gap_width/2);
		imageMode(CORNERS);
		noSmooth();
		image(this.sprite, 0, 0, this.pipe_width,height-this.pipe_gap_y_pos+this.pipe_gap_width/2, 0, 0, this.sprite.width, image_height_2);
		this.x -= 200*(Date.now()/1000 - this.last_update);
		this.last_update = Date.now()/1000;
		pop();
	}

	make_data_raw() {
		return this.x+","+this.x_offset+","+this.pipe_width+","+this.pipe_gap_y_pos;
	}
	
	make_data() {
		if (argument[0] === undefined) {
			return "pipe_pos:"+this.make_data_raw();
		} else {
			return "pipe_pos:"+argument[0]+","+this.make_data_raw();
		}
	}

	update_data(x_offset, x, pipe_width, pipe_gap_y_pos, pipe_gap_width) {
		if (x_offset != null) { this.x_offset = x_offset; }
		if (x != null) { this.x = x; }
		if (pipe_width != null) { this.pipe_width = pipe_width; }
		if (pipe_gap_y_pos != null) { this.pipe_gap_y_pos = pipe_gap_y_pos; }
		if (pipe_gap_width != null) { this.pipe_gap_width = pipe_gap_width; }
	}
}

class flappy_bird_player {
	constructor(sprite_sheet, x, y, sprite_color) {
		this.sprite_color = sprite_color % 4;
		this.sprite_anim = new sprite_animation_object(sprite_sheet, 70, 64, 64,
			{
				"flap": {
					"row": 9+10*this.sprite_color,
					"row_length": 6
				},
				"die": {
					"row": 7+10*this.sprite_color,
					"row_length": 1
				}
			});
		this.x = x;
		this.y = y;
		this.last_jump = Date.now()/1000;
		this.y_on_last_jump = this.y;
		this.acceleration = -20;
		this.is_dead = 0;
		//this.acceleration = 0;
		this.has_jumped = false;
		this.sprite_anim.change_animation("flap");
		this.sprite_anim.start();
		this.current_animation = "flap";
		stopAllSounds(true);
		playSound("soothing_2", true);
	}
	
	draw() {
		push();
		if (this.has_jumped) {
			var slope = (Date.now()/1000 - this.last_jump - 1);
			this.sprite_anim.rotation_angle = 180*Math.atan(slope)+90;
		} else {
			this.sprite_anim.rotation_angle = 0;
		}
		this.sprite_anim.draw(this.x, this.y, false);
		this.update();
		/*
		if (this.sprite_anim.sx%6 == 5) {
			this.sprite_anim.stop();
		}
		*/
		pop();
	}

	jump() {
		if (this.is_dead) { return; }
		this.sprite_anim.start();
		if (!this.has_jumped) { this.has_jumped = true; }
		this.y_on_last_jump = int(this.y);
		this.last_jump = Date.now()/1000;
	}
	
	update_anim(animation) {
		if (this.current_animation == animation) {return;}
		this.current_animation = animation;
		this.sprite_anim.change_animation(animation)
		if (animation == "flap") { this.sprite_anim.start(); }
		else { this.sprite_anim.stop(); }
	}

	update() {
		if (!this.has_jumped) { return; }
	  	this.y = float(this.y_on_last_jump) + (this.acceleration - this.acceleration*Math.pow((Date.now()/1000 - this.last_jump)*5-1, 2));
	}

	calc_time(y, y_on_last_jump) {
		var v1 = y - y_on_last_jump - this.acceleration;
		v1 /= this.acceleration;
		var v2 = Math.sqrt(v1);
		var v3 = (v2+1)/5;
		var time_calc = Date.now()/1000 - v3;
		return time_calc;
	}
  
	make_data_raw() {
	  return this.x+","+this.y+","+this.last_jump+","+this.y_on_last_jump+","+this.acceleration+","+this.is_dead+","+this.current_animation;
	}
  
	make_data(){
	  if (arguments[0] === undefined) {
		return "pos_player:"+this.make_data_raw();
	  } else {
		return "pos_player:"+arguments[0]+","+this.make_data_raw();
	  }
	}
  
	update_data(x, y, last_jump, y_on_last_jump, acceleration, is_dead, animation){
	  if (x != null) { this.x = x; }
	  if (y != null) {
			this.y = y; 
		}
	  if (last_jump != null) { this.last_jump = last_jump; }
	  if (y_on_last_jump != null) { this.y_on_last_jump = y_on_last_jump; }
	  if (acceleration != null) { this.acceleration = acceleration; }
	  if (is_dead != null) { 
			if (is_dead != this.is_dead) {
				if (is_dead) { this.update_anim("dead"); }
				else { this.update_anim("flap"); }
			}
			this.is_dead = is_dead; 
		}
	  if (animation != null) { this.update_anim(animation); }
	}
}

function flappy_bird() {
    this.setup = function() {
      this.players = [];
      this.pipes = [];
      this.main_player_index = 0;
      this.space_bar = 32; //space bar
      //this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
	  this.Sprite = loadImage(repo_address+"media/sprites/Spritesheet_64_update.png");
	//   this.backGround = loadImage("media/background/loopable_city_background_upscaled.png")
	  this.pipe_sprite = loadImage("media/sprites/pipe.png")
	  this.game_is_over = false;
	  this.game_over_time;
		
	  //1280x330 height/330
	//   this.backGroundOriginalHeight = 330;
	//   this.backGroundOriginalWidth = 1280;

	//   this.backGroundHeight = height;
	//   this.backGroundWidth = height/this.backGroundOriginalHeight*width;
	//   this.backGround1XPosition = width/2;
	//   this.backGround1YPosition = height/2;
	//   this.backGround2XPosition = width/2+this.backGroundWidth-20;
	//   this.backGround2YPosition = height/2;

	  this.test_background_1 = loadImage("media/backgrounds/city_layer_3.png");
	  this.scroll_background_1 = new scroll_image(this.test_background_1, [1920, 1080], -20);
	  this.test_background_2 = loadImage("media/backgrounds/city_layer_2.png");
	  this.scroll_background_2 = new scroll_image(this.test_background_2, [1920, 1080], -7);
	  this.test_background_3 = loadImage("media/backgrounds/city_layer_1.png");
	  this.scroll_background_3 = new scroll_image(this.test_background_3, [1920, 1080], -80);

	  this.players[0] = new flappy_bird_player(this.Sprite, 200, 200, 0);
      this.main_player_index = 0;
    }
  
    this.key_pressed = function(keycode) {
		//if (this.players[this.main_player_index].is_dead) { return; }
			if(keycode == this.space_bar) {
				if (this.players[this.main_player_index].isDead) { return; }
				send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
				this.players[this.main_player_index].jump();
				send_data("jump_notice");
				playSound("snare_1");
			}
    }
  
    this.mouse_pressed = function() { return; }
    this.mouse_released = function() { return; }
  
    this.draw = function() {
			push();
			background(200, 200, 200);
			// image(this.backGround,this.backGround1XPosition,this.backGround1YPosition,
			// 		this.backGroundWidth,this.backGroundHeight);
			// image(this.backGround,this.backGround2XPosition,this.backGround2YPosition,
			// 		this.backGroundWidth, this.backGroundHeight);
			this.scroll_background_1.draw();
			this.scroll_background_2.draw();
			this.scroll_background_3.draw();

			fill(0, 0, 0);
			text_make(4, 200, 0, 2);
			textAlign(CENTER, CENTER);
			//text("FLAP!", width/2, height/2);
			
			if (this.game_is_over) {
				var message_position = sigmoid_array([width*2, width/2, -width], [0, 1.5, 3], [1.5, 1.5], this.current_time-this.game_over_time);
				text("game over", message_position, height/2);
			}

			for (let i in this.pipes) {
				this.pipes[i].draw();
			}
			for (let i in this.players) {
				this.players[i].draw();
			}
			if (this.players[this.main_player_index].is_dead == 0) {
				this.check_collision();
			}
			pop();
    }
  
    this.read_network_data = function(flag, message) {
      if (flag == "player_count") {
        for (j=this.players.length; j < parseInt(message); j++){
          this.players[j] = new flappy_bird_player(this.Sprite, 200, 200, j%4);
        }
      } else if (flag == "assigned_id") {
        this.main_player_index = parseInt(message);
      } else if (flag == "pos_player") {
        this.read_in_player_position(message);
      } else if (flag == "new_player") {
        this.players[parseInt(message)] = new flappy_bird_player(this.Sprite, 200, 200, parseInt(message)%4);
				console.log("New player connected");
      } else if (flag == "rmv_player") {
        var player_index = parseInt(message);
        this.players.splice(player_index, 1);
        if (this.main_player_index > player_index) {
          this.main_player_index -= 1;
        }
      } else if (flag == "pipe_pos") {
        this.read_in_pipe_position(message);
			} else if (flag == "death") {
				this.kill(parseInt(message));
			} else if (flag == "end_game") {
				this.game_is_over = 1;
				this.game_over_time = Date.now()/1000;
			} else if (flag == "player_jump") {
				this.players[parseInt(message)].jump();
			}
    }

	this.read_in_player_position = function(data) {
		p_vals = convert_data_string(data, [0], [1, 2, 3, 4, 5, 6], [7]);
		if (this.players[p_vals[0]] === undefined) {
			this.players[p_vals[0]] = new flappy_bird_player_2(this.Sprite, 10, 10);
		}
		this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
	}

	this.read_in_pipe_position = function(data) { //format packet as pipe:x,y,pipeWidth
		p_vals = convert_data_string(data, [0], [1, 2, 3, 4, 5]);
		if (this.pipes[p_vals[0]] === undefined) {
			this.pipes[p_vals[0]] = new flappy_bird_pipe(this.pipe_sprite, 10, 10, 10, 200);
		}
		this.pipes[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5]);
	}

	this.check_collision = function() {
		if (this.players[this.main_player_index].is_dead) { return; }
		var kill_player = false;
		var player_draw_height = this.players[this.main_player_index].sprite_anim.draw_size;
		var player_draw_width = player_draw_height*this.players[this.main_player_index].sprite_anim.w_h_ratio,
			player_draw_angle = this.players[this.main_player_index].sprite_anim.rotation_angle*Math.PI/180;
		var player_margin_width = Math.max(player_draw_height*Math.abs(Math.sin(player_draw_angle))/2, 
											player_draw_width*Math.abs(Math.cos(player_draw_angle))/2);
		var player_margin_height = Math.max(player_draw_height*Math.abs(Math.cos(player_draw_angle))/2, 
											player_draw_width*Math.abs(Math.cos(player_draw_angle))/2);
		for (let i in this.pipes) {
			var lower_bound_x = this.pipes[i].x - this.pipes[i].pipe_width/2 - player_margin_width;
			var upper_bound_x = this.pipes[i].x + this.pipes[i].pipe_width/2 + player_margin_width;
			if (this.players[this.main_player_index].x > lower_bound_x && this.players[this.main_player_index].x < upper_bound_x) {
				console.log ("ahead of pipe "+i);

				var lower_bound_y = this.pipes[i].pipe_gap_y_pos - this.pipes[i].pipe_gap_width/2 + player_margin_height;
				var upper_bound_y = this.pipes[i].pipe_gap_y_pos + this.pipes[i].pipe_gap_width/2 - player_margin_height;

				/*
				//show hitbox
				rectMode(CORNER);
				stroke(color(255, 0, 0));
				strokeWeight(4);
				fill(color(0, 0, 0, 0));
				rect(lower_bound_x, lower_bound_y, (upper_bound_x-lower_bound_x), (upper_bound_y-lower_bound_y));
				*/

				if (this.players[this.main_player_index].y < lower_bound_y ||
					this.players[this.main_player_index].y > upper_bound_y) {
					kill_player = true;
					break;
				}
			}
		}
		if (kill_player == false) { return; }
		
		if (kill_player) {
			this.kill(this.main_player_index);
			send_data("dead_notice");
		}
	}

	this.kill = function(player_id) {
		this.players[player_id].is_dead = 1;
		this.players[player_id].sprite_anim.change_animation("die");
		this.players[player_id].jump();
		playSound("snare_reverb");
	}
}