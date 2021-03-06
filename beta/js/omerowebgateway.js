// Global polygon mesh
// var boxMesh;
var plane;

var path = "http://idr.openmicroscopy.org/webgateway/render_image/2858253/10/0/?c=1|0:111$00FF00,2|0:40$FF0000";

THREE.ImageUtils.crossOrigin = "";

// Global scene object
var scene;
// Global camera object
var camera;
// The cube has to rotate around all three axes, so we need three rotation values.
// x, y and z rotation
var xRotation = 0.0;
var yRotation = 0.0;

var initialRotation = -Math.PI / 2 ;
// Rotation speed around x and y axis
var xSpeed = 0.0;
var ySpeed = 0.0;

// Translations
var xTranslation = 0;
var yTranslation = 0;
var zTranslation = 0;

var group = new THREE.Group();

const imageCount = 42;
const channelCount = 7;

var channels = {
	"path":[
	"images/coloredmovie_4datasets/",
	"images/coloredmovie_4datasets/grayscale/nuclei",
	"images/coloredmovie_4datasets/grayscale/dpERK",
	"images/coloredmovie_4datasets/grayscale/twist",
	"images/coloredmovie_4datasets/grayscale/dorsal",
	"images/coloredmovie_4datasets/grayscale/ind",
	"images/coloredmovie_4datasets/grayscale/rhomboid",
	],
	"name":[
	"all_",
	"nuclei_",
	"dpERK_",
	"twist_",
	"dorsal_",
	"ind_",
	"rhomboid_",
	]
};


// Texture and flag for current texture filter
var textureArray = {};
var channelLoaded = [];
var manager = [];
for (ch = 0; ch < channelCount; ++ch) {
	channelLoaded[ch] = false;
	manager.push(new THREE.LoadingManager());
	manager[ch].ch = ch;
	manager[ch].onLoad = function() {
		channelLoaded[this.ch] = true;
		if (this.ch == 0) {
			selectTexture(0, 0);
		}
	};
}

var slider;

// Initialize the scene
initializeScene();

// Instead of calling 'renderScene()', we call a new function: 'animateScene()'. It will
// update the rotation values and call 'renderScene()' in a loop.
// Animate the scene
animateScene();

/**
* Initialize the scene
*/
function initializeScene() {
// Check whether the browser supports WebGL. If so, instantiate the hardware accelerated
// WebGL renderer. For antialiasing, we have to enable it. The canvas renderer uses
// antialiasing by default.
// The approach of multiple renderers is quite nice, because your scene can also be
// viewed in browsers, which don't support WebGL. The limitations of the canvas renderer
// in contrast to the WebGL renderer will be explained in the tutorials, when there is a
// difference.
webGLAvailable = false;
if (Detector.webgl) {
	renderer = new THREE.WebGLRenderer({antialias:true});
	webGLAvailable = true;
} else {
	renderer = new THREE.CanvasRenderer();
}

// Set the background color
renderer.setClearColor(0x000000);//(0xc8c8c8);

// Get the size of the inner window (content area) to create a full size renderer
canvasWidth = window.innerWidth/1.5;
canvasHeight = window.innerHeight/1.5;

// Set the renderers size to the content areas size
renderer.setSize(canvasWidth, canvasHeight);

// Get the DIV element from the HTML document by its ID and append the renderers DOM
// object to it
document.getElementById("WebGLCanvas").appendChild(renderer.domElement);

// Create the scene, in which all objects are stored 
scene = new THREE.Scene();

// Now that we have a scene, we want to look into it. Therefore we need a camera.
// Three.js offers three camera types:
//  - PerspectiveCamera (perspective projection)
//  - OrthographicCamera (parallel projection)
//  - CombinedCamera (allows to switch between perspective / parallel projection
//    during runtime)
// In this example we create a perspective camera. Parameters for the perspective
// camera are ...
// ... field of view (FOV),
// ... aspect ratio (usually set to the quotient of canvas width to canvas height)
// ... near and
// ... far.
// Near and far define the cliping planes of the view frustum. Three.js provides an
// example (http://mrdoob.github.com/three.js/examples/
// -> canvas_camera_orthographic2.html), which allows to play around with these
// parameters.
// The camera is moved 10 units towards the z axis to allow looking to the center of
// the scene.
// After definition, the camera has to be added to the scene.
camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);
camera.position.set(0, 0, 10);
camera.lookAt(scene.position);
scene.add(camera);


