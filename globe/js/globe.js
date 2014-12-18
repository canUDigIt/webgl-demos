var	eye,
	lightPosition,
	diffuse,
	specular,
	ambient,
	shininess,

	vbo,
	ibo,

	globeModelMatrix,
	perspectiveMatrix,
	viewMatrix;

function runApp() {
	var canvasName = "canvas-id",
		canvas = document.getElementById( canvasName ),
		app = new WebGLApp( canvasName );

	c_width = canvas.width;
	c_height = canvas.height;

	app.configureGLHook = configure;
	app.loadSceneHook = load;
	app.drawSceneHook = render;
	app.handleContextLostHook = handleContextLost;
	app.handleContextRestoredHook = handleContextRestored;

	app.run();
}

function configure() {
	eye = vec3.fromValues( 0, 5, 10 );
	var center = vec3.fromValues( 0, 0, 0 ),
		up = vec3.fromValues( 0, 1, 0 );

	lightPosition = vec3.create( [2, 2, -7] );

	// Diffuse, specular, ambient are user defined coefficients used to control the lighting
	// throughout the entire scene. They are percentages, so valid values are 0.0 - 1.0. 
	// Shininess is an integer exponent. Smaller numbers make large, dull specular highlights,
	// and high values create tight, sharp highlighs
	diffuse = 0.7;
	specular = 0.3;
	ambient = 0;
	shininess = 10;

	perspectiveMatrix = mat4.create();
	mat4.perspective( perspectiveMatrix, 45, c_width/c_height, 1, 1000 );

	viewMatrix = mat4.create();
	mat4.lookAt( viewMatrix, eye, center, up );

	globeModelMatrix = mat4.create();

	gl.clearColor( 0.2, 0.2, 0.2, 1.0 );
	gl.clearDepth( 1.0 );
}

function load() {
	globeGeometry = generateGlobeGeometry();

	vbo = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vbo );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(globeGeometry.vertices), gl.STATIC_DRAW );
	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	ibo = gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo );
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(globeGeometry.indices), gl.STATIC_DRAW );
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

	globeTexture = loadTexture();
	loadGlobeShadingProgram();
}

function generateGlobeGeometry() {
	var numberOfStacks = 10,
		numberOfSlices = 20,
		ellipseRadii = vec3.fromValues( 1, 1, 1 ),
		vertices = [];

	var i, j;

	// Top most point
	var x = 0,
		y = 0,
		z = ellipseRadii[2];

	vertices.push(x);
	vertices.push(y);
	vertices.push(z);

	// Middle section
	for ( i = 1; i < numberOfStacks; ++i ) {
		var phi = Math.PI * i / numberOfStacks,
			cosPhi = Math.cos( phi ),
			sinPhi = Math.sin( phi );

		for ( j = 0; j < numberOfSlices; ++j ) {
			var theta = 2 * Math.PI * j / numberOfSlices,
				cosTheta = Math.cos( theta ),
				sinTheta = Math.sin( theta );

				x = ellipseRadii[0] * cosTheta * sinPhi;
				y = ellipseRadii[1] * sinTheta * sinPhi;
				z = ellipseRadii[2] * cosPhi;

				vertices.push(x);
				vertices.push(y);
				vertices.push(z);
		}
	}

	// Last point at the bottom
	x = 0;
	y = 0;
	z = -ellipseRadii[2];

	vertices.push(x);
	vertices.push(y);
	vertices.push(z);

	var indices = [];

	// Triangles for the top row
	for ( j = 1; j < numberOfSlices; ++j ) {
		indices.push(0);
		indices.push(j);
		indices.push(j + 1);
	}

	indices.push(0);
	indices.push(numberOfSlices);
	indices.push(1);

	// Middle section triangles
	for ( i = 0; i < numberOfStacks - 2; ++i ) {
		var top = (i * numberOfSlices) + 1;
		var bottom = ((i + 1) * numberOfSlices) + 1;

		for ( j = 0; j < numberOfSlices - 1; ++j ) {
			indices.push(bottom + j);
			indices.push(bottom + j + 1);
			indices.push(top + j + 1);

			indices.push(bottom + j);
			indices.push(top + j + 1);
			indices.push(top + j);
		}
		indices.push(bottom + numberOfSlices - 1);
		indices.push(bottom);
		indices.push(top);

		indices.push(bottom + numberOfSlices - 1);
		indices.push(top);
		indices.push(top + numberOfSlices - 1);
	}

	// Triangles for bottom row
	var lastPosition = (vertices.length / 3) - 1;
	for ( j = lastPosition - 1; j > lastPosition - numberOfSlices; --j ) {
		indices.push(lastPosition);
		indices.push(j);
		indices.push(j - 1);
	}

	indices.push(lastPosition);
	indices.push(lastPosition - numberOfSlices);
	indices.push(lastPosition - 1);

	return {
		vertices: vertices,
		indices: indices,
		radii: ellipseRadii
	};
}

function loadTexture() {

}

function loadGlobeShadingProgram() {
	var attributes = [
			"a_Position"
		], 
		uniforms = [
			"u_MVMatrix",
			"u_PMatrix",
			"u_LightPosition",
			"u_EyePosition",
			"u_DiffuseSpecularAmbientShininess"
		];

	Program.load( attributes, uniforms );
}

function render() {
	gl.viewport( 0, 0, c_width, c_height );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	gl.useProgram( Program.programId );

	// gl.activeTexture(gl.TEXTURE0);
	// gl.bindTexture(gl.TEXTURE2D, globeTexture);
	// gl.uniform1i(Program.u_Texture0, 0);

	var mvMatrix = mat4.create();
	mat4.multiply( mvMatrix, viewMatrix, globeModelMatrix );
	gl.uniformMatrix4fv( Program.u_MVMatrix, false, mvMatrix );
	gl.uniformMatrix4fv( Program.u_PMatrix, false, perspectiveMatrix );

	gl.uniform3fv( Program.u_LightPosition, eye );
	gl.uniform3fv( Program.u_EyePosition, eye );

	var diffuseSpecularAmbientShininess = [
		diffuse,
		specular,
		ambient,
		shininess ];
	gl.uniform4fv( Program.u_DiffuseSpecularAmbientShininess, diffuseSpecularAmbientShininess );

	gl.bindBuffer( gl.ARRAY_BUFFER, vbo );
	gl.vertexAttribPointer( Program.a_Position, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( Program.a_Position );

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo );
	gl.drawElements( gl.TRIANGLES, globeGeometry.indices.length, gl.UNSIGNED_SHORT, 0 );
}

function handleContextLost(event) {
	event.preventDefault();
	app.stop();
}

function handleContextRestored(event) {
	gl = Utils.getGLContext(canvas);

	app.run();
}