function main_menu() {
	this.setup = function() {
		this.start_time = millis()/1000;
		this.server_address_input;
		this.server_port_input;
		this.cert_hyperlink;
		this.temp_server_address = host_address;
		this.temp_server_port = str(global_port);
		this.current_time = 0.000;
		this.current_menu = "main";
		this.button_funcs = [];

		this.test_background_1 = loadImage("media/backgrounds/test_background_2.png");
		this.scroll_background_1 = new scroll_image(this.test_background_1, [1920, 1080], 10);
		this.test_background_2 = loadImage("media/backgrounds/test_background_3.png");
		this.scroll_background_2 = new scroll_image(this.test_background_2, [1920, 1080], 80);
		
		this.sounds = new Tone.Players({
			"Hum" : 'media/sounds/synth_2.wav'
		});
		this.sounds.toDestination();


		this.buttons = {
			"main" : [],
			"server" : [],
			"certify" : [],
			"info" : []
		};

		this.user_info = user_info;

		console.log("WINDOW DIMS : "+width+", "+height);
		this.buttons["main"][0] = new button(810, 200, 150, 100, [255, 78, 0], [10, 10, 10], "Certify", true, false);
		this.buttons["main"][1] = new button(1110, 200, 150, 100, [255, 78, 0], [10, 10, 10], "Connect", true, false);
		this.buttons["main"][2] = new button(810, 350, 150, 100, [255, 78, 0], [10, 10, 10], "Server", true, false);
		this.buttons["main"][3] = new button(1110, 350, 150, 100, [255, 78, 0], [10, 10, 10], "Test Game", true, false);
		this.buttons["main"][4] = new button(810, 500, 150, 100, [255, 78, 0], [10, 10, 10], "Board\nGame\nTime", true, false);
		this.buttons["main"][5] = new button(1110, 500, 150, 100, [255, 78, 0], [10, 10, 10], "Info", true, false);
		this.buttons["server"][0] = new button(860, 680, 150, 100, [255, 78, 0], [10, 10, 10], "Submit", true, false);
		this.buttons["server"][1] = new button(1060, 680, 150, 100, [255, 78, 0], [10, 10, 10], "Cancel", true, false);
		this.buttons["certify"][0] = new button(960, 620, 150, 100, [255, 78, 0], [10, 10, 10], "Back", true, false);
		this.buttons["info"][0] = new button(860, 680, 150, 100, [255, 78, 0], [10, 10, 10], "Submit", true, false);
		this.buttons["info"][1] = new button(1060, 680, 150, 100, [255, 78, 0], [10, 10, 10], "Cancel", true, false);
		g_cam.reset();
	}

	this.playSound = function(whichSound='Fail') {
		this.sounds.player(whichSound).start();
	}

	this.adjust_current_menu = function() {
		var max_text_size = this.buttons[this.current_menu][0].calculate_max_text_size();
		for (let i in this.buttons[this.current_menu]) {
			var new_size = this.buttons[this.current_menu][i].calculate_max_text_size();
			if (new_size < max_text_size) { max_text_size = new_size; }
		}
		for (let i in this.buttons[this.current_menu]) {
			this.buttons[this.current_menu][i].text_size = max_text_size;
		}
	}

	this.draw = function() {
		this.scroll_background_1.draw();
		this.scroll_background_2.draw();
		this.adjust_current_menu();
		this.current_time = millis()/1000 - this.start_time;
		if (this.current_time < 3) { this.draw_startup_animation(); return; }
		if (this.current_menu == "main") { this.draw_menu_1(); }
		else if (this.current_menu == "server") { this.draw_menu_2(); }
		else if (this.current_menu == "certify") { this.draw_menu_3(); }
		else if (this.current_menu == "info") { this.draw_menu_4(); }
	}

	this.draw_menu_1 = function() {
		var r_color = rainbow_gradient(2*this.current_time);
		textAlign(CENTER, CENTER);
		text_make(2, Math.min(110*height/1080, 110*width/1920), 0, 2);
		fill(r_color[0], r_color[1], r_color[2]);
		text("RETRO ROYALE", width/2, height/20);
		for (let i in this.buttons["main"]) { this.buttons["main"][i].draw(); }
		text_make(0, 10, 0, 1);
		stroke(11);
		if (connected_to_server) {
			fill(0, 255, 0);
			text("Connected", width - 50, 10);
		} else {
			fill(255, 0, 0);
			text("Not connected", width - 50, 10);
		}
	}

	this.draw_menu_2 = function() {
		//background(255, 78, 0);
		strokeWeight(5);
		fill(200, 200, 255);
		rect(width*4/10, height*3/10, width*2/10, height*4/10);
		text_make(0, 20, 0, 0);
		fill(0, 0, 0);
		textAlign(CENTER, CENTER);
		text("Server address", width/2, height*415/1080);
		text("Server port", width/2, height*525/1080);
		for (let i in this.buttons["server"]) { this.buttons["server"][i].draw(); }
	}

	this.draw_menu_3 = function() {
		strokeWeight(5);
		fill(200, 200, 255);
		rect(width*4/10, height*3/10, width*2/10, height*4/10);
		text_make(0, Math.min(25*width/1920, 30*height/1080), 0, 0);
		fill(0, 0, 0);
		textAlign(CENTER, CENTER);
		text("WebSockets with self-signed\ncertificates aren't accepted\nuntil you authorize them",
								width/2, height*440/1080);
		for (let i in this.buttons["certify"]) { this.buttons["certify"][i].draw(); }
	}

	this.draw_menu_4 = function() {
		//background(255, 78, 0);
		strokeWeight(5);
		fill(200, 200, 255);
		rect(width*4/10, height*3/10, width*2/10, height*4/10);
		text_make(0, 20, 0, 0);
		fill(0, 0, 0);
		textAlign(CENTER, CENTER);
		text("Name", width/2, height*415/1080);
		for (let i in this.buttons["info"]) { this.buttons["info"][i].draw(); }
	}

	this.window_resize = function() {
		if (this.current_menu == "server") {
			this.server_address_input.position(width/2 - 77, height*440/1080);
			this.server_port_input.position(width/2 - 75, height*550/1080);
		} else if (this.current_menu == "certify") {
			this.cert_hyperlink.position(width/2-70, height*520/1080);
		}
	}

	this.draw_startup_animation = function() {
		text_make(1, 50,  0, 2);
		var text_position_x = sigmoid_array([width*2, width/2, -width], [0, 1.5, 3], [1.5, 3], this.current_time),
				box_position_x = sigmoid_array([-width, width/2, width*2], [0, 1.5, 3], [1.5, 3], this.current_time),
				box_width = 350, box_height = 100;
		fill(255, 78, 0);
		rect(box_position_x - box_width/2, height/2 - box_height/2, box_width, box_height);
		var r_color = rainbow_gradient(this.current_time);
		fill(r_color[0], r_color[1], r_color[2]);
		textAlign(CENTER, CENTER);
		text("RETRO ROYALE", text_position_x, height/2);
	}

	this.key_pressed = function(keycode) {
		return;
	}

	this.key_released = function(keycode) {
		return;
	}

	this.mouse_pressed = function() {
		for (let i in this.buttons[this.current_menu]) {
			if (this.buttons[this.current_menu][i].check_press(mouseX, mouseY)) { return; }
		}
	}

	this.mouse_released = function() {
		for (let i in this.buttons[this.current_menu]) {
			if (this.buttons[this.current_menu][i].pressed) { 
				this.buttons[this.current_menu][i].pressed = 0;
				this.button_press(i);
				this.playSound('Hum');
				return;
			}
		}
	}

	this.button_press = function(code) {
		if (this.current_menu == "main") {
			if (code == 0) { this.authorize_menu_enable(); }
			else if (code == 1) { send_data("user_info:"+user_info["name"]+"\ngame_connect"); swap_current_state("load_screen"); }
			else if (code == 2) { this.server_menu_enable(); }
			else if (code == 3) { this.switch_test_game(); }
			else if (code == 4) { this.switch_board_game(); }
			else if (code == 5) { this.info_menu_enable(); }
		} else if (this.current_menu == "server") {
			if (code == 0) { this.update_server_address(); }
			else if (code == 1) { this.server_menu_disable(); }
		} else if (this.current_menu == "certify") {
			if (code == 0) { this.authorize_menu_disable(); }
		} else if (this.current_menu == "info") {
			if (code == 0) { this.update_user_info(); }
			else if (code == 1) { this.info_menu_disable(); }
		}
	}

	this.read_network_data = function(flag, message) {
		return;
	}

	this.info_menu_enable = function() {
		this.user_name_input = createInput(this.user_info["name"]);
		this.user_name_input.position(width/2 - 77, height*440/1080);
		this.user_name_input.input(oninput_name); 
		this.current_menu = "info";
	}

	this.info_menu_disable = function() {
		this.user_name_input.remove();
		this.current_menu = "main";
		this.user_info = user_info;
	}

	this.update_user_info = function() {
		this.user_name_input.remove();
		this.current_menu = "main";
		user_info = this.user_info;
	}

	this.server_menu_enable = function() {
		this.server_address_input = createInput(host_address);
		this.server_address_input.position(width/2 - 77, height*440/1080);
		this.server_address_input.input(oninput_address);  

		this.server_port_input = createInput(str(global_port));
		this.server_port_input.position(width/2 - 75, height*550/1080);
		this.server_port_input.input(oninput_port);
		this.current_menu = "server";
	}

	this.server_menu_disable = function() {
		this.server_address_input.remove();
		this.server_port_input.remove();
		this.current_menu = "main";
	}

	this.update_server_address = function() {
		host_address = this.temp_server_address;
		global_port = parseInt(this.temp_server_port);
		make_socket();
		this.server_menu_disable();
	}

	this.authorize_menu_enable = function() {
		this.cert_hyperlink = createA("https://"+host_address+":"+global_port, "Authorize Connection");
		this.cert_hyperlink.position(width/2-70, height*520/1080);
		this.current_menu = "certify";
	}

	this.authorize_menu_disable = function() {
		this.cert_hyperlink.remove();
		this.current_menu = "main";
	}
	
	this.switch_test_game = function() {
		swap_current_state("test_game");
	}

	this.switch_board_game = function() {
		swap_current_state("board_game");
	}
}

function oninput_address() {
  current_state.temp_server_address = this.value();
}

function oninput_port() {
  current_state.temp_server_port = this.value();
}

function oninput_name() {
	current_state.user_info["name"] = this.value();
}