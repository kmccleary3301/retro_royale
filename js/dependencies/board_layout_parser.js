
class pixel {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.connected = [null, null, null, null];
    }

    increment(direction) {
        if (direction == 0) {this.x += 1;}
        else if (direction == 1) {this.x -= 1;}
        else if (direction == 2) {this.y -= 1;}
        else if (direction == 3) {this.y += 1;}
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
}



function flood_fill_backend(filled_array, current_layer, iteration, max_iteration, condition) {
    return;
}


function parse_backend(img_pixels, img_width, img_height) {
    this.get_pixel = function(x, y) {
        return img_pixels.getImageData(x, y, 1, 1).data;
    }

    this.print_pixel_array = function(pixel_array) {
        for (let i in pixel_array) {
            print("pixel "+i+" -> ( "+pixel_array[i].x+", "+pixel_array[i].y+")");
        }
    }

    this.flood_fill_backend = function(processed_layer, old_layer, current_layer, current_iteration, condition) {
        var move_directions = [0, 1, 2, 3];
        var new_layer = [];
        for (let i in current_layer) {
            for (let m in move_directions) {
                var new_pixel = new pixel(current_layer[i].x, current_layer[i].y);
                new_pixel.increment(move_directions[m]);
                if (new_pixel.in_bounds(img_width, img_height)) {
                    console.log("checking pixel "+new_pixel.x+","+new_pixel.y+" -> "+condition(new_pixel));
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
                                in_old_layer = true;
                                break;
                            }
                        }

                        for (let j in new_layer) {
                            if (new_pixel.compare(new_layer[j])) {
                                in_old_layer = true;
                                break;
                            }
                        }

                        if (!in_old_layer) {
                            new_layer[new_layer.length] = new_pixel;
                        }
                    }
                }
            }
        }
        console.log("FF iteration "+current_iteration+" new layer");
        this.print_pixel_array(new_layer);

        if (new_layer.length == 0) { 
            processed_layer = processed_layer.concat(old_layer);
            processed_layer = processed_layer.concat(current_layer);
            return processed_layer;
        } else {
            processed_layer = processed_layer.concat(old_layer);
            return this.flood_fill_backend(processed_layer, current_layer, new_layer, current_iteration+1, condition);
        }

    }

    this.flood_fill = function(start_pixel, condition) {
        return this.flood_fill_backend([], [], [start_pixel], 0, condition);
    }

    this.check_function = function(pixel) {
        var p_get = this.get_pixel(pixel.x, pixel.y);
        return (p_get[0] != 255 && p_get[1] != 255 && p_get[2] != 255);
    }

    

    console.log("p10 -> "+img_pixels.getImageData(1, 0, 1, 1).data);

    var break_flag = false;
    var start_pixel = false;

    console.log("p["+63+"]["+31+"] -> "+this.get_pixel(63, 31));

    for (x_i = 0; x_i < img_width; x_i++) {
        for (y_i = 0; y_i < img_height; y_i++) {
            var p_get = this.get_pixel(x_i, y_i);
            //if (p_get[0] != 255 && p_get[1] != 255 && p_get[2] != 255) {
            //    console.log("p["+x_i+"]["+y_i+"] -> "+this.get_pixel(x_i, y_i));
            //}
            if (p_get[0] == 0 && p_get[1] == 0 && p_get[2] == 255) {
                break_flag = true;
                start_pixel = new pixel(x_i, y_i);
                break;
            }
        }

        if (break_flag) {
            break;
        }
    }
    
    //console.log("start pixel -> "+start_pixel.x+","+start_pixel.y);

    if (start_pixel) {
        var list_make = this.flood_fill(start_pixel, this.check_function);
    }

}

function parse_board_image(img_path) {
    //The call stack/order for this is extremely stupid, don't try to understand it
    //Reading image data raw in JS is very obnoxious.
    var img = new Image();
    var img_pixels;
    img.onload = function() {
        console.log(this)
        var canvas = document.createElement("canvas");
        img_pixels = canvas.getContext("2d");
        img_pixels.drawImage(img, 0, 0);
        var pix_tmp = img_pixels.getImageData(0, 0, 1, 1).data;
        console.log(pix_tmp);
        console.log("width -> "+img.width);
        img_width = img.width;
        img_height = img.height;
        parse_backend(img_pixels, img_width, img_height);
    }
    img.src = img_path;
}
