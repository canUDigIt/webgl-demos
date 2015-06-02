(function() {
    var gl = null,
        m4 = twgl.m4,
        v3 = twgl.v3,
        width = 0,
        height = 0,
        eye = [2, 0, 0],
        target = [0, 0, 0],
        lightPos = [2, 2, 0],
        programInfo = {},
        uniforms = {
            u_modelViewPerspectiveMatrix: m4.inverse(m4.lookAt(eye, target, [0, 1, 0])),
            u_cameraLightPosition: [2, 2, 0],
            u_cameraEyePosition: eye,
            u_diffuseSpecularAmbientShininess: [0.9, 0.9, 0.1, 100],
            u_sphereRadius: 1,
            u_oneOverTwoPi: 1.0 / (2 * Math.PI),
            u_oneOverPi: 1.0 / Math.PI
        },
        sphereBufferInfo = {},
        rotateStart = [0, 0, 0],
        rotateEnd = [0, 0, 0],
        rotationSpeed = 0.01,
        theta = Math.atan2(lightPos[0], lightPos[2]),
        phi = Math.atan2(Math.sqrt(lightPos[0] * lightPos[0] + lightPos[2] * lightPos[2]), lightPos[1]),
        thetaDelta = 0,
        phiDelta = 0
        maxTheta = 2 * Math.PI,
        minTheta = 0,
        minPhi = -Math.PI / 2.0,
        maxPhi = Math.PI / 2.0,
        updateLight = false;

    function runApp() {
        var canvasName = "canvas-id",
            canvas = document.getElementById(canvasName);

        gl = twgl.getWebGLContext(canvas);
        width = canvas.width;
        height = canvas.height;
        programInfo = twgl.createProgramInfo(gl, ["shader-vs", "shader-fs"]);

        canvas.addEventListener("mousedown", function(event) {
            rotateStart = [event.pageX, event.pageY, 0];
            addEventListener("mousemove", dragged);
            addEventListener("mouseup", mouseUp);
            event.preventDefault();
            updateLight = true;
        });

        function dragged(event) {
            rotateEnd = [event.pageX, event.pageY, 0];
            var rotateDelta = v3.subtract(rotateEnd, rotateStart);
            thetaDelta = 2 * Math.PI * (rotateDelta[0] / canvas.width) * rotationSpeed;
            phiDelta = Math.PI * (rotateDelta[1] / canvas.height) * rotationSpeed;
        }

        function mouseUp(event) {
            removeEventListener("mousemove", dragged);
            removeEventListener("mouseup", mouseUp);
            updateLight = false;
        }

        function renderLoop(time) {
            requestAnimationFrame(renderLoop);
            render();
        }

        configure();
        load();

        renderLoop();
    }

    function configure() {
        twgl.setAttributePrefix("a_");
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    function load() {
        sphereBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 2.0);
        //uniforms.u_texture = twgl.createTexture(gl, { src: "images/2_no_clouds_4k.jpg" });
        uniforms.earthcolor = twgl.createTexture(gl, { src: "images/earthcolor.jpg" });
        uniforms.oceanmask = twgl.createTexture(gl, { src: "images/oceanmask.jpg" });
    }

    function render() {
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (updateLight) {
            var radius = 2;
            theta += thetaDelta;
            phi += phiDelta;

            theta = Math.max( minTheta, Math.min( maxTheta, theta ) );
            phi  = Math.max( minPhi, Math.min( maxPhi, phi ) );

            var x = radius * Math.sin(phi) * Math.sin(theta);
            var y = radius * Math.cos(phi);
            var z = radius * Math.sin(phi) * Math.cos(theta);
            uniforms.u_cameraLightPosition = [x, y, z];
        }

        gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);
        twgl.setUniforms(programInfo, uniforms);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, sphereBufferInfo);
    }

    function handleContextLost(event) {
        event.preventDefault();
    }

    function handleContextRestored(event) {
        gl = twgl.getWebGLContext(canvas);
    }

    $(document).ready(function() {
        runApp();
    });
    
}());