// Load an image as texture
for (ch = 0; ch < channelCount; ++ch) {
	var textureLoader = new THREE.TextureLoader(manager[ch]);
	for (img = 0; img < imageCount; ++img) {
		textureArray[ch * imageCount + img] = textureLoader.load(channels.path[ch].concat(img+1,".png"));
	}
}

var planeMaterial = new THREE.MeshBasicMaterial({ 
side:THREE.DoubleSide,
transparent:true,
depthWrite:false,
map:loadImage(path)
});
planeMaterial.blending = THREE.AdditiveBlending;

// plane
plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 8),planeMaterial);
// plane.material.map = textureArray[0];

plane.overdraw = true;

scene.add(plane);




// Add a listener for 'keydown' events. By this listener, all key events will be
// passed to the function 'onDocumentKeyDown'. There's another event type 'keypress'.
// It will report only the visible characters like 'a', but not the function keys
// like 'cursor up'.
document.addEventListener("keydown", onDocumentKeyDown, false);

// slider = document.getElementById("myRange"),
document.addEventListener("input", onSlide, false);

document.addEventListener('dblclick', onDblClick, false); 

}

/**
* Select current texture to display in loaded texture arrays
*/
function selectTexture(channel, image) {
// boxMesh.material.map = textureArray[channel * imageCount + image];
// plane.material.map = textureArray[channel * imageCount + image];
// console.log(channel * imageCount + image +parseInt(10*yTranslation,10));
// console.log(parseInt(10*yTranslation,10));
// console.log(yTranslation);
document.getElementById("overlaytext").innerHTML = channels.name[channel].concat(image+1,".png");
document.getElementById("myRange").value = image;
}

function loadImage(path) {
  var canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  //document.body.appendChild(canvas);

  var texture = new THREE.Texture(canvas);

  var image_remote = new Image();
  image_remote.crossOrigin = '' 
  image_remote.onload = function() {
      canvas.width = image_remote.width;
      canvas.height = image_remote.height;

      var context = canvas.getContext('2d');
      context.drawImage(image_remote, 0, 0);

      texture.needsUpdate = true;
  };
  image_remote.src = path;
  return texture;
};


/**
* This function is called, when a key is pushed down.
*/
function onDocumentKeyDown(event) {
	this.currentImage = this.currentImage || 0;
	this.currentChannel = this.currentChannel || 0;

// Get the key code of the pressed key
var keyCode = event.which;
if (keyCode == enums.keyboard.SPACE) {	// SWITCH CHANNEL
	if (this.currentChannel < channelCount - 1 && channelLoaded[this.currentChannel+1]) {
		++this.currentChannel;
	} else {
		this.currentChannel = 0;
	}

} else if(keyCode == enums.keyboard.KEY_W) {	// ROTATE UP
// xSpeed -= 0.01;
xRotation -= 0.1;
} else if(keyCode == enums.keyboard.KEY_S) {	// ROTATE DOWN
// xSpeed += 0.01;
xRotation += 0.1;
} else if(keyCode == enums.keyboard.KEY_A) {	// ROTATE LEFT
// ySpeed -= 0.01;
yRotation -= 0.1;
} else if(keyCode == enums.keyboard.KEY_D) {	// ROTATE RIGHT
// ySpeed += 0.01;
yRotation += 0.1;

} else if(keyCode == enums.keyboard.KEY_P) {	
// ySpeed -= 0.01;
yTranslation += 0.1;
}  else if(keyCode == enums.keyboard.KEY_L) {	
// ySpeed -= 0.01;
yTranslation -= 0.1;
} else if(keyCode == enums.keyboard.KEY_O) {	
// ySpeed -= 0.01;
xTranslation += 0.1;
}  else if(keyCode == enums.keyboard.KEY_K) {	
// ySpeed -= 0.01;
xTranslation -= 0.1;
} else if(keyCode == enums.keyboard.LEFT_ARROW) {	// NEXT IMAGE
	if (this.currentImage > 0) {
		--this.currentImage;
	} else {
		this.currentImage = imageCount - 1;
	}

} else if(keyCode == enums.keyboard.RIGHT_ARROW) {	// PREVIOUS IMAGE
	if (this.currentImage < imageCount - 1) {
		++this.currentImage;
	} else {
		this.currentImage = 0;
	}

// Page up
} else if(keyCode == enums.keyboard.UP_ARROW) {	// ZOOM IN
	zTranslation += 0.2;
// Page down
} else if(keyCode == enums.keyboard.DOWN_ARROW) {	// ZOOM OUT
	zTranslation -= 0.2;
}
else if(keyCode == enums.keyboard.KEY_R) {	// RESET VIEW
	xRotation = 0.0;
	yRotation = 0.0;
	xSpeed = 0.0;
	ySpeed = 0.0;
	xTranslation = 0;
	yTranslation = 0;
	zTranslation = 0;
	plane.position.x = 0;
	plane.position.y = 0;
	plane.position.z = 0;
}
selectTexture(this.currentChannel, this.currentImage);
}

