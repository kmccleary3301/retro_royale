
function game_end_screen() {
    this.setup = function() {
      this.players = [];
      this.main_player_index;
      this.arrow_keys = [39, 37, 38, 40];
      //this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
      this.greenSprite = loadImage("media/sprites/Spritesheet_64.png");
      imageMode(CENTER);
      this.players[0] = new game_end_screen_player(this.greenSprite, 200, 200, 0);
      this.main_player_index = 0;

      //stores 1,2,3,4 depending on usr_id entered as index value
      //this.playerPlaces = [];

      //stores names similarly
      //this.playerNames = [];

      //this.numberOfPlayers = 2;

      //this gets the data stored in client info about the player scores/positions
      send_data("get_client_data");
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
      //send_data("get_places");
      background(200, 200, 200);
      fill(0, 0, 0);
      text_make(0, 200, 0, 2);
      textAlign(CENTER, CENTER);

      text_make(0,40,0,2);
      textAlign(CENTER, CENTER);
      text(this.players[0].name+" WON!", width/2, 50);
      
      j = 0;
      for (let i in this.players) {
        console.log(this.players[i].name+"\'s color is "+this.players[i].color);
        console.log(this.players[i].name+"\'s place is "+this.players[i].place);
        j++;
        // this.players[i].y = 100*j;
        // this.players[i].x = 500;
        //text("Player "+j+" made: "+this.playerPlaces[i],20,100*j);
        if(this.players[i].place != null && this.players[i].place != undefined) {
          if(this.players[i].place == 1) {
            this.players[i].y = 200;
            this.players[i].x = width/2;
            this.players[i].update_anim("First")
          }
          else {
            if(this.players[i].place > 4){
              this.players[i].y = 400;
              this.players[i].x = width/2+(this.players[i].place-3)*250;
              this.players[i].update_anim("SecondAndThird")
            }
            else {
              this.players[i].y = 400;
              this.players[i].x = width/2+(this.players[i].place-3)*250;
              this.players[i].update_anim("Fourth")
            }
          }
        }
        else {
          this.players[i].y = 400;
          this.players[i].x = width/2+(4-3)*250;
          this.players[i].update_anim("Fourth")
        }

        this.players[i].draw();
        text(this.players[i].name,this.players[i].x,this.players[i].y+90);
      }
    }
  
    this.read_network_data = function(flag, message) {
      if (flag == "player_count") {
        for (j=this.players.length; j < parseInt(message); j++){
          this.numberOfPlayers++;
          this.players[j] = new game_end_screen_player(this.greenSprite, height/2, width/2*this.numberOfPlayers, 1);
        }
      } else if (flag == "assigned_id") {
        this.main_player_index = parseInt(message);
      } else if (flag == "pos_player") {
        this.read_in_player_position(message);
      } else if (flag == "new_player") {
        this.numberOfPlayers++;
        this.players[parseInt(message)] = new game_end_screen_player(this.greenSprite, height/2, width/2*this.numberOfPlayers, 0);
        console.log("Number of Players:"+this.players.length);
      } else if (flag == "rmv_player") {
        var player_index = parseInt(message);
        this.players.splice(player_index, 1);
        if (this.main_player_index > player_index) {
          this.main_player_index -= 1;
        }
      } else if (flag == "clients_info") {
        var p_vals = convert_data_string(message,[0,1,3],null,[2]);
        if(this.players[p_vals[0]] == undefined) {
          this.players[p_vals[0]] = new game_end_screen_player(this.greenSprite,200,200,0);
        }
        
        this.players[p_vals[0]].place = p_vals[1];
        this.players[p_vals[0]].name = p_vals[2];
        this.players[p_vals[0]].color = p_vals[3];
        
      }
    }
  
    this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
      p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
      this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
    }
  }