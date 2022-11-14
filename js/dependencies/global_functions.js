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

function select_random_element(entries, weights, return_index) {
  if (return_index === undefined) {return_index = false;}
  var index_current = 0, target = Math.random(), sum = 0;
  while (sum < target) {
    sum += weights[index_current];
    index_current++;
  }
  if (return_index) { return index_current-1; }
  return entries[index_current-1];
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

function test_reset_draw_settings() {
  translate(0, 0);
  scale(1, 1);
  textSize(10);
}

function stringf(str_in) {
  // |n10l# or ..|d10r# for ints, 10 spaces align to left or right
  // |f10.4l# 10 spaces, 4 decimals precise, align to left
  // |s10l# 10 spaces, align to left.

  var params = [];
  for (i = 1; i < arguments.length; i++) { params[params.length] = arguments[i]; }

  var marker_array = [], new_string = str_in;
  var temp_ind = 0, value_string = "", values, marker_var, temp_rep_string, arg_string, t1, t2;
  for (let i in str_in) {
    if (i > str_in.length-3) { break; }
    if (str_in[i] == '|') {
      if ("nfs".includes(str_in[int(i)+1])) {
        temp_ind = int(i)+2;
        while ('0123456789.'.includes(str_in[temp_ind])) {
          temp_ind++;
        }
        if ('lr'.includes(str_in[temp_ind]) && str_in[temp_ind+1] == '#') {
          marker_var = {
            "type" : "empty",
            "frmt_size": 0,
            "precision": 0,
            "alignment": "left",
            "index_in_input_string": int(i),
            "length_of_marker": temp_ind - int(i) + 2
          }
          if (str_in[int(i)+1] == 'n') { marker_var["type"] = "int"; }
          else if (str_in[int(i)+1] == 'f') { marker_var["type"] = "float"; }
          else if (str_in[int(i)+1] == 's') { marker_var["type"] = "string"; }
          if (str_in[temp_ind] == 'l') { marker_var["alignment"] = "left"; }
          else if (str_in[temp_ind] == 'r') { marker_var["alignment"] = "right"; }
          value_string = str_in.substring(int(i)+2, temp_ind);
          var values = value_string.split(".");
          marker_var["frmt_size"] = parseInt(values[0]);
          if (marker_var["type"] == "float") { marker_var["precision"] = parseInt(values[1]); }
          marker_array[marker_array.length] = marker_var;
        }
      }
    }
  }
  if (params.length < marker_array.length) { marker_array.splice(params.length, marker_array.length-params.length); }
  for (var i = marker_array.length-1; i >= 0; i--) {
    arg_string = str(params[i]);
    if (marker_array[i]["type"] == "float") {
      var dot_index = arg_string.indexOf(".");
      if (arg_string.length > dot_index + marker_array[i]["precision"]) {
        arg_string = arg_string.substring(0, dot_index+marker_array[i]["precision"]+1);
      }
    }
    temp_rep_string = "";
    for (j=arg_string.length; j <= marker_array[i]["frmt_size"]; j++) { temp_rep_string += " "; }
    if (marker_array[i]["alignment"] == "left") { temp_rep_string = arg_string + temp_rep_string; }
    else if (marker_array[i]["alignment"] == "right") { temp_rep_string = temp_rep_string + arg_string; }
    t1 = marker_array[i]["index_in_input_string"];
    t2 = t1 + marker_array[i]["length_of_marker"];
    new_string = new_string.substring(0, t1) + temp_rep_string + new_string.substring(t2, new_string.length);
  }
  return new_string;
}