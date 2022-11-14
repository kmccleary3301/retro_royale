function purgatory() {
  this.setup = function() {
    this.special_Characters = [8,9,13,16,17,18,19,20,27,32,33,34,35,36,37,38,39,40,44,45,46,91,92,93,96,97,98,99,100,101,102,103,104,105,106,107,109,112,113,114,115,116,117,118,119,120,121,122,123,144,145,182,183];
    this.players = [];
    this.main_player_index;
    this.players[0] = new game_1_player(this.greenSprite, 200, 200, 0);
    this.main_player_index = 0;
  }

  this.key_pressed = function(keycode) {
    if(this.key_pressed(keycode) == 32) {
      round_Input.push(" ");
    }
    if(this.key_pressed(keycode) == 8) {
      round_Input.pop();
      backspaces += 1;
    }
    if(special_Characters.indexOf(this.key_pressed(keycode)) == -1) {
      round_Input.push(this.key_pressed(keycode));
    }
  }

  this.key_released = function(keycode) {
  }

  this.mouse_pressed = function() { return; }
  this.mouse_released = function() { return; }

  const prompt0 = ["Where are your keys?", "Still in my car", "I don't own yorkies"];
  const prompt1 = ["Where were you last night?", "At the bar"];
  const prompt = [prompt0, prompt1]
  
  this.newRound = function() {
    correct_letters = 0;
    backspaces = 0;
    this.new_Round = prompt[Math.floor(Math.random()*prompt.length)];
  }

  this.checker = function() {
    for(i = 0, i < this.new_Round.length; i++;) {
      if(this.round_Input(i) == this.new_Round(i)) {
        correct_letters += 1;
      }
    }
  }
  
  this.draw = function() {
    background(200, 200, 200);
    fill(0, 0, 0);
    text_make(0, 200, 0, 2);
    textAlign(CENTER, CENTER);
    text("Tipsy Texting", width/2, height/2);
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
    }
  }

  this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
    p_vals = convert_data_string(data_string, [0, 3, 5, 6, 7], [1, 2, 4]);
    this.players[p_vals[0]].update_data(null, p_vals[1], p_vals[2], p_vals[3], p_vals[4], p_vals[5], p_vals[6], p_vals[7]);
  }
}