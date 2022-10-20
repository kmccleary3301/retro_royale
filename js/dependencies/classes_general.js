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
    fill(this.color[0], this.color[1], this.color[2]);
    stroke(10);
    if (this.pressed) {strokeWeight(3);} else {strokeWeight(1);}
    rect(this.x_cen - this.box_width/2, this.y_cen - this.box_height/2, this.box_width, this.box_height);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    text_make(0, 0.3*Math.min(this.box_width, this.box_height), 0, 0);
    fill(this.text_color[0], this.text_color[1], this.text_color[2]);
    text(this.text, this.x_cen, this.y_cen);  
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