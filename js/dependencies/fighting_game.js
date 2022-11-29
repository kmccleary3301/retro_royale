

var GOtimer = 5;
var video_game_font; //font for the game

const gravity = .5;
var fgs_floor = 570;

var colors = ['#E53564', '#2DE2E6', '#9700CC', '#035EE8', '#F3C752', '#F6019D']; //color array containing red, cyan, purple, blue, yellow, pink
class laser {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.laser_beam = loadImage(repo_address+"media/misc/laser.png");
  }
  draw() {
    //ctx.fillStyle = this.color;
    //ctx.fillRect(this.x, this.y, this.width, this.height);
    image(this.laser_beam, this.x, this.y, 40, 80);
    //ellipse(this.x, this.y, 20, 20);
    
    
  }
  update() {
    this.draw();
    this.y += 10;
  }

}

class spaceship {
  constructor(x, y, color, speed) {
    this.x = x;
    this.y = y;
    this.facing = 0;
    
    this.color = color;
    this.speed = speed;
    this.laser_beam_1 = [];
    this.video_game_font = loadFont('media/fonts/videogame.ttf');
    this.j = 0;
    
  }

  draw() {

    //translate(this.x, this.y);
    push();
    fill(this.color);
    textFont(this.video_game_font, 60);
    text("A", this.x, this.y);
    //rect(this.x, this.y, 50, 50);
    pop();
    if (frameCount % 60 == 0) {
      //this.move();
      this.laser_beam_1[this.j] = new laser(this.x, this.y, this.color);
      this.j++;
    }
    if(this.j > 0){
    for (var i = 0; i < this.laser_beam_1.length; i++) {
      this.laser_beam_1[i].update();
    }
  }
    this.move();
    if (this.x >= 1440-60) {
      this.facing = 1;
    }
    if (this.x <= 0+60) {
      this.facing = 0;
    }
  }

  move() {
    this.x += this.speed-(2*this.facing);
    this.y += random(-1, 1);
  }

  hit() {
    this.health -= 1;
  }
}

