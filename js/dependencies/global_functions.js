function sigmoid_shift(peak_value, t1, t2, speed, t) { //a sigmoid smoothly goes from 0 to 1 around x = 0, and is scaled here accordingly.
  var exp_value = ((t - t1)/(t2 - t1) - 0.5)*10*speed;
  return peak_value / (1 + Math.exp(-(exp_value)));
}

function sigmoid_array(p_array, t_array, speed_array, t) { //this sums sigmoids in a way that is useful for animating.
  // smooth transitions along the real numbers from p1 at time t1 to p2 at time t2, etc.
  //I'm using this for nice UI animations.
  sum = p_array[0]
  for (i = 1; i < p_array.length; i++){
    var exp_value = ((t -  t_array[i-1]) / (t_array[i] - t_array[i-1]) - 0.5 ) * 10 * speed_array[i-1];
    sum += (p_array[i] - p_array[i-1]) / (1 + Math.exp(-(exp_value)));
  }
  return sum
}

function rainbow_gradient(t) {
  var r = 255*(Math.sin(1+t*3.19)+1)/2,
      g = 255*(Math.cos(2+t*2.15)+1)/2,
      b = 255*(Math.sin(3+t*2.23)+1)/2;
  return [r, g, b];
}

function convert_data_string(message, ints, floats, strings) {
  // Converts messages into an array of ints, floats, and strings according to passed indices for each.
  var message_split = message.split(",");
  var return_vals = [];
  for (let i in message_split) { return_vals[i] = NaN; }
  if (!(ints === undefined)) {
    for (let i in ints) {
      if (message_split[ints[i]] != "") { return_vals[ints[i]] = parseInt(message_split[ints[i]]); }
    }
  }
  if (!(floats === undefined)) {
    for (let i in floats) {
      if (message_split[floats[i]] != "") { return_vals[floats[i]] = parseInt(message_split[floats[i]]); }
    }
  }
  if (!(strings === undefined)) {
    for (let i in strings) { return_vals[strings[i]] = message_split[strings[i]]; }
  }
  return return_vals
}

function font_make(index, size) {
  textFont(font_set[index]);
  textSize(font_size_scaling[index]*size);
}

function text_make(font_index, size, stroke, stroke_weight) {
  textFont(font_set[font_index]);
  textSize(font_size_scaling[font_index]*size);
  strokeWeight(stroke_weight);
  //stroke(stroke);
}