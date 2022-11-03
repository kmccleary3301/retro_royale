function dev_room() {
	this.setup = function() {
		this.players = [];
		this.main_player_index;
		this.arrow_keys = [39, 37, 38, 40];
		this.host_started_game = false;
		this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
		imageMode(CENTER);
		this.players[0] = new game_1_player(this.greenSprite, 200, 200, 0);
		this.main_player_index = 0;
		this.start_time = Date.now()/1000;
		this.current_time = 0;
		this.client_is_host = 0;
		this.buttons = {
			"overlay": []
		};
		this.current_menu = "overlay";
        this.global_games = ["ball_game", "fruit_game", "board_game", "load_room", "purgatory", "fighting_game", "flappy_bird"];

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

	this.mouse_pressed = function() {
		for (let i in this.buttons[this.current_menu]) {
			if (this.buttons[this.current_menu][i].check_press(mouseX, mouseY)) {
				return;
			}
		}
	}

	this.mouse_released = function() {
		for (let i in this.buttons[this.current_menu]) {
			if (this.buttons[this.current_menu][i].pressed) {
				this.button_press(i);
			}
			this.buttons[this.current_menu][i].pressed = 0;
		}
	}

	this.button_press = function(code) {
		if (this.current_menu == "overlay") {
            if (code < this.global_games.length) {
                send_data("start_game:"+this.buttons["overlay"][code].text);
            }
		}
	}

	this.draw = function() {
		this.current_time = Date.now()/1000 - this.start_time;
		push();
		background(200, 200, 200);
		fill(0, 0, 0);
		text_make(0, 50, 0, 2);
		textAlign(CENTER, CENTER);
		if (this.host_started_game) {
			text("Game starting in "+str(Math.max(0, int(10-this.current_time))), width/2, height/2);
		} else {
			text("Waiting for host to start game", width/2, height/2);
		}
		for (let i in this.players) {
			this.players[i].draw();
		}
		for (let i in this.buttons[this.current_menu]) { this.buttons[this.current_menu][i].draw(); }
		pop();
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
		} else if (flag == "host_started_game") {
			this.start_time = Date.now()/1000 - parseFloat(message);
			this.current_time = parseFloat(message);
			this.host_started_game = true;
		} else if (flag == "assigned_host") {
            this.assigned_host();
			this.client_is_host = 1;
			
		}
	}

    this.assigned_host = function() {
        this.client_is_host = 1;
        for (let i in this.global_games) {
            this.buttons["overlay"][this.buttons["overlay"].length] = 
            new button(width*(1+Math.floor(i/4))/6, height*(1+(i%4))/6, 150, 100, [255, 78, 0], [10, 10, 10], this.global_games[i]);
        }
    }

	this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
		p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
		this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
	}
}