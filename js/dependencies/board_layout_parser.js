class pixel {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    increment(direction) {
        if (direction == "right") {this.x += 1;}
        else if (direction == "left") {this.x -= 1;}
        else if (direction == "up") {this.y -= 1;}
        else if (direction == "down") {this.y += 1;}
    }

    in_bounds(width, height) {
        return ((this.x >= 0) && (this.x < width) && (this.y >= 0) && (this.y < height));
        if (direction == 0) { return (this.x == width-1); }
        else if (direction == 1) {return (this.x == 0); }
        else if (direction == 2) { return (this.y == height-1); }
        else if (direction == 3) { return (this.y == 0); }
        return false
    }

    compare(other_pixel) {
        return (this.x == other_pixel.x && this.y == other_pixel.y);
    }

    to_string() {
        return "p["+this.x+"]["+this.y+"]";
    }
}

class linked_pixel extends pixel {
    constructor(x, y) {
        super(x, y);
        this.connected = {
            "left" : false,
            "right" : false,
            "up" : false,
            "down" : false
        };

        this.rgb = {
            "r" : null,
            "g" : null,
            "b" : null
        }
    }

    link(id, direction) {
        this.connected[direction] = id;
    }

    set_rgb() {
        if (arguments.length == 3 && typeof arguments[0] == int) {
            this.rgb["r"] = arguments[0];
            this.rgb["g"] = arguments[1];
            this.rgb["b"] = arguments[2];
        } else if (Array.isArray(arguments[0])) {
            this.rgb["r"] = arguments[0][0];
            this.rgb["g"] = arguments[0][1];
            this.rgb["b"] = arguments[0][2];
        } 
    }

    compare_rgb() {
        var r_t, g_t, b_t;
        if (arguments.length == 3) {
            r_t = arguments[0];
            g_t = arguments[1];
            b_t = arguments[2];
        } else if (Array.isArray(arguments[0])) {
            r_t = arguments[0][0];
            g_t = arguments[0][1];
            b_t = arguments[0][2];
        } 
        return (this.rgb["r"] == r_t && this.rgb["g"] == g_t && this.rgb["b"] == b_t);
    }
}

function swap_compass_direction(dir) {
    return dir - (dir%2) + ((dir+1)%2);
}

function dict_to_str(dict_in) {
    str_make = "{ ";
    for (let key in dict_in) {
        str_make += "\""+key+"\": "+dict_in[key]+", ";
    }
    str_make += "}";
    return str_make
}

function swap_new_direction(dir) {
    if (dir == "up") { return "down"; }
    if (dir == "down") { return "up"; }
    if (dir == "left") { return "right"; }
    if (dir == "right") { return "left"; }
}

