function runApp() {
	var scene = new THREE.Scene();
	var canvas = document.getElementById("canvas-id");
	var camera = new THREE.PerspectiveCamera( 75, canvas.width/canvas.height, 0.1, 1000 );

	var renderer = new THREE.WebGLRenderer( { canvas: canvas } );

	var geometry = new THREE.SphereGeometry( 1, 32, 32 );

	var uniforms = {
		u_LightPosition: { 
			type: "v3", 
			value: new THREE.Vector3() 
		},
		u_DiffuseSpecularAmbientShininess: {
			type: "v4",
			value: new THREE.Vector4( 0.7, 0.3, 0.0, 10.0 )
		}
	}
	var material = new THREE.ShaderMaterial( { 
		vertexShader: document.getElementById("shader-vs").textContent,
		fragmentShader: document.getElementById("shader-fs").textContent,

		uniforms: uniforms
	} );
	var sphere = new THREE.Mesh( geometry, material );

	scene.add( sphere );

	camera.position.z = 5;

	uniforms.u_LightPosition.value = camera.position;

	var render = function () {
		requestAnimationFrame( render );

		renderer.render(scene, camera);
	};

	render();	
}