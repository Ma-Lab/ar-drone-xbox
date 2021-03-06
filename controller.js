var joystick = new (require('joystick'))(1, 3500, 350);
var arDrone = require('ar-drone');
var droneStatus = 'landed';
var drone = arDrone.createClient();

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

buttonAction = function(event) {
    if (event.init) {
        console.log('init button ' + event.number + ' : ' + buttons[event.number]);
    } else {
        console.log(event);
        switch (buttons[event.number]) {
            case 'start':
                if (event.value == 1) {
                    if (droneStatus == 'landed') {
                       drone.takeoff();
                        droneStatus = 'flying';
                    } else {
                        drone.land();
                        droneStatus = 'landed';
                    }
                    console.log(droneStatus);
                }
                break;
            case 'xbox':
                drone.stop();
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
            case 'left_y':
                if (event.value <= 0) {
                    s = event.value / axisLimits.min;
			drone.front(s);
                    //front
                } else {
                    s = event.value / axisLimits.max;
			drone.back(s);
                    //back
                }
                console.log('front/back', s);
                break;
           case 'left_x':
                if (event.value <= 0) {
                    s = event.value / axisLimits.min;
                    drone.left(s);
                } else {
                    s = event.value / axisLimits.max;
                    drone.right(s);
                }
                console.log('left/right', s);
                break;
            case 'right_y':
                if (event.value <= 0) {
                    s = event.value / axisLimits.min;
                    drone.up(s);
                } else {
                    s = event.value / axisLimits.max;
                    drone.down(s);
                }
                console.log('altitude', s);
                break;
           case 'right_x':
                if (event.value <= 0) {
                    s = event.value / axisLimits.min;
                    drone.clockwise(s);
                } else {
                    s = event.value / axisLimits.max;
                    drone.counterClockwise(s);
                }
                console.log('clockwise', s);
                break;
            default:
                console.log(event);
                break;
        }
    }
}

joystick.on('button', buttonAction);
joystick.on('axis', axisAction);

