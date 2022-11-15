function load_room() {
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
		this.buttons = {
			"overlay": [],
			"host_menu": [20],
		};

		this.vid_font = loadFont('media/fonts/videogame.ttf');
		this.background1 = [226,200,226];
		this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];

		this.host_settings = [20]; //# of turns turns;

		this.current_menu = "overlay";
		this.buttons["host_menu"][0] = new button(width/6, 100, 50, 50, [0, 0, 255], [10, 10, 10], "+1");
		this.buttons["host_menu"][1] = new button(width/6, 200, 50, 50, [0, 0, 255], [10, 10, 10], "-1");
		this.buttons["host_menu"][2] = new button(width/6, 300, 50, 50, [0, 0, 255], [10, 10, 10], "Back");
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
				this.buttons[this.current_menu][i].pressed = 0;
				this.button_press(i);
			}
		}
	}

	this.button_press = function(code) {
		if (this.current_menu == "overlay") {
			if (code == 0) { send_data("start_game"); }
			else if (code == 1) { this.current_menu = "host_menu"; }
		} else if (this.current_menu == "host_menu") {
			if (code == 0) { this.host_settings[0] = 20 + ((this.host_settings[0] + 1 - 20 ) % 31); }
			else if (code == 1) { this.host_settings[0] = 20 + ((this.host_settings[0] - 1 - 20 ) % 31); }
			else if (code == 2) { this.current_menu = "overlay"; }
		}
	}

	this.draw = function() {
		this.current_time = Date.now()/1000 - this.start_time;
		background(background1);
		fill(0, 0, 0);
		text_make(0, 50, 0, 2);
		textAlign(CENTER, CENTER);
		textFont(vid_font);
		if (this.host_started_game) {
			textFont(vid_font);
			text("game starting in "+str(Math.max(0, int(10-this.current_time))), width/2, height/2);
		} else {
			textFont(vid_font);
			text("waiting for host to start game", width/2, height/2);
		}
		for (let i in this.players) {
			this.players[i].draw();
		}
		for (let i in this.buttons[this.current_menu]) { this.buttons[this.current_menu][i].draw(); }
		if (this.current_menu == "host_menu") { this.draw_host_menu(); }
	}

	this.draw_host_menu = function() {
		push();
		background(background1);
		text_make(0, 20, 0, 0);
		textAlign(CENTER, CENTER);
		fill(0, 0, 0);
		textFont(vid_font);
		text("turns : "+this.host_settings[0], 200, 150);
		pop();
	}

	this.read_network_data = function(flag, message) {
		if (flag == "player_count") {
			for (j=this.players.length; j < parseInt(message); j++){
				this.players[j] = new game_1_player(this.sprite, 300, 300, 1, j%4);
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
			this.buttons["overlay"][0] = new button(width/6, 100, 150, 100, this.blue, [10, 10, 10], "Start");
			this.buttons["overlay"][1] = new button(width/6, 300, 150, 100, this.blue, [10, 10, 10], "Menu");
		}
	}

	this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
		p_vals = convert_data_string(data_string, [0, 3, 6, 7], [1, 2, 4], [5]);
		this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
	}
}