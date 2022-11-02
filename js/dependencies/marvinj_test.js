

function marvin_alternative_path_find(image) {
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

    this.check_pixel_isnt_white = function(pixel) {
        var p_get = this.get_pixel(pixel.x, pixel.y);
        return (p_get[0] != 255 && p_get[1] != 255 && p_get[2] != 255);
    }

    console.log("p10 -> "+this.get_pixel(1, 0));

    var break_flag = false;
    var start_pixel = false;

    console.log("p["+63+"]["+31+"] -> "+this.get_pixel(63, 31));

    console.log("p["+12+"]["+36+"] -> "+this.get_pixel(12, 36));

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
    
    console.log("start pixel -> "+start_pixel.x+","+start_pixel.y);

    if (start_pixel) {
        var list_make = this.flood_fill(start_pixel, this.check_pixel_isnt_white);
    }

}


function marvin_test_1(img_path, function_pass_image) {
    console.log("marvin_test_1 called with arg " + img_path);
    var canvas = document.createElement("canvas");
    var image = new MarvinImage();
    image.load(img_path, function(){
		image.draw(canvas);
		//Marvin.colorChannel(image, image, 14, 0, -8);

        /*
        for(var y=0; y<image.getHeight(); y++){
            for(var x=0; x<image.getWidth(); x++){
               var r = image.getIntComponent0(x,y);
               var g = image.getIntComponent1(x,y);
               var b = image.getIntComponent2(x,y);
               
               var gray = Math.floor(r * 0.21 + g * 0.72 + b * 0.07);
               
               image.setIntColor(x,y,255,gray,gray,gray);
            }
        }
        */
        


        if (function_pass_image === undefined) {
            return image;
        } else {
            return function_pass_image(image);
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