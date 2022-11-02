
const gravity = .5;
const floor = 600;

class fighting_game_player  {
	constructor(spriteSheet, x, y, face, color) {
		this.spriteSheet = spriteSheet;
    this.spriteColor = color; //0 = red, 1 = blue, 2 = pink, 3 = green
		this.sx = 0;          //Frame counter for when the player is moving.
		this.x = x;           //Player's x position.
		this.y = y;           //Position of the player.
    this.dx = 0;          //Horizontal velocity
    this.dy = 0;          //Vertical velocity
		this.facing = face;   // 0 = left, 1 = right
    this.health = 100;    //Player's health
    this.isDucking = 0;   // 0 = not ducking, 1 = ducking
    this.isAttacking = 0; // 0 = not attacking, 1 = attacking
		this.bounds = [0, 1440/2, 0, 1440/2];
    this.is_hit = 0;
    this.start_hit;
	}

	draw() {
    //console.log("drawing_player:"+this.x+","+this.y);
		push();
		g_cam.translate(this.x, this.y);
    //g_cam.image(this.spriteSheet, null, null, 100, 100, this.spriteColor*256+64*(this.sx), 64, 64, 64);

    //gravity animation
    this.y += this.dy;

    

    if(this.y > floor) {
        this.y = floor;
        //this.dy = 0;
    }

     if(this.y < floor )  {         
        this.dy += gravity; 
           
        
     }
        
    if(this.isDucking == 1) {
      scale(1-this.facing*2, 1);  
      g_cam.image(this.spriteSheet, null, null, 100, 100, 0, 6*64+(640*this.spriteColor), 64, 64);
    }
    else {
      if(this.isAttacking == 1) {
        scale(1-this.facing*2, 1);  
        g_cam.image(this.spriteSheet, null, null, 100, 100, 64*this.sx, 3*64+(640*this.spriteColor), 64, 64);
      }
      else {
        if(this.y < floor) {
          scale(1-this.facing*2, 1);  
          g_cam.image(this.spriteSheet, null, null, 100, 100, 0, 5*64+(640*this.spriteColor), 64, 64);
        }
        else {
          if(this.dx != 0) {
            scale(1-this.facing*2, 1);  
            g_cam.image(this.spriteSheet, null, null, 100, 100, 64*(this.sx), 1*64+(640*this.spriteColor), 64, 64);
             
          }
          else {
            scale(1-this.facing*2, 1);  
            g_cam.image(this.spriteSheet, null, null, 100, 100, 64, 64+(640*this.spriteColor), 64, 64);
          }
          
        }
        
      }
      this.x += this.dx * (1-this.facing*2); // //move the player

      this.x = Math.min(this.bounds[1]-40, Math.max(this.bounds[0]+40, this.x));    //Prevents the player from leaving the game boundaries.
		  this.y = Math.min(this.bounds[3]-40, Math.max(this.bounds[2]+40, this.y));  
      
    }

    console.log('debug:facing value ='+this.facing+" dx value = "+this.dx);

   

		// if (this.dx != 0) { //if the player is moving
		// 	if (this.isDucking == 0) {
    //     console.log("Debug:Player is ducking?"+this.isDucking+"\n");
    //     if(this.isAttacking == 0) {
    //       scale(1-this.facing*2, 1);  
    //      g_cam.image(this.spriteSheet, null, null, 100, 100, this.spriteColor*256+64*(this.sx), 64, 64, 64);           
    //     }
		// 		//this.x = this.dx * (1-this.facing*2); 
		// 	} else {
    //     scale(1-this.facing*2, 1);  
    //     g_cam.image(this.spriteSheet, null, null, 100, 100, 256*this.spriteColor, 7*64, 64, 64);
    //   }
		// 	 
		// } else {//not moving
      
    //     if(this.isAttacking == 0) {
    //       scale(1-this.facing*2, 1);  
    //       //g_cam.image(this.spriteSheet, null, null, 100, 100, 143+32*(this.sx+1), 0, 32, 49); link
    //       g_cam.image(this.spriteSheet, null, null, 100, 100, 256*this.spriteColor+64, 64, 64, 64);
    //     }
    //    else {
    //     scale(1-this.facing*2, 1);  
    //     g_cam.image(this.spriteSheet, null, null, 100, 100, 256*this.spriteColor, 7*64, 64, 64);
    //   }
    // }
    // if(this.isAttacking == 1) {
    //   if(this.facing < 2) {        
    //     this.x -= 10*(1-this.facing*2);
    //   this.dy = -2;      
    //     scale(1-this.facing*2, 1);  
    //     g_cam.image(this.spriteSheet, null, null, 100, 100, (this.spriteColor*256)+64*(this.sx), (5*64), 64, 64);
    //   }
    //   if (this.sx == 3) {
    //     this.sx = 0;
    //     this.isAttacking = 0;
    //   }
    // }
    // if (this.is_hit == 1) {
    //   this.x = 10*(1-this.facing*2);
    //   this.dy = -2;
    //   scale(1-this.facing*2, 1);
    //   g_cam.image(this.spriteSheet, null, null, 100, 100, (this.spriteColor*256)+64*(this.sx), (5*64), 64, 64);
    //   if (millis()/1000 - this.start_hit > 1000) {
    //     this.is_hit = 0;
    //   }
    // }
    // /*
    // if (frameCount % 6 == 0) {
    //   this.s6x = (this.s6x+1) % 6;
    // }
    // */
    if (frameCount % 4 == 0) {
       this.sx = (this.sx + 1) % 4;
    }

		pop();
	}

