var THREE = require('three');
var Brush = require('./lib/brush.js');
var CSG = require('./lib/csg.js');

var container;
var scene, camera, renderer;
var plane, rollOverMesh, rollOverMaterial, currentGeometry, currentMaterial;
var raycaster, mouse;
var objects;
var selectedObjects, selectedObjectIndex, maxNumberOfSelectedObjects, numberOfSelectedObjects, selectedMaterial;
var isShiftDown;

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff );
    container.appendChild( renderer.domElement );

    var $documentElement = $( document );
    $documentElement.resize( onResize );
    $documentElement.mousemove( onMouseMove );
    $documentElement.click( onMouseClick );
    $documentElement.keydown( onKeyDown );
    $documentElement.keyup( onKeyUp );
    $documentElement.keypress( onKeyPress );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 5, 5, 5 );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    currentGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    currentGeometry.computeBoundingBox();
    currentMaterial = new THREE.MeshPhongMaterial({
       color: 0xff0000
    });

    rollOverMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        opacity: 0.5,
        transparent: true
    });
    rollOverMesh = new THREE.Mesh( currentGeometry, rollOverMaterial );

    selectedMaterial = new THREE.MeshPhongMaterial({
       color: 0x0000ff
    });

    objects = [];

    maxNumberOfSelectedObjects = 2;
    numberOfSelectedObjects = 0;
    selectedObjects = [];
    for (var i = 0; i < maxNumberOfSelectedObjects; i++){
        selectedObjects.push( null );
    }
    selectedObjectIndex = 0;

    plane = createGrid( 1, 50 );

    objects.push( plane );

    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 1, 0.75, 1 );
    scene.add( directionalLight );

    scene.add( plane );
    scene.add( rollOverMesh );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    isShiftDown = false;
}

function onMouseMove ( event ) {
    event.preventDefault();

    // Put the mouse coordinates in Normalized Device Coordinates
    // -1 to 1
    mouse.set( event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObject( plane );

    if ( intersects.length > 0 ) {
        var intersect = intersects[0];


        rollOverMesh.position.copy( intersect.point ).add( intersect.object.up.clone().multiplyScalar( currentGeometry.boundingBox.size().y / 2 ) );
    }
}

function onMouseClick( event ) {
    event.preventDefault();

    mouse.set( event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1 );

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {
        var intersect = intersects[0];

        if( isShiftDown ) {
            if ( intersect.object != plane ) {
                scene.remove( intersect.object );

                objects.splice( objects.indexOf( intersect.object ), 1 );
            }
        }
        else {
            if ( intersect.object == plane ) {
                var shape = new THREE.Mesh(currentGeometry, currentMaterial);
                shape.position.copy(intersect.point).add(intersect.object.up.clone().multiplyScalar(currentGeometry.boundingBox.size().y / 2));
                objects.push(shape);
                scene.add(shape);
            }
            else {
                objectClicked( intersect.object );
            }
        }
    }
}

function onKeyDown( event ) {
    isShiftDown = event.shiftKey;
}

function onKeyUp() {
    isShiftDown = false;
}

function unionSelectedObjects() {
    if ( numberOfSelectedObjects < 1 ) {
        console.log("Need at least two objects selected before you can union them!");
        return;
    }

    var currentObject = selectedObjects[0];
    var currentGeometry = currentObject.geometry.clone();
    currentGeometry.applyMatrix(currentObject.matrix);
    var resultingBrush = Brush.fromGeometry( currentGeometry );

    for (var i = 1; i < numberOfSelectedObjects; i++) {
        currentObject = selectedObjects[i];
        currentGeometry = currentObject.geometry.clone();
        currentGeometry.applyMatrix(currentObject.matrix);
        resultingBrush = CSG.union( resultingBrush, Brush.fromGeometry( currentGeometry ) );
    }

    var length = numberOfSelectedObjects;
    for (i = 0; i < length; i++) {
        currentObject = selectedObjects[i];
        deselectFromIndex(i);
        scene.remove( currentObject );
        objects.splice( objects.indexOf( currentObject ), 1 );
    }

    var geometry = Brush.toGeometry( resultingBrush );
    var object = new THREE.Mesh( geometry, currentMaterial );
    object.position.add(plane.up.clone().multiplyScalar(geometry.boundingBox.size().y / 2));

    select( object );
    scene.add( object );
    objects.push( object );
}

function onKeyPress( event ) {
    switch (event.keyCode) {
        case 117:
            unionSelectedObjects();
            break;
        default:
            break;
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function createGrid(step, size) {
    var geometry = new THREE.Geometry();

    for (var i = -size; i <= size; i += step) {
        geometry.vertices.push(new THREE.Vector3(-size, 0, i));
        geometry.vertices.push(new THREE.Vector3(size, 0, i));

        geometry.vertices.push(new THREE.Vector3(i, 0, -size));
        geometry.vertices.push(new THREE.Vector3(i, 0, size));
    }

    var material = new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.2,
        transparent: true
    });

    return  new THREE.Line(geometry, material, THREE.LinePieces);
}

function deselect(object) {
    var index = selectedObjects.indexOf(object);
    selectedObjects[index].material = currentMaterial;
    selectedObjects[index] = null;
    numberOfSelectedObjects--;
}

function deselectFromIndex(index) {
    selectedObjects[index].material = currentMaterial;
    selectedObjects[index] = null;
    numberOfSelectedObjects--;
}

function freeSpaceInSelectedObjectList() {
    for (var i = 0; i < maxNumberOfSelectedObjects; i++) {
        if (selectedObjects[i] === null) {
            return i;
        }
    }
    return -1;
}

function oldestSelectedObjectIndex() {
    return (selectedObjectIndex + 1) % maxNumberOfSelectedObjects;
}

function select(object) {
    var index = freeSpaceInSelectedObjectList();
    if ( index === -1 ) { // no free space
        index = oldestSelectedObjectIndex();
        selectedObjects[index].material = currentMaterial;
    }
    else {
        numberOfSelectedObjects++;
    }
    selectedObjectIndex = index;
    selectedObjects[index] = object;
    object.material = selectedMaterial;
}

function isSelected(object) {
    return selectedObjects.indexOf(object) !== -1;
}

function objectClicked( object ) {
    
    if( isSelected(object) ) {
        deselect(object);
    }
    else {
        select(object);
    }
}

function render() {
    requestAnimationFrame( render );

    renderer.render(scene, camera);
}

$( document ).ready(function() {
    init();
    render();
});