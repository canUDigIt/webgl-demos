(function() {
    var gl = null,
        m4 = twgl.m4,
        width = 0,
        height = 0,
        eye = [2, 0, 0],
        target = [0, 0, 0],
        programInfo = {},
        uniforms = {
            u_modelViewPerspectiveMatrix: m4.inverse(m4.lookAt(eye, target, [0, 1, 0])),
            u_cameraLightPosition: [1, 1, 0],
            u_cameraEyePosition: eye,
            u_diffuseSpecularAmbientShininess: [0.9, 0.9, 0.2, 100],
            u_sphereRadius: 1,
            u_oneOverTwoPi: 1.0 / (2 * Math.PI),
            u_oneOverPi: 1.0 / Math.PI
        },
        sphereBufferInfo = {};

    function runApp() {
        var canvasName = "canvas-id",
            canvas = document.getElementById(canvasName);

        gl = twgl.getWebGLContext(canvas);
        width = canvas.width;
        height = canvas.height;
        programInfo = twgl.createProgramInfo(gl, ["shader-vs", "shader-fs"]);

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
        uniforms.u_texture = twgl.createTexture(gl, { src: "images/2_no_clouds_4k.jpg" });
    }

    function render() {
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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