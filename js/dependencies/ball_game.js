var seed_get = 1;
let background1;

function seed_random(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

class game_2_ball {
  constructor(bounds) {
      this.radius = 35;
      this.x = 0;
      this.y = 0;
      this.dx = 1;
      this.dy = 1;
      this.speed = 300;
      this.last_update = Date.now()/1000;
      this.bounds = bounds;
    }

    draw() {
      //console.log("drawing ball");
      fill(colors[4]);
      stroke(255);
      ellipse(this.x, this.y, this.radius);
      //console.log("drawing - "+str(this.x)+","+str(this.y));
      var bounce_flag = false;
      this.x += this.dx*this.speed*(Date.now()/1000 - this.last_update);
      this.y += this.dy*this.speed*(Date.now()/1000 - this.last_update);
      if (this.x < this.bounds["x"][0] || this.x >= this.bounds["x"][1]) {
        var adjust_factor = Math.max(this.bounds["x"][0], Math.min(this.x, this.bounds["x"][1])) - this.x;
        adjust_factor /= this.dx;
        var mid_time = -adjust_factor/this.speed;
        this.x += this.dx*adjust_factor;
        this.y += this.dy*adjust_factor;
        
        this.dx *= -1;
        this.dx -= 0.3*seed_random(seed_get+this.dx)-0.15;
        bounce_flag = true;
      }
      if (this.y < this.bounds["y"][0] || this.y >= this.bounds["y"][1]) {
        var adjust_factor = Math.max(this.bounds["y"][0], Math.min(this.y, this.bounds["y"][1])) - this.y;
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
    this.sprite_anim.change_animation("down");
    this.sprite_anim.stop();
    this.current_animation = "down";
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
		text_make(0, 20, 0, 1);
		fill(0, 0, 255);
		g_cam.text(this.name, this.x, this.y+60);
		this.sprite_anim.draw(this.x, this.y, false);
    fill(255, 0, 0);
    ellipse(this.x, this.y, 10);
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
    console.log("animation -> "+animation);
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
    return this.x+","+this.y+","+this.move+","+this.speed+","+this.facing+","+this.isDead+","+this.current_animation+","+this.name;
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
    this.result;
    this.players = [];
    this.balls = [];
    this.main_player_index;
    this.arrow_keys = {
			"left" : 37,
			"right" : 39,
			"up" : 38,
			"down" : 40
		};
    this.bounds = {"x":[0, 1536], "y":[0, 731]};
    this.greenSprite = loadImage(repo_address+"media/sprites/Spritesheet_64.png");
    this.font = loadFont('media/fonts/Alpharush.ttf');
    imageMode(CENTER);
    this.players[0] = new ball_game_player(this.greenSprite, 200, 200, "left", 0);
    this.main_player_index = 0;

    this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];
		//this.color_array = [this.red, this.cyan, this.purple, this.blue, this.yellow, this.pink];
		this.disco_ball = loadImage('media/misc/disco_ball_string.png');
		this.sparkle = loadImage(repo_address+"media/misc/sparkle.png");
		this.disco_sprites = loadImage(repo_address+"media/misc/disco_sprite.png");
		this.disco_sprites_2 = loadImage(repo_address+"media/misc/disco_sprite_7i.png");
		this.disco_sprites_3 = loadImage(repo_address+"media/misc/disco_sprite_5i.png");
		this.sx = 0;
		this.s5x = 0;
		this.s7x = 0;
		this.rando = [-20, 25, 6];
  }

  this.key_pressed = function(keycode) {
    if (this.players[this.main_player_index].isDead == 1) { return; }
    for (let i in this.arrow_keys){
      if (keycode == this.arrow_keys[i]){
        this.players[this.main_player_index].update_facing(i);
        this.players[this.main_player_index].update_moving(true);
        this.players[this.main_player_index].move = 1;

        break;
      }
    }
    send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
  }

  this.key_released = function(keycode) {
    if (this.players[this.main_player_index].isDead == 1) { return; }
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
    if(frameCount % 10 == 0){
			this.sx = (this.sx + 1) % 6;
		}

    image(this.background1, width/2, height/2, width, height);
    fill(0, 0, 0);
    let current_time = int(millis() / 1000);
    countdown = timelimit - current_time;

    text_make(0, 100, 0, 2);
    textFont(this.font);

    //draw disco ball image
		stroke(this.blue);
		strokeWeight(5);
		line(width/2, 0, width/2, 300);
		image(this.disco_sprites, width/2, 300, 96, 96, 128*this.sx, 0, 128, 128);
		//image(this.blue_line1, width/2, 175, 1, 175, this.blue_line1.width, this.blue_line1.length);
		imageMode(CENTER);
		image(this.sparkle, width/2+this.rando[2], 300+this.rando[0], abs(sin(frameCount/30))*30, abs(sin(frameCount/30))*30, 0, 0, this.sparkle.width, this.sparkle.height, CONTAIN, LEFT, CENTER);
   		image(this.sparkle, width/2+this.rando[0], 300+this.rando[1], abs(sin(frameCount/25))*40, abs(sin(frameCount/25))*40, 0, 0, this.sparkle.width, this.sparkle.height, COVER, CENTER, CENTER);
   		image(this.sparkle, width/2+this.rando[1], 300+this.rando[2], abs(sin(frameCount/20))*50, abs(sin(frameCount/20))*50, 0, 0, this.sparkle.width, this.sparkle.height, COVER, CENTER, CENTER);
    
    if(countdown > 0){
      fill(colors[4]);
      text("Time until start: " + countdown, width/2, height/2);
    }
    else {
      fill(colors[4]);
      text("DISCO BLITZ", width/2, height-200);
    }

    for (let i in this.players) {
      this.players[i].draw();
    //  if(this.players[i].isDead == 1){
    //    this.players[i].update_anim("dead");
    //   }
    }

    for (let i in this.balls) 
    { 
      this.balls[i].draw(); 
      var d_x = Math.abs(this.players[this.main_player_index].x-this.balls[i].x);
      if (d_x < this.balls[i].radius+this.players[this.main_player_index].sprite_anim.draw_size/2) {
        var d_y = Math.abs(this.players[this.main_player_index].y-this.balls[i].y);
        if (Math.sqrt(d_x*d_x+d_y*d_y) < this.balls[i].radius+10) {
          this.kill_player(this.main_player_index);
          send_data("player_dead");
        }
      }
    }

  }

  this.read_network_data = function(flag, message) {
    if (flag == "player_count") {
      for (j=this.players.length; j < parseInt(message); j++){
        this.players[j] = new ball_game_player(this.greenSprite, 300, 300, 1);
      }
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
      this.kill_player(parseInt(message));
    }
    else if (flag == "go_to_game_end_screen") {
		swap_current_state("game_end_screen");
	  }
  }

  this.kill_player = function(player_id) {
    this.players[player_id].isDead = 1;
    this.players[player_id].update_anim("dead");
    //this.players[player_id].update_facing("dead");
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string,  [0, 3, 6], [1, 2, 4], [5, 7, 8]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new ball_game_player(this.greenSprite, 300, 200, "left", (p_vals[0]%4)); }
    this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
  }

  this.read_in_ball_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 6], [1, 2, 3, 4], [5, 7, 8]);
    console.log ("reading in ball pos -> "+data_string);
    if (p_vals[0] >= this.balls.length && this.balls.length < 10) { this.balls[p_vals[0]] = new game_2_ball(this.bounds); }
    this.balls[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
  }

}
