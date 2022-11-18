
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

let numberOfPlayers = 1;

function purgatory() {
  this.setup = function() {
    this.whoGotFirst; //holds the index of the player who wins the game
    this.whoGotSecond;
    this.whoGotThird;

    this.names = [];

		this.game_length = 30.000;
		this.start_time;
		this.current_time = this.game_length;

    this.players = [];
    this.main_player_index;
    this.arrow_keys = [39, 37];
    this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
    this.test_background = loadImage("media/backgrounds/pink_gradient_background.png");
    this.checkerboard = loadImage("media/misc/checkerboard_2.jpg");
    //this.checkerboard.resize(0,1500);

		this.scroll_background = new scroll_image(this.test_background, [1920, 1080], 0);
    imageMode(CENTER);
    this.players[0] = new game_2_player(this.greenSprite, null, this.numberOfPlayers, 3);
    this.main_player_index = 0;
    this.alphabet = "abcdefghijklmnopqrstuvwxyz";
    this.current_letter = "g"
    //data fields for MY game
		//
		//stores the current number of players in the game
		//this.numberOfPlayers = 1;
		//
    send_data("get_index");
    send_data("get_names");
  }

  this.key_pressed = function(keycode) {
    if (keycode == this.arrow_keys[0]) { //if the client presses "right"
      if(this.players[this.main_player_index].previous_key_pressed == this.arrow_keys[1]) {
        //if client previously pressed the "left" key
        this.players[this.main_player_index].facing = 0;
        this.players[this.main_player_index].move = 1;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        this.players[this.main_player_index].previous_key_pressed = keycode;
        this.players[this.main_player_index].timePlayerStartedMoving = Date.now();
        return;
      } else if(this.players[this.main_player_index].previous_key_pressed == 40) {
        //if this is the first key the client pressed
        this.players[this.main_player_index].facing = 0;
        this.players[this.main_player_index].move = 1;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        this.players[this.main_player_index].previous_key_pressed = keycode;
        this.players[this.main_player_index].timePlayerStartedMoving = Date.now();
        return;
      }
    } else if (keycode == this.arrow_keys[1]) { //if the client presses "left"
        if(this.players[this.main_player_index].previous_key_pressed == this.arrow_keys[0]) {
          //if client previously pressed the "right" key
          this.players[this.main_player_index].facing = 0;
          this.players[this.main_player_index].move = 1;
          this.players[this.main_player_index].sx = 0;
          send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
          this.players[this.main_player_index].previous_key_pressed = keycode;
          this.players[this.main_player_index].timePlayerStartedMoving = Date.now();
          return;
        } else if(this.players[this.main_player_index].previous_key_pressed == 40) {
          //if this is the first key the client pressed
          this.players[this.main_player_index].facing = 0;
          this.players[this.main_player_index].move = 1;
          this.players[this.main_player_index].sx = 0;
          send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
          this.players[this.main_player_index].previous_key_pressed = keycode;
          this.players[this.main_player_index].timePlayerStartedMoving = Date.now();
          return;
        }
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
    this.scroll_background.draw();
    image(this.checkerboard,900+this.checkerboard.width/2,height/2);
    fill(0, 0, 0);
    text_make(0, 70, 0, 2);
    textAlign(CENTER, CENTER);
    //text("RUN!", width/2, height/2);
    //text("Time Remaining: "+this.current_time, width/2,40);

    fill(100,0,0);
    //rect(900,40,50,450);
    for (let i in this.players) {
      text_make(0, 20, 0, 2);

      this.players[i].y = 400-i * 90;

      this.players[i].draw();

      this.playerNum = parseInt(i)+1;

      text(""+this.names[parseInt(i)],this.players[i].x,this.players[i].y-50);

      if(this.players[i].x > 900) {
        if(this.whoGotFirst == null) {
          this.whoGotFirst = this.playerNum;
        } 
        else {
          if(this.whoGotFirst != this.playerNum && this.whoGotSecond == null) {
            this.whoGotSecond = this.playerNum;
          }
          else {
            if(this.whoGotFirst!= this.playerNum && this.whoGotSecond != this.playerNum && this.whoGotThird == null) {
              this.whoGotThird = this.playerNum;
            }
          }
        }

        textAlign(LEFT, CENTER);
        text_make(0, 20, 0, 2);

        text(this.names[this.whoGotFirst-1]+" Got First!",15,15);
        if(this.whoGotSecond != null)
          text(this.names[this.whoGotSecond-1]+" Got Second!",15,35);
        if(this.whoGotThird != null)
          text(this.names[this.whoGotThird-1]+" Got Third!",15,55);
      }
    }
  }

  this.read_network_data = function(flag, message) {
    if (flag == "player_count") {
      for (j=this.players.length; j < parseInt(message); j++){
        this.players[j] = new game_2_player(this.greenSprite, null, numberOfPlayers, 3);
        numberOfPlayers++;
        send_data("debug:"+numberOfPlayers)
      }
      send_data("get_names");
    } else if (flag == "assigned_id") {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") {
      this.read_in_player_position(message);
    } else if (flag == "new_player") {
      this.players[parseInt(message)] = new game_2_player(this.greenSprite, null, numberOfPlayers, 3);
      //this.players.push(new game_2_player(this.greenSprite, null, numberOfPlayers, 3));
      numberOfPlayers++;
    } else if (flag == "rmv_player") {
      var player_index = parseInt(message);
      this.players.splice(player_index, 1);
      if (this.main_player_index > player_index) {
        this.main_player_index -= 1;
      }
      numberOfPlayers--;
    } else if (flag == "game_state") {
      this.read_in_game_state(message);
    } else if (flag == "index") {
      this.main_player_index = parseInt(message);
      console.log("This is my INDEX !:"+message+", I think I'm "+this.main_player_index);
    } else if (flag == "Name of") {
      if(this.players[p_vals[0]] === undefined) {this.players[p_vals[0]]=new game_2_player(this.greenSprite, null, numberOfPlayers, 3);}
      p_vals = convert_data_string(message,[0],[],[1]);
      console.log(message);
      this.names[p_vals[0]]=p_vals[1];
    }
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    if(this.players[p_vals[0]] === undefined) {this.players[p_vals[0]]=new game_2_player(this.greenSprite, null, numberOfPlayers, 3);}
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
  }
  this.read_in_game_state = function(data_string) {
		p_vals = convert_data_string(data_string, [0, 1]);
    this.current_time = Math.max(p_vals[0],0);
		this.game_length = p_vals[1];
		this.start_time = millis()/1000;
	}
}

/*function purgatory() {
  this.setup = function() {
    this.players = [];
    this.main_player_index;
    this.arrow_keys = [39, 37, 38, 40];
    this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
    imageMode(CENTER);
    this.players[0] = new game_1_player(this.greenSprite, 200, 200, 0);
    this.main_player_index = 0;
  }

  this.key_pressed = function(keycode) {
    for (i=0;i<4;i++){
      if (keycode == this.arrow_keys[i]){
        this.players[this.main_player_index].facing = i;
        this.players[this.main_player_index].move = 1;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        return;
      }
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
    background(200, 200, 200);
    fill(0, 0, 0);
    text_make(0, 200, 0, 2);
    textAlign(CENTER, CENTER);
    text("PURGATORY", width/2, height/2);
    for (let i in this.players) {
      this.players[i].draw();
    }
  }

  this.read_network_data = function(flag, message) {
    if (flag == "player_count") {
      for (j=this.players.length; j < parseInt(message); j++){
        this.players[j] = new game_1_player(this.greenSprite, 300, 300, 1);
      }
    } else if (flag == "assigned_id") {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") {
      this.read_in_player_position(message);
    } else if (flag == "new_player") {
      this.players[parseInt(message)] = new game_1_player(this.greenSprite, 300, 300, 0);
    } else if (flag == "rmv_player") {
      var player_index = parseInt(message);
      this.players.splice(player_index, 1);
      if (this.main_player_index > player_index) {
        this.main_player_index -= 1;
      }
    }
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
  }
}*/