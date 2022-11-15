function game_end_screen() {
<<<<<<< HEAD
    this.setup = function() {
      this.players = [];
      this.main_player_index;
      this.arrow_keys = [39, 37, 38, 40];
      //this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
      this.greenSprite = loadImage("media/sprites/Spritesheet_64.png");
      imageMode(CENTER);
      this.players[0] = new game_end_screen_player(this.greenSprite, 200, 200, 0);
      this.main_player_index = 0;
=======
  this.setup = function() {
		this.players = [];
		this.main_player_index;
		this.arrow_keys = [39, 37, 38, 40];
		this.host_started_game = false;
		this.sprite = loadImage(repo_address+"media/sprites/Spritesheet_64_update.png");
		imageMode(CENTER);
		this.players[0] = new game_1_player(this.sprite, 200, 200, "down", 0);
		this.main_player_index = 0;
		this.start_time = Date.now()/1000;
		this.current_time = 0;
		this.client_is_host = 0;
>>>>>>> origin/master

    this.game_results_json = {};
	}

	this.key_pressed = function(keycode) {
    /*
		for (i=0;i<4;i++){
			if (keycode == this.arrow_keys[i]){
				this.players[this.main_player_index].facing = i;
				this.players[this.main_player_index].move = 1;
				this.players[this.main_player_index].sx = 0;
				send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
				return;
			}
		}
    */
	}

	this.key_released = function(keycode) {
    /*
		for (i=0;i<4;i++){
			if(keycode == this.arrow_keys[i] && this.players[this.main_player_index].facing == i) {
				this.players[this.main_player_index].move = 0;
			}
		}
		send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
    */
	}

	this.mouse_pressed = function() {
		return;
	}

	this.mouse_released = function() {
		return;
	}

	this.draw = function() {
		this.current_time = Date.now()/1000 - this.start_time;
		background(200, 200, 200);
		fill(0, 0, 0);
		text_make(0, 20, 0, 2);
		textAlign(CENTER, CENTER);
    text(JSON.stringify(this.game_results_json), width/2, height/2);
		
		for (let i in this.players) {
			this.players[i].draw();
		}
		//for (let i in this.buttons[this.current_menu]) { this.buttons[this.current_menu][i].draw(); }
		if (this.current_menu == "host_menu") { this.draw_host_menu(); }
	}

	this.draw_host_menu = function() {
		push();
		background(200, 200, 200);
		text_make(0, 20, 0, 0);
		textAlign(CENTER, CENTER);
		fill(0, 0, 0);
		text("turns : "+this.host_settings[0], 200, 150);
		pop();
	}

  this.read_in_game_results_json = function(data) {
    var vals_get = data.split(",");
    for (i=0; i<Math.floor(vals_get.length/3); i++) {
      this.game_results_json[vals_get[3*i]] = {
        "player_id" : parseInt(vals_get[3*i+1]),
        "coins_added" : parseInt(vals_get[3*i+2])
      }
    }
  }

<<<<<<< HEAD
      text_make(0,40,0,2);
      textAlign(CENTER, CENTER);
      text(this.playerNames[0]+" WON!", width/2, 50);
      
      j = 0;
      for (let i in this.players) {
        j++;
        // this.players[i].y = 100*j;
        // this.players[i].x = 500;
        //text("Player "+j+" made: "+this.playerPlaces[i],20,100*j);
        if(this.playerPlaces[i] == 1) {
          this.players[i].y = 200;
          this.players[i].x = width/2;
          this.players[i].update_anim("First")
        }
        else if(this.playerPlaces[i] > 4){
          this.players[i].y = 400;
          this.players[i].x = width/2+(this.playerPlaces[i]-3)*250;
          this.players[i].update_anim("SecondAndThird")
        }
        else {
          this.players[i].y = 400;
          this.players[i].x = width/2+(this.playerPlaces[i]-3)*250;
          this.players[i].update_anim("Fourth")
        }

        this.players[i].draw();
        text(this.playerNames[i],this.players[i].x,this.players[i].y+90);
      }
    }
  
    this.read_network_data = function(flag, message) {
      if (flag == "player_count") {
        for (j=this.players.length; j < parseInt(message); j++){
          this.numberOfPlayers++;
          this.players[j] = new game_end_screen_player(this.greenSprite, height/2, width/2*this.numberOfPlayers, 1);
        }
      } else if (flag == "assigned_id") {
        this.main_player_index = parseInt(message);
      } else if (flag == "pos_player") {
        this.read_in_player_position(message);
      } else if (flag == "new_player") {
        this.numberOfPlayers++;
        this.players[parseInt(message)] = new game_end_screen_player(this.greenSprite, height/2, width/2*this.numberOfPlayers, 0);
        console.log("Number of Players:"+this.players.length);
      } else if (flag == "rmv_player") {
        var player_index = parseInt(message);
        this.players.splice(player_index, 1);
        if (this.main_player_index > player_index) {
          this.main_player_index -= 1;
        }
      } else if (flag == "clients_info") {
        this.p_vals = convert_data_string(message,[0,1,3],null,[2]);
        this.players[this.p_vals[0]].place = this.p_vals[1];
        this.players[this.p_vals[0]].name = this.p_vals[2];
        this.players[this.p_vals[0]].color = this.p_vals[3];

      }
    }
  
    this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
      p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
      this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
=======
	this.read_network_data = function(flag, message) {
		if (flag == "player_count") {
			for (j=this.players.length; j < parseInt(message); j++){
				this.players[j] = new game_1_player(this.sprite, 300, 300, "down", j%4);
			}
		} else if (flag == "assigned_id") {
			this.main_player_index = parseInt(message);
		} else if (flag == "pos_player") {
			this.read_in_player_position(message);
		} else if (flag == "new_player") {
			this.players[parseInt(message)] = new game_1_player(this.sprite, 300, 300, "down", parseInt(message)%4);
		} else if (flag == "rmv_player") {
			var player_index = parseInt(message);
			this.players.splice(player_index, 1);
			if (this.main_player_index > player_index) {
				this.main_player_index -= 1;
			}
		} else if (flag == "host_started_game") {
			this.start_time = Date.now()/1000 - parseFloat(message);
			this.current_time = parseFloat(message);
			this.host_started_game = true;
		} else if (flag == "assigned_host") {
			this.client_is_host = 1;
		} else if (flag == "game_result_json") {
      this.read_in_game_results_json(message);
>>>>>>> origin/master
    }
	}

	this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
		p_vals = convert_data_string(data_string, [0, 3, 6, 7], [1, 2, 4], [5]);
		this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
	}
  }