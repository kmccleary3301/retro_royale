class game_2_player {
	constructor(spriteSheet, x, y, face) {
		this.spriteSheet = spriteSheet;
		this.sx = 0;        //Frame counter for when the player is moving.
		//in MY game, every player starts at x = 20.
		this.x = 200;
		//in MY game, I pass numberOfPlayers as y and the program calculates where to put
		//the player based on the number of players and the height of the screen.
		this.y = 450-y*90;
		this.move = 0;      //Whether or not player is moving. Int is more convenient than boolean for network messages.
		this.timePlayerStartedMoving = null; //makes it so the player does not move upon initial spawning
		this.timeLoadedIntoGame = Date.now();

		this.speed = 5;     // Player movement speed
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for East West North South respectively
		this.sprite_row = 0;
		this.fruit_holding = 0;
		this.fruit_held_id = 0;
		this.bounds = [0, 2000, 0, 1000]; //THIS decides who has what bounds!
		
		//data fields for MY players
		//
		//previous_key_pressed holds the previous key that the player pressed,
		//in the form of the keycode [39,37] representing EW
		//(at first, it holds the value 38 as a flag variable, so that
    	// the user can press left or right to start moving)
		this.previous_key_pressed = 40;
		//
		
	}

	//
	draw() {
		push();
		g_cam.translate(this.x, this.y);
		if (this.move == 1){
			scale(1-this.facing*2, 1);  
			g_cam.image(this.spriteSheet, null, null, 100, 100, 80*(this.sx+1), 0, 80, 80);
			this.x = this.x + this.speed * (1-this.facing*2);
			if(this.timePlayerStartedMoving != null) {
				if(Date.now()-this.timePlayerStartedMoving >= 100) {
					this.move = 0;
				}
			}
			

			this.x = Math.min(this.bounds[1]-40, Math.max(this.bounds[0]+40, this.x));    //Prevents the player from leaving the game boundaries.
			this.y = Math.min(this.bounds[3]-40, Math.max(this.bounds[2]+40, this.y));   

		}
		else {
			if (this.facing < 2){
				scale(1-this.facing*2, 1);  
				g_cam.image(this.spriteSheet, null, null, 100, 100, 0, 0, 80, 80);
			} else if (this.facing == 2) {
				g_cam.image(this.spriteSheet, null, null, 100, 100, 0, 400, 80, 80);
			} else if (this.facing == 3) {
				g_cam.image(this.spriteSheet, null, null, 100, 100, 480, 400, 80, 80);
			}

		}
		
		if (frameCount % 6 == 0) {
			this.sx = (this.sx + 1) % 6;
		}

		pop();
	}

	grab_fruit(fruit_id, size){
	}

	drop_fruit(){
	}

	get_pos_string(){
		var string_make = str(this.x)+","+str(this.y)+","+str(this.move)+","+str(this.facing);
		return string_make;
	}
	
	update_data(sprite, x, y, move, speed, facing, fruit_holding, fruit_id){
		//if (sprite != null) {this.spriteSheet = }
		if (x != null) { this.x = x; }
		if (y != null) { this.y = y; }
		if (move != null) { this.move = move; }
		if (speed != null) { this.speed = speed; }
		if (facing != null) { this.facing = facing; }
		if (fruit_holding != null) { this.fruit_holding = fruit_holding; }
		if (fruit_id != null) { this.fruit_held_id = fruit_id; }
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