class flappy_bird_pipe {
	constructor(x,y,pipeWidth) {
		this.x = x;
		this.y = y;
		this.pipeWidth = pipeWidth;
		this.hasBeenPassed = false;
	}
	draw() {
		push();
		rect(this.x-100,0,200,this.y-(this.pipeWidth/2));//draws top half
		rect(this.x-100,this.y+(this.pipeWidth/2),200,height-this.y-(this.pipeWidth/2)); //draws bottom half
		//-100 makes it so the rectangle is drawn centered with the pipe's x position,
		//not left-aligned
		pop();
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
		console.log("velocity -> "+this.velocity);
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

function flappy_bird() {
    this.setup = function() {
      this.players = [];
      this.pipesList = [];
      this.main_player_index;
      this.arrow_keys = [39, 37, 38, 40]; //EWNS
      this.space_bar = 32; //space bar
      //this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
	  this.Sprite = loadImage(repo_address+"media/sprites/Spritesheet_64.png");
	  this.backGround = loadImage("media/background/loopable_city_background_upscaled.png")

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
      this.players[0] = new flappy_bird_player(this.Sprite, 200, 200, 0);
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
        //this.players[this.main_player_index].jump();
		send_data("jump");
		send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
		this.players[this.main_player_index].velocity = 990;
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

	  this.bilbo = 0;
	  for(let i in this.players) {
		this.bilbo++;
	  }
	  
	  console.log("Number Of Players:"+this.bilbo);

      fill(0, 0, 0);
      text_make(0, 200, 0, 2);
      textAlign(CENTER, CENTER);
      text("FLAP!", width/2, height/2);

	  //draws the pipes
      for (let i in this.pipesList) {
        if(this.pipesList[i].x > 0) {
          this.pipesList[i].draw();
        }
        else {
          this.pipesList.shift;
        }
      }

	  this.everyPlayerIsDead = true;

	  //draws the players

      for (let i in this.players) {
		this.players[i].draw();
		if(this.players[i].isDead == false)
			this.everyPlayerIsDead = false;
		else {
			this.players[i].update_anim("die");
		}
	  }

	//   if(this.everyPlayerIsDead) {
	// 	send_data("swap_current_state:game_end_screen");
	// 	swap_current_state("game_end_screen");
	//   }

	  this.players[this.main_player_index].playerIsInPipe = false;

	  for(let p in this.pipesList) {
		/*if(this.players[this.main_player_index].x > this.pipesList[p].x - 100-40 && this.players[this.main_player_index].x < this.pipesList[p].x+100+40) { 
			if(this.players[this.main_player_index].y < this.pipesList[p].y-(this.pipesList[p].pipeWidth/2)+40) {
				this.players[this.main_player_index].isDead = true;
				send_data("death");
				this.players[this.main_player_index].playerIsInPipe = true;
				this.players[this.main_player_index].update_anim("die");
			}
			else if(this.players[this.main_player_index].y > this.pipesList[p].y+(this.pipesList[p].pipeWidth/2)-40) {
				this.players[this.main_player_index].isDead = true;
				send_data("death");
				this.players[this.main_player_index].playerIsInPipe = true;
				this.players[this.main_player_index].update_anim("die");
			}
		}*/
		if(this.players[this.main_player_index].y<0 && this.players[this.main_player_index].isDead == false) {
			this.players[this.main_player_index].isDead = true;
			send_data("death");
			this.players[this.main_player_index].playerIsInPipe = true;
			//this.players[this.main_player_index].update_anim("die");
		}
		else if(this.pipesList[p].hasBeenPassed == false && 
				this.players[this.main_player_index].x > this.pipesList[p].x && 
				this.players[this.main_player_index].isDead == false) {
			//if the player hasn't passed the pipe and is ahead of it
			this.players[this.main_player_index].pipesPassed++;
			this.pipesList[p].hasBeenPassed = true;
		}
	  }

	  //collision loop for main player
	//   if(this.players[this.main_player_index].y < height+40  || this.players[this.main_player_index].isDead == false){
	// 	for(let p in this.pipesList) {
	// 		if(this.players[this.main_player_index].x > this.pipesList[p].x-200-40 && this.players[this.main_player_index].x < this.pipesList[p].x+40) {
	// 			console.log("Crash da game sis");
	// 			if(this.players[this.main_player_index].y < this.pipesList[p].y-(this.pipesList[p].pipeWidth/2)+40) {
	// 				//if player is in top pipe plus half of the height of their spreight
	// 				this.players[main_player_index].isDead = true;
	// 				//this.playerIsInPipe = false;
	// 			}
	// 			else if(this.players[this.main_player_index].y > this.pipesList[p].y+(this.pipesList[p].pipeWidth/2)-40) {
	// 				//if player is in bottom pipe minus half of the height of their spreight
	// 				this.players[main_player_index].isDead = true;
	// 				//this.playerIsInPipe = false;
	// 			}
	// 		}
	// 		else if(this.pipesList[p].hasBeenPassed == false && this.players[this.main_player_index].x > this.pipesList[p].x) {
	// 			//if the player hasn't passed the pipe and is ahead of it
	// 			this.players[this.main_player_index].pipesPassed++;
	// 			this.pipesList[p].hasBeenPassed = true;
	// 		}
	// 	}
	// }

	  fill(200,0,0);
	  text_make(0,20,0,2);
	  textAlign(LEFT,CENTER);
	  text("Player is in Pipe: "+this.players[this.main_player_index].playerIsInPipe, 20, 20);
      text("Player is dead: "+this.players[this.main_player_index].isDead,20,50);
      text("Pipes Passed: "+this.players[this.main_player_index].pipesPassed,20,80);
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
      } else if (flag == "rmv_player") {
        var player_index = parseInt(message);
        this.players.splice(player_index, 1);
        if (this.main_player_index > player_index) {
          this.main_player_index -= 1;
        }
      } else if (flag == "pipe") {
        this.read_in_pipe_position(message);
      } else if (flag == "move_pipes") {
		this.move_pipes();
	  } else if (flag == "death") {
		this.players[message].isDead = true;
	  } else if (flag == "go_to_game_end_screen") {
		swap_current_state("game_end_screen");
	  }
    }
  
    this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id,velocity
      p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7, 8], [1, 2, 4]);
      this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
      //send_data("debug:"+p_vals[1]);
    //   for(let i in this.pipesList) { //this activates on every tick
    //     this.pipesList[i].x -= 400*0.035; //speed times tick interval
    //   }
    }
  
    this.read_in_pipe_position = function(data_string) { //format packet as pipe:x,y,pipeWidth
      pipe_vals = convert_data_string(data_string, [0,1,2]);
      this.pipesList[this.pipesList.length] = new flappy_bird_pipe(pipe_vals[0],pipe_vals[1],pipe_vals[2]); //I changed this from this.pipesList.push to what it is now. -Kyle
      send_data("debug:new pipe "+this.pipesList[this.pipesList.length-1].make_data); //James, you had a bug here that I fixed. Referenced pipesList instead of this.pipesList
    }

	this.move_pipes = function() {
		this.numberOfPlayers = 0;
		for(let i in this.players) {
			this.numberOfPlayers++;
		}
		for(let i in this.pipesList) {
			this.pipesList[i].x -= 400 * 0.035;
		}
		this.backGround1XPosition -= 400 * 0.035;
		this.backGround2XPosition -= 400 * 0.035;
		if(this.backGround1XPosition+(this.backGroundWidth)/2 <= 0) {
			this.backGround1XPosition = this.backGround2XPosition;
			//this.backGround1XPosition = width/2;
			this.backGround2XPosition = this.backGround1XPosition + this.backGroundWidth-20;
		}
	}
  }