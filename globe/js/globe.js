(function() {
	var gl = null,
		m4 = twgl.m4;
		width = 0,
		height = 0,
		programInfo = {},
		uniforms = {
			u_modelViewPerspectiveMatrix: m4.identity(),
			u_cameraLightPosition: [1, 2, -2],
			u_cameraEyePosition: [0, 0, 1],
			u_diffuseSpecularAmbientShininess: [0.5, 0.6, 0.2, 100]
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
		sphereBufferInfo = twgl.primitives.createSphereBufferInfo(gl, 1.0, 20.0, 10.0);
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