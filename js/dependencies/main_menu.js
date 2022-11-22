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
		this.color_arrray = ['#E53564', '#2DE2E6', '#9700CC', '#035EE8', '#F3C752', '#F6019D']; //color array containing red, cyan, purple, blue, yellow, pink
		this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];
		//this.color_array = [this.red, this.cyan, this.purple, this.blue, this.yellow, this.pink];
		this.disco_ball = loadImage('media/misc/disco_ball_string.png');
		this.sparkle = loadImage(repo_address+"media/misc/sparkle.png");
		this.disco_sprites = loadImage(repo_address+"media/misc/disco_sprite.png");
		this.disco_sprites_2 = loadImage(repo_address+"media/misc/disco_sprite_7i.png");
		this.disco_sprites_3 = loadImage(repo_address+"media/misc/disco_sprite_5i.png");
		this.sx = 0;
		this.s5x = 0;
		this.s7x = 0;
		this.rando = [-20, 25, 6];
		this.test_background_1 = loadImage("media/backgrounds/city_layer_3.png");
		this.scroll_background_1 = new scroll_image(this.test_background_1, [1920, 1080], 0);
		this.test_background_2 = loadImage("media/backgrounds/city_layer_2.png");
		this.scroll_background_2 = new scroll_image(this.test_background_2, [1920, 1080], 10);
		this.test_background_3 = loadImage("media/backgrounds/city_layer_1.png");
		this.scroll_background_3 = new scroll_image(this.test_background_3, [1920, 1080], 80);
		
		this.loop_started = 0;


		this.buttons = {
			"main" : [],
			"server" : [],
			"certify" : [],
			"info" : []
		};
		
		
		
		this.user_info = user_info;

		console.log("WINDOW DIMS : "+width+", "+height);
		this.buttons["main"][0] = new button(810-200, 300+100, 240, 160, this.color_arrray[3], [10, 10, 10], "certify", 4, true, false);
		this.buttons["main"][1] = new button(1110+200, 300+100, 240, 160, this.color_arrray[3], [10, 10, 10], "connect", 4, true, false);
		this.buttons["main"][2] = new button(810-200, 550+100, 240, 160, this.color_arrray[3], [10, 10, 10], "server", 4, true, false);
		//this.buttons["main"][3] = new button(1110+100, 350+100, 150, 100, this.color_arrray[3], [10, 10, 10], "test game", 4, true, false);
		//this.buttons["main"][4] = new button(810-100, 500+100, 150, 100, this.color_arrray[3], [10, 10, 10], "board\ngame", 4, true, false);
		this.buttons["main"][5] = new button(1110+200, 550+100, 240, 160, this.color_arrray[3], [10, 10, 10], "info", 4, true, false);
		this.buttons["server"][0] = new button(860, 680, 150, 100, this.color_arrray[3], [10, 10, 10], "submit", 4, true, false);
		this.buttons["server"][1] = new button(1060, 680, 150, 100, this.color_arrray[3], [10, 10, 10], "cancel", 4, true, false);
		this.buttons["certify"][0] = new button(960, 620, 150, 100, this.color_arrray[3], [10, 10, 10], "back", 4, true, false);
		this.buttons["info"][0] = new button(860, 680, 150, 100, this.color_arrray[3], [10, 10, 10], "submit", 4, true, false);
		this.buttons["info"][1] = new button(1060, 680, 150, 100, this.color_arrray[3], [10, 10, 10], "cancel", 4, true, false);
		g_cam.reset();
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
		this.scroll_background_3.draw();
		this.adjust_current_menu();
		this.current_time = millis()/1000 - this.start_time;
		if (this.current_time < 3) { this.draw_startup_animation(); return; }
		if (this.current_menu == "main") { this.draw_menu_1(); }
		else if (this.current_menu == "server") { this.draw_menu_2(); }
		else if (this.current_menu == "certify") { this.draw_menu_3(); }
		else if (this.current_menu == "info") { this.draw_menu_4(); }
		/*
		//laser effect
		push();
		var time_get = millis()*10 / 1000
		offset_x = Math.max(0, time_get%20-10);
		offset_width = Math.min(time_get%20, 10);
		rectMode(CORNERS);
		fill(255, 0, 0);
		translate(width/2, height/2);
		rotate(millis()/1000);
		rect(20*offset_x, -10, 20*offset_width, 20)
		pop();
		*/
	}

	this.draw_menu_1 = function() {
		if(frameCount % 10 == 0){
			this.sx = (this.sx + 1) % 6;
		}
		if(frameCount % 10 == 0){
			this.s5x = (this.s5x + 1) % 5;
		}
		if(frameCount % 10 == 0){
			this.s7x = (this.s7x + 1) % 5;}
		//draw disco ball image
		//image(this.disco_ball, width/2, 175, 50*2, 175*2);
		stroke(this.blue);
		strokeWeight(5);
		line(width/2, 0, width/2, 300);
		image(this.disco_sprites, width/2, 300, 96, 96, 128*this.sx, 0, 128, 128);
		//image(this.blue_line1, width/2, 175, 1, 175, this.blue_line1.width, this.blue_line1.length);
		imageMode(CENTER);
		image(this.sparkle, width/2+this.rando[2], 300+this.rando[0], abs(sin(frameCount/30))*30, abs(sin(frameCount/30))*30, 0, 0, this.sparkle.width, this.sparkle.height, CONTAIN, LEFT, CENTER);
   		image(this.sparkle, width/2+this.rando[0], 300+this.rando[1], abs(sin(frameCount/25))*40, abs(sin(frameCount/25))*40, 0, 0, this.sparkle.width, this.sparkle.height, COVER, CENTER, CENTER);
   		image(this.sparkle, width/2+this.rando[1], 300+this.rando[2], abs(sin(frameCount/20))*50, abs(sin(frameCount/20))*50, 0, 0, this.sparkle.width, this.sparkle.height, COVER, CENTER, CENTER);
		var r_color = rainbow_gradient(2*this.current_time);
		var r_color2 = rainbow_gradient(2*this.current_time+2);
		textAlign(CENTER, CENTER);
		text_make(4, Math.min(200*height/1080, 200*width/1920), 0, 2);
		//fill(r_color[0], r_color[1], r_color[2]);
		fill(this.blue);
		
		text("retro  royale", width/2, height/10);
		//fill(r_color2[0], r_color2[1], r_color2[2]);
		fill(this.cyan);
		text("retro  royale", width/2+6, height/10);
		for (let i in this.buttons["main"]) { this.buttons["main"][i].draw(); }
		text_make(0, 10, 0, 1);
		//stroke(11);
		if (connected_to_server) {
			fill(0, 255, 0);
			text_make(4, 10, 0, 0);
			text("connected", width - 50, 10);
		} else {
			fill(this.red);
			text_make(4, 10, 0, 0);
			text("not connected", width - 50, 10);
		}
	}

	this.draw_menu_2 = function() {
		//background(255, 78, 0);
		strokeWeight(5);
		fill(200, 200, 255);
		rect(width*4/10, height*3/10, width*2/10, height*4/10);
		fill(0, 0, 0);
		textAlign(CENTER, CENTER);
		text_make(4, 20, 0, 0);
		text("server address", width/2, height*415/1080);
		text("server port", width/2, height*525/1080);
		for (let i in this.buttons["server"]) { this.buttons["server"][i].draw(); }
	}

	this.draw_menu_3 = function() {
		strokeWeight(5);
		fill(200, 200, 255);
		rect(width*4/10, height*3/10, width*2/10, height*4/10);
		text_make(4, Math.min(25*width/1920, 30*height/1080), 0, 0);
		fill(0, 0, 0);
		textAlign(CENTER, CENTER);
		text("webSockets with self-signed\ncertificates are not accepted\nuntil you authorize them",
								width/2, height*440/1080);
		for (let i in this.buttons["certify"]) { this.buttons["certify"][i].draw(); }
	}

	this.draw_menu_4 = function() {
		//background(255, 78, 0);
		strokeWeight(5);
		fill(200, 200, 255);
		rect(width*4/10, height*3/10, width*2/10, height*4/10);
		text_make(4, 20, 0, 0);
		fill(0, 0, 0);
		textAlign(CENTER, CENTER);
		text("name", width/2, height*415/1080);
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
		text_make(4, 50,  0, 2);
		var text_position_x = sigmoid_array([width*2, width/2, -width], [0, 1.5, 3], [1.5, 3], this.current_time),
				box_position_x = sigmoid_array([-width, width/2, width*2], [0, 1.5, 3], [1.5, 3], this.current_time),
				box_width = 350, box_height = 100;
		fill(255, 78, 0);
		rect(box_position_x - box_width/2, height/2 - box_height/2, box_width, box_height);
		var r_color = rainbow_gradient(this.current_time);
		fill(r_color[0], r_color[1], r_color[2]);
		textAlign(CENTER, CENTER);
		text("retro royale", text_position_x, height/2);
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
				playSound('press');
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
		/*
		if (this.loop_started == 0) {
			this.sounds.player("arp").start();
			this.loop_started = 1;
		}
		*/
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