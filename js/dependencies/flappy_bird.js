class flappy_bird_pipe {
	constructor(x_offset, pipe_width, pipe_gap_y_pos, pipe_gap_width) {
		this.x_offset = x_offset;
		this.x;
		this.pipe_width = pipe_width;
		this.pipe_gap_width = pipe_gap_width;
		this.pipe_gap_y_pos = pipe_gap_y_pos;
		this.hasBeenPassed = false;

		this.last_update = Date.now()/1000;
	}
	draw() {
		push();
		//this.x = this.x_offset - 200*(Date.now()/1000 - this.last_update);
		rect(this.x-100,0,200,this.pipe_gap_y_pos-this.pipe_gap_width/2);//draws top half
		rect(this.x-100,this.pipe_gap_y_pos+this.pipe_width/2,200,height-this.pipe_gap_y_pos-this.pipe_gap_width/2); //draws bottom half
		//-100 makes it so the rectangle is drawn centered with the pipe's x position,
		//not left-aligned
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

	update_data(x_offset, x, pipe_width, pipe_gap_y_pos) {
		if (x_offset != null) { this.x_offset = x_offset; }
		if (x != null) { this.x = x; }
		if (pipe_width != null) { this.pipe_width = pipe_width; }
		if (pipe_gap_y_pos != null) { this.pipe_gap_y_pos = pipe_gap_y_pos; }
	}
}

class flappy_bird_player {
	constructor(sprite_sheet, x, y) {
		this.sprite_anim = new sprite_animation_object(sprite_sheet, 70, 64, 64,
			{
				"jump": {
					"row": 5,
					"row_length": 1
				},
				"die": {
					"row": 7,
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
		this.hasJumped = false;
	}
	
	draw() {
		push();
		var slope = (Date.now()/1000 - this.last_jump - 1);
		this.sprite_anim.rotation_angle = 180*Math.atan(slope)+90;
		this.sprite_anim.draw(this.x, this.y, true);
		this.update();
		
		pop();
	}

	jump() {
		//if (this.is_dead) { return; }
		this.y_on_last_jump = int(this.y);
		this.last_jump = Date.now()/1000;
	}
  
	update() {
	  	this.y = float(this.y_on_last_jump) + (this.acceleration - this.acceleration*Math.pow((Date.now()/1000 - this.last_jump)*5-1, 2));
	}
  
	make_data_raw() {
	  return this.x+","+this.y+","+this.last_jump+","+this.y_on_last_jump+","+this.acceleration+","+this.is_dead;
	}
  
	make_data(){
	  if (arguments[0] === undefined) {
		return "pos_player:"+this.make_data_raw();
	  } else {
		return "pos_player:"+player_index+","+this.make_data_raw();
	  }
	}
  
	update_data(x, y, last_jump, y_on_last_jump, acceleration){
	  if (x != null) { this.x = x; }
	  if (y != null) { this.y = y; }
	  if (last_jump != null) { this.last_jump = last_jump; }
	  if (y_on_last_jump != null) { this.y_on_last_jump = y_on_last_jump; }
	  if (acceleration != null) { this.acceleration = acceleration; }
	}
  }

function flappy_bird() {
    this.setup = function() {
      this.players = [];
      this.pipes = [];
      this.main_player_index = 0;
      this.space_bar = 32; //space bar
      //this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
	  this.Sprite = loadImage(repo_address+"media/sprites/Spritesheet_64.png");
	  this.backGround = loadImage("media/background/loopable_city_background_upscaled.png")
	  
	  this.game_is_over = false;

	  //1280x330 height/330
	  this.backGroundOriginalHeight = 330;
	  this.backGroundOriginalWidth = 1280;

	  this.backGroundHeight = height;
	  this.backGroundWidth = height/this.backGroundOriginalHeight*width;
	  this.backGround1XPosition = width/2;
	  this.backGround1YPosition = height/2;
	  this.backGround2XPosition = width/2+this.backGroundWidth-20;
	  this.backGround2YPosition = height/2;

	  this.players[0] = new flappy_bird_player(this.Sprite, 200, 200, 200);
      this.main_player_index = 0;
    }
  
    this.key_pressed = function(keycode) {
		//if (this.players[this.main_player_index].is_dead) { return; }
		if(keycode == this.space_bar) {
			if (this.players[this.main_player_index].isDead) { return; }
			this.players[this.main_player_index].jump();
			send_data("jump_notice");
			send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
		}
    }
  
    this.mouse_pressed = function() { return; }
    this.mouse_released = function() { return; }
  
    this.draw = function() {
		background(200, 200, 200);
		image(this.backGround,this.backGround1XPosition,this.backGround1YPosition,
				this.backGroundWidth,this.backGroundHeight);
		image(this.backGround,this.backGround2XPosition,this.backGround2YPosition,
				this.backGroundWidth, this.backGroundHeight);

		fill(0, 0, 0);
		text_make(0, 200, 0, 2);
		textAlign(CENTER, CENTER);
		text("FLAP!", width/2, height/2);
		

		for (let i in this.pipes) {
			this.pipes[i].draw();
		}
		for (let i in this.players) {
			this.players[i].draw();
		}
		this.check_collision();
    }
  
    this.read_network_data = function(flag, message) {
      if (flag == "player_count") {
        for (j=this.players.length; j < parseInt(message); j++){
          this.players[j] = new flappy_bird_player(this.Sprite, 200, 200, 0);
        }
      } else if (flag == "assigned_id") {
        this.main_player_index = parseInt(message);
      } else if (flag == "pos_player") {
        this.read_in_player_position(message);
      } else if (flag == "new_player") {
        this.players[parseInt(message)] = new flappy_bird_player(this.Sprite, 200, 200, 0);
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
		this.players[message].isDead = true;
	  }
    }

	this.read_in_player_position = function(data) {
		p_vals = convert_data_string(data, [0], [1, 2, 3, 4, 5, 6]);
		if (this.players[p_vals[0]] === undefined) {
			this.players[p_vals[0]] = new flappy_bird_player_2(this.Sprite, 10, 10);
		}
		this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6])
	}

	this.read_in_pipe_position = function(data) { //format packet as pipe:x,y,pipeWidth
		p_vals = convert_data_string(data, [0], [1, 2, 3, 4]);
		if (this.pipes[p_vals[0]] === undefined) {
			this.pipes[p_vals[0]] = new flappy_bird_pipe(10, 10, 10, 200);
		}
		this.pipes[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4])
	}

	this.check_collision = function() {
		if (this.players[this.main_player_index].is_dead) { return; }
		var pipe_index = false;
		var player_draw_height = this.players[this.main_player_index].sprite_anim.draw_size;
		var player_draw_width = player_draw_height*this.players[this.main_player_index].sprite_anim.w_h_ratio,
			player_draw_angle = this.players[this.main_player_index].sprite_anim.rotation_angle*Math.PI/180;
		var player_margin_width = Math.max(player_draw_height*Math.abs(Math.sin(player_draw_angle))/2, 
											player_draw_width*Math.abs(Math.cos(player_draw_angle))/2);
		for (let i in this.pipes) {
			var distance = this.players[this.main_player_index].x - this.pipes[i].x + this.pipes[i].pipe_width/2;
			if (distance > 0 && distance < this.pipes[i].pipe_width-player_draw_width) {
				console.log ("ahead of pipe "+i);
				pipe_index = i;
				break;
			}
		}
		if (pipe_index == false) { return; }
		var player_margin_height = Math.max(player_draw_height*Math.abs(Math.cos(player_draw_angle))/2, 
											player_draw_width*Math.abs(Math.cos(player_draw_angle))/2);
		if (Math.abs(this.players[this.main_player_index].y - this.pipes[pipe_index].pipe_gap_y_pos) > 
			this.pipes[pipe_index].pipe_gap_width/2-player_margin_height) {
			this.kill(this.main_player_index);
		}
	}

	this.kill = function(player_id) {
		this.players[player_id].is_dead = 1;
		this.players[player_id].sprite_anim.change_animation("die");
		send_data("dead_notice");
	}
  }