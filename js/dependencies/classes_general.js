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

  image(img, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight, image_mode) {
    push();
    if (image_mode === undefined) { image_mode = CENTER; }
    if (dx != null || dy != null) { this.translate(dx, dy); }
    imageMode(image_mode);
    image(img, 0, 0, this.new_size(dWidth), this.new_size(dHeight), sx, sy, sWidth, sHeight);
    pop();
  }

  stroke_weight_adjust() {
    return;
  }

  text_size_adjust() {
    var old_size = textSize();
  }

  text(str_in, x, y) { 
    push();
    var old_text_size = textSize();
    textSize(textSize()/this.scale);
    text(str_in, this.new_x(x), this.new_y(y));
    textSize(old_text_size);
    pop();
  }

  rect(x, y, w, h) {
    push();
    rectMode(CENTER);
    rect(this.new_x(x), this.new_y(y), this.new_size(w), this.new_size(h));
    pop();
  }

  ellipse(x, y, w, h) {
    push();
    ellipse(this.new_x(x), this.new_y(y), this.new_size(w), this.new_size(h));
    pop();
  }

  triangle(x1, y1, x2, y2, x3, y3) {
    push();
    triangle(this.new_x(x1), this.new_y(y1), this.new_x(x2), this.new_y(y2), this.new_x(x3), this.new_y(y3));
    pop(); 
  }
}

class button {
  constructor(x_in, y_in, width_in, height_in, color, text_color, text, font, position_by_proportion, auto_adjust_text) {
    /*
    x_in, y_in is center position of button.
    width_in, height_in is dimensions of button.
    color is the color of the button.
    text_color is the color of the text.
    text is the actual string to display.
    position_by_proportion is optional boolean,
    if true the position will be defined in terms of window dimensions,
    otherwise it will be positioned from the top left corner (0, 0)
    example of position_by_proportion:

      x_in = 1/3, y_in = 1/3 -> button will be centered at 33% down the width and height of window.
    */

    this.proportion_definition = 0;
    if (position_by_proportion !== undefined) {
      if (position_by_proportion) { this.proportion_definition = 1; }
    }
    this.adjust_text_size = 0;
    if (auto_adjust_text !== undefined) {
      if (auto_adjust_text) { this.adjust_text_size = 1; }
    }
    if (this.proportion_definition && x_in >= 1 && y_in >= 1) {
      //If dev wants proportion resizing but entered coordinates, this will convert them.
      //Instead of using actual width, I used reference of 1920x1080 so it will adapt to ideal.
      x_in = x_in / 1920, y_in = y_in / 1080;
    }
    if (this.proportion_definition && width_in >= 1 && height_in >= 1) {
      //If user wants proportion resizing but entered coordinates, this will convert them.
      width_in = width_in / 1920, height_in = height_in / 1080;
    }

    this.x_cen_in = x_in;
    this.y_cen_in = y_in;
    this.x_cen = x_in, this.y_cen = y_in;
    this.box_width_in = width_in;
    this.box_height_in = height_in;
    this.box_width = width_in, this.box_height = height_in;
    this.font = font;
    this.text = text.split('\n');
    this.color = color;
    this.text_color = text_color;
    this.pressed = 0;
    this.radius = 5;
    this.max_text_length = this.text[0].length;
    this.text_size = 5;

    for (let i in this.text) { 
      if (this.text[i].length > this.max_text_length) { this.max_text_length = this.text[i].length; }
    }
    
    if (this.proportion_definition) { this.reposition(); }
    else {
      this.text_size =Math.min(1.8*this.box_width / this.max_text_length, 0.9*this.box_height / this.text.length);
    }

    this.execute = function() {return;}
  }

  calculate_max_text_size() {
    if (this.proportion_definition) { this.reposition(); }
    return Math.min(1.7*this.box_width / this.max_text_length, 0.9*this.box_height / this.text.length);
  }

  update_text_size(text_size_in) {
    this.text_size = text_size_in;
  }

  reposition() {
    if (this.proportion_definition) {
      this.x_cen = width*this.x_cen_in, this.y_cen = height*this.y_cen_in
      this.box_width = width*this.box_width_in, this.box_height = height*this.box_height_in;
      if (this.adjust_text_size) {
        this.text_size = Math.min(1.8*this.box_width / this.max_text_length, 0.9*this.box_height / this.text.length);
      }
    }
  }

