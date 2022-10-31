var host_address = "127.0.0.1", global_port = 3128;
var connected_to_server;

function make_socket() {
  if (host_address.includes(":") && !(host_address.includes("["))) {
    host_address = "[" + host_address + "]"; //IPv6 correction, urls written as ws://[::1]:3128/
  }
  console.log("Connecting to: "+"wss://"+host_address+":"+str(global_port));
  connected_to_server = false;
  socket = new WebSocket("wss://"+host_address+":"+str(global_port)); //Declares the websocket for connecting to host server.
  socket.onopen = (event) => { open_socket(); };                  //Sets function trigger for websocket being opened
  socket.onmessage = (event) => { process_message(event.data); }; //Sets function trigger for websocket recieving data
}

function open_socket() {
  socket.send("connected");
  connected_to_server = true;
}

function process_message(data) {          //Event function to process data recieved from the server through the websocket.
  var lines = data.split("\n");
  for (let i in lines) {
    //console.log("line "+str(i)+": "+lines[i]);
    var line_split = lines[i].split(":");
    var flag = line_split[0],
        message = null;
    if (line_split.length > 1) { message = line_split[1]; }
    if (flag == "current_game" && current_state_flag != "main_menu") { swap_current_state(message); }
    current_state.read_network_data(flag, message);  //Feeds to current_state's local data recieved function.
  }
}

function send_data(data) {  //Global function to send data to server.
  if (connected_to_server) { socket.send(data); }
}