function parse_board_from_image(image) {
    var img_width = image.getWidth();
    var img_height = image.getHeight();

    this.get_pixel = function(x, y) {
        var r = image.getIntComponent0(x,y);
        var g = image.getIntComponent1(x,y);
        var b = image.getIntComponent2(x,y);
        return [r, g, b];
    }

    this.print_pixel_array = function(pixel_array) {
        for (let i in pixel_array) {
            print("pixel "+i+" -> ( "+pixel_array[i].x+", "+pixel_array[i].y+")");
        }
    }
    
    this.flood_fill_backend = function(processed_layer, old_layer, current_layer, current_iteration, condition) {
        var move_directions = ["left", "right", "up", "down"];
        var new_layer = [];
        for (let i in current_layer) {
            for (let m in move_directions) {
                var new_pixel = new linked_pixel(current_layer[i].x, current_layer[i].y);
                new_pixel.increment(move_directions[m]);
                if (new_pixel.in_bounds(img_width, img_height)) {
                    if (condition(new_pixel)) {
                        var in_old_layer = false;
                        for (let j in old_layer) {
                            if (new_pixel.compare(old_layer[j])) {
                                in_old_layer = true;
                                break;
                            }
                        }
                        for (let j in current_layer) {
                            if (new_pixel.compare(current_layer[j])) {
                                var x1 = processed_layer.length + old_layer.length + int(j);
                                var x2 = processed_layer.length + old_layer.length + int(i);
                                current_layer[i].link(x1, move_directions[m]);
                                current_layer[j].link(x2, swap_new_direction(move_directions[m]));
                                in_old_layer = true;
                                break;
                            }
                        }

                        for (let j in new_layer) {
                            if (new_pixel.compare(new_layer[j])) {
                                var x1 = processed_layer.length + old_layer.length + current_layer.length + int(j);
                                var x2 = processed_layer.length + old_layer.length + int(i);
                                current_layer[i].link(x1, move_directions[m]);
                                new_layer[j].link(x2, swap_new_direction(move_directions[m]));
                                in_old_layer = true;
                                break;
                            }
                        }

                        if (!in_old_layer) {
                            

                            var x1 = processed_layer.length + old_layer.length + current_layer.length + new_layer.length;
                            var x2 = processed_layer.length + old_layer.length + int(i);
                            current_layer[i].link(x1, move_directions[m]);
                            new_pixel.link(x2, swap_new_direction(move_directions[m]));
                            new_layer[new_layer.length] = new_pixel;
                        }
                    }
                }
            }
        }
        if (new_layer.length == 0) { 
            console.log ("flood fill finished in "+(current_iteration+1)+" iterations");
            processed_layer = processed_layer.concat(old_layer);
            processed_layer = processed_layer.concat(current_layer);

            for (let  i in processed_layer) {
                processed_layer[i].set_rgb(this.get_pixel(processed_layer[i].x, processed_layer[i].y));
            }

            return processed_layer;
        } else {
            processed_layer = processed_layer.concat(old_layer);
            return this.flood_fill_backend(processed_layer, current_layer, new_layer, current_iteration+1, condition);
        }

    }

    this.flood_fill = function(start_pixel, condition) {
        return this.flood_fill_backend([], [], [start_pixel], 0, condition);
    }
    
    this.check_pixel_isnt_white = function(pixel) {
        var p_get = this.get_pixel(pixel.x, pixel.y);
        return (p_get[0] != 255 || p_get[1] != 255 || p_get[2] != 255);
    }

    var break_flag = false;
    var start_pixel = false;

    for (x_i = 0; x_i < img_width; x_i++) {
        for (y_i = 0; y_i < img_height; y_i++) {
            var p_get = this.get_pixel(x_i, y_i);
            if (p_get[0] == 0 && p_get[1] == 0 && p_get[2] == 255) {
                break_flag = true;
                start_pixel = new linked_pixel(x_i, y_i);
                break;
            }
        }
        if (break_flag) {
            break;
        }
    }
    
    this.print_direction = function(direction) {
        if (direction == 0) { return "left"; }
        if (direction == 1) { return "right"; }
        if (direction == 2) {return "up"; }
        if (direction == 3) {return "down"; }
    }

    console.log("start pixel -> "+start_pixel.x+","+start_pixel.y);
    if (start_pixel) {
        var list_make = this.flood_fill(start_pixel, this.check_pixel_isnt_white);
        
        return list_make;
    } else {
        return null;
    }
}

function image_process(img_path, function_pass_image) {
    console.log("marvin_test_1 called with arg " + img_path);
    var canvas = document.createElement("canvas");
    var image = new MarvinImage();
    image.load(img_path, function(){
		image.draw(canvas);
        if (function_pass_image === undefined) {
            return image;
        } else {
            var list_make = function_pass_image(image);
            current_state.make_board_from_image(list_make);
            return list_make;
        }

	});
}

function function_log_execution_time() {
    console.log("args passed: "+arguments.length);
    console.log("arguments is type "+typeof arguments);
    var args = Array.prototype.slice.call(arguments);
    console.log("args is type "+typeof args);
    var varToString = varObj => Object.keys(varObj)[0];
    if (args.length <= 1) { return; }
    var func_get = args[0];
    args.splice(0, 1);
    var timer = Date.now();
    var return_data = func_get(args);
    timer = Date.now() - timer;
    console.log("Executed "+varToString({func_get})+" in "+timer+" ms");
    return return_data;
}