function onSlide(event){
	this.currentImage = this.currentImage || 0;
	this.currentChannel = this.currentChannel || 0;
	this.currentImage = parseInt(document.getElementById("myRange").value);
	selectTexture(this.currentChannel, this.currentImage);
}

function onDblClick(event) {
	this.currentImage = this.currentImage || 0;
	this.currentChannel = this.currentChannel || 0;
	if (this.currentChannel < channelCount - 1 && channelLoaded[this.currentChannel+1]) {
		++this.currentChannel;
	} else {
		this.currentChannel = 0;
	}
	selectTexture(this.currentChannel, this.currentImage);
}

/**
* Import images using html input
*/
function showImages() {

	var preview = document.querySelector('#preview');
	var files   = document.querySelector('input[type=file]').files;
	var count = 0;
	function changeTexture(file) {

// Make sure `file.name` matches our extensions criteria
if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
	var reader = new FileReader();

	reader.onload = function(evt){
		console.log(evt);
		var image = document.createElement( 'img' );
		image.src = evt.target.result;
		textureArray[count] = THREE.ImageUtils.loadTexture(evt.target.result);
		count += 1;
	}


	reader.readAsDataURL(file);

// document.getElementById("preview").innerHTML = file.tmp_name;

}

}

if (files) {
	[].forEach.call(files, changeTexture);

}

selectTexture(this.currentChannel, this.currentImage);

}

/**
* Animate the scene and call rendering.
*/
function animateScene() {
//directionalLight.position = camera.position;
if (channelLoaded[0]) {
// Increase the x, y and z rotation of the cube
// xRotation += xSpeed;
// yRotation += ySpeed;
// boxMesh.rotation.set(xRotation, yRotation, 0.0);
plane.rotation.set(xRotation, yRotation, 0.0, 'XYZ' );
// plane.rotateX(xRotation);
// plane.rotateY(yRotation);

// planeHoriz.rotateX(xRotation+initialRotation);
// planeHoriz.rotateZ(yRotation);
// initialRotation = 0;
// xRotation = 0;
// yRotation = 0;
// Apply the the translation along the z axis
// boxMesh.position.z = zTranslation;
plane.position.z = zTranslation;
// plane.translateY(yTranslation);
// plane.translateOnAxis(a, yTranslation);
// yTranslation = 0;

xTranslation = 0;

// Map the 3D scene down to the 2D screen (render the frame)
renderScene();
}

// Define the function, which is called by the browser supported timer loop. If the
// browser tab is not visible, the animation is paused. So 'animateScene()' is called
// in a browser controlled loop.
requestAnimationFrame(animateScene);
}

/**
* Render the scene. Map the 3D world to the 2D screen.
*/
function renderScene() {
	renderer.render(scene, camera);
}


