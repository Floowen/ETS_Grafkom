"use strict";

var perspectiveExample = function(){
var canvas;
var gl;

var positionsArray = [];
var colorsArray = [];

var vertices = [
    vec4(-1.37638,0.,0.262866, 1.0),            //1
    vec4(1.37638,0.,-0.262866, 1.0),            //2
    vec4(-0.425325,-1.30902,0.262866, 1.0),     //3
    vec4(-0.425325,1.30902,0.262866, 1.0),      //4
    vec4(1.11352,-0.809017,0.262866, 1.0),      //5
    vec4(1.11352,0.809017,0.262866, 1.0),       //6
    vec4(-0.262866,-0.809017,1.11352, 1.0),     //7
    vec4(-0.262866,0.809017,1.11352, 1.0),      //8
    vec4(-0.688191,-0.5,-1.11352, 1.0),         //9
    vec4(-0.688191,0.5,-1.11352, 1.0),          //10
    vec4(0.688191,-0.5,1.11352, 1.0),           //11
    vec4(0.688191,0.5,1.11352, 1.0),            //12
    vec4(0.850651,0.,-1.11352, 1.0),            //13
    vec4(-1.11352,-0.809017,-0.262866, 1.0),    //14
    vec4(-1.11352,0.809017,-0.262866, 1.0),     //15
    vec4(-0.850651,0.,1.11352, 1.0),            //16
    vec4(0.262866,-0.809017,-1.11352, 1.0),     //17
    vec4(0.262866,0.809017,-1.11352, 1.0),      //18
    vec4(0.425325,-1.30902,-0.262866, 1.0),     //19
    vec4(0.425325,1.30902,-0.262866, 1.0),      //20
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(0.5, 1.0, 0.5, 1.0),  // white
    vec4(0.5, 0.0, 0.5, 1.0),  // purple
    vec4(0.5, 0.5, 0.5, 1.0),  // grey
    vec4(1.0, 0.8, 0.0, 1.0),  // teal
    vec4(1.0, 0.5, 0.0, 1.0),  // orange
    vec4(0.9, 0.0, 0.0, 1.0)   // light blue
];


var near = 0.3;
var far = 8.0;
var radius = 7.0;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;

var fovy = 56.0;  // Update the fovy to match code 2
var aspect;

var defaultOffset = -4.5; // default mesh position / offset
var defaultXAccel = 0.004; // default acceleration
var defaultYAccel = 0.05; // default acceleration / gravity

var horizontalOffset = defaultOffset; // mesh horizontal position / offset
var verticalOffset = 0.0; // mesh vertical position / offset

var flagMoveXPos = false;
var flagMoveXNeg = false;
var flagMoveYPos = false;
var flagMoveYNeg = false;
var flagMoveAccel = false;
var flagFalling = false;

var velocityX = 0.0;
var velocityY = 0.0;
var accelX = defaultXAccel;
var accelY = defaultYAccel;

var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function pentagon(a, b, c, d, e) {
    positionsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    positionsArray.push(vertices[b]);
    colorsArray.push(vertexColors[a]);
    positionsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);

    positionsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    positionsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    positionsArray.push(vertices[d]);
    colorsArray.push(vertexColors[a]);

    positionsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    positionsArray.push(vertices[d]);
    colorsArray.push(vertexColors[a]);
    positionsArray.push(vertices[e]);
    colorsArray.push(vertexColors[a]);
}

init();

function createDodecahedron() {
    pentagon(11,10,6,15,7);  // Face 8
    pentagon(4,1,12,16,18);  // Face 9
    pentagon(5,19,17,12,1);  // Face 10
    pentagon(3,14,9,17,19);  // Face 11
    pentagon(9,14,0,13,8);   // Face 12

    pentagon(7,3,19,5,11);   // Face 1
    pentagon(1,4,10,11,5);   // Face 2
    pentagon(10,4,18,2,6);   // Face 3
    pentagon(6,2,13,0,15);   // Face 4
    pentagon(0,14,3,7,15);   // Face 5
    pentagon(12,17,9,8,16);  // Face 6
    pentagon(8,13,2,18,16);  // Face 7
}

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = canvas.width/canvas.height;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    createDodecahedron();  // Correct pentagon calls

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 1.5;};
    document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    document.getElementById("Button5").onclick = function(){theta += dr;};
    document.getElementById("Button6").onclick = function(){theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};

    document.getElementById("ButtonMoveXPos").onclick = function(){flagMoveXPos = !flagMoveXPos;}; //moves the object to the right
    document.getElementById("ButtonMoveXNeg").onclick = function(){flagMoveXNeg = !flagMoveXNeg;}; //moves the object to the left
    document.getElementById("ButtonMoveYNeg").onclick = function(){flagMoveYNeg = !flagMoveYNeg;}; //moves the object down
    document.getElementById("ButtonMoveYPos").onclick = function(){flagMoveYPos = !flagMoveYPos;}; //moves the object up
    document.getElementById("ButtonMoveXAccel").onclick = function(){flagMoveAccel = !flagMoveAccel;} //accelerates the object to the right
    document.getElementById("ButtonReset").onclick = function(){horizontalOffset = defaultOffset; verticalOffset = 0.0; velocityX = 0.0; velocityY = 0.0; accelX = defaultXAccel; accelY = defaultYAccel;}; //resets the object to the center
    document.getElementById("ButtonMoveFalling").onclick = function(){flagFalling = !flagFalling;}

    render();
}

function meshMove() {
    var staticVelocity = 0.01;
    if(flagMoveXPos) horizontalOffset += staticVelocity; //moves the object to the right
    if(flagMoveXNeg) horizontalOffset -= staticVelocity; //moves the object to the left
    if(flagMoveYPos) verticalOffset += staticVelocity; //moves the object up
    if(flagMoveYNeg) verticalOffset -= staticVelocity; //moves the object down

    if(flagMoveAccel){ //accelerates the object to the right
        velocityX += accelX;
        horizontalOffset += velocityX;
        console.log("velocityX: " + velocityX);
    }

    if(flagFalling){
        velocityY += accelY;
        verticalOffset -= velocityY;
        console.log("velocityY: " + velocityY);
    }
}

function checkBoundaries() {
    if(horizontalOffset > 5.5 || horizontalOffset < -5.5){ //if the object reaches the edge of the screen, reverse the direction
        velocityX = 0;
        flagMoveAccel = false;
        if(horizontalOffset > 5.5) flagMoveXPos = false;
        if(horizontalOffset < -5.5) flagMoveXNeg = false;
    }

    if(verticalOffset > 1.5 || verticalOffset < -1.6){ //if the object reaches the edge of the screen, reverse the direction
        velocityY = 0;
        flagFalling = false;
        if(verticalOffset > 1.5) flagMoveYPos = false;
        if(verticalOffset < -1.6) flagMoveYNeg = false;
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += 1.0 * Math.PI/180.0; //make it rotate
    if(flagFalling){
        verticalOffset = 1.4;
    }
    meshMove();
    checkBoundaries();

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

        modelViewMatrix = mult(translate(horizontalOffset, verticalOffset, 0.0), lookAt(eye, at , up));
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length);
    requestAnimationFrame(render);
}
};
perspectiveExample();
