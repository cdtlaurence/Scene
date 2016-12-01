
//Declare global vars
var keys = {}; // Empty object to store which keys are being held down
var tractorGroupHeight = 2; // var to show how high the tractor is relitive to (0,0,0)
var turningLeft = false; // var to show if the tractor is turning left
var turningRight = false; // var to show if the tractor is turning right
var correctl; // var holding the x position for a straight left wheel 
var correctr; // var holding the x position for a straight right wheel 
var notTurning = true; // var to show if the tractor is not turning
var wheelAngle = 0; // var holding the angle of the wheels
var turnAngle = 0; // var holding the angle of the tractor
var tractorHeading; // var holding x,y,z position of where the tractor is facing
var firstPerson = false; // var holding bool of whether we are in first person mode
var numberOfSheep = 40; // var holding the current number of sheep on the screen
var sheeps = []; // array of all the sheep in the scene

//Event listener that will fire when a key is pressed
window.addEventListener("keydown", function (event) {
    keys[event.keyCode] = true; //create a property  for the key being pressed
});

//Event listener that will fire when a key is released
window.addEventListener("keyup", function (event) {
    delete  keys[event.keyCode];
});

// Adds the stats to the screen, at the top left. These are great for debugging and showing the user their frame rate
var stats = initStats();

// Create new three.js scene to hold all other objects
var scene = new THREE.Scene();

//Ask user if they want fog, and display if needed
var foggyAnswer = prompt("Would you like it to be a foggy day?\n(Yes or No)", "Yes");
if (foggyAnswer === "Yes") {
    scene.fog = new THREE.Fog(0xffffff, 20, 200);
}

//Add the ambient light to the scene
addLight();

// Create a render and set the size
var renderer = createRenderer();

// Create a the floor plane, and give it a grass texture
var background = createBackground();

// Add the background to the scene
scene.add(background);

// Create a group to hold the tractor and add it to the scene
var tractorGroup = new THREE.Object3D();
scene.add(tractorGroup);

// Create a group to hold the tractor body and add it to the tractor group
var body = createTractorBody();
body.position.y = tractorGroupHeight;
body.position.x = 0;
tractorGroup.add(body);
var driver = createDriver();
driver.position.y = tractorGroupHeight + 1;
driver.position.x = +2;
tractorGroup.add(driver);

// Create the tractor wheels and add it to the tractor group
var bigWheel1 = createTractorWheel(2);
bigWheel1.position.y = tractorGroupHeight;
bigWheel1.position.x = body.position.x + 2;
bigWheel1.position.z = body.position.z + 2;
tractorGroup.add(bigWheel1);
var bigWheel2 = createTractorWheel(2);
bigWheel2.position.y = tractorGroupHeight;
bigWheel2.position.x = body.position.x + 2;
bigWheel2.position.z = body.position.z - 2;
tractorGroup.add(bigWheel2);
var smallWheelLeft = createTractorWheel(1);
smallWheelLeft.position.y = tractorGroupHeight - 1;
smallWheelLeft.position.x = body.position.x - 2;
smallWheelLeft.position.z = body.position.z + 1;
tractorGroup.add(smallWheelLeft);
var smallWheelRight = createTractorWheel(1);
smallWheelRight.position.y = tractorGroupHeight - 1;
smallWheelRight.position.x = body.position.x - 2;
smallWheelRight.position.z = body.position.z - 1;
tractorGroup.add(smallWheelRight);
correctl = smallWheelLeft.position.x;
correctr = smallWheelRight.position.x;

// Set the default tractor heading and add it to the tractor group
tractorHeading = new THREE.Object3D;
tractorHeading.position.y = tractorGroupHeight + 1;
tractorHeading.position.x = body.position.x - 10;
tractorHeading.position.z = body.position.z;
tractorGroup.add(tractorHeading);


// Create and add the first tractor headlight
var light1 = new THREE.SpotLight("#ffffff");
light1.position.set(body.position.x - 2, tractorGroupHeight + 0.5, body.position.z + 0.4);
light1.castShadow = true;
light1.shadow.camera.near = 2;
light1.shadow.camera.far = 200;
light1.shadow.camera.fov = 130;
light1.distance = 10;
light1.intensity = 10;
light1.target = tractorHeading;
tractorGroup.add(light1);

