function runApp() {
    var canvas = document.getElementById("canvas-id"),
        app = new ThreejsApp( { canvas : canvas } );

    c_width = canvas.width;
    c_height = canvas.height;

    app.configureHook = configure;
    app.loadSceneHook = load;
    app.drawSceneHook = render;

    $( "#canvas-id" )
        .mousedown( handleMouseDown )
        .mouseup( handleMouseUp )
        .mousemove( handleMouseMove );

    app.run();
}

$( document ).keypress( function(event) {

    var o = 111,
        p = 112;

    if (event.which === o) {
        moveablePartsIndex = (++moveablePartsIndex) % moveableParts.length;
    }

    if (event.which === p) {
        g_picking = !g_picking;
    }

});

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

var halfWidth, 
    halfHeight,

    scene,
    camera,

    head, 
    body,
    leftHip,
    rightHip,
    leftLeg, 
    rightLeg, 
    leftShoulder, 
    rightShoulder, 
    leftArm, 
    rightArm,

    moveableParts = [],
    transformFunctions = [],
    moveablePartsIndex = 0,

    // milliseconds
    animationRate = 15,
    initialTime = (new Date()).getTime(),
    elapsedTime,
    sceneTime = 0.0,

    projector,

    g_leftMouseButton,
    g_middleMouseButton,
    g_rightMouseButton,
    g_lastPosition,
    g_picking = false;

function configure() {
    halfWidth = c_width / 2;
    halfHeight = c_height / 2;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, c_width/c_height, 1, 1000);

    renderer.setSize(c_width, c_height);

    projector = new THREE.Projector();

    g_leftMouseButton = false;
    g_middleMouseButton = false;
    g_rightMouseButton = false;
    g_lastPosition = new THREE.Vector2();
}

function load() {
    var headRadius = 5,
        headGeometry = new THREE.SphereGeometry( headRadius, 32, 32 ),
        headMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } ),

        bodyRadius = 10,
        bodyHeight = 25,
        bodyGeometry = new THREE.CylinderGeometry( bodyRadius, bodyRadius, bodyHeight ),
        bodyMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),

        legRadius = 3,
        legHeight = 25,
        legGeometry = new THREE.CylinderGeometry( legRadius, legRadius, legHeight ),
        legMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } ),

        armRadius = 3,
        armHeight = 30,
        armGeometry = new THREE.CylinderGeometry( armRadius, armRadius, armHeight ),
        armMaterial = new THREE.MeshBasicMaterial( { color: 0x00ffff } ),

        translationMat = new THREE.Matrix4();

    head = new THREE.Mesh( headGeometry, headMaterial );
    body = new THREE.Mesh( bodyGeometry, bodyMaterial );
    leftLeg = new THREE.Mesh( legGeometry, legMaterial );
    rightLeg = new THREE.Mesh( legGeometry, legMaterial );
    leftArm = new THREE.Mesh( armGeometry, armMaterial );
    rightArm = new THREE.Mesh( armGeometry, armMaterial );
    leftHip = new THREE.Object3D();
    rightHip = new THREE.Object3D();
    leftShoulder = new THREE.Object3D();
    rightShoulder = new THREE.Object3D();

    body.add( head );
    body.add( leftHip );
    body.add( rightHip );
    body.add( leftShoulder );
    body.add( rightShoulder );

    leftHip.add( leftLeg );
    rightHip.add( rightLeg );

    leftShoulder.add( leftArm );
    rightShoulder.add( rightArm );

    translationMat.makeTranslation( 0, (bodyHeight / 2) + headRadius, 0 );
    head.applyMatrix( translationMat );

    translationMat.makeTranslation( -bodyRadius + legRadius, (-bodyHeight / 2), 0 );
    leftHip.applyMatrix( translationMat );

    translationMat.makeTranslation( bodyRadius - legRadius, (-bodyHeight / 2), 0 );
    rightHip.applyMatrix( translationMat );

    translationMat.makeTranslation( 0, -(legHeight / 2), 0 );
    leftLeg.applyMatrix( translationMat );

    translationMat.makeTranslation( 0, -(legHeight / 2), 0 );
    rightLeg.applyMatrix( translationMat );

    translationMat.makeTranslation( 0, -armHeight/2, 0 );
    leftArm.applyMatrix( translationMat );
    rightArm.applyMatrix( translationMat );

    translationMat.makeTranslation( -bodyRadius, bodyHeight/2, 0 );
    leftShoulder.applyMatrix( translationMat );

    translationMat.makeTranslation( bodyRadius, bodyHeight/2, 0 );
    rightShoulder.applyMatrix( translationMat );

    scene.add(body);

    camera.position.setZ(120);

    moveableParts = [body, leftHip, rightHip, leftShoulder, rightShoulder];

    var xyRotation = function(deltaPos) {
        var quaternion = new THREE.Quaternion();

        if (g_leftMouseButton) {
            if ( Math.abs(deltaPos.x) > Math.abs(deltaPos.y) ) {

                quaternion.setFromAxisAngle( camera.up, Math.radians( deltaPos.x ) );
            } 
            else {
                var rightAxis = getCameraRightAxis(camera);

                quaternion.setFromAxisAngle( rightAxis, Math.radians( deltaPos.y ) );
            }
        }

        return quaternion;
    };

    var xRotation = function(deltaPos) {
        var quaternion = new THREE.Quaternion();

        if (g_leftMouseButton) {
            var delta = Math.abs(deltaPos.x) > Math.abs(deltaPos.y) ? deltaPos.x : deltaPos.y,
                rightAxis = getCameraRightAxis(camera);

            quaternion.setFromAxisAngle( rightAxis , Math.radians( delta ) );
        }

        return quaternion;
    };

    transformFunctions = [xyRotation, xRotation, xRotation, xyRotation, xyRotation];
}

function getCameraRightAxis(cam) {
    var rightAxis = new THREE.Vector3(), 
        lookAtVector = getCameraLookAt(cam);

    rightAxis.crossVectors( lookAtVector, cam.up );

    return rightAxis;
}

function getCameraLookAt(cam) {
    var lookAtVector = new THREE.Vector3(0, 0, -1);

    lookAtVector.applyQuaternion( cam.quaternion );

    return lookAtVector;
}

function render() {
    var steps = Math.floor( elapsedTime / animationRate );

    elapsedTime = ( (new Date()).getTime() - initialTime );
    if (elapsedTime < animationRate) {
        return;
    }

    while(steps > 0) {
        animate();
        renderer.render(scene, camera);
        steps -= 1;
    }

    initialTime = (new Date()).getTime();
}

function animate() {
    sceneTime += 33/1000;
}

function transformWithRespectToA(transform, A) {
    var resultingMatrix = new THREE.Matrix4(),
        inverseA = new THREE.Matrix4();

    inverseA.getInverse(A);
    resultingMatrix.multiply(A).multiply(transform).multiply(inverseA);

    return resultingMatrix;
}

function handleMouseDown(event) {
    switch(event.which)
    {
        case 1:
            g_leftMouseButton = true;

            if ( g_picking ) {
                var mouseVector = new THREE.Vector3();
                mouseVector.x = 2 * (event.pageX / c_width) - 1;
                mouseVector.y = 1 - 2 * ( event.pageY / c_height );

                var ray = projector.pickingRay( mouseVector.clone(), camera );

                var intersects = ray.intersectObjects( moveableParts, true );

                if ( intersects.length > 0 ) {
                    if( intersects[0].object !== body ) {
                        moveablePartsIndex = moveableParts.indexOf(intersects[0].object.parent);
                    }
                    else {
                        moveablePartsIndex = moveableParts.indexOf(intersects[0].object);
                    }
                }

                g_picking = false;
            }

            break;
        case 2:
            g_middleMouseButton = true;
            break;
        case 3:
            g_rightMouseButton = true;
            break;
        default:
            break;
    }
}

function handleMouseUp(event) {
    switch(event.which)
    {
        case 1:
            g_leftMouseButton = false;
            break;
        case 2:
            g_middleMouseButton = false;
            break;
        case 3:
            g_rightMouseButton = false;
            break;
        default:
            break;
    }
}

function handleMouseMove(event) {
    var currentPosition = new THREE.Vector2(event.pageX, event.pageY);

    if (g_leftMouseButton || g_middleMouseButton || g_rightMouseButton) {
        var diffPos = new THREE.Vector2();
            rotationMatrix = new THREE.Matrix4();

        diffPos.subVectors( currentPosition, g_lastPosition );

        rotateMovablePart(diffPos);
    }

    g_lastPosition = currentPosition;
}

function rotateMovablePart(deltaPos) {
    if (moveablePartsIndex != -1) {
        var transformFunction = transformFunctions[moveablePartsIndex],
            objectRotationFrame = new THREE.Matrix4(),
            objectToRotate = moveableParts[moveablePartsIndex];

        var rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion( transformFunction(deltaPos) );

        objectRotationFrame.copyPosition( objectToRotate.matrix );
        objectRotationFrame.extractRotation( camera.matrix );

        objectToRotate.applyMatrix( transformWithRespectToA( rotationMatrix, objectRotationFrame ) );
    }
}