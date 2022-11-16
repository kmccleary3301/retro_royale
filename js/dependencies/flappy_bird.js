class flappy_bird_pipe {
	constructor(x_offset, pipe_width, pipe_gap_y_pos) {
		this.x_offset = x_offset;
		this.x;
		this.pipe_width = pipe_width;
		this.pipe_gap_y_pos = pipe_gap_y_pos;
		this.hasBeenPassed = false;

		this.last_update = Date.now()/1000;
	}
	draw() {
		push();
		//this.x = this.x_offset - 200*(Date.now()/1000 - this.last_update);
		rect(this.x-100,0,200,this.pipe_gap_y_pos-this.pipe_width/2);//draws top half
		rect(this.x-100,this.pipe_gap_y_pos+this.pipe_width/2,200,height-this.pipe_gap_y_pos-this.pipe_width/2); //draws bottom half
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
	constructor(spriteSheet, x, y, face) {
		this.spriteSheet = spriteSheet;

		this.temp_sprite_sheet = spriteSheet;
		this.sprite_anim = new sprite_animation_object(spriteSheet, 100, 64, 64,
			{
				// "left_right": {
				// 	"row": 0,
				// 	"row_length": 6
				// },
				// "down": {
				// 	"row": 1,
				// 	"row_length": 6
				// },
				// "up": {
				// 	"row": 2,
				// 	"row_length": 6
				// },
				"jump": {
					"row": 5,
					"row_length": 1
				},
				"die": {
					"row": 7,
					"row_length": 1
				}
			});
		
		this.sx = 0;        //Frame counter for when the player is moving.
		this.x = x;
		this.y = y;
		this.velocity = 0;
		this.acceleration = 0; //pixels per second per second
		this.move = 0;      //Whether or not player is moving. Int is more convenient than boolean for network messages.
		this.speed = 5;     // Player movement speed
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for East West North South respectively
		this.sprite_row = 0;
		this.fruit_holding = 0;
		this.fruit_held_id = 0;
		this.bounds = [0, 2000, 0, 1000];
		this.playerIsInPipe = false;
		this.isDead = false;
		this.pipesPassed = 0;

		this.update_anim("jump");
	}

	draw() {
		push();
		// g_cam.translate(this.x, this.y);
		// if (this.move == 1){
		// 	if (this.facing < 2){
		// 		scale(1-this.facing*2, 1);  
		// 		g_cam.image(this.spriteSheet, null, null, 100, 100, 80*(this.sx+1), 0, 80, 80);
		// 		this.x = this.x + this.speed * (1-this.facing*2);
		// 	} else if (this.facing == 2) {
		// 		g_cam.image(this.spriteSheet, null, null, 100, 100, 80*(this.sx), 400, 80, 80);
		// 		this.y = this.y - this.speed;
		// 	} else if (this.facing == 3) {
		// 		g_cam.image(this.spriteSheet, null, null, 100, 100, 480 + 80*(this.sx), 400, 80, 80);
		// 		this.y = this.y + this.speed;
		// 	}

		// 	this.x = Math.min(this.bounds[1]-40, Math.max(this.bounds[0]+40, this.x));    //Prevents the player from leaving the game boundaries.
		// 	this.y = Math.min(this.bounds[3]-40, Math.max(this.bounds[2]+40, this.y));   

		// }
		// else {
		// 	if (this.facing < 2){
		// 		scale(1-this.facing*2, 1);  
		// 		g_cam.image(this.spriteSheet, null, null, 100, 100, 0, 0, 80, 80);
		// 	} else if (this.facing == 2) {
		// 		g_cam.image(this.spriteSheet, null, null, 100, 100, 0, 400, 80, 80);
		// 	} else if (this.facing == 3) {
		// 		g_cam.image(this.spriteSheet, null, null, 100, 100, 480, 400, 80, 80);
		// 	}
		// }
		
		// if (frameCount % 6 == 0) {
		// 	this.sx = (this.sx + 1) % 6;
		// }
		//send_data_debug("debug:velocity is "+this.velocity);
		
		//this.velocity += 0.1*this.acceleration;
		//this.y += this.velocity;
		//console.log("velocity -> "+this.velocity);
		this.update_rotation(this.velocity);

		this.sprite_anim.draw(this.x, this.y, true);

		pop();
	}

	update_anim(animation) {
		if (animation == this.current_animation) { return; }
		//if (animation == "standing" || animation == "dead") { this.moving = 0; this.sprite_anim.stop(); }
		else  { this.moving = 1; this.sprite_anim.start(); }
		this.sprite_anim.change_animation(animation);
		this.current_animation = animation;
	}
	update_rotation(velocity) {
		this.sprite_anim.rotation_angle = -1*180*Math.atan(velocity/(2000));
	}

	//jump() {
	//	this.velocity = 100;
	//}

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
	
	update_data(sprite, x, y, move, speed, facing, fruit_holding, fruit_id, velocity){
		//if (sprite != null) {this.spriteSheet = }
		if (x != null) { this.x = x; }
		if (y != null) { this.y = y; }
		if (move != null) { this.move = move; }
		if (speed != null) { this.speed = speed; }
		if (facing != null) { this.facing = facing; }
		if (fruit_holding != null) { this.fruit_holding = fruit_holding; }
		if (fruit_id != null) { this.fruit_held_id = fruit_id; }
		if (velocity != null) {this.velocity = velocity; }
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

class flappy_bird_player_2 {
	constructor(sprite_sheet, x, y) {
		this.sprite_anim = new sprite_animation_object(sprite_sheet, 100, 64, 64,
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
		//this.acceleration = 0;
		this.hasJumped = false;
	}
	
	draw() {
		push();
		var slope = (Date.now()/1000 - this.last_jump - 1);
		this.sprite_anim.rotation_angle = 180*Math.atan(slope)-90;
		this.sprite_anim.draw(this.x, this.y, true);
		this.update();
		
		pop();
	}

	jump() {
		this.y_on_last_jump = int(this.y);
		this.last_jump = Date.now()/1000;
	}
  
	update() {
	  	this.y = float(this.y_on_last_jump) + (this.acceleration - this.acceleration*Math.pow((Date.now()/1000 - this.last_jump)*5-1, 2));
	}
  
	make_data_raw() {
	  return this.x+","+this.y+","+this.last_jump+","+this.y_on_last_jump+","+this.acceleration;
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

      imageMode(CENTER);
      //this.players[0] = new flappy_bird_player(this.Sprite, 200, 200, 0);

	  this.players[0] = new flappy_bird_player_2(this.Sprite, 200, 200);
      this.main_player_index = 0;
	  //this.playerIsInPipe = false;
    }
  
    this.key_pressed = function(keycode) {
      // for (i=0;i<4;i++){
      //   if (keycode == this.arrow_keys[i]){
      //     this.players[this.main_player_index].facing = i;
      //     this.players[this.main_player_index].move = 1;
      //     this.players[this.main_player_index].sx = 0;
      //     send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
      //     return;
      //   }
      // }
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
    //   g_cam.x = this.players[this.main_player_index].x;
    //   g_cam.scale = 0.8;
		background(200, 200, 200);

		//image(this.backGround,width/2,height/2,width,height);
		//drawing the first loop of the background
		image(this.backGround,this.backGround1XPosition,this.backGround1YPosition,
				this.backGroundWidth,this.backGroundHeight);
		//drawing the second loop of the background
		image(this.backGround,this.backGround2XPosition,this.backGround2YPosition,
				this.backGroundWidth, this.backGroundHeight);

		//   this.bilbo = 0;
		//   for(let i in this.players) {
		// 	this.bilbo++;
		//   }
		
		//   console.log("Number Of Players:"+this.bilbo);

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
	
	/*
    this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id,velocity
      p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7, 8], [1, 2, 4]);
	  if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new flappy_bird_player(this.Sprite, 200, 200, 0)}
      this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
      //send_data("debug:"+p_vals[1]);
    //   for(let i in this.pipesList) { //this activates on every tick
    //     this.pipesList[i].x -= 400*0.035; //speed times tick interval
    //   }
    }
	*/
	
	this.read_in_player_position = function(data) {
		p_vals = convert_data_string(data, [0], [1, 2, 3, 4, 5]);
		if (this.players[p_vals[0]] === undefined) {
			this.players[p_vals[0]] = new flappy_bird_player_2(this.Sprite, 10, 10);
		}
		this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5])
	}

	/*
    this.read_in_pipe_position = function(data_string) { //format packet as pipe:x,y,pipeWidth
      pipe_vals = convert_data_string(data_string, [0,1,2]);
      this.pipesList[this.pipesList.length] = new flappy_bird_pipe(pipe_vals[0],pipe_vals[1],pipe_vals[2]); //I changed this from this.pipesList.push to what it is now. -Kyle
      send_data("debug:new pipe "+this.pipesList[this.pipesList.length-1].make_data); //James, you had a bug here that I fixed. Referenced pipesList instead of this.pipesList
    }
	*/
	this.read_in_pipe_position = function(data) { //format packet as pipe:x,y,pipeWidth
		p_vals = convert_data_string(data, [0], [1, 2, 3, 4]);
		if (this.pipes[p_vals[0]] === undefined) {
			this.pipes[p_vals[0]] = new flappy_bird_pipe(10, 10, 10);
		}
		this.pipes[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4])
	}
  }