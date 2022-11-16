function load_screen() {
	this.setup = function(){
		this.start_time = millis()/1000;
		this.current_time = 0;
		this.attempts = 0;
		this.sent_load_flag = false;
		this.connect_attempted = true;
		g_cam.reset();
		this.vid_font = loadFont('media/fonts/videogame.ttf');
	}

	this.draw = function(){
		this.current_time = millis()/1000 - this.start_time;
		var menu_text, cycle_time = 15 - this.current_time;
		if (connected_to_server) {
			menu_text = "connection successful";
			if (!this.sent_load_flag) {
				send_data("load_game");
				send_data("game_connect");
				send_data("user_info:"+user_info["name"]);
				this.sent_load_flag = true;
			}
		} else if (this.attempts == 0) {
			menu_text = "attempting to connect";
			make_socket();
			this.attempts++;
		} else if (this.attempts == 1) {
			menu_text = "attempting to connect";
			for (i = 0; i < (int(this.current_time) % 4); i++) {
				menu_text += ".";
			}
			if (cycle_time <= 0) {
				this.start_time = millis()/1000;
				this.attempts++;
			}
		} else if (this.attempts >= 5) {
			menu_text = "5 failed attempts\n Returning to menu";
			if (cycle_time <= 10) {
				swap_current_state("main_menu");
			}
		} else if (cycle_time > 0) {
			menu_text = "retrying in " + str(int(Math.max(0, cycle_time)));
		} else if (cycle_time <= 0 && !(connected_to_server)) {
			make_socket();
			this.start_time = millis()/1000;
			this.attempts++;
		}
		text_make(0, 40, 0, 0);
		textAlign(CENTER, CENTER);
		textFont(this.vid_font);
		fill(0, 0, 0);
		g_cam.text(menu_text, width/2, height/2);
	}

	this.key_pressed = function(keycode) { return; }
	this.key_released = function(keycode) { return; }
	this.mouse_pressed = function() { return; }
	this.mouse_released = function() { return; }
	this.read_network_data = function(flag, message) { return; }
}