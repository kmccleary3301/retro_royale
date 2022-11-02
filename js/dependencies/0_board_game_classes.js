class board_game_player {
  constructor(spriteSheet, x, y, face) {
    this.spriteSheet = spriteSheet;
    this.sx = 0;
    this.x = x;
    this.y = y;
    this.move = 0;
    this.speed = 5;
    this.facing = face; // use 4, maybe 8 later. 0, 1, 2, 3 for EWNS respectively
    this.sprite_row = 0;
    this.fruit_holding = 0;
    this.fruit_held_id = 0;
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    if (this.move == 1){
      if (this.facing < 2){
        scale(1-this.facing*2, 1);  
        image(this.spriteSheet, 0, 0, 100, 100, 80*(this.sx+1), 0, 80, 80);
        this.x = this.x + this.speed * (1-this.facing*2);
      } else if (this.facing == 2) {
        image(this.spriteSheet, 0, 0, 100, 100, 80*(this.sx), 400, 80, 80);
        this.y = this.y - this.speed;
      } else if (this.facing == 3) {
        image(this.spriteSheet, 0, 0, 100, 100, 480 + 80*(this.sx), 400, 80, 80);
        this.y = this.y + this.speed;
      }

      this.x = Math.min(width-40, Math.max(40, this.x));
      this.y = Math.min(height-40, Math.max(40, this.y));

    }
    else {
      if (this.facing < 2){
        scale(1-this.facing*2, 1);  
        image(this.spriteSheet, 0, 0, 100, 100, 0, 0, 80, 80);
      } else if (this.facing == 2) {
        image(this.spriteSheet, 0, 0, 100, 100, 0, 400, 80, 80);
      } else if (this.facing == 3) {
        image(this.spriteSheet, 0, 0, 100, 100, 480, 400, 80, 80);
      }
    }
    
    if (frameCount % 6 == 0) {
      this.sx = (this.sx + 1) % 6;
    }

    pop();
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