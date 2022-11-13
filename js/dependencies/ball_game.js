var seed_get = 1;
let background1;

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

    draw() {
      //console.log("drawing ball");
      fill(colors[4]);
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

    update_data(x, y, dx, dy, speed) {
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.speed = speed;
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
					"row": 0+10*this.spriteColor,
					"row_length": 4
				},
				"down": {
					"row": 1+10*this.spriteColor,
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
		this.current_tile_index = 0;
    
		this.previous_tile_index = 0;
		this.last_update = millis()/1000;
		this.name = "temp name";
	}
	
	draw() {
		push();
    


		if(this.move == 0) { this.sprite_anim.stop(); }
    if(this.isDead == 1){
      console.log("line 112");
      this.update_anim("dead");
      return;
    }
		if (this.move) {
			if (this.facing == "left") { this.x -= this.speed * (millis()/1000 - this.last_update); }
			else if (this.facing == "right") { this.x += this.speed * (millis()/1000 - this.last_update); }
			else if (this.facing == "up") { this.y -= this.speed * (millis()/1000 - this.last_update); }
			else if (this.facing == "down") { this.y += this.speed * (millis()/1000 - this.last_update); }
			this.last_update = millis()/1000;
		} 
    for (let i in this.players){
      if (this.players[i].isDead) { continue; }
      for (let j in this.balls) {
        var dx= Math.abs(this.balls[j].x-(this.players[i].x));
        var dy= Math.abs(this.balls[j].y-(this.players[i].y));
        var distance = Math.sqrt(dx*dx + dy*dy);
        console.log("distance: "+distance);
          if (distance <= this.balls[j].radius){
            console.log("Player "+i+" is dead");
            this.players[i].isDead = 1;
            this.players[i].update_anim("dead");
            //send player dead message
            //sessions[this.session_id].clients[i].send("player_dead:"+i);
            sessions[this.session_id].broadcast("player_dead:"+i, [i]);
          }
      }
    }
		text_make(0, 20, 0, 1);
		fill(0, 0, 255);
		g_cam.text(this.name, this.x, this.y+60);
		this.sprite_anim.draw(this.x, this.y, true);
		pop();
	}

  update_anim(animation) {
    if(animation == this.current_animation) {return;}
    if(animation == "dead")  
    {
      console.log("line 135");
      this.move = 0; 
      this.sprite_anim.stop(); 
    }
    else {this.move = 1; this.sprite_anim.start(); }
    this.sprite_anim.change_animation(animation);
    this.current_animation = animation;
    }
  
	get_pos_string(){
	  var string_make = str(this.x)+","+str(this.y)+","+str(this.move)+","+str(this.facing);
	  return string_make;
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
      console.log("line 166");

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

	update_data(sprite, x, y, move, speed, facing, current_tile_index, previous_tile_index, name){
	  //if (sprite != null) {this.spriteSheet = }
	  if (x != null) { this.x = x; }
	  if (y != null) { this.y = y; }
	  if (move != null) { this.move = move; }
	  if (speed != null) { this.speed = speed; }
    if (isDead != null) {this.isDead = this.isDead; }
	  if (facing != null) { this.update_facing(facing); }
	  if (current_tile_index != null) { this.current_tile_index = current_tile_index; }
	  if (previous_tile_index != null) { this.previous_tile_index = previous_tile_index; }
		if (name != null) { this.name = name; }
	}
  
	make_data_raw(){
	  return this.x+","+this.y+","+this.move+","+this.speed+","+this.facing+","+this.current_tile_index+","+
						this.previous_tile_index+","+this.name+","+this.isDead;
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
    this.players[0] = new ball_game_player(this.greenSprite, 200, 200, 0,);
    this.main_player_index = 0;
  }

  this.key_pressed = function(keycode) {
    for (let i in this.arrow_keys){
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
        send_data("my_pos:" + this.players[this.main_player_index].make_data_raw());

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
    for (let i in this.players) {
      this.players[i].draw();
      if(this.players[i].isDead == 1){
        this.players[i].update_anim("dead");
      }
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
    } else if (flag == "assigned_id") {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") {
      this.read_in_player_position(message);
    } else if (flag == "new_player") {
      this.players[parseInt(message)] = new ball_game_player(this.greenSprite, 300, 300, 0);
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
      this.players[parseInt(message)].isDead = 1;
      this.players[parseInt(message)].update_anim("dead");
    }

  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new ball_game_player(this.greenSprite, 300, 200, 0); }
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
  }

  this.read_in_ball_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0], [1, 2, 3, 4, 5]);
    
      if (p_vals[0] >= this.balls.length && this.balls.length < 10) { this.balls[p_vals[0]] = new game_2_ball(); }
    
    this.balls[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5]);
  }

}
