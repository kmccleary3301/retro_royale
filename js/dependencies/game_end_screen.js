
function game_end_screen() {
    this.setup = function() {
      this.players = [];
      this.main_player_index;
      this.arrow_keys = [39, 37, 38, 40];
      this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
      //this.greenSprite = loadImage(repo_address+"media/sprites/Spritesheet_64.png");
      imageMode(CENTER);
      this.players[0] = new game_1_player(this.greenSprite, 200, 200, 0);
      this.main_player_index = 0;

      //stores 1,2,3,4 depending on usr_id entered as index value
      this.playerPlaces = [];

      //this gets the data stored in client info about the player scores/positions
      send_data("get_places");
    }
  
    this.key_pressed = function(keycode) {
      for (i=0;i<4;i++){
        //send_data("get_places");
        /*if (keycode == this.arrow_keys[i]){
          this.players[this.main_player_index].facing = i;
          this.players[this.main_player_index].move = 1;
          this.players[this.main_player_index].sx = 0;
          send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
          return;
        }*/
      }
    }
  
    this.key_released = function(keycode) {
      /*for (i=0;i<4;i++){
        if(keycode == this.arrow_keys[i] && this.players[this.main_player_index].facing == i) {
          this.players[this.main_player_index].move = 0;
        }
      }*/
      send_data("my_pos:"+this.players[this.main_player_index].make_data_raw());
    }
  
    this.mouse_pressed = function() { return; }
    this.mouse_released = function() { return; }
  
    this.draw = function() {
      background(200, 200, 200);
      fill(0, 0, 0);
      text_make(0, 200, 0, 2);
      textAlign(CENTER, CENTER);
      text("PURGATORY", width/2, height/2);

      text_make(0,40,0,2);
      textAlign(LEFT, CENTER);
      j;
      for (let i in this.players) {
        this.players[i].draw();
        j = i+1;
        text("Player "+j+" made: "+this.playerPlaces[i],20,100*(i+1));
      }
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
      } else if (flag == "player_place") {
        this.playerAndPosition = convert_data_string(message,[0,1]);
        this.playerPlaces[this.playerAndPosition[0]] = this.playerAndPosition[1];
      }
    }
  
    this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
      p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
      this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    }
  }