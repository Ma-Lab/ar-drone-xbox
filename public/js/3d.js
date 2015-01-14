$(function() {
  var theCamera;
  var theScene;
  var theRenderer;
  var theControls;
  var theDrone;

  var playbackFrameNum = null;

  function init() {

   //   m = new THREE.Matrix4();
  //    m.makeScale(1, 1, -1);
  //    console.log(m);
      theCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
      theCamera.position.x = 0;
      theCamera.position.y = 0;
      theCamera.position.z = 400;
      theCamera.lookAt(new THREE.Vector3(0, 0, 0));

    theScene = new THREE.Scene();
    theScene.add(theCamera);

   var loader = new THREE.ColladaLoader();
   loader.load('assets/ar-drone-2.dae', function(result) {
     result.scene.rotation = new THREE.Vector3(-Math.PI / 2, 0, -Math.PI / 2);
     theDrone = new Drone(result.scene);
     theScene.add(theDrone);
     $('#status').html('');
   });
    // Connect to websocket.
  var hostname = document.location.hostname ? document.location.hostname : "localhost";
  droneSocket = io.connect('http://' + hostname);
  droneSocket.on('navdata', function(navdata) {
    // Don't listen to the drone telemetry if we're in playback
    // mode.
    if (!jQuery.isEmptyObject(navdata) &&
        playbackFrameNum === null &&
        theDrone) {
      theDrone.updateState(navdata);
      updateTelemetry(navdata);
    }
  });

  theScene.add(new THREE.AmbientLight(0x333333));
  var directionalLight = new THREE.DirectionalLight(0xaaaaaa);
  directionalLight.position.x = 500;
  directionalLight.position.y = 200;
  directionalLight.position.z = 500;
  directionalLight.position.normalize();
  theScene.add(directionalLight);
  directionalLight = new THREE.DirectionalLight(0xaaaaaa);
  directionalLight.position.x = -500;
  directionalLight.position.y = -200;
  directionalLight.position.z = 500;
  directionalLight.position.normalize();
  theScene.add(directionalLight);
  
  
  theRenderer = new THREE.WebGLRenderer({
  alpha: true
  });
  theRenderer.setSize(window.innerWidth, window.innerHeight);
  theRenderer.setClearColorHex(0x000000, 0);
 
  // trackback _controls settings.
  var radius = 60;
  theControls = new THREE.TrackballControls(theCamera, theRenderer.domElement);
  theControls.rotateSpeed = 0.5;
  theControls.zoomSpeed = 1.2;
  theControls.panSpeed = 0.2;
  theControls.noZoom = false;
  theControls.noPan = false;
  theControls.staticMoving = false;
  theControls.dynamicDampingFactor = 0.3;
  theControls.minDistance = radius * 1.1;
  theControls.maxDistance = radius * 100;
  theControls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]
 
  $('#telemetry').append(theRenderer.domElement);
  }


  function animate() {
    if (playbackFrameNum !== null) {
      if (playbackFrameNum >= navdatas.length) {
        playbackFrameNum = null;
      } else {
        theDrone.updateState(navdatas[playbackFrameNum]);
        playbackFrameNum += 1;
      }
      window.setTimeout(function() {requestAnimationFrame(animate);},
                        50);
    } else {
      requestAnimationFrame(animate);
    }
    theControls.update();
    theRenderer.render(theScene, theCamera);
  }


	init();
  animate();

});