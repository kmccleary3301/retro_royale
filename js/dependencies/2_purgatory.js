//const { rejects } = require("assert");

//const { text } = require("body-parser");

//const { text } = require("body-parser");

//const { text } = require("body-parser");

let numberOfPlayers = 1;

function purgatory() {
  this.setup = function() {
    this.whoGotFirst; //holds the index of the player who wins the game
    this.whoGotSecond;
    this.whoGotThird;

		this.game_length = 30.000;
		this.start_time;
		this.current_time = this.game_length;

    this.players = [];
    this.main_player_index;
    this.arrow_keys = [39, 37];
    this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
    imageMode(CENTER);
    this.players[0] = new game_2_player(this.greenSprite, null, this.numberOfPlayers, 3);
    this.main_player_index = 0;
    this.alphabet = "abcdefghijklmnopqrstuvwxyz";
    this.current_letter = "g"
    //data fields for MY game
		//
		//stores the current number of players in the game
		//this.numberOfPlayers = 1;
		//
  }

  this.key_pressed = function(keycode) {
    if (keycode == this.arrow_keys[0]) { //if the client presses "right"
      if(this.players[this.main_player_index].previous_key_pressed == this.arrow_keys[1]) {
        //if client previously pressed the "left" key
        this.players[this.main_player_index].facing = 0;
        this.players[this.main_player_index].move = 1;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        this.players[this.main_player_index].previous_key_pressed = keycode;
        this.players[this.main_player_index].timePlayerStartedMoving = Date.now();
        return;
      } else if(this.players[this.main_player_index].previous_key_pressed == 40) {
        //if this is the first key the client pressed
        this.players[this.main_player_index].facing = 0;
        this.players[this.main_player_index].move = 1;
        this.players[this.main_player_index].sx = 0;
        send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
        this.players[this.main_player_index].previous_key_pressed = keycode;
        this.players[this.main_player_index].timePlayerStartedMoving = Date.now();
        return;
      }
    } else if (keycode == this.arrow_keys[1]) { //if the client presses "left"
        if(this.players[this.main_player_index].previous_key_pressed == this.arrow_keys[0]) {
          //if client previously pressed the "right" key
          this.players[this.main_player_index].facing = 0;
          this.players[this.main_player_index].move = 1;
          this.players[this.main_player_index].sx = 0;
          send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
          this.players[this.main_player_index].previous_key_pressed = keycode;
          this.players[this.main_player_index].timePlayerStartedMoving = Date.now();
          return;
        } else if(this.players[this.main_player_index].previous_key_pressed == 40) {
          //if this is the first key the client pressed
          this.players[this.main_player_index].facing = 0;
          this.players[this.main_player_index].move = 1;
          this.players[this.main_player_index].sx = 0;
          send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
          this.players[this.main_player_index].previous_key_pressed = keycode;
          this.players[this.main_player_index].timePlayerStartedMoving = Date.now();
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

  this.mouse_pressed = function() { return; }
  this.mouse_released = function() { return; }

  this.draw = function() {
    background(200, 200, 200);
    fill(0, 0, 0);
    text_make(0, 70, 0, 2);
    textAlign(CENTER, CENTER);
    text("RUN!", width/2, height/2);
    text("Time Remaining: "+this.current_time, width/2,40);

    fill(100,0,0);
    rect(900,40,50,450);
    for (let i in this.players) {
      text_make(0, 70, 0, 2);

      this.players[i].y = 400-i * 90;

      this.players[i].draw();

      this.playerNum = parseInt(i)+1;

      text(""+this.playerNum,30,this.players[i].y);

      if(this.players[i].x > 900) {
        if(this.whoGotFirst == null) {
          this.whoGotFirst = this.playerNum;
        } 
        else {
          if(this.whoGotFirst != this.playerNum && this.whoGotSecond == null) {
            this.whoGotSecond = this.playerNum;
          }
          else {
            if(this.whoGotFirst!= this.playerNum && this.whoGotSecond != this.playerNum && this.whoGotThird == null) {
              this.whoGotThird = this.playerNum;
            }
          }
        }

        textAlign(LEFT, CENTER);
        text_make(0, 20, 0, 2);

        text("Player "+this.whoGotFirst+" Got First!",15,15);
        if(this.whoGotSecond != null)
          text("Player "+this.whoGotSecond+" Got Second!",15,35);
        if(this.whoGotThird != null)
          text("Player "+this.whoGotThird+" Got Third!",15,55);
      }
    }
  }

  this.read_network_data = function(flag, message) {
    if (flag == "player_count") {
      for (j=this.players.length; j < parseInt(message); j++){
        this.players[j] = new game_2_player(this.greenSprite, null, numberOfPlayers, 3);
        numberOfPlayers++;
        send_data("debug:"+numberOfPlayers)
      }
    } else if (flag == "assigned_id") {
      this.main_player_index = parseInt(message);
    } else if (flag == "pos_player") {
      this.read_in_player_position(message);
    } else if (flag == "new_player") {
      this.players[parseInt(message)] = new game_2_player(this.greenSprite, null, numberOfPlayers, 3);
      numberOfPlayers++;
    } else if (flag == "rmv_player") {
      var player_index = parseInt(message);
      this.players.splice(player_index, 1);
      if (this.main_player_index > player_index) {
        this.main_player_index -= 1;
      }
      numberOfPlayers--;
    } else if (flag == "game_state") {
      this.read_in_game_state(message);
    }
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
  }
  this.read_in_game_state = function(data_string) {
		p_vals = convert_data_string(data_string, [0, 1]);
    this.current_time = Math.max(p_vals[0],0);
		this.game_length = p_vals[1];
		this.start_time = millis()/1000;
	}
}