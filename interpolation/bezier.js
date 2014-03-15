(function () {

	window.runApp = function() {
		var canvas = document.getElementById("canvas-id"),
			app = new ThreejsApp( { canvas: canvas } );

		c_width = canvas.width;
		c_height = canvas.height;

		app.configureHook = configure;
		app.loadSceneHook = load;
		app.drawSceneHook = render;

		app.run();
	};

	var scene,
		camera;

	function configure() {
		scene = new THREE.Scene();
		camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0, 100);
	}

	function load() {
		var numSegments = 50,
			c0 = new THREE.Vector3(-4, 0, 0),
			d0 = new THREE.Vector3(-3, 4, 0),
			e0 = new THREE.Vector3(3, 4, 0),
			c1 = new THREE.Vector3(4, 0, 0),
			bezierGeometry = createBezierGeometry(c0, d0, e0, c1, numSegments);
			bezierMaterial = new THREE.LineBasicMaterial( {color: 0xff0000} );

		var bezier = new THREE.Line( bezierGeometry, bezierMaterial );

		scene.add(bezier);

		camera.position.z = 5;
	}

	function createBezierGeometry(c0, d0, e0, c1, numberOfSegments) {
		var bezierGeometry = new THREE.Geometry();

		bezierGeometry.vertices.push(c0);

		var increment = 1 / numberOfSegments;
		for (var t = increment; t < 1; t += increment) {
			var oneMinusT = (1 - t),
				f = new THREE.Vector3().addVectors( multiplyScalarCopy(c0, oneMinusT), multiplyScalarCopy(d0, t) ),
				g = new THREE.Vector3().addVectors( multiplyScalarCopy(d0, oneMinusT), multiplyScalarCopy(e0, t) ),
				h = new THREE.Vector3().addVectors( multiplyScalarCopy(e0, oneMinusT), multiplyScalarCopy(c1, t) ),
				m = new THREE.Vector3().addVectors( multiplyScalarCopy(f, oneMinusT), multiplyScalarCopy(g, t) ),
				n = new THREE.Vector3().addVectors( multiplyScalarCopy(g, oneMinusT), multiplyScalarCopy(h, t) ),
				ct = new THREE.Vector3().addVectors( multiplyScalarCopy(m, oneMinusT), multiplyScalarCopy(n, t) );
				
				bezierGeometry.vertices.push( ct );
		}
		
		bezierGeometry.vertices.push(c1);

		return bezierGeometry;
	}

	function multiplyScalarCopy(vector, scalar) {
		var vectorCopy = new THREE.Vector3();
		vectorCopy.copy(vector).multiplyScalar(scalar);
		return vectorCopy;
	}

	function render() {
		renderer.render(scene, camera);
	}

}());