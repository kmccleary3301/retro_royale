
function game_end_screen() {
  this.setup = function() {
		this.players = [];
		this.main_player_index;
		this.arrow_keys = [39, 37, 38, 40];
		this.host_started_game = false;
		this.sprite = loadImage(repo_address+"media/sprites/Spritesheet_64_update.png");
		imageMode(CENTER);
		this.players[0] = new game_1_player(this.sprite, 200, 200, "left", 0);
		this.main_player_index = 0;
		this.start_time = Date.now()/1000;
		this.current_time = 0;
		this.client_is_host = 0;
    this.names = [];

    this.game_results_json = {};

    send_data("get_clients_info");
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
		push();
		this.current_time = Date.now()/1000 - this.start_time;
		background(200, 200, 200);
		fill(0, 0, 0);
		text_make(0, 20, 0, 2);
		textAlign(CENTER, CENTER);
    text("PLAYER "+this.names[0]+" WON!",width/2,50)
    //text(JSON.stringify(this.game_results_json), width/2, height/2);
		
		for (let i in this.players) {
			this.players[i].x = 100;
      this.players[i].y = 200*(i+1);
      text(this.names[i],this.players[i].x,this.players[i].y+50);
		}
		pop();
	}


  this.read_in_game_results_json = function(data) {
    var vals_get = data.split(",");
    for (i=0; i<Math.floor(vals_get.length/3); i++) {
      this.game_results_json[vals_get[3*i]] = {
        "player_id" : parseInt(vals_get[3*i+1]),
        "coins_added" : parseInt(vals_get[3*i+2]),
		"won" : false
      }
    }

	for (let player_name in this.game_results_json) {
		if (this.winner_names.length == 0) { this.winner_names[0] = player_name; } 
		else if (this.game_results_json[player_name]["coins_added"] > this.game_results_json[this.winner_names[0]]["coins_added"]) {
			console.log("winner names 1 ->"+this.winner_names);
			this.winner_names.splice(0, this.winner_names.length);
			console.log("winner names 2 ->"+this.winner_names);
			this.winner_names[0] = player_name;
			console.log("winner names 3 ->"+this.winner_names);
		} else if (this.game_results_json[player_name]["coins_added"]  == 
					this.game_results_json[this.winner_names[0]]["coins_added"]) {
			console.log("winner names 4 ->"+this.winner_names);
			this.winner_names[this.winner_names.length] = player_name;
			console.log("winner names 5 ->"+this.winner_names);
		}
	}
	console.log("winner names 6 ->"+this.winner_names);
	for (let i in this.winner_names) {
		console.log("game results json -> "+JSON.stringify(this.game_results_json));
		console.log("player name -> "+player_name);
		var player_name = this.winner_names[i];
		this.game_results_json[player_name]["won"] = true;
	}
	console.log("winner names 7 ->"+this.winner_names);
	for (let player_name in this.game_results_json) {
		if (!this.game_results_json[player_name]["won"]) {
			this.loser_names[this.loser_names.length] = player_name;
		}
	}
	console.log("winner names 8 ->"+this.winner_names);
	this.window_resize();
  }

	this.read_network_data = function(flag, message) {
		if (flag == "player_count") {
			for (j=this.players.length; j < parseInt(message); j++){
				this.players[j] = new game_1_player(this.sprite, 300, 300, "left", j%4);
				this.window_resize();
			}
		} else if (flag == "assigned_id") {
			this.main_player_index = parseInt(message);
		} else if (flag == "pos_player") {
			this.read_in_player_position(message);
		} else if (flag == "new_player") {
			this.players[parseInt(message)] = new game_1_player(this.sprite, 300, 300, "left", parseInt(message)%4);
			this.window_resize();
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
    } else if (flag == "client_info") {
      //if(players)
      p_vals = convert_data_string(message,[0],null,[1]);
      this.names[p_vals[0]] = p_vals[1];
    }
	}

	this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
		p_vals = convert_data_string(data_string, [0, 3, 6, 7], [1, 2, 4], [5]);
		this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
	}
  }