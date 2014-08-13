function runApp() {
	var canvas = document.getElementById("canvas-id"),
		app = new WebGLApp(canvas);

	c_width = canvas.width;
	c_height = canvas.height;

	app.configureGLHook = configure;
	app.loadSceneHook = load;
	app.drawSceneHook = render;

	app.run();
}

function configure() {
	gl.clearColor(0.2, 0.2, 0.2, 1.0);
	gl.clearDepth(1.0);

	camera = new Camera(ORBIT);
	camera.setFocus([0.0, 0.0, 0.0]);
	camera.setAzimuth(cameraAzimuth);
	camera.setElevation(cameraElevation);

	var interactor = new CameraInteractor(camera, document.getElementById("canvas-id"));

	var light = new Light();
	light.setPosition([25, 25, 10]);
	light.setAmbient([0.1, 0.1, 0.1]);
	light.setDifuse([0.5, 0.5, 0.5]);
	light.setSpecular([0.4, 0.4, 0.4]);

	Lights.add(light);
}

function load() {
	globe = loadGlobe();
}

function render() {
	gl.viewport(0, 0, c_width, c_height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	update(globe);
	draw(globe);
}