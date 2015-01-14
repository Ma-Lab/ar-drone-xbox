var express = require('express')
  , app = express()
  , fs = require('fs')
  , path = require('path')
  , server = require("http").createServer(app)
  , io = require('socket.io').listen(server)
  , joystick = new (require('joystick'))(1, 3500, 350)
  , arDrone = require('ar-drone')
  //, brDrone = require('br-drone')
  , arDroneConstants = require('ar-drone/lib/constants')
  ;
var drone = arDrone.createClient();
drone.config('general:navdata_demo', 'TRUE');
drone.config('video:video_channel', '0');
drone.config('general:navdata_options', navdata_options);
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

// Fetch configuration
try {
    var config = require('./config');
} catch (err) {
    console.log("Missing or corrupted config file. Have a look at config.js.example if you need an example.");
    process.exit(-1);
}
  

start = function(event) {
    console.log('Yay :)')
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
			drone.stop();
                    } else {
                        drone.land();
                        droneStatus = 'landed';
			drone.stop();
                    }
                    console.log(droneStatus);
                }
                break;
            case 'xbox':
                // emergency !
		drone.stop();
                break;
	    case 'x':
		drone.animateLeds('fire', 5, 20);
		console.log("Rood");
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
                } else {
                    s = event.value / axisLimits.max;
                    drone.back(s);
                }
setTimeout(function() {drone.stop();},995);
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
setTimeout(function() {drone.stop();},995);
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
setTimeout(function() {drone.stop();},995);
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
setTimeout(function() {drone.stop();},995);
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
                    drone.animate(action, flipTime);
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
                    drone.animate(action, flipTime);
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

// Override the drone ip using an environment variable,
// using the same convention as node-ar-drone
var drone_ip = process.env.DEFAULT_DRONE_IP || '192.168.1.1';

// Keep track of plugins js and css to load them in the view
var scripts = []
  , styles = []
  ;
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs', { pretty: true });
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use("/components", express.static(path.join(__dirname, 'bower_components')));
});
app.configure('development', function () {
    app.use(express.errorHandler());
    app.locals.pretty = true;
});

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Express'
        ,scripts: scripts
        ,styles: styles
        ,options: {
          keyboard: config.keyboard
        }
    });
});

function navdata_option_mask(c) {
  return 1 << c;
}

// From the SDK.
var navdata_options = (
    navdata_option_mask(arDroneConstants.options.DEMO) 
  | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
  | navdata_option_mask(arDroneConstants.options.MAGNETO)
  | navdata_option_mask(arDroneConstants.options.WIFI)
);

// Connect and configure the drone
var client = new arDrone.createClient({timeout:4000});
client.config('general:navdata_demo', 'TRUE');
client.config('video:video_channel', '0');
client.config('general:navdata_options', navdata_options);

// Add a handler on navdata updates
var latestNavData;
client.on('navdata', function (d) {
    latestNavData = d;
});

// Signal landed and flying events.
client.on('landing', function () {
  console.log('LANDING');
  io.sockets.emit('landing');
});
client.on('landed', function () {
  console.log('LANDED');
  this.animateLeds('fire', 5, 10);
  io.sockets.emit('landed');
});
client.on('takeoff', function() {
  console.log('TAKEOFF');
  io.sockets.emit('takeoff');
});
client.on('hovering', function() {
  console.log('HOVERING');
this.animateLeds('fire', 5, 10);
  io.sockets.emit('hovering');
});
client.on('flying', function() {
  console.log('FLYING');
this.animateLeds('fire', 5, 10);
  io.sockets.emit('flying');
});

// Process new websocket connection
io.set('log level', 1);
io.sockets.on('connection', function (socket) {
  socket.emit('event', { message: 'Welcome to cockpit :-)' });
});

// Schedule a time to push navdata updates
var pushNavData = function() {
    io.sockets.emit('navdata', latestNavData);
};
var navTimer = setInterval(pushNavData, 100);

// Prepare dependency map for plugins
var deps = {
    server: server
  , app: app
  , io: io
  , client: client
  , config: config
};


// Load the plugins
var dir = path.join(__dirname, 'plugins');
function getFilter(ext) {
    return function(filename) {
        return filename.match(new RegExp('\\.' + ext + '$', 'i'));
    };
}

config.plugins.forEach(function (plugin) {
    console.log("Loading " + plugin + " plugin.");

    // Load the backend code
    require(path.join(dir, plugin))(plugin, deps);

    // Add the public assets to a static route
    if (fs.existsSync(assets = path.join(dir, plugin, 'public'))) {
      app.use("/plugin/" + plugin, express.static(assets));
    }

    // Add the js to the view
    if (fs.existsSync(js = path.join(assets, 'js'))) {
        fs.readdirSync(js).filter(getFilter('js')).forEach(function(script) {
            scripts.push("/plugin/" + plugin + "/js/" + script);
        });
    }

    // Add the css to the view
    if (fs.existsSync(css = path.join(assets, 'css'))) {
        fs.readdirSync(css).filter(getFilter('css')).forEach(function(style) {
            styles.push("/plugin/" + plugin + "/css/" + style);
        });
    }
});
// Start the web server
server.listen(app.get('port'), function() {
  console.log('B ROS Development Drone is listening on port ' + app.get('port'));
});
