function fruitGame() {
	this.setup = function() {

		//colors
		this.blue = [3, 94, 232];
		this.red = [229, 53, 100];
		this.yellow = [243, 199, 82];
		this.pink = [246, 1, 157];
		this.cyan = [45, 226, 230];
		this.purple = [151, 0, 204];

		this.fruits_count = 15;
		this.players = [];
		this.fruits = [];
		this.endzones = [];
		this.game_active = 0;
		this.game_length = 5.000;
		this.start_time;
		this.current_time = this.game_length;
		this.main_player_index;
		this.background1 = loadImage(repo_address+"media/backgrounds/diner_background.png");
		this.arrow_keys = {
			"left" : 37,
			"right" : 39,
			"up" : 38,
			"down" : 40
		}; 
		this.sounds = new Tone.Players({
			Fail : 'media/sounds/fail_sound.mp3',
			Win : 'media/sounds/win_sound.mp3',
			Hit : 'media/sounds/hit.mp3',
			Miss : 'media/sounds/miss.mp3'
		});
		this.sounds.toDestination();
		this.soundNames = ['Fail', 'Win', 'Hit', 'Miss']
		this.main_sprite = loadImage("media/sprites/Spritesheet_64.png");
		this.fruitSprite = loadImage(repo_address+"media/sprites/fruit_sprites.png");
		this.start_time = millis()/1000;
		this.game_dimensions = [2000, 1000];
		textFont(font_set[3]);
		textSize(20);
		textAlign(CENTER, CENTER);
		fill(0, 0, 0);
		imageMode(CENTER);
		for (i=0; i < 15; i++) {
			this.fruits[i] = new game_1_fruit(this.fruitSprite, width*Math.random(), height*Math.random(), 3+Math.random()*12);
		}
		this.players[0] = new game_1_player(this.main_sprite, 200, 200, "left", 0);
		this.endzones[0] = new game_1_endzone(1/15*this.game_dimensions[0], 10.5/20*this.game_dimensions[1], 4*(this.game_dimensions[0]/30), 5*(this.game_dimensions[1]/20));
		this.endzones[1] = new game_1_endzone(14/15*this.game_dimensions[0], 10.5/20*this.game_dimensions[1], 4*(this.game_dimensions[0]/30), 5*(this.game_dimensions[1]/20));
		this.main_player_index = 0;
		this.end_message = "GAME OVER";
		g_cam.reset();
	}

	this.key_pressed = function(keycode) {
		for (let i in this.arrow_keys){
			if (keycode == this.arrow_keys[i]){
				this.players[this.main_player_index].update_facing(i);
				this.players[this.main_player_index].update_moving(true);
				this.players[this.main_player_index].move = 1;
				send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
				return;
			}
		}
		if (this.game_active != 1) { return; }
		if (keycode == 32) {
			if (this.players[this.main_player_index].fruit_holding == 1) {
				var fruit_id = this.players[this.main_player_index].fruit_held_id;
				this.players[this.main_player_index].drop_fruit();
				this.fruits[fruit_id].drop();
				for (i=0; i<this.endzones.length; i++) {
					var fr_x = this.fruits[fruit_id].x,
							fr_y = this.fruits[fruit_id].y;
					if (!(this.fruits[this.players[this.main_player_index].fruit_held_id].scored) &&
							this.endzones[i].check_placement(fr_x, fr_y)) {
						this.fruits[fruit_id].scored = 1;
						this.endzones[i].score += this.fruits[fruit_id].size;
						send_data(this.fruits[fruit_id].make_data(fruit_id)+"\n"+
									this.players[this.main_player_index].make_data(this.main_player_index)+"\n"+
									this.endzones[i].make_data(i));
						break;
					}
				}
				this.playSound("Miss");
				send_data(this.fruits[fruit_id].make_data(fruit_id)+"\n"+
									this.players[this.main_player_index].make_data(this.main_player_index));
			} else {
				for (i=0; i < this.fruits.length; i++) {
					this.fruits[i].check_grabbed(
						this.players[this.main_player_index].x, 
						this.players[this.main_player_index].y,
						this.main_player_index
					);
					if (this.fruits[i].held) {  
						this.players[this.main_player_index].grab_fruit(i, this.fruits[i].size);
						this.playSound("Hit");

						send_data(this.fruits[i].make_data(i)+"\n"+
											this.players[this.main_player_index].make_data(this.main_player_index));
						
						return;
					}
				}
			}
		}
	}

	this.key_released = function(keycode) {
		for (let i in this.arrow_keys){
			if(keycode == this.arrow_keys[i] && this.players[this.main_player_index].facing == i) {
				this.players[this.main_player_index].dx = 0;
				this.players[this.main_player_index].update_moving(false);
				this.players[this.main_player_index].move = 0;
			}
		}
		send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
	}

	this.mouse_pressed = function() { return; }
	this.mouse_released = function() { return; }

	this.draw = function() {
		push();
		textFont(font_set[3]);
		
		this.current_time = this.game_length - ((millis()/1000) - this.start_time);
		if (this.game_active == 0) { this.draw_game_load(); }
		else if (this.game_active == 1) { this.draw_game_active();}
		else if (this.game_active == 2) { this.draw_game_over(); }
		pop();
	}

	this.draw_game_load = function() {
		background(this.cyan);
		stroke(5);
		fill(this.purple);
		text_make(0, 50, 0, 0);
		for (let i in this.players) {
			this.players[i].draw();
		}
		
		textAlign(CENTER, CENTER);
		textFont(font_set[3]);
		g_cam.text("game starts in "+str(int(this.current_time)), width/2, height/2);
		if (this.current_time < 0) {
			this.game_active = 1;
		}
	}

	this.draw_game_active = function() {
		g_cam.x = this.players[this.main_player_index].x;
		g_cam.y = this.players[this.main_player_index].y;
		g_cam.scale = 0.8;
		g_cam.image(this.background1, this.game_dimensions[0]/2, this.game_dimensions[1]/2, this.game_dimensions[0], this.game_dimensions[1]);
		fill(0, 0, 0);
		text_make(0, 50, 0, 0);
		textSize(50);
		for (let i in this.endzones) { this.endzones[i].draw(); }
		for (let i in this.players) {
			if (this.players[i].fruit_holding == 1) {
				this.fruits[this.players[i].fruit_held_id].update_position(
					this.players[i].x, this.players[i].y
				);
			}
			this.players[i].draw();
			this.players[i].x = Math.max(0, Math.min(this.players[i].x, this.game_dimensions[0]));
			this.players[i].y = Math.max(0, Math.min(this.players[i].y, this.game_dimensions[1]));
		}
		for (let i in this.fruits){ this.fruits[i].draw(); }
		text("Time: "+str(Math.max(0, int(this.current_time))), width/2, 50);
	}

	this.game_over = function() {
		g_cam.reset();
		this.start_time = millis()/1000;
		var indices_winners = [0], max=0;
		for (let i in this.endzones) {
			if (this.endzones[i].score > max) {
				indices_winners = [i];
				max = this.endzones[i].score;
			} else if (this.endzones[i].score == max) {
				indices_winners[indices_winners.length] = i;
			}
		}
		if (indices_winners.length > 1) {
			this.end_message = "TIE";
			/*
			for (let i in indices_winners) {
				this.end_message += "Team "+str(indices_winners[i])+",";
			}
			*/
		} else {
			this.end_message = "TEAM "+str(indices_winners)+" WINS";
		}
		console.log(this.end_message);
		this.game_active = 2;
	}

	this.draw_game_over = function() {
		var time = this.game_length - this.current_time;
		var breakpoint = 3;
		var text_position_x = sigmoid_array([width*2, width/2, -width], [0, 1.5, 3], [1.5, 3], time),
				box_position_x = sigmoid_array([-width, width/2, width*2], [0, 1.5, 3], [1.5, 3], time),
				r = 255*(Math.sin(time/5)+1)/2,
				g = 255*(Math.cos(time/5.13)+1)/2,
				b = 255*(Math.sin(time/5.3+5)+1)/2;
		stroke(51);
		strokeWeight(2);
		textSize(100);
		textAlign(CENTER, CENTER);
		textStyle(ITALIC);
		fill(127.5+g/2, 127.5+b/2, 127.5+r/2);
		if (time < breakpoint) {
			stroke(0, 0, 0);
			strokeWeight(4);
			fill(this.red);
			rect(box_position_x-250, height/2 - 100, 500, 200);
			fill(r, g, b);
			text("GAME OVER", text_position_x, height/2);
			return;
		}
		stroke(51);
		strokeWeight(4);
		font_make(0, 100);
		textAlign(CENTER, CENTER);
		for (i=Math.max(0, Math.floor(20*((time - breakpoint)/1.5)%39-20)); 
				i<Math.min(20, Math.floor(20*((time - breakpoint)/1.5)%39));i++) {
			text_make(int(time*2) % 3, 100, 51, 4);
			var r = 255*(Math.sin(time*2+i*PI/15+3)+1)/2,
					g = 255*(Math.cos(time*2+i*PI/15)+1)/2,
					b = 255*(Math.sin(time*2+i*PI/15+5)+1)/2;
			fill(r, g, b);
			text(this.end_message, width/2, i*25+height/2-250);
		}
		
	}
	
	this.playSound = function(whichSound='Fail') {
		this.sounds.player(whichSound).start();
	}

	this.read_network_data = function(flag, message) {
		/*
		Server packets will be formatted as such

		new_player:id
		pos_player:3,500,200,3,1    (id, x_pos, y_pos, facing, moving, speed)
		rmv_player:3                deletes player from array

		multiple statements can be send, split by newline \n

		on connection
		assigned_id:3               tells client where they are in server array

		new_id:2                    if a player leaves, indices change, and the assignments will too
		*/
		//console.log("Recieved:" + str(data_in));
		if (flag == "player_count") {
			for (j=this.players.length; j < parseInt(message); j++){
				this.players[j] = new game_1_player(this.main_sprite, 300, 300, "left", j%4);
			}
		} else if (flag == "assigned_id") {
			this.main_player_index = parseInt(message);
		} else if (flag == "pos_player") {
			this.read_in_player_position(message);
		} else if (flag == "new_player") {
			this.players[parseInt(message)] = new game_1_player(this.main_sprite, 200, 200, "left", parseInt(message)%4);
		} else if (flag == "rmv_player") {
			var player_index = parseInt(message);
			this.players.splice(player_index, 1);
			if (this.main_player_index > player_index) {
				this.main_player_index -= 1;
			}
		} else if (flag == "pos_fruit") {
			this.read_in_fruit_position(message);
		} else if (flag == "upd_endzone") {
			this.read_in_endzone_data(message);
		} else if (flag == "game_state") {
			this.read_in_game_state(message)
		} //else if (flag == "pop_fruit") {
			//this.fruits.splice(parseInt(message), 1);
		//}
	}

	this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
		p_vals = convert_data_string(data_string, [0, 3, 6, 7], [1, 2, 4], [5]);
		this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
	}

	this.read_in_fruit_position = function(data_string) {
		p_vals = convert_data_string(data_string, [0, 3, 4, 5, 6], [1, 2]);
		if (p_vals[0] >= this.fruits.length) { this.fruits[p_vals[0]] = new game_1_fruit(this.fruitSprite, 0, 0, 0); }
		this.fruits[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6]);
		return p_vals[0];
	}

	this.read_in_endzone_data = function(data_string) {
		p_vals = convert_data_string(data_string, [0, 5], [1, 2, 3, 4]);
		if (p_vals[0] >= this.endzones.length) { this.endzones[p_vals[0]] = new game_1_endzone(0, 0, 0, 0); }
		this.endzones[p_vals[0]].update_data(p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5]);
	}
	this.read_in_game_state = function(data_string) {
		p_vals = convert_data_string(data_string, [0], [1, 2]);
		this.current_time = p_vals[1];
		this.game_active = p_vals[0];
		this.game_length = p_vals[2];
		if (this.game_active != 2) {
			this.start_time = millis()/1000 - (this.game_length - this.current_time);
		} else {
			this.start_time = millis()/1000;
		}
		if (this.game_active != 2 && p_vals[0] == 2) { this.game_over(); }
	}
}