  hit() {
    this.is_hit = 0;
    this.start_hit = millis()/1000;
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
  this.setup = function() {
    this.players = [];
    this.main_player_index;
    this.arrow_keys = [39, 37];
    this.space_key = 32;
    
    this.Sprite = loadImage(repo_address+"media/sprites/Spritesheet_64.png");
    imageMode(CENTER);
    this.players[0] = new fighting_game_player(this.Sprite, 400, floor, 0, 0); //starting location, direction facing, color
    this.main_player_index = 0;
    //send_data("load_game");
  }

  

  this.key_pressed = function(keycode) {
    for (i=0;i<2;i++)
    {
      if (keycode == this.arrow_keys[i])
      {
        
        this.players[this.main_player_index].facing = i;
        this.players[this.main_player_index].dx = 10;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        return;
      }
      if (keycode == 38)
      {
        if(this.players[this.main_player_index].y == floor){
        this.players[this.main_player_index].dy = -15;}
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        return;
      }
      if(keycode == 40){
        this.players[this.main_player_index].isDucking = 1;
        //this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        return;
      }
      if (keycode == this.space_key)
      {
        
        if (this.players[this.main_player_index].isDucking == 0){
          this.players[this.main_player_index].isAttacking = 1;
          this.players[this.main_player_index].sx = 0;
          send_data("my_pos:"+this.players[this.main_player_index].make_data_raw()+"\nattack");
        }
        return;
      }
    }
  }

  this.key_released = function(keycode) {
    for (i=0;i<2;i++){
      if(keycode == this.arrow_keys[i] && this.players[this.main_player_index].facing == i) {
        this.players[this.main_player_index].dx = 0;
      }
      if(keycode == 38) {
        //if(this.players[this.main_player_index].dy < 0 ) {
        //this.players[this.main_player_index].dy = 0;
        //this.players[this.main_player_index].dy = 0;
        
      }
      if(keycode == 40) {
        //this.players[this.main_player_index].dy = 0;
        this.players[this.main_player_index].isDucking = 0;
      }
      if(keycode == this.space_key) {
        this.players[this.main_player_index].isAttacking = 0;
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
    }
  }

  this.read_in_player_position = function(data_string) 
  { //format packet as pos_player: id, x, y, dx, dy, facing, health, isAttacking, isDucking
    p_vals = convert_data_string(data_string, [0, 5, 6, 7, 8], [1, 2, 3, 4]);
    if (p_vals[0] >= this.players.length) { this.players[p_vals[0]] = new fighting_game_player(this.Sprite, 300, floor, 0, p_vals[0]%4); }
    this.players[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7], p_vals[8]);
  }

  /*
  
  this.read_attack = function(data_string) 
  {
    p_vals = convert_data_string(data_string, [0]);
    this.players[p_vals[0]].isAttacking = 1;
    this.players[p_vals[0]].sx = 0;
  }

  this.attack = function(player_attacking_id) {
    this.players[player_attacking_id].isAttacking = 1;
  }

  this.hit_parse = function(data_string) {
    p_vals = convert_data_string(data_string, [0, 1]);
    this.players[p_vals[0]].health = p_vals[1];
    this.players[p_vals[0]].hit();
  }
*/

}