  draw() {
    push();
    
    if (this.proportion_definition) { this.reposition(); }
    fill(this.color);
    stroke(10);
    if (this.pressed) {strokeWeight(3);} else {strokeWeight(1);}
    rect(this.x_cen - this.box_width/2, this.y_cen - this.box_height/2, this.box_width, this.box_height, this.radius);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    text_make(this.font, this.text_size, 0, 0);
    fill(this.text_color);
    for (let i in this.text) {
      text(this.text[i], this.x_cen, this.y_cen+this.text_size*(i - 0.5*(this.text.length-1)));
    }
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
/*
class text_box {
  constructor(x_in, y_in, width_in, height_in, color, text_color, prompt, position_by_proportion) {
    /
    x_in, y_in is center position of button.
    width_in, height_in is dimensions of button.
    color is the color of the button.
    text_color is the color of the text.
    text is the actual string to display.
    position_by_proportion is optional boolean,
    if true the position will be defined in terms of window dimensions,
    otherwise it will be positioned from the top left corner (0, 0)
    example of position_by_proportion:

      x_in = 1/3, y_in = 1/3 -> button will be centered at 33% down the width and height of window.
    /

    this.proportion_definition = 0;
    if (position_by_proportion !== undefined) {
      if (position_by_proportion) { this.proportion_definition = 1; }
    }
    if (this.proportion_definition && x_in >= 1 && y_in >= 1) {
      //If dev wants proportion resizing but entered coordinates, this will convert them.
      //Instead of using actual width, I used reference of 1920x1080 so it will adapt to ideal.
      x_in = x_in / 1920, y_in = y_in / 1080;
    }
    if (this.proportion_definition && width_in >= 1 && height_in >= 1) {
      //If user wants proportion resizing but entered coordinates, this will convert them.
      width_in = width_in / 1920, height_in = height_in / 1080;
    }

    this.x_cen_in = x_in;
    this.y_cen_in = y_in;
    this.x_cen = x_in, this.y_cen = y_in;
    this.box_width_in = width_in;
    this.box_height_in = height_in;
    this.box_width = width_in, this.box_height = height_in;
    this.text_prompt = prompt;
    this.color = color;
    this.text_color = text_color;
    this.pressed = 0;
    this.type_active = 0;
    this.radius = 5;
    this.max_text_size;
    this.text_input = "";
    this.max_input_display = 10;
    this.uppercase_on = 0;

    
    if (this.proportion_definition) { this.reposition(); }
    else {
      this.max_text_size = Math.min(1.8*this.box_width / (1 + this.text_prompt.length + this.max_input_display), 0.9*this.box_height);
    }

    this.text_size = this.max_text_size;
  }

  reposition() {
    if (this.proportion_definition) {
      this.x_cen = width*this.x_cen_in, this.y_cen = height*this.y_cen_in
      this.box_width = width*this.box_width_in, this.box_height = height*this.box_height_in;
      this.max_text_size = Math.min(1.8*this.box_width / (1 + this.text_prompt.length + this.max_input_display), 0.9*this.box_height);
    }
  }

  draw() {
    push();

    if (this.proportion_definition) { this.reposition(); }

    var text_display = this.text_prompt, input = this.text_input;
    input.splice(0, Math.max(0, input.length-this.max_input_display));
    text_display += input;
    if (this.type_active && Date.now/100 % 10 < 5) { text_display += "|"; }
    input.splice()

    fill(this.color[0], this.color[1], this.color[2]);
    stroke(10);
    if (this.pressed) {strokeWeight(3);} else {strokeWeight(1);}
    rect(this.x_cen - this.box_width/2, this.y_cen - this.box_height/2, this.box_width, this.box_height, this.radius);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    text_make(0, this.text_size, 0, 0);
    fill(this.text_color[0], this.text_color[1], this.text_color[2]);
    text(text_display, this.x_cen, this.y_cen);
    pop();
  }

  key_input(keycode) {
    var uppercase = 0;
    switch(keycode) {
      case 8:
        if (this.text_input.length > 0) { this.text_input.splice(this.text_input.length-1, 1); }
        break;
      case 16
    }
  }

  check_press(x, y) {
    if ((Math.abs(x - this.x_cen) < this.box_width/2) && 
        (Math.abs(y - this.y_cen) < this.box_height/2)) {
          this.pressed = 1;
          if (this.type_active) { this.type_active = 0; }
          else { this.type_active = 1; }
          return true;
    }
    return false;
  }
}
*/

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
    for (let i in this.row_dictionary) {
      if (this.row_dictionary[i]["first_tile"] === undefined) {
        this.row_dictionary[i]["first_tile"] = 0;
      }
    }
    this.current_animation_row = 0;
    this.current_first_tile = 0;
    this.current_row_length = 1;
    this.flip_image = 0;
    this.flip_image_ref = 1;
    this.rotation_angle = 0; //in degrees
    this.global_frames_per_anim_frame = 6;
  }