// Create and add the second tractor headlight
var light2 = new THREE.SpotLight("#ffffff");
light2.position.set(body.position.x - 2, tractorGroupHeight + 0.5, body.position.z - 0.4);
light2.castShadow = true;
light2.shadow.camera.near = 2;
light2.shadow.camera.far = 200;
light2.shadow.camera.fov = 130;
light2.distance = 10;
light2.intensity = 10;
light2.target = tractorHeading;
tractorGroup.add(light2);

//Add the first physical headlight
var headlight1 = createHeadlight();
headlight1.position.copy(light1.position);
tractorGroup.add(headlight1);

//Add the second physical headlight
var headlight2 = createHeadlight();
headlight2.position.copy(light2.position);
tractorGroup.add(headlight2);

// Add the scene to the html page
document.body.appendChild(renderer.domElement);

// Create a camera which defines where we're looking at
var camera = createCamera();
scene.add(camera);

// Function to update the dat.gui controls as values change
var controls = new function () {
    this.headLightColor = light1.color.getHex();
    this.numberOfSheep = numberOfSheep;
    this.selfDrive = false;
    this.switchCamera = function () {
        if (firstPerson)
        {
            camera = createCamera();
            firstPerson = false;
        } else {
            camera.position.x = tractorGroup.position.x;
            camera.position.y = tractorGroup.position.y + 6;
            camera.position.z = tractorGroup.position.z;
            camera.lookAt(tractorHeading.position);
            firstPerson = true;
        }
    };
};

// Add the controls to the html
addControls();

// Add the sheep to the scene
addSheep();

// Call the render function to start the rendering loop
render();

// The render callback function will be called on a loop while the tab is being viewed
function render() {
    //Update the displayed stats
    stats.update();

    if (controls.selfDrive)
    {
        var int = getRandomInt(0, 3);
        switch (int) {
            case 1:
                forwardKey();
                break;
            case 2:
                keys[38] = true;
                leftKey();
                delete  keys[38];
                break;
            case 3:
                keys[38] = true;
                rightKey();
                delete  keys[38];
                break;
        }
    } else {
        //Check and deal with any pressed keys
        checkKeys();
    }


    // Check if we are in first person mode
    if (firstPerson)
    {
        // Set the camera position to be like we are looking out the front of the tractor
        camera.position.x = tractorGroup.position.x;
        camera.position.y = tractorGroup.position.y + 6;
        camera.position.z = tractorGroup.position.z;
        var pos = new THREE.Vector3();
        pos.setFromMatrixPosition(tractorHeading.matrixWorld);

        // Tell the camera to look forward in respect to the tractor
        camera.lookAt(pos);
    }
    requestAnimationFrame(render);

    // Actually render the scene
    renderer.render(scene, camera);
}

// Add the required amount of sheep to the scene
function addSheep() {
    for (i = 0; i < numberOfSheep; i++) {
        var sheep = createSheep();
        var x = getRandomInt(-150, 150);
        var z = getRandomInt(-150, 150);
        sheep.position.x = x;
        sheep.position.z = z;
        scene.add(sheep);
        sheeps.push(sheep);
    }
}

// Remove all the sheep from the scene
function removeSheep() {
    sheeps.forEach(function (item, index) {
        scene.remove(item);
    });
}

// Get a random whole integer between a max and min value
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Create the tractory body and return the Mesh
function createTractorBody() {
    var geometry = new THREE.BoxGeometry(4, 2.5, 2);
    var loader = new THREE.TextureLoader();
    var metalTexture = loader.load("../assets/textures/general/old-rusty-metal.jpg");
    var material = new THREE.MeshPhongMaterial();
    material.map = metalTexture;
    var body = new THREE.Mesh(geometry, material);
    return body;
}

// Create the driver section of the tractor
function createDriver() {
    var geometry = new THREE.BoxGeometry(2, 4, 2);
    var loader = new THREE.TextureLoader();
    var metalTexture = loader.load("../assets/textures/general/old-rusty-metal.jpg");
    var material = new THREE.MeshPhongMaterial();
    material.map = metalTexture;
    var driver = new THREE.Mesh(geometry, material);
    return driver;
}

//Create a single wheel
function createTractorWheel(radius) {
    var loader = new THREE.TextureLoader();
    var wheelTexture = loader.load("../assets/textures/general/wheel.jpg");
    var material = new THREE.MeshPhongMaterial();
    material.map = wheelTexture;
    var geometry = new THREE.CylinderGeometry(radius, radius, 1);
    var wheel = new THREE.Mesh(geometry, material);
    wheel.rotation.x = Math.PI / 2;
    return wheel;
}

