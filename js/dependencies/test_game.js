function test_game() {
    this.setup = function() {
      this.players = [];
      this.main_player_index;
      this.arrow_keys = [39, 37, 38, 40];
      this.greenSprite = loadImage(repo_address+"media/sprites/Green.png");
      imageMode(CENTER);
      this.players[0] = new game_1_player(this.greenSprite, 200, 200, 0);
      this.main_player_index = 0;
    }
  
    this.key_pressed = function(keycode) {
      for (i=0;i<4;i++){
        if (keycode == this.arrow_keys[i]){
          this.players[this.main_player_index].facing = i;
          this.players[this.main_player_index].move = 1;
          this.players[this.main_player_index].sx = 0;
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
    }
  
    this.mouse_pressed = function() { return; }
    this.mouse_released = function() { return; }
  
    this.draw = function() {
      background(200, 200, 200);
      fill(0, 0, 0);
      text_make(0, 200, 0, 2);
      textAlign(CENTER, CENTER);
      text("TEST GAME", width/2, height/2);
      for (let i in this.players) {
        this.players[i].draw();
      }
    }
  
    this.read_network_data = function(flag, message) {
      return;
    }
  
    this.read_in_player_position = function(data_string) { //format packet as pos_player:id,x,y,move,speed,facing,fruit_holding,fruit_id
      return;
    }
  }