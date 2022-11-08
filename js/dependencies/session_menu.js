function session_menu() {
	this.setup = function() {
		this.session_id_input;
		this.temp_session_id = "";
		this.current_time = 0.000;
		this.current_menu = "main";
		this.button_funcs = [];
        this.warning_message = "";
		this.buttons = {
			"main" : [],
			"create_session" : [],
			"join_session" : [],
		};

		this.user_info = user_info;

		console.log("WINDOW DIMS : "+width+", "+height);
		this.buttons["main"][0] = new button(810, 200, 150, 100, [255, 78, 0], [10, 10, 10], "Create\nSession", true);
		this.buttons["main"][1] = new button(1110, 200, 150, 100, [255, 78, 0], [10, 10, 10], "Join\nSession", true);
		this.buttons["create_session"][0] = new button(860, 680, 150, 100, [255, 78, 0], [10, 10, 10], "Start", true);
		this.buttons["create_session"][1] = new button(1060, 680, 150, 100, [255, 78, 0], [10, 10, 10], "Cancel", true);
		this.buttons["join_session"][0] = new button(860, 680, 150, 100, [255, 78, 0], [10, 10, 10], "Join", true);
		this.buttons["join_session"][1] = new button(1060, 680, 150, 100, [255, 78, 0], [10, 10, 10], "Cancel", true);
		g_cam.reset();
	}

	this.draw = function() {
		if (this.current_menu == "main") { this.draw_menu_1(); }
		else if (this.current_menu == "create_session") { this.draw_menu_2(); }
		else if (this.current_menu == "join_session") { this.draw_menu_3(); }
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
		text("Session_id", width/2, height*415/1080);
        fill(255, 0, 0);
        text(this.warning_message, width/2, height*525/1080);
		for (let i in this.buttons["create_session"]) { this.buttons["create_session"][i].draw(); }
	}

	this.draw_menu_3 = function() {
		//background(255, 78, 0);
		strokeWeight(5);
		fill(200, 200, 255);
		rect(width*4/10, height*3/10, width*2/10, height*4/10);
		text_make(0, 20, 0, 0);
		fill(0, 0, 0);
		textAlign(CENTER, CENTER);
		text("Session_id", width/2, height*415/1080);
        fill(255, 0, 0);
        text(this.warning_message, width/2, height*525/1080);
		for (let i in this.buttons["join_session"]) { this.buttons["join_session"][i].draw(); }
	}

	this.window_resize = function() {
		if (this.current_menu == "create_session" || this.current_menu == "join_session") {
			this.session_id_input.position(width/2 - 77, height*440/1080);
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
				return;
			}
		}
	}

	this.button_press = function(code) {
		if (this.current_menu == "main") {
			if (code == 0) { this.create_menu_enable(); }
			else if (code == 1) { this.join_menu_enable(); }
		} else if (this.current_menu == "create_session") {
			if (code == 0) { this.create_session_send(); }
            else if (code == 1) { this.create_menu_disable(); }
		} else if (this.current_menu == "join_session") {
			if (code == 0) { this.join_session_send(); }
            else if (code == 1) { this.join_menu_disable(); }
		}
	}

	this.read_network_data = function(flag, message) {
		if (flag == 'session_warning') {
            this.warning_message = message;
        } else if (flag == 'assigned_session') {
			session_id = parseInt(message);
		} else if (flag == 'remove_inputs') {
			this.session_id_input.remove();
		}
	}

	this.create_menu_enable = function() {
		this.session_id_input = createInput(this.temp_session_id);
		this.session_id_input.position(width/2 - 77, height*440/1080);
		this.session_id_input.input(oninput_session);
		this.current_menu = "create_session";
	}

	this.create_menu_disable = function() {
		this.session_id_input.remove();
		this.current_menu = "main";
        this.warning_message = "";
	}

    this.join_menu_enable = function() {
		this.session_id_input = createInput(this.temp_session_id);
		this.session_id_input.position(width/2 - 77, height*440/1080);
		this.session_id_input.input(oninput_session);
		this.current_menu = "join_session";
	}

	this.join_menu_disable = function() {
		this.session_id_input.remove();
		this.current_menu = "main";
        this.warning_message = "";
	}

	this.create_session_send = function() {
        send_data("create_session:"+this.temp_session_id);
    }

    this.join_session_send = function() {
        send_data("join_session:"+this.temp_session_id);
    }
}

function oninput_session() {
  current_state.temp_session_id = this.value();
}