class fighting_game_player  {
	constructor(spriteSheet, x, y, face, color) {
		this.spriteSheet = spriteSheet;
    this.spriteColor = color; //0 = red, 1 = blue, 2 = pink, 3 = green
    this.sprite_anim = new sprite_animation_object(spriteSheet, 100, 64, 64, {
      "left_right_walking" : {
        "row" : 1+10*this.spriteColor,
        "row_length": 4
      },
      "standing" : {
        "row" : 1+10*this.spriteColor,
        "row_length": 1
      },
      "attacking" : {
        "row" : 3+10*this.spriteColor,
        "row_length": 4
      },
      "hit" : {
        "row" : 4+10*this.spriteColor,
        "row_length": 4
      },
      "dead" : {
        "row" : 7+10*this.spriteColor,
        "row_length": 1
      },
      "ducking" : {
        "row" : 6+10*this.spriteColor,
        "row_length": 1
      },
      "jumping" : {
        "row" : 5+10*this.spriteColor,
        "row_length": 1
    },
    "victory_stance" : {
      "row" : 8+10*this.spriteColor,
      "row_length": 1
  }
    });
    this.sprite_anim.change_animation("standing");
    this.current_animation = "standing";
    this.moving = 0;
		this.sx = 0;              //Frame counter for when the player is moving.
		this.x = x;               //Player's x position.
		this.y = y;               //Position of the player.
    this.dx = 0;              //Horizontal velocity
    this.dy = 0;              //Vertical velocity
		this.facing = face;       // 0 = left, 1 = right
    this.flip = 0;
    this.health = 100;        // Player's health
    this.isDucking = 0;       // 0 = not ducking, 1 = ducking
    this.isAttacking = 0;     // 0 = not attacking, 1 = attacking
    this.is_hit = 0;          // 0 = not hit, 1 = hit
    this.isDead = 0;          // 0 = not dead, 1 = dead
    this.start_hit;           // Time when the player was hit
    this.duckTimer = 0;       // Timer for ducking
    this.duckTimeout = 0;     // Timeout for ducking

    this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];
    
	}

	draw() {
		push();
    
    var sparkle = {
      locationX: random(width),
      locationY: random(height-300),
      size: random(5, 12)
    }

    var sparkle2 = {
      locationX: random(width),
      locationY: random(height-300),
      size: random(5, 15)
    }

    var sparkle3 = {
      locationX: random(width),
      locationY: random(height-300),
      size: random(5, 15)
    }
  
    fill (243, 199, 82);
    noStroke();
  // ellipse(mouseX, mouseY, sparkle.size, sparkle.size);
    //ellipse(sparkle.locationX, sparkle.locationY, sparkle.size, sparkle.size);
    rect(sparkle.locationX, sparkle.locationY, sparkle.size, sparkle.size);
    noStroke();
    fill(this.blue);
    rect(sparkle2.locationX, sparkle2.locationY, sparkle2.size, sparkle2.size);
    noStroke();
    fill(this.red);
    rect(sparkle3.locationX, sparkle2.locationY, sparkle3.size, sparkle3.size);

    this.y += this.dy; //add gravity to y position
    this.y = Math.min(this.y, 0);

    this.x = Math.max(bounds[0], Math.min(this.x, bounds[1]));

    
    
    this.sprite_anim.draw(this.x, this.y+fgs_floor, false);
    if (this.isDead == 1) {
      this.y += this.dy; //add gravity to y position
      this.y = Math.min(this.y, 0); //if y position is greater than floor, then set y position to floor
      this.update_anim("dead"); 
      return;
    }

    if (this.dx != 0 && this.isDucking == 0) { 
      this.update_facing(this.facing);
      this.x += this.dx;
    }

    // if (this.current_animation == "attacking" && this.sprite_anim.sx == 3) { 
    //   if (this.moving == 0) {
    //     this.update_anim("standing"); 
    //   } else {
    //     this.update_anim("standing");
    //     //this.update_anim("left_right_walking");
    //   }
    // }

    if (this.facing == 0) { this.sprite_anim.flip(0); this.flip = 0; }  else { this.sprite_anim.flip(1); this.flip = 1; }

    

    if(this.isDucking == 1 && this.duckTimer < 1) { //if ducking and duck timer is less than 1, then update animation to ducking  
      this.duckTimer += 1/120;
      this.update_facing(this.facing);
      this.update_anim("ducking");

      //this.y = floor - 32;
      //this.sprite_anim.draw(this.x, this.y, true);
      
    } else if (this.isDucking == 1 && this.duckTimer >= 1) { //if ducking and duck timer is greater than 1, then update animation to standing
      this.duckTimer = 0;
      this.isDucking = 0;
      this.duckTimeout = 1;
      this.update_facing(this.facing);
      this.update_anim("standing");
    }

    if (this.duckTimeout == 1) { //if duck timeout is 1, then update animation to standing
      setTimeout(() => {this.duckTimeout = 0;}, 3000);
    }
   
    if(this.isDucking == 1){ //if ducking, then update animation to ducking
      this.update_facing(this.facing);
      this.update_anim("ducking");
    } else if (this.isAttacking == 1) { //if attacking, then update animation to attacking
      this.update_facing(this.facing);
      this.update_anim("attacking");
    } else if (this.dy < 0) { //if jumping, then update animation to jumping
      this.update_anim("jumping");
    } else if (this.dx != 0) { //if moving, then update animation to left_right_walking
      this.update_facing(this.facing);
      this.update_anim("left_right_walking");
      
    } else { //if not moving, then update animation to standing
      this.update_facing(this.facing); 
      this.update_anim("standing");
       
    }
  
    // if (this.isDucking == 0 && this.dx == 0 && this.y == floor) {
    //   this.update_anim("standing");
    // }
    //gravity animation
     //if y position is greater than floor, then set y position to floor
    //this.y = Math.max(bounds[2], Math.min(this.y, bounds[3])); //if y position is less than bounds[2], then set y position to bounds[2]

    //draw rectangle respresenting health in top right corner
    
    fill(255, 0, 0);
    rect(this.x-25, this.y+fgs_floor-60, 50, 10);
    fill(0, 255, 0);
    rect(this.x-25, this.y+fgs_floor-60, this.health/2, 10);
    
    /*
      fill(colors[4]);
      //textFont(this.video_game_font);
      text("player " + (this.spriteColor+1), this.x, this.y+70);
      */

    //make an if statement to make the player dead once health is 0
    if (this.health <= 0) {
     // this.announce_death();

      this.isDead = 1;
     // this.update_anim("dead");
     
    }
    if(this.y < -1 )  {     
      this.dy += gravity; 
    }
    if (this.is_hit){
      fill(this.red);
      this.is_hit = 0;
    }
    
		pop();
	}

  update_facing(facing) {
		if (facing == this.facing) { return; }
		this.facing = facing;
		if (facing == 0 || facing == 1) {
			if (facing == 1) { this.sprite_anim.flip(1); this.flip = 1;}
			else { this.sprite_anim.flip(0); this.flip = 0; }
    }
	}

  update_anim(animation) {
    if (animation == this.current_animation) { return; }
    if (animation == "standing" || animation == "dead") { this.moving = 0; this.sprite_anim.stop(); }
    else  { this.moving = 1; this.sprite_anim.start(); }
    this.sprite_anim.change_animation(animation);
    this.current_animation = animation;
  }

  hit() {
    if(this.isDead == 1) { return; }
    this.is_hit = 1;
    this.start_hit = millis()/1000;
    this.update_anim("hit");
  }

	
	update_data(x, y, dx, dy, facing, health, isAttacking, isDucking, animation) {
		//if (sprite != null) {this.spriteSheet = }
		if (x != null) { this.x = x; }
		if (y != null) { this.y = y; }
    if (dx != null) { this.dx = dx; }
    if (dy != null) { this.dy = dy; }
	
		if (facing != null) { this.facing = facing; }
   
    if (health != null) { this.health = health; }
    if (isAttacking != null) { this.isAttacking = isAttacking; }
    if (isDucking != null) { this.isDucking = isDucking; }
    if (animation != null) { this.update_anim(animation); }
		
	}

	make_data_raw() {
		return this.x+","+this.y+","+this.dx+","+this.dy+","+this.facing+","+this.health+","+this.isAttacking+","+this.isDucking+","+this.current_animation;
	}

	make_data(player_index) {
		var string_make = "pos_player:"+player_index+","+this.make_data_raw();
		return string_make;
	}
}