// Create the background, and floor for the scene
function createBackground() {
    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 1, 1);
    var loader = new THREE.TextureLoader();
    var grassTexture = loader.load("../assets/textures/general/grass.jpg");
    var planeMaterial = new THREE.MeshPhongMaterial();
    planeMaterial.map = grassTexture;
    var background = new THREE.Mesh(planeGeometry, planeMaterial);

    // rotate and position the plane
    background.rotation.x = -0.5 * Math.PI;
    return background;
}

// Create the default camera for the scene
function createCamera() {
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // position and point the camera to the center of the scene
    camera.position.x = -40;
    camera.position.y = 20;
    camera.position.z = 30;
    camera.lookAt(scene.position);
    return camera;
}

// Create the renderer for the scene
function createRenderer() {
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    return renderer;
}

// Check if any keys have been pressed and deal with them if needed
function checkKeys() {
    if (keys[37]) { //left
        leftKey();
    }
    if (keys[39]) { //right
        rightKey();
    }
    if (keys[38]) { //up
        forwardKey();
    }
    if (keys[40]) { //down
        backwardKey();
    }
    if (keys[82]) { //r
        var r = getRandomInt(0, 255);
        var g = getRandomInt(0, 255);
        var b = getRandomInt(0, 255);
        var colour = new THREE.Color("rgb(" + r + "," + g + "," + b + ")");
        controls.headLightColor = new THREE.Color(colour).getHex();
        light1.color = new THREE.Color(colour);
        light2.color = new THREE.Color(colour);
        headlight1.material.color = new THREE.Color(colour);
        headlight2.material.color = new THREE.Color(colour);
    }
}

// Add the controls to the right hand side of the screen
function addControls() {
    var gui = new dat.GUI();
    gui.addColor(controls, 'headLightColor').onChange(function (e) {
        //Change the lights color to the color stored in "e".
        light1.color = new THREE.Color(e);
        light2.color = new THREE.Color(e);
        headlight1.material.color = new THREE.Color(e);
        headlight2.material.color = new THREE.Color(e);
    });
    gui.add(controls, 'switchCamera');
    gui.add(controls, 'selfDrive');
    gui.add(controls, 'numberOfSheep').min(0).max(40).step(1).onChange(function (e) {
        removeSheep();
        numberOfSheep = e;
        addSheep();
    });
}

// Create a single physical headlight
function createHeadlight() {
    var material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
    var geometry = new THREE.SphereGeometry(0.2);
    var headlight = new THREE.Mesh(geometry, material);
    return headlight;
}

function forwardKey() {
    wheelAngle += 0.2;
    tractorGroup.position.z -= Math.sin(-turnAngle);
    tractorGroup.position.x -= Math.cos(-turnAngle);
    tractorGroup.rotation.y = turnAngle;
    tractorGroup.rotation.y = turnAngle;
    turnWheels(true);
    if (!keys[37] || !keys[39]) {
        smallWheelLeft.position.x = correctl;
        smallWheelRight.position.x = correctr;
        notTurning = true;
        turningRight = false;
        turningLeft = false;
    }
}

function backwardKey() {
    wheelAngle -= 0.2;
    tractorGroup.position.z += Math.sin(-turnAngle);
    tractorGroup.position.x += Math.cos(-turnAngle);
    tractorGroup.rotation.y = turnAngle;
    tractorGroup.rotation.y = turnAngle;
    turnWheels(false);
    if (!keys[37] || !keys[39]) {
        smallWheelLeft.position.x = correctl;
        smallWheelRight.position.x = correctr;
        notTurning = true;
        turningRight = false;
        turningLeft = false;
    }
}

function leftKey() {
    if (keys[38]) { //up
        turnAngle += 0.1;
    }
    if (keys[40]) { //up
        turnAngle -= 0.1;
    }
    if (notTurning) {
        correctl = smallWheelLeft.position.x;
        correctr = smallWheelRight.position.x;
        smallWheelLeft.position.x += 0.5;
        smallWheelRight.position.x -= 0.5;
        turningLeft = true;
        notTurning = false;
    }
    if (turningRight)
    {
        smallWheelLeft.position.x += 0.5;
        smallWheelRight.position.x -= 0.5;
        notTurning = true;
        turningRight = false;
    }
}

