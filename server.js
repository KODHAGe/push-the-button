var osc = require("osc"),
http = require("http");
var express = require("express");

var app = express(),
    server = app.listen(8081);
app.use("/", express.static(__dirname + "/static"));

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:8080});

var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 7110
});

// all skeleton joints (kinectsdk 1.8)
var head,
    neck,
    torso,
    r_shoulder,
    r_elbow,
    r_wrist,
    r_hand,
    l_shoulder,
    l_elbow,
    l_wrist,
    l_hand,
    r_hip,
    r_knee,
    r_ankle,
    r_foot,
    l_hip,
    l_knee,
    l_ankle,
    l_foot;

var skeletonArray = ["head","neck","torso","r_shoulder","r_elbow","r_wrist","r_hand","l_shoulder","l_elbow","l_wrist","l_hand","l_hip","r_knee","r_ankle","r_foot","l_hip","l_knee","l_ankle","l_foot"];
var jointsArray = new Array(skeletonArray.length).fill(0);
var confidenceCount = 0;
var status = 0;
//console.log(jointsArray);

function checkStatus(confidence){
  if(confidence == 0){
    status = 0;
  } else if(confidence < 15) {
    status = 1;
  } else {
    status = 2;
  }
  console.log("status: "+status);
}

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
});

udpPort.on("message", function (oscMessage) {
  confidenceCount = 0;
    //console.log(oscMessage);
    for(var i = 0; i < skeletonArray.length; i++){
    if(oscMessage.args[0] == skeletonArray[i]){
      jointsArray[i] = oscMessage.args[6];
    }
  }
  for(var x = 0; x < jointsArray.length; x++){
    confidenceCount += jointsArray[x];
  }
});

setInterval(function(){
  checkStatus(confidenceCount);
},100);

udpPort.on("error", function (err) {
    console.log(err);
});


/*var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

  udpPort.on("message", function (oscMessage) {
    console.log("snd");
    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        console.log('received: %s', message);
      });

      ws.send(JSON.stringify(oscMessage));
    });
  });*/

/*  wss.on('open', function connection(ws) {
    udpPort.on("message", function (oscMessage) {
      console.log("snd");
          ws.send(oscMessage);
    });
  });*/