  draw(x, y, use_g_cam) {
    push();
    if (use_g_cam === undefined || !(use_g_cam)) { 
      var use_g_cam = false; 
      if (x === undefined) { var x = 0; }
      if (y === undefined) { var y = 0; }
    } else {
      if (x === undefined) { var y = 0; }
      if (y === undefined) { var y = 0; }
    }
    if (this.running) {
      if (use_g_cam) {
        g_cam.translate(x, y);
        scale (this.flip_image_ref, 1);
        rotate(this.rotation_angle*Math.PI/180);
        g_cam.image(this.sprite, null, null, this.draw_size*this.w_h_ratio, this.draw_size, 
                    this.x_mod*(this.sx+this.current_first_tile), this.y_mod*this.current_animation_row, 
                    this.x_mod, this.y_mod);
      } else {
        translate(x, y);
        scale(this.flip_image_ref, 1);
        rotate(this.rotation_angle*Math.PI/180);
        imageMode(CENTER);
        image(this.sprite, 0, 0, this.draw_size*this.w_h_ratio, this.draw_size, 
              this.x_mod*(this.sx+this.current_first_tile), this.y_mod*this.current_animation_row, 
              this.x_mod, this.y_mod);
      }
      if (frameCount % this.global_frames_per_anim_frame == 0) {
        this.sx = (this.sx + 1) % this.current_row_length;
      }
    } else {
      if (use_g_cam) {
        g_cam.translate(x, y);
        scale (this.flip_image_ref, 1);
        rotate(this.rotation_angle*Math.PI/180);
        g_cam.image(this.sprite, null, null, this.draw_size*this.w_h_ratio, this.draw_size, 
                    this.x_mod*this.current_first_tile, this.y_mod*this.current_animation_row, 
                    this.x_mod, this.y_mod);
      } else {
        translate(x, y);
        scale(this.flip_image_ref, 1);
        rotate(this.rotation_angle*Math.PI/180);
        imageMode(CENTER);
        image(this.sprite, 0, 0, this.draw_size*this.w_h_ratio, this.draw_size, 
              this.x_mod*this.current_first_tile, this.y_mod*this.current_animation_row, 
              this.x_mod, this.y_mod);
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
      animation = animation;
    } else if (typeof animation === "number") {
      var key = Object.keys(this.row_dictionary)[animation];
      animation = key;
    }
    if (this.row_dictionary[animation] === undefined) { return; }
    this.current_animation_row = this.row_dictionary[animation]["row"];
    this.current_row_length = this.row_dictionary[animation]["row_length"];
    this.current_first_tile = this.row_dictionary[animation]["first_tile"];
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
    this.flip_image_ref = (1-2*this.flip_image);
  }

  draw_thumbnail(x, y, draw_size, use_g_cam) {
    if (use_g_cam === undefined) { var use_g_cam = false; } 
    push();

    if (use_g_cam) {
      g_cam.translate(x, y);
      imageMode(CENTER);
      var row_get = this.row_dictionary[Object.keys(this.row_dictionary)[0]]["row"],
          col_get = this.row_dictionary[Object.keys(this.row_dictionary)[0]]["first_tile"];
      g_cam.image(this.sprite, null, null, draw_size*this.w_h_ratio, draw_size, 
        this.x_mod*(col_get), this.y_mod*row_get, this.x_mod, this.y_mod);
    } else {
      translate(x, y);
      imageMode(CENTER);
      image(this.sprite, 0, 0, draw_size*this.w_h_ratio, draw_size, 
        this.x_mod*(col_get), this.y_mod*row_get, this.x_mod, this.y_mod);
    }


    pop();
  }
}

class scroll_image {
  constructor(image, draw_dimensions, scroll_rate) {
    this.image = image;
    this.last_update = Date.now()/1000;
    this.scroll_rate = scroll_rate;
    this.x_position = 0;
    this.draw_dimensions = draw_dimensions;
    this.display_height = displayHeight;
    this.stretch_to_top = true;

  }

  draw() {
    if (height > this.display_height) { this.display_height = height; }
    this.x_position += (Date.now()/1000 - this.last_update) * this.scroll_rate;
    this.last_update = Date.now()/1000;
    var draw_positions = [this.x_position];
    var increment = this.image.width*this.display_height/this.image.height
    var x_make = this.x_position - increment;
    while (x_make >= -increment) {
      draw_positions[draw_positions.length] = x_make;
      x_make -= increment;
    }
    draw_positions[draw_positions.length] = x_make;
    //x_make = this.x_position + this.image.width;
    x_make = this.x_position + increment;
    while (x_make <= displayWidth+increment) {
      draw_positions[draw_positions.length] = x_make;
      x_make += increment;
    }
    draw_positions[draw_positions.length] = x_make;

    for (let i in draw_positions) {
      push();
      translate(draw_positions[i], 0);
      imageMode(CORNERS);
      image(this.image, 0, 0, increment, this.display_height);
      //console.log(" drawing params -> "+draw_positions[i]+","+this.image.width*height/this.image.height+","+height);
      pop();
    }
    this.x_position = (this.x_position) % (displayWidth*2 - (displayWidth*2 % increment));
  }
}