var seed_get = 1;
let background1;

function seed_random(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

class game_2_ball {
  constructor(ball_sprite) {
      this.discoBall = ball_sprite;
      this.radius = 35;
      this.x = 0;
      this.y = 0;
      this.dx = 1;
      this.dy = 1;
      this.speed = 110;
      this.last_update = Date.now()/1000;
    }

    draw() {
      //console.log("drawing ball");
      fill(colors[4]);
      stroke(255);
      //ellipse(this.x, this.y, this.radius);
      image(this.discoBall,this.x,this.y);
      //console.log("drawing - "+str(this.x)+","+str(this.y));
      var bounce_flag = false;
      this.x += this.dx*this.speed*(Date.now()/1000 - this.last_update);
      this.y += this.dy*this.speed*(Date.now()/1000 - this.last_update);
      if (this.x < 0 || this.x >= 500) {
        var adjust_factor = Math.max(0, Math.min(this.x, 500)) - this.x;
        adjust_factor /= this.dx;
        var mid_time = -adjust_factor/this.speed;
        this.x += this.dx*adjust_factor;
        this.y += this.dy*adjust_factor;
        
        this.dx *= -1;
        this.dx -= 0.3*seed_random(seed_get+this.dx)-0.15;
        bounce_flag = true;
      }
      if (this.y < 0 || this.y >= 500) {
        var adjust_factor = Math.max(0, Math.min(this.y, 500)) - this.y;
        adjust_factor /= this.dy;
        var mid_time = -adjust_factor/this.speed;
        this.x += this.dx*adjust_factor;
        this.y += this.dy*adjust_factor;
        this.dy *= -1;
        this.dy += 0.3*seed_random(seed_get+this.dy+0.1)-0.15;
        bounce_flag = true;
        
      }
      if (bounce_flag) {
        var factor = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
        this.dy /= factor;
        this.dx /= factor;
        this.x += this.dx*this.speed*mid_time;
        this.y += this.dy*this.speed*mid_time;
      }
      this.last_update = Date.now()/1000;
    }

    update_data(x, y, dx, dy, speed) {
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.speed = speed;
      this.last_update = Date.now()/1000;
    }

}

var colors = ['#E53564', '#2DE2E6', '#9700CC', '#035EE8', '#F3C752', '#F6019D'];

class ball_game_player { 
	constructor(spriteSheet, x, y, face, color) {
		this.temp_sprite_sheet = spriteSheet;
    this.spriteColor = color;
		this.sprite_anim = new sprite_animation_object(spriteSheet, 100, 64, 64,
			{
				"left_right": {
					"row": 1+10*this.spriteColor,
					"row_length": 4
				},
				"down": {
					"row": 0+10*this.spriteColor,
					"row_length": 4
				},
        "standing" : {
          "row" : 1+10*this.spriteColor,
          "row_length": 1,
          "first_tile": 1
        },
				"up": {
					"row": 2+10*this.spriteColor,
					"row_length": 4
				},
        "dead": {
          "row": 7+10*this.spriteColor,
          "row_length": 1
        }
			});
  
		this.x = x;
		this.y = y;
		this.move = 0;
		this.speed = 150;
    this.isDead = 0;
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
		this.last_update = millis()/1000;
		this.name = "temp name";
	}
	
	draw() {
		push();
    
		//if(this.move == 0) { this.sprite_anim.stop(); }
   // if(this.isDead == 1){
   //   console.log("line 112");
   //   this.update_anim("dead");
  //  }
		if (this.move) {
			if (this.facing == "left") { this.x -= this.speed * (millis()/1000 - this.last_update); }
			else if (this.facing == "right") { this.x += this.speed * (millis()/1000 - this.last_update); }
			else if (this.facing == "up") { this.y -= this.speed * (millis()/1000 - this.last_update); }
			else if (this.facing == "down") { this.y += this.speed * (millis()/1000 - this.last_update); }
			this.last_update = millis()/1000;
		} 
    console.log("player coords -> "+this.x+", "+this.y);
		text_make(0, 20, 0, 1);
		fill(0, 0, 255);
		//g_cam.text(this.name, this.x, this.y+60);
		this.sprite_anim.draw(this.x, this.y, false);
    fill(255, 0, 0);
		pop();
	}

  update_anim(animation) {
    if(animation == this.current_animation) {return;}
    if(animation == "dead")  
    {
      this.move = 0; 
      this.sprite_anim.stop(); 
    }
    else {this.move = 1; this.sprite_anim.start(); }
    this.sprite_anim.change_animation(animation);
    this.current_animation = animation;
    }
	
	update_facing(facing) {
		if (facing == this.facing) { return; }
		this.facing = facing;
		if (facing == "left" || facing == "right") {
			this.sprite_anim.change_animation("left_right");
			if (facing == "left") { this.sprite_anim.flip(1); }
			else { this.sprite_anim.flip(0); }
		} else if (facing == "up") {
			this.sprite_anim.flip(3);
			this.sprite_anim.change_animation("up");
		} else if (facing == "down") {
			this.sprite_anim.flip(4);
			this.sprite_anim.change_animation("down");
		} else if (facing == "dead") {
      this.sprite_anim.flip(0);
      this.sprite_anim.change_animation("dead");
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

	update_data(x, y, move, speed, facing, is_dead, animation, name){
	  //if (sprite != null) {this.spriteSheet = }
	  if (x != null) { this.x = x; }
	  if (y != null) { this.y = y; }
	  if (move != null) { this.update_moving(move); }
	  if (speed != null) { this.speed = speed; }
    if (is_dead != null) {this.isDead = this.is_dead; }
	  if (facing != null) { this.update_facing(facing); }
		if (name != null) { this.name = name; }
    if (animation != null) { this.update_anim(animation); }
	}

  make_data_raw(){
    return this.x+","+this.y+","+this.move+","+this.speed+","+this.facing+","+this.isDead+","+this.animation+","+this.name;
  }
  
  make_data(player_index){
    return "pos_player:"+player_index+","+this.make_data_raw();
  }
}

var font;
var countdown;
var ballcount = 0;
var timelimit = 20; //20 seconds
function ball_game() {
  this.setup = function() {
    this.background1 = loadImage(repo_address+"media/backgrounds/disco_blitz_background.png");
    this.ball_sprite = loadImage("media/misc/disco_ball_resized.png");

    this.result;
    this.names = [];
    this.players = [];
    this.balls = [];
    this.main_player_index;
    this.arrow_keys = {
			"left" : 37,
			"right" : 39,
			"up" : 38,
			"down" : 40
		};
    this.greenSprite = loadImage(repo_address+"media/sprites/Spritesheet_64.png");
    this.font = loadFont('media/fonts/Alpharush.ttf');
    imageMode(CENTER);
    this.players[0] = new ball_game_player(this.greenSprite, 200, 200, 0, 0);
    this.main_player_index = 0;
    send_data("get_names");
  }

  this.key_pressed = function(keycode) {
    for (let i in this.arrow_keys){
      if (this.players[this.main_player_index].isDead) { return; }
      if (keycode == this.arrow_keys[i]){
        this.players[this.main_player_index].update_facing(i);
        this.players[this.main_player_index].update_moving(true);
        this.players[this.main_player_index].move = 1;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        return;
      }
    }
  }

  this.key_released = function(keycode) {
    for (let i in this.arrow_keys){
      if(keycode == this.arrow_keys[i] && this.players[this.main_player_index].facing == i) {
        this.players[this.main_player_index].dx = 0;
        this.players[this.main_player_index].update_moving(false);
        this.players[this.main_player_index].move = 0;
      }
    }
    send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
  }

  this.mouse_pressed = function() { return; }
  this.mouse_released = function() { return; }

  this.draw = function() {
    image(this.background1, width/2, height/2, width, height);
    fill(0, 0, 0);
    let current_time = int(millis() / 1000);
    countdown = timelimit - current_time;

    text_make(0, 200, 0, 2);
    textFont(this.font);
    
    if(countdown > 0){
      fill(colors[4]);
      text("Time until start: " + countdown, width/2, height/2);
    }
    else {
      fill(colors[4]);
      text("DISCO BLITZ", width/2, height/2);
    }
    
    text_make(0, 20, 0, 2);
    textFont(this.font);

    for (let i in this.players) {
      this.players[i].draw();
    //  if(this.players[i].isDead == 1){
    //    this.players[i].update_anim("dead");
    //   }
      g_cam.text(this.names[i], this.players[i].x, this.players[i].y+60);
    }

    for (let i in this.balls) 
    { 
      this.balls[i].draw(); 
    }

  }

  this.read_network_data = function(flag, message) {
    if (flag == "player_count") {
      for (j=this.players.length; j < parseInt(message); j++){
        this.players[j] = new ball_game_player(this.greenSprite, 300, 300, 1);
      }
      send_data("get_names");
    } else if (flag == "assigned_id") {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") {
      this.read_in_player_position(message);
    } else if (flag == "new_player") {
      this.players[parseInt(message)] = new ball_game_player(this.greenSprite, 300, 300, 0, (parseInt(message)%4));
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
     //make a flag for a dead player
    else if (flag == "player_dead") {
      console.log("dead player ->"+message);
      this.players[parseInt(message)].isDead = 1;
      this.players[parseInt(message)].update_anim("dead");
      this.players[parseInt(message)].update_facing("dead");
    } else if (flag == "go_to_game_end_screen") {
		  swap_current_state("game_end_screen");
	  } else if (flag == "Name of") {
      if(this.players[p_vals[0]] === undefined) {this.players[p_vals[0]]=new game_2_player(this.greenSprite, null, numberOfPlayers, 3);}
      p_vals = convert_data_string(message,[0],[],[1]);
      console.log(message);
      this.names[p_vals[0]]=p_vals[1];
    }
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string,  [0, 3, 6], [1, 2, 4], [5, 7, 8]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new ball_game_player(this.greenSprite, 300, 200, 0, (p_vals[0]%4)); }
    this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
  }

  this.read_in_ball_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0], [1, 2, 3, 4, 5]);
    console.log ("reading in ball pos -> "+data_string);
    if (p_vals[0] >= this.balls.length && this.balls.length < 10) { this.balls[p_vals[0]] = new game_2_ball(this.ball_sprite); }
    this.balls[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5]);
  }

}
