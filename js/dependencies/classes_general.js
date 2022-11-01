class g_camera {
  constructor(x, y, scale) {
    this.x = x;
    this.y = y;
    this.scale = scale;
  }
  
  update(x, y, scale) {
    this.x = x;
    this.y = y;
    this.scale = scale;
  }

  reset() {
    this.x = width/2;
    this.y = height/2;
    this.scale = 1;
  }

  new_coords(x, y) { //Map x in the coords to 
    var new_x = (x - this.x) * this.scale + width/2;
    var new_y = (y - this.y) * this.scale + height/2;
    return [new_x, new_y];
  }

  new_x(x) {
    return (x - this.x) / this.scale + width/2;
  }

  new_y(y) {
    return (y - this.y) / this.scale + height/2;
  }

  new_size(in_value) {
    return in_value / this.scale;
  }

  translate(x, y) {
    translate(this.new_x(x), this.new_y(y));
  }

  image(img, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight) {
    if (dx != null || dy != null) { this.translate(dx, dy); }
    image(img, 0, 0, this.new_size(dWidth), this.new_size(dHeight), sx, sy, sWidth, sHeight);
  }

  stroke_weight_adjust() {
    return;
  }

  text_size_adjust() {
    var old_size = textSize()
  }

  text(str_in, x, y) { 
    var old_text_size = textSize();
    textSize(textSize()/this.scale);
    text(str_in, this.new_x(x), this.new_y(y));
    textSize(old_text_size);
  }

  rect(x, y, w, h) {
    rect(this.new_x(x), this.new_y(y), this.new_size(w), this.new_size(h));
  }

  ellipse(x, y, w, h) {
    ellipse(this.new_x(x), this.new_y(y), this.new_size(w), this.new_size(h));
  }

  triangle(x1, y1, x2, y2, x3, y3) {
    triangle(this.new_x(x1), this.new_y(y1), this.new_x(x2), this.new_y(y2), this.new_x(x3), this.new_y(y3)); 
  }
}

class button {
  constructor(x_in, y_in, width_in, height_in, color, text_color, text) {
    this.x_cen = x_in;
    this.y_cen = y_in;
    this.box_width = width_in;
    this.box_height = height_in;
    this.text = text;
    this.color = color;
    this.text_color = text_color;
    this.pressed = 0;
    this.execute = function() {return;}
  }

  draw() {
    push();
    fill(this.color[0], this.color[1], this.color[2]);
    stroke(10);
    if (this.pressed) {strokeWeight(3);} else {strokeWeight(1);}
    rect(this.x_cen - this.box_width/2, this.y_cen - this.box_height/2, this.box_width, this.box_height);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    text_make(0, 0.3*Math.min(this.box_width, this.box_height), 0, 0);
    fill(this.text_color[0], this.text_color[1], this.text_color[2]);
    text(this.text, this.x_cen, this.y_cen);
    pop();
  }

  check_press(x, y) {
    if ((Math.abs(x - this.x_cen) < this.box_width/2) && 
        (Math.abs(y - this.y_cen) < this.box_height/2)) {
          this.pressed = 1;
          return true;
    }
    return false;
  }

  activate() {
    this.execute();
  }
}

class sprite_animation_object {
  constructor(sprite, draw_size, tile_width, tile_height, row_dictionary) {
    //full sprite image, draw size of image, width of each grid tile, height of each grid tile, length of each animation, 
    this.sprite = sprite;
    this.sx = 0;
    this.x_mod = tile_width;
    this.y_mod = tile_height;
    this.running = 0;
    this.draw_size = draw_size;
    this.w_h_ratio = this.x_mod/this.y_mod;
    this.row_dictionary = row_dictionary;
    this.current_animation_row = 0;
    this.current_row_length = 1;
    this.flip_image = 0;
  }

  draw(x, y, use_g_cam) {
    push();
    /*
    all parameters optional.
    use_g_cam is true or false
    if x and y not passed, it will draw at 0, 0
    */

    if (use_g_cam === undefined || !(use_g_cam)) { 
      var use_g_cam = false; 
      if (x === undefined) { var x = 0; }
      if (y === undefined) { var y = 0; }
    } else {
      if (x === undefined) { var y = 0; }
      if (y === undefined) { var y = 0; }
    }
    //if (this.flip_image) { console.log("flip1"); scale(-1, 1); console.log("flip2"); }
    if (this.running) {
      if (use_g_cam) {
        g_cam.translate(x+(this.draw_size*this.w_h_ratio)*this.flip_image, y);
        scale (1-2*this.flip_image, 1);
        g_cam.image(this.sprite, null, null, this.draw_size*this.w_h_ratio, this.draw_size, 
                    this.x_mod*this.sx, this.y_mod*this.current_animation_row, this.x_mod, this.y_mod);
      } else {
        image(this.sprite, x, y, this.draw_size*this.w_h_ratio, this.draw_size, 
              this.x_mod*this.sx, this.y_mod*this.current_animation_row, this.x_mod, this.y_mod);
      }
      if (frameCount % 6 == 0) {
        this.sx = (this.sx + 1) % this.current_row_length;
      }
    } else {
      if (use_g_cam) {
        g_cam.translate(x+(this.draw_size*this.w_h_ratio)*this.flip_image, y);
        scale (1-2*this.flip_image, 1);
        g_cam.image(this.sprite, null, null, this.draw_size*this.w_h_ratio, this.draw_size, 
                    0, this.y_mod*this.current_animation_row, this.x_mod, this.y_mod);
      } else {
        image(this.sprite, x, y, this.draw_size*this.w_h_ratio, this.draw_size, 
              0, this.y_mod*this.current_animation_row, this.x_mod, this.y_mod);
      }
    }
    pop();
  }

  start() {
    this.running = 1;
    this.sx = 0;
  }

  stop() {
    this.running = 0;
    this.sx = 0;
  }

  change_animation(animation) {
    if (typeof animation === "string") {
      console.log("recieved animation as string");
      this.current_animation_row = this.row_dictionary[animation]["row"];
      this.current_row_length = this.row_dictionary[animation]["row_length"];
    } else if (typeof animation === "number") {
      var key = Object.keys(this.row_dictionary)[animation];
      this.current_animation_row = this.row_dictionary[key]["row"];
      this.current_row_length = this.row_dictionary[key]["row_length"];
    }
    this.sx = 0;
  }

  flip(value) {
    //pass true or false
    if (value === undefined) {
      this.flip_image = (this.flip_image+1)%2;
    } else {
      if (value) {
        this.flip_image = 1;
      } else {
        this.flip_image = 0;
      }
    }
  }
}