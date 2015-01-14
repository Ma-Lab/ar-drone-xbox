var 	arDrone = require('ar-drone'),
	client = arDrone.createClient();

  client.on('navdata', console.log);
  client.disableEmergency();
  client.takeoff();
  client.animateLeds('blinkRed', 5, 20);
  client.after(2000, function() {
	this.clockwise(0.5);
  });
  client.after(2000, function() {
	this.front(0.6); 
  });
  client.after(3000, function() {
      this.stop();
      this.land();
  });