function fighting_game() {
  this.preload = function() {
  // 
   //load video game font from google fonts
    
    //loadFont("https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap");
    
    //video_game_font = "Arial";
    
  }

  this.setup = function() {   

    //this.boundary_offset = 100*this.game_round;
    //this.bounds = [0+this.boundary_offset, 1440-boundary_offset, 0, 1440/2];
    
    this.video_game_font = loadFont('media/fonts/videogame.ttf');
    // this.background1 = loadImage(repo_address+"media/backgrounds/melee_sunset_background.png");
    // this.background2 = loadImage(repo_address+"media/backgrounds/melee_sunset_background2.png");
    // this.background3 = loadImage(repo_address+"media/backgrounds/melee_sunset_background3.png");
    this.background1 = loadImage(repo_address+"media/backgrounds/space1.png");
    this.background2 = loadImage(repo_address+"media/backgrounds/space2.png");
    this.background3 = loadImage(repo_address+"media/backgrounds/space3.png");
    this.sparkle = loadImage(repo_address+"media/misc/sparkle.png");
    this.disco_ball_string = loadImage(repo_address+"media/misc/disco_ball_string.png");

    this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];

    this.spaceshippy = [];

    this.gameOver = 0; //game over variable
    this.game_round = 1; //game round variable
   
    this.round_length = 30;
    this.countdown_time = this.round_length;
    this.round_bound = [0, 165, 405]; //round boundary increments

    this.start_time = Date.now()/1000;
    this.current_time = 0;

    this.window_resize();
    
    imageMode(CENTER);
    
    this.players = [];
    this.main_player_index;
    this.arrow_keys = [39, 37];
    this.space_key = 32;
    this.rando = [-20, 25, 6];
    this.keys_held = {
      "right": false,
      "left": false
    };

    this.Sprite = loadImage(repo_address+"media/sprites/Spritesheet_64_update.png");
    imageMode(CENTER);
    
    //this.background.resize(0, height);
    //this.background.resize(width, 0);
    //this.background.resize(width, height);
  
    this.players[0] = new fighting_game_player(this.Sprite, 400, 0, 0, 0); //starting location, direction facing, color
    this.main_player_index = 0;

    
    this.spaceshippy[0] = new spaceship(100, 100, this.blue, 1);
    

    this.user_last_attacked_time = Date.now()/1000 - 20;
    //send_data("load_game");
    stopAllSounds();
		playSound("beat_angry", true);
  }

  this.window_resize = function() {
    fgs_floor = height-200;
  }

  this.key_pressed = function(code) {
    if(this.players[this.main_player_index].isDead == 0) {
      //send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
      if (code == 39) { //right
        //this.players[this.main_player_index].update_anim("left_right_walking");
        // console.log("flipping: "+0);
        this.keys_held["right"] = true;
        this.players[this.main_player_index].facing = 0;
        this.players[this.main_player_index].dx = 10 * (1-this.players[this.main_player_index].facing*2);
        //send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        //return;
      }
      else if (code == 37) //left
      {
      // this.players[this.main_player_index].update_anim("left_right_walking");
      // console.log("flipping: "+1);
        this.keys_held["left"] = true;
        this.players[this.main_player_index].facing = 1;
        this.players[this.main_player_index].dx = 10 * (1-this.players[this.main_player_index].facing*2);
        //send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        //return;
      }
      else if (code == 38) //jumping
      {
        if (this.players[this.main_player_index].y == 0) {
          this.players[this.main_player_index].dy = -15;
          this.players[this.main_player_index].update_anim("jumping");
          //this.players[this.main_player_index].sprite_anim.stop();
          //this.players[this.main_player_index].moving = 0;
          //send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
          //return;
        }
        
      }
      else if(code == 40){ //down
        //this.players[this.main_player_index].update_anim("ducking");
        //this.players[this.main_player_index].sx = 0;
        if (this.players[this.main_player_index].duckTimeout == 0) {
          this.players[this.main_player_index].isDucking = 1;
          //send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        }
        //return;
      }
      else if (code == this.space_key)
      {
        if (Date.now()/1000 - this.user_last_attacked_time > 1) {

          //this.players[this.main_player_index].update_anim("attacking");
          this.player_attack(this.main_player_index);
          send_data("attack");
          this.user_last_attacked_time = Date.now()/1000;
          //return;
        }
      }
      send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
    }
  }

  

  this.key_released = function(code) {
    for (i=0;i<2;i++){
      if(code == this.arrow_keys[i]) {
       // if (this.players[this.main_player_index].flip == i) { 
          this.keys_held[Object.keys(this.keys_held)[i]] = false;
          this.players[this.main_player_index].dx = 0;
          //if (this.keys_held[Object.keys(this.keys_held)[(i+1)%2]]) { this.key_pressed(this.arrow_keys[(i+1)%2]); }
          //this.players[this.main_player_index].moving = 0;
          //this.players[this.main_player_index].update_anim("standing");
       // }
      }
      if(code == 38) { //jumping
        //if(this.players[this.main_player_index].dy < 0 ) {
        //this.players[this.main_player_index].dy = 0;
        //this.players[this.main_player_index].dy = 0;
        //this.players[this.main_player_index].update_anim("standing");
        
      }
      if(code == 40) { //down
       // this.players[this.main_player_index].update_anim("standing");
        this.players[this.main_player_index].isDucking = 0;
        //this.players[this.main_player_index].dy = 0;
      }
      
      if(code == this.space_key) {
        this.players[this.main_player_index].isAttacking = 0;
       
      }
      for (let i in Object.keys(this.keys_held)) {
        if (this.keys_held[Object.keys(this.keys_held)[i]]) { this.key_pressed(this.arrow_keys[i]); }
      }
      
    }
    send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
  }

  this.player_attack = function(player_id) {
    this.players[player_id].isAttacking = 1;
  }

  this.mouse_pressed = function() { return; }
  this.mouse_released = function() { return; }

  this.draw = function() {
    //this.current_time = Date.now()/1000 - this.start_time;
    if(this.gameOver == 0) {

      boundary_offset = this.round_bound[this.game_round-1];
      
      bounds = [0+boundary_offset, 1440-boundary_offset, 0, 1440/2];
      
      
      switch(int(this.game_round)) {
        case 1:
          image(this.background1, width/2, height/2, width, height);
          break;
        case 2:
          image(this.background2, width/2, height/2, width, height);
          break;
        case 3:
          image(this.background3, width/2, height/2, width, height);
          break;
        case 4:
          this.gameOver = 1;
          break;
      }
      
      textFont(this.video_game_font, 40);
      fill(this.yellow);
      text("round "+this.game_round, width/2, height-120);

      
        this.spaceshippy[0].draw();
      

      for (let i in this.players) {
        for (let j in this.laser_beam_1){
          if (this.laser_beam_1[j].y < 600){
            if (collisionDetection(this.players[i], this.laser_beam_1[j])) {
              send_data("hit:"+i);
              this.laser_beam_1[j].y = 6000;
            }
          
          }
        }
      }
      /*
      //DISCO DISCO HEAVEN
      image(this.disco_ball_string, width/2, 50, 50*2, 175*2);

      

      image(this.sparkle, width/2+this.rando[2], 150+this.rando[0], sin(frameCount/30)*10, sin(frameCount/30)*30);
      image(this.sparkle, width/2+this.rando[0], 150+this.rando[1], sin(frameCount/25)*20, sin(frameCount/25)*40);
      image(this.sparkle, width/2+this.rando[1], 150+this.rando[2], sin(frameCount/20)*40, sin(frameCount/20)*50);

      //fill (243,199,82);
      fill(3,94,232);
      rect(0, floor+45, width, 500);

      fill (151,0,204);
      rect(0, floor+90, width, 500);

      fill (229,53,100);
      rect(0, floor+135, width, 500);

      fill (45,226,230);
      rect(0, floor+180, width, 500);
      */
    
      /*
      fill(0, 200, 0);

      text_make(0, 200, 0, 2);
      textAlign(CENTER, CENTER);
      text("Jake", width/2, height/2);



      */




      if (this.countdown_time >= 0) {

        //this.countdown_time = this.round_length - this.current_time;
        //this.countdown_time -= 1/60;
        //fill(colors[4]);
        // // text_make(0, 200, 0, 2);
        textAlign(CENTER, CENTER);
        textFont(this.video_game_font, 100);     
        text(round(this.countdown_time), width/2, height-60);
        

      }else  
      {
        //shrink the boundaries by half
        //image(this.background1, width/2, height/2, width, height);
        
        this.game_round++;
        this.start_time = Date.now()/1000;
        this.countdown_time = this.round_length;
      }
      for (let i in this.players) {
        this.players[i].draw();
      }
      
    }else{
      //this.game_over();
      //game over screen
      fill(colors[0]);
      rect(0, 0, width, height);
      fill(colors[4]);
      textFont(this.video_game_font, 100);
      text("game over", width/2, height/2);

      //display timer that counts down from 5
      text(round(GOtimer), width/2, height/2+100);
      GOtimer -= 1/60;

      if (GOtimer < 0) {
        //go back to menu
        this.game_over();
      }
    }
  }

  this.read_network_data = function(flag, message) {
    if (flag == "player_count") 
    {
      for (j=this.players.length; j < parseInt(message); j++)
      {
        this.players[j] = new fighting_game_player(this.Sprite, 300, 0, 0, j%4);
      }
    } else if (flag == "assigned_id") 
    {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") 
    {
      this.read_in_player_position(message);
    } else if (flag == "new_player") 
    {
      this.players[parseInt(message)] = new fighting_game_player(this.Sprite, 500, 0, 0, parseInt(message)%4);
      send_data("debug:new player added client game players");
    } else if (flag == "rmv_player") 
    {

      var player_index = parseInt(message);
      this.players.splice(player_index, 1);
      if (this.main_player_index > player_index) {
        this.main_player_index -= 1;
      }
    } else if (flag == "hit") {
      this.hit_parse(message);
    } else if (flag == "attack") {
      this.read_attack(message);
    } else if (flag == "death") {
    // this.players[parseInt(message)].isDead = 1;
    } else if (flag == "winner") {
      this.winner = parseInt(message);
      this.players[this.winner].update_anim("victory_stance");
    } else if (flag == "game_timer_info") {
      this.read_in_game_timer_info(message);
    }
  }

  this.announce_death = function() 
  {
    send_data("death:"+this.main_player_index);
    this.players[this.main_player_index].isDead = 1;
  }

  this.read_in_player_position = function(data_string) 
  { //format packet as pos_player: id, x, y, dx, dy, facing, health, isAttacking, isDucking
    p_vals = convert_data_string(data_string, [0, 5, 6, 7, 8], [1, 2, 3, 4], [9]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new fighting_game_player(this.Sprite, 300, 0, 0, p_vals[0]%4); }
    this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8], p_vals[9]);
  }

  this.read_in_game_timer_info = function(data_string) 
  {
    p_vals = convert_data_string(data_string, [2], [0, 1]);
    this.current_time = p_vals[0];
    this.start_time = Date.now()/1000 - this.current_time;
    this.countdown_time = p_vals[1];
    this.game_round = p_vals[2];
  }

    
    
  this.read_attack = function(data_string) 
  {
    p_vals = convert_data_string(data_string, [0, 5, 6, 7, 8], [1, 2, 3, 4], [9]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new fighting_game_player(this.Sprite, 300, 0, 0, p_vals[0]%4); }
    this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8], p_vals[9]);
    this.player_attack(p_vals[0]);
  }

  /*
  this.attack = function(player_attacking_id) {
    this.players[player_attacking_id].isAttacking = 1;
  }
  */
  this.hit_parse = function(data_string) {
    p_vals = convert_data_string(data_string, [0, 1]);
    this.players[p_vals[0]].health = p_vals[1];
    this.players[p_vals[0]].hit();
  }

  this.game_over = function() {
    //display text saying game over
    text("game over", width/2, height/2);


  }

}

//create a collision detection function
function collisionDetection(player, enemy) {
  if (player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y) {
    return true;
  }
  return false;
}

/*
function three_dimensional_disco_ball() {
  box(70, 70, 70);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  box(70, 70, 70);
  //construct a 3d disco ball made of boxes
  //do it with a for loop
  //rotate the boxes
  //make the boxes smaller
  for (var i = 0; i < 100; i++) {
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
    box(70, 70, 70);
  }
    
  }



kd.run(function () {
  kd.tick();
});
*/

document.addEventListener("keydown", (e) => {
  if (e.code == 68) {
    xPos -= 10;
  }
  if (e.code == 65) {
    xPos += 10;
  }
  if (e.code == 87) {
    yPos += 10;
  }
  if (e.code == 83) {
    yPos -= 10;
  }
});