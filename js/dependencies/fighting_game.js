let background1;
const gravity = .5;
const floor = 600;
var colors = ['#E53564', '#2DE2E6', '#9700CC', '#035EE8', '#F3C752', '#F6019D']; //color array containing red, cyan, purple, blue, yellow, pink
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
        "row_length": 1,
        "first_tile": 1
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
    }
    });
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
    this.bounds = [0+100, 1440-100, 0, 1440/2];
    this.is_hit = 0;
    this.isDead = 0;
    this.start_hit;
	}

	draw() {
    
    

		push();
    
    

    // if (this.is_hit == 1 && (millis()/1000 - this.start_hit) < .5) {
    //   this.update_anim("standing");

    // }
   
    

    this.x = Math.max(this.bounds[0], Math.min(this.x, this.bounds[1]));
    this.sprite_anim.draw(this.x, this.y, true);
    if (this.isDead == 1) {
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

   
    if(this.isDucking == 1){
      this.update_facing(this.facing);
      this.update_anim("ducking");
    } else if (this.isAttacking == 1) {
      this.update_facing(this.facing);
      this.update_anim("attacking");
    } else if (this.dy < 0) {
      this.update_anim("jumping");
    } else if (this.dx != 0) {
      this.update_facing(this.facing);
      this.update_anim("left_right_walking");
      
    } else {
      this.update_facing(this.facing); 
      this.update_anim("standing");
       
    }
  
    // if (this.isDucking == 0 && this.dx == 0 && this.y == floor) {
    //   this.update_anim("standing");
    // }
    //gravity animation
    this.y += this.dy;
    this.y = Math.min(this.y, floor);
    this.y = Math.max(this.bounds[2], Math.min(this.y, this.bounds[3]));

    //draw rectangle respresenting health in top right corner
    
      fill(255, 0, 0);
      rect(this.x-20, this.y-60, 50, 10);
      fill(0, 255, 0);
      rect(this.x-20, this.y-60, this.health/2, 10);
    

    

    //make an if statement to make the player dead once health is 0
    if (this.health <= 0) {
     // this.announce_death();
      this.isDead = 1;
     // this.update_anim("dead");
    }
    if(this.y < floor )  {         
      this.dy += gravity; 
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


	get_pos_string() {
		var string_make = str(this.x)+","+str(this.y)+","+str(this.dx)+","+str(this.dy)+","+str(this.facing)+","+str(this.health)+","+str(this.isAttacking)+","+str(this.isDucking);
		return string_make;
	}
	
	update_data(x, y, dx, dy, facing, health, isAttacking, isDucking) {
		//if (sprite != null) {this.spriteSheet = }
		if (x != null) { this.x = x; }
		if (y != null) { this.y = y; }
    if (dx != null) { this.dx = dx; }
    if (dy != null) { this.dy = dy; }
	
		if (facing != null) { this.facing = facing; }
   
    if (health != null) { this.health = health; }
    if (isAttacking != null) { this.isAttacking = isAttacking; }
    if (isDucking != null) { this.isDucking = isDucking; }
		
	}

	make_data_raw() {
		return this.x+","+this.y+","+this.dx+","+this.dy+","+this.facing+","+this.health+","+this.isAttacking+","+this.isDucking;
	}

	make_data(player_index) {
		var string_make = "pos_player:"+player_index+","+this.make_data_raw();
		return string_make;
	}
}


function fighting_game() {
  this.preload = function() {
    
  }

  this.setup = function() {
    //drawImage(this.background1, 0, 0, width, height);
    this.background1 = loadImage(repo_address+"media/backgrounds/sunset_background.png");
    imageMode(CENTER);
    this.players = [];
    this.main_player_index;
    this.arrow_keys = [39, 37];
    this.space_key = 32;
    
    this.Sprite = loadImage(repo_address+"media/sprites/Spritesheet_64.png");
    imageMode(CENTER);
    
    
    //this.background.resize(0, height);
    //this.background.resize(width, 0);
    //this.background.resize(width, height);
  
    this.players[0] = new fighting_game_player(this.Sprite, 400, floor, 0, 0); //starting location, direction facing, color
    this.main_player_index = 0;
    //send_data("load_game");
  }

  

  this.key_pressed = function(code) {
    if(this.players[this.main_player_index].isDead == 0) {
      send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
    if (code == 39) { //right
      //this.players[this.main_player_index].update_anim("left_right_walking");
     // console.log("flipping: "+0);
      this.players[this.main_player_index].facing = 0;
      this.players[this.main_player_index].dx = 10 * (1-this.players[this.main_player_index].facing*2);
      send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
      return;
    }
    if (code == 37) //left
    {
     // this.players[this.main_player_index].update_anim("left_right_walking");
     // console.log("flipping: "+1);
      this.players[this.main_player_index].facing = 1;
      this.players[this.main_player_index].dx = 10 * (1-this.players[this.main_player_index].facing*2);
      send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
      return;
    }
    if (code == 38) //jumping
    {
      if (this.players[this.main_player_index].y == floor) {
      this.players[this.main_player_index].dy = -15;
      //this.players[this.main_player_index].update_anim("jumping");
      //this.players[this.main_player_index].sprite_anim.stop();
      //this.players[this.main_player_index].moving = 0;
      send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
      return;
      }
      
    }
    if(code == 40){ //down
      //this.players[this.main_player_index].update_anim("ducking");
      //this.players[this.main_player_index].sx = 0;
      this.players[this.main_player_index].isDucking = 1;
      send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
      return;
    }
    if (code == this.space_key)
    {
      send_data("my_pos:"+this.players[this.main_player_index].make_data_raw()+"\nattack");
      send_data("attack"+this.players[this.main_player_index].make_data_raw());
      //this.players[this.main_player_index].update_anim("attacking");
      this.players[this.main_player_index].isAttacking = 1;
      return;
    }
    send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
    }
  }

  this.key_released = function(code) {
    for (i=0;i<2;i++){
      if(code == this.arrow_keys[i]) {
       // if (this.players[this.main_player_index].flip == i) { 
          this.players[this.main_player_index].dx = 0;
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
      
    }
    send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
  }

  this.mouse_pressed = function() { return; }
  this.mouse_released = function() { return; }

  this.draw = function() {
    
    //background(background1);
    // use background1 as a background for the game
    
    //image(background1, 0, 0, width, height);
    
    
   
    
    //background(200, 250, 200);
    image(this.background1, width/2, height/2, width, height);

    //fill (243,199,82);
    fill(3,94,232);
    rect(0, floor+45, width, 500);

    fill (151,0,204);
    rect(0, floor+90, width, 500);

    fill (229,53,100);
    rect(0, floor+135, width, 500);

    fill (45,226,230);
    rect(0, floor+180, width, 500);

    fill(0, 200, 0);
    
    text_make(0, 200, 0, 2);
    textAlign(CENTER, CENTER);
    text("Jake", width/2, height/2);
    
    for (let i in this.players) {
      this.players[i].draw();
    }
    
  }

  this.read_network_data = function(flag, message) {
    if (flag == "player_count") 
    {
      for (j=this.players.length; j < parseInt(message); j++)
      {
        this.players[j] = new fighting_game_player(this.Sprite, 300, floor, 0, j%4);
      }
    } else if (flag == "assigned_id") 
    {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") 
    {
      this.read_in_player_position(message);
    } else if (flag == "new_player") 
    {
      this.players[parseInt(message)] = new fighting_game_player(this.Sprite, 500, floor, 0, parseInt(message)%4);
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
    }
  }

  this.announce_death = function() 
  {
    send_data("death:"+this.main_player_index);
    this.players[this.main_player_index].isDead = 1;
  }
   

  this.read_in_player_position = function(data_string) 
  { //format packet as pos_player: id, x, y, dx, dy, facing, health, isAttacking, isDucking
    p_vals = convert_data_string(data_string, [0, 5, 6, 7, 8], [1, 2, 3, 4]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new fighting_game_player(this.Sprite, 300, floor, 0, p_vals[0]%4); }
    this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
  }

  
  
  this.read_attack = function(data_string) 
  {
    p_vals = convert_data_string(data_string, [0]);
    this.players[p_vals[0]].current_animation = "attacking";
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

kd.run(function () {
  kd.tick();
});


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