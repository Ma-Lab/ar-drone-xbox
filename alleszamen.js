var joystick = new (require('joystick'))(1, 3500, 350);
var arDrone = require('ar-drone');
var http    = require('http');
var droneStatus = 'landed';

var buttons = {
    0: 'a',
    1: 'b',
    2: 'x',
    3: 'y',
    4: 'lb',
    5: 'rb',
    6: 'select',
    7: 'start',
    8: 'xbox',
    9: 'left_stick',
    10: 'right_stick',
}

var axis = {
    0: 'left_x',
    1: 'left_y',
    2: 'lt',
    3: 'right_x',
    4: 'right_y',
    5: 'rt',
    6: 'cross_x',
    7: 'cross_y'

}

var axisLimits = {
    'min': -32767,
    'max': 32767
}

var flipTime = 3000;

//var pngStream = arDrone.createClient().getPngStream();
var client = arDrone.createClient();
client.disableEmergency();

console.log('PNG ophalen ...');
var pngStream = client.getPngStream();

var lastPng;
pngStream
  .on('error', console.log)
  .on('data', function(pngBuffer) {
    lastPng = pngBuffer;
  });

var server = http.createServer(function(req, res) {
  if (!lastPng) {
    res.writeHead(503);
    res.end('Nog geen PNG gevonden.');
    return;
  }

  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(lastPng);
});

server.listen(8080, function() {
  console.log('Laatste PNG te zien op localhost:8080');
  //client.takeoff();
  client.animateLeds('blinkRed', 5, 20);
  client.after(1000, function() {
      this.stop();
      //this.land();


start = function(event) {
    console.log('started')
}

buttonAction = function(event) {
    if (event.init) {
        console.log('init button ' + event.number + ' : ' + buttons[event.number]);
    } else {
        console.log(event);
        switch (buttons[event.number]) {
            case 'start':
                if (event.value == 1) {
                    if (droneStatus == 'landed') {
                        client.takeoff();
                        droneStatus = 'flying';
			client.stop();
                    } else {
                        client.land();
                        droneStatus = 'landed';
			client.stop();
                    }
                    console.log(droneStatus);
                }
                break;
            case 'xbox':
                // emergency !
		client.stop();
		console.log("Druk op start om te landen");
                break;
	    case 'x':
		client.animateLeds('fire', 5, 10);
		console.log("Vuur");
                break;
	case 'y':
		client.animateLeds('snakeGreenRed', 5, 10);
		console.log("GroenRood");
                break;
	case 'a':
		client.animateLeds('doubleMissile', 5, 10);
		console.log("DoubleMissile");
                break;
	case 'b':
		client.animateLeds('blinkStandard', 5, 10);
		console.log("Knipperen");
                break;
            default:
                break;
        }
    }
}


axisAction = function(event) {
    if (event.init) {
        console.log('init axis ' + event.number + ' : ' + axis[event.number]);
    } else {
        switch (axis[event.number]) {
            case 'right_y':
                if (event.value <= 0) {
                    s = event.value / axisLimits.min;
                    client.front(s);
                }else if (event.value == 0){
			client.stop();
		} else {
                    s = event.value / axisLimits.max;
                    client.back(s);
		}
                console.log('front/back', s);
                break;
           case 'right_x':
                if (event.value <= 0) {
                    s = event.value / axisLimits.min;
                    client.left(s);
		}else if (event.value == 0){
			client.stop();
                } else {
                    s = event.value / axisLimits.max;
                    client.right(s);
                }
                console.log('left/right', s);
                break;
            case 'left_y':
                if (event.value <= 0) {
                    s = event.value / axisLimits.min;
                    client.up(s);
		}else if (event.value == 0){
			client.stop();
                } else {
                    s = event.value / axisLimits.max;
                    client.down(s);
                }
                console.log('altitude', s);
                break;
           case 'left_x':
                if (event.value <= 0) {
                    s = event.value / axisLimits.min;
                    client.counterClockwise(s);
		}else if (event.value == 0){
			client.stop();
                } else {
                    s = event.value / axisLimits.max;
                    client.clockwise(s);
                }
                console.log('clockwise', s);
                break;
            case 'cross_x':
                var action = null;
                if (event.value > (axisLimits.max / 2)) {
                    action = 'flipRight';
                } else if (event.value < (axisLimits.min / 2)) {
                    action = 'flipLeft';
                }
                if (action) {
                    client.animate(action, flipTime);
                    console.log(action);
                }
                break;
            case 'cross_y':
                var action = null;
                if (event.value > (axisLimits.max / 2)) {
                    action = 'flipBehind';
                } else if (event.value < (axisLimits.min / 2)) {
                    action = 'flipAhead';
                }
                if (action) {
                    client.animate(action, flipTime);
                    console.log(action);
                }
                break;
            default:
                console.log(event);
                break;
        }
    }
}

joystick.on('button', buttonAction);
joystick.on('axis', axisAction);

    });

});
