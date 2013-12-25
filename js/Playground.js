var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_MViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'void main() {\n' +
//    '   gl_Position = a_Position;\n' +
    '   gl_Position = u_ProjMatrix * u_MViewMatrix * a_Position;\n' +
    '   gl_PointSize = 10.0;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '   gl_FragColor = u_FragColor;\n' +
    '}\n';

function main() {
    var canvasId = "canvas-id";
    var canvas = document.getElementById(canvasId);

    var position = vec3.fromValues(200.0, 200.0, 0.0);
    var speed = vec3.fromValues(0.0, 0.0, 0.0);
    var acceleration = vec3.fromValues(0.0, 0.0, 0.0);

    var mousePosition = vec3.create();
    vec3.copy(mousePosition, position);

    $('#webgl').mousemove( function(event) {
        mousePosition[0] = event.pageX;
        mousePosition[1] = canvas.width - event.pageY;
    } );

    var gl = Utils.getGLContext(canvasId);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    var numberOfVertices = 1;
    var vertexBuffer = initVertexBuffers(gl, position);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_Position);

    var u_FragColor =  gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    var color = vec4.fromValues(1.0, 0.0, 0.0, 1.0);

    gl.uniform4fv(u_FragColor, color);

    var u_MViewMatrix = mat4.create();
    mat4.translate(u_MViewMatrix, u_MViewMatrix, [-200, -200, -1]);

    var u_ProjMatrix = mat4.create();
    mat4.ortho(u_ProjMatrix,-200, 200, -200, 200, 1, 100);

    var u_MViewMatrixLocation = gl.getUniformLocation(gl.program, 'u_MViewMatrix');
    var u_ProjMatrixLocation = gl.getUniformLocation(gl.program, 'u_ProjMatrix');

    gl.uniformMatrix4fv(u_MViewMatrixLocation, false, u_MViewMatrix);
    gl.uniformMatrix4fv(u_ProjMatrixLocation, false, u_ProjMatrix);

    var render = function() {
        window.requestAnimationFrame(render, canvas);

        update(gl, vertexBuffer, position, speed, acceleration, mousePosition);

        draw(gl, numberOfVertices, canvas.width, canvas.height);
    }

    render();
}

function initShaders(gl, vertexShader, fragmentShader) {
    return false;
}

function initVertexBuffers(gl, vertexData) {
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return;
    }

    uploadBufferData(gl, vertexBuffer, vertexData);

    return vertexBuffer;
}

function uploadBufferData(gl, buffer, bufferData) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
}

function limitValue(value, limit) {
    if (value[0] >= 0) {
        value[0] = Math.min(value[0], limit);
    }
    else {
        value[0] = Math.max(value[0], -limit);
    }
}
function update( gl, positionBuffer, position, speed, acceleration, mousePosition ) {
    var direction = vec3.create();
    vec3.subtract(direction, mousePosition, position);
    vec3.normalize(direction, direction);
    vec3.scale(acceleration, direction, 0.5);

    vec3.add(speed, speed, acceleration);

    var limit = .01;

    limitValue(speed[0], limit);
    limitValue(speed[1], limit);

    vec3.add(position, position, speed);

    uploadBufferData(gl, positionBuffer, position);
}

function draw(gl, numberOfVertices, width, height) {
    gl.viewport(0, 0, width, height)
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, numberOfVertices);
}