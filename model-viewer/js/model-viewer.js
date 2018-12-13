(function(){
    const vs = `#version 300 es
        precision mediump float;

        in vec4 position;
        in vec4 normal;
        in vec2 texcoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat4 uNMatrix;

        out vec4 eyePosition;
        out vec4 eyeNormal;
        out vec2 uv;

        void main()
        {
           gl_Position = uPMatrix * uMVMatrix * position;

           eyePosition = uMVMatrix * position;
           eyeNormal = uNMatrix * normal;
           uv = texcoord;
        }
    `;

    const fs = `#version 300 es
        precision mediump float;

        in vec4 eyePosition;
        in vec4 eyeNormal;
        in vec2 uv;

        uniform vec3 uLightDirection;
        uniform mat4 uMVMatrix;
        uniform sampler2D uDiffuse;

        vec4 ambient = vec4(0.2, 0.2, 0.2, 1.0);
        vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);

        out vec4 color;

        void main()
        {
            vec4 diffuse = texture(uDiffuse, vec2(uv.s, 1.0 - uv.t));

            vec4 eyeLightDirection = uMVMatrix * vec4(uLightDirection, 0.0);
            vec4 L = normalize(eyeLightDirection);

            vec4 norm = normalize(eyeNormal);

            float intensity = max(0.0, dot(norm, L));
            vec4 lightIntensity = intensity * lightColor;

            color = (lightIntensity + ambient) * diffuse;
        }
    `;
    function runApp() {
        const gl = document.getElementById("c").getContext("webgl2");
        const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
        const m4 = twgl.m4;
        const v3 = twgl.v3;

        const fovRadians = Math.PI / 4;
        const near = 0.1;
        const far = 100.0;
        const minDistance = 2;
        const maxDistance = 25;
        const minPitch = -89 * (Math.PI / 180);
        const maxPitch = 89 * (Math.PI / 180);
        const rotationSpeed = 1 / 100;
        const zoomSpeed = 1 / 250;

        let objects = [];

        let aspectRatio = gl.canvas.width / gl.canvas.height;
        let perspective = m4.perspective(fovRadians, aspectRatio, near, far);
        let camera = m4.identity();
        let worldUp = v3.create(0, 1, 0);
        let target = v3.create(0, 0, 0);
        let distance = 5;
        let yaw = 0;
        let pitch = 0;
        let roll = 0;

        gl.enable(gl.DEPTH_TEST);

        let uniforms = {};
        uniforms.uPMatrix = perspective;

        let textures = twgl.createTextures(gl, {
            diffuse: {src: "models/Final_Pokemon_Diffuse.jpg"}
        },
        function(err, textures, sources) {
            if (!err) { 
                uniforms.uDiffuse = textures.diffuse;
            }
            else {
                console.log("Couldn't create texture for " + sources.diffuse.src);
            }
        });

        const myRequest = new Request('models/Pokemon.json');

        fetch(myRequest)
            .then(function(response) { return response.json(); })
            .then(function(json) {
                json.meshes.forEach(function(mesh) {
                    const arrays = {
                        position: mesh.vertices,
                        texcoord: mesh.texturecoords[0],
                        normal: mesh.normals,
                        indices: []
                    };

                    mesh.faces.forEach(function(face) {
                        arrays.indices.push(face[0]);
                        arrays.indices.push(face[1]);
                        arrays.indices.push(face[2]);
                    });

                    objects.push({
                        programInfo: programInfo,
                        bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays)
                    });
                });
            });

        let dragging = false;
        let startX = 0, startY = 0;
        gl.canvas.addEventListener("mousedown", function (event) {
            event.preventDefault();
            startX = event.pageX;
            startY = event.pageY;
            dragging = true;
        });

        gl.canvas.addEventListener("mouseup", function(event) {
            event.preventDefault();
            dragging = false;
        });

        gl.canvas.addEventListener("mouseout", function(event) {
            event.preventDefault();
            dragging = false;
        });

        gl.canvas.addEventListener("mousemove", function(event) {
            event.preventDefault();
            if (dragging) {
                deltaX = event.pageX - startX;
                deltaY = event.pageY - startY;
                startX = event.pageX;
                startY = event.pageY;
                pitch = clamp(minPitch, pitch - deltaY * rotationSpeed, maxPitch);
                yaw -= deltaX * rotationSpeed;
            }
        });

        gl.canvas.addEventListener("wheel", function(event){
            const delta = event.deltaY * zoomSpeed;
            distance = clamp(minDistance, distance - delta, maxDistance);
            event.preventDefault();
        });

        function clamp(min, x, max) {
            return Math.min(Math.max(min, x), max);
        }

        requestAnimationFrame(render);

        function yawPitchRoll() {
            const rotation = m4.identity();
            m4.rotateY(rotation, yaw, rotation);
            m4.rotateX(rotation, pitch, rotation);
            m4.rotateZ(rotation, roll, rotation);
            return rotation;
        }

        function render(time) {
            time *= 0.001; // change from ms to seconds

                if (objects && objects.length) { 
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0, 0, 0, 1);
                gl.clear(gl.COLOR_BUFFER_BIT);

                const R = yawPitchRoll();
                const T = m4.transformPoint(R, v3.create(0, 0, distance));
                const position = v3.add(target, T);

                const look = v3.create();
                v3.subtract(target, position, look);
                v3.normalize(look, look);

                const right = v3.create();
                v3.cross(look, worldUp, right);

                const up = v3.create();
                v3.cross(right, look, up);

                const view = m4.create();
                m4.lookAt(position, target, worldUp, view);

                const lightPosition = v3.add(position, v3.create(0, 5, 0));

                uniforms.uMVMatrix = m4.inverse(view);
                uniforms.uNMatrix = m4.transpose(view);
                uniforms.uLightDirection = v3.subtract(target, lightPosition);

                gl.useProgram(programInfo.program);
                twgl.setUniforms(programInfo, uniforms);
                twgl.drawObjectList(gl, objects);
            } 

            requestAnimationFrame(render);
        }
    }

    runApp();
})();
