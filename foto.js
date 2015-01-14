var 	arDrone = require('ar-drone'),
	http    = require('http'),
	client = arDrone.createClient(),
	pngStream = client.getPngStream(),
	lastPng;

client.disableEmergency();

console.log('PNG ophalen ...');
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
});