function rightKey() {
    if (keys[38]) { //up
        turnAngle -= 0.1;
    }
    if (keys[40]) { //up
        turnAngle += 0.1;
    }
    if (notTurning) {
        correctl = smallWheelLeft.position.x;
        correctr = smallWheelRight.position.x;
        smallWheelLeft.position.x -= 0.5;
        smallWheelRight.position.x += 0.5;
        turningRight = true;
        notTurning = false;
    }
    if (turningLeft) {
        smallWheelLeft.position.x -= 0.5;
        smallWheelRight.position.x += 0.5;
        notTurning = true;
        turningLeft = false;
    }
}

// Create a single sheep
function createSheep() {
    // Create the main body for the sheep
    var sheep = new THREE.Object3D();
    var loader = new THREE.TextureLoader();
    var sheepTexture = loader.load("../assets/textures/general/sheep.jpg");
    var sheepMaterial = new THREE.MeshPhongMaterial();
    sheepMaterial.map = sheepTexture;
    var geometry = new THREE.CylinderGeometry(1, 1, 4);
    var sheepBody = new THREE.Mesh(geometry, sheepMaterial);
    sheepBody.position.y = 2.5;
    sheepBody.rotation.z = Math.PI / 2;
    sheep.add(sheepBody);
    var sheepAngle = 0;

    // Add cylinders around the body to make sheep look fluffy
    for (var i = 0; i < 11; i++) {
        sheepAngle += 0.7;
        var geometry1 = new THREE.CylinderGeometry(0.5, 0.5, 4);
        var sheepBody1 = new THREE.Mesh(geometry1, sheepMaterial);
        sheepBody1.position.z += Math.sin(-sheepAngle);
        sheepBody1.position.y += Math.cos(-sheepAngle) + 3;
        sheepBody1.rotation.z = Math.PI / 2;
        sheep.add(sheepBody1);
    }

    // Create and add the legs for the sheep
    var l1 = createLeg();
    l1.position.x = sheep.position.x + 1.5;
    l1.position.y = sheep.position.y;
    l1.position.z = sheep.position.z + 0.8;
    var l2 = createLeg();
    l2.position.x = sheep.position.x + 1.5;
    l2.position.y = sheep.position.y;
    l2.position.z = sheep.position.z - 0.8;
    var l3 = createLeg();
    l3.position.x = sheep.position.x - 1.5;
    l3.position.y = sheep.position.y;
    l3.position.z = sheep.position.z + 0.8;
    var l4 = createLeg();
    l4.position.x = sheep.position.x - 1.5;
    l4.position.y = sheep.position.y;
    l4.position.z = sheep.position.z - 0.8;
    sheep.add(l1);
    sheep.add(l2);
    sheep.add(l3);
    sheep.add(l4);

    // Create the sheep head and add it to the sheep
    var sheepHeadTexture = loader.load("../assets/textures/general/sheepheadnew.jpg");
    var headMaterial = new THREE.MeshPhongMaterial();
    headMaterial.map = sheepHeadTexture;
    var headGeometry = new THREE.SphereGeometry(0.8);
    var head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.x = sheep.position.x - 3;
    head.position.y = sheep.position.y + 4;
    head.rotation.y = Math.PI;
    head.rotation.z = -0.1;
    sheep.add(head);
    return sheep;
}

// Create a single sheeps leg
function createLeg() {
    var material = new THREE.MeshBasicMaterial({color: 0x000000});
    var geometry = new THREE.BoxGeometry(0.5, 4, 0.5);
    var sheepLeg = new THREE.Mesh(geometry, material);
    return sheepLeg;
}

// Add the ambient light to the scene
function addLight() {
    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
}

// Rotate the wheels depending on if we are moving forward or back
function turnWheels(forward) {
    if (forward)
    {
        wheelAngle += 0.2;
    } else
    {
        wheelAngle -= 0.2;
    }
    bigWheel1.rotation.y = wheelAngle;
    bigWheel2.rotation.y = wheelAngle;
    smallWheelLeft.rotation.y = wheelAngle;
    smallWheelRight.rotation.y = wheelAngle;
}

// Create a new stats object and add it to the html
function initStats() {

    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    window.document.getElementById("Stats-output").appendChild(stats.domElement);
    return stats;
}