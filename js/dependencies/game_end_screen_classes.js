class game_end_screen_player {
	constructor(spriteSheet, x, y, face) {
		this.spriteSheet = spriteSheet;
		this.sprite_anim = new sprite_animation_object(spriteSheet, 100, 64, 64,
			{
				// "left_right": {
				// 	"row": 0,
				// 	"row_length": 6
				// },
				// "down": {
				// 	"row": 1,
				// 	"row_length": 6
				// },
				// "up": {
				// 	"row": 2,
				// 	"row_length": 6
				// },
				"First": {
					"row": 9*(this.color+1)-1,
					"row_length": 1
				},
				"SecondAndThird": {
					"row": 1*(this.color+1)-1,
					"row_length": 1
				},
				"Fourth": {
					"row": 8*(this.color+1)-1,
					"row_length": 1
				}
			});

		this.sx = 0;        //Frame counter for when the player is moving.
		this.x = x;
		this.y = y;
		this.move = 0;      //Whether or not player is moving. Int is more convenient than boolean for network messages.
		this.speed = 5;     // Player movement speed
		this.name = "";
		this.color=0;
		this.place;
		this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for East West North South respectively
		this.sprite_row = 0;
		this.fruit_holding = 0;
		this.fruit_held_id = 0;
		this.bounds = [0, 2000, 0, 1000];
	}

	draw() {
		push();
		this.sprite_anim.draw(this.x, this.y, true);
		pop();
	}
	update_anim(animation) {
		if (animation == this.current_animation) { return; }
		//if (animation == "standing" || animation == "dead") { this.moving = 0; this.sprite_anim.stop(); }
		else  { this.moving = 1; this.sprite_anim.start(); }
		this.sprite_anim.change_animation(animation);
		this.current_animation = animation;
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