var container;
var scene, camera, renderer;
var plane, rollOverMesh, rollOverMaterial, currentGeometry, currentMaterial;
var raycaster, mouse;
var objects;
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
    $documentElement.click( onMouseDown );
    $documentElement.keydown( onKeyDown );
    $documentElement.keyup( onKeyUp );

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

    objects = [];

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

function onMouseDown( event ) {
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
            var shape = new THREE.Mesh( currentGeometry, currentMaterial );
            shape.position.copy( intersect.point ).add( intersect.object.up.clone().multiplyScalar( currentGeometry.boundingBox.size().y / 2 ) );
            objects.push( shape );
            scene.add( shape );
        }
    }
}

function onKeyDown( event ) {
    isShiftDown = event.shiftKey;
}

function onKeyUp() {
    isShiftDown = false;
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function createGrid(step, size) {
    var geometry = new THREE.Geometry();

    for(var i = -size; i <= size; i += step) {
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

function render() {
    requestAnimationFrame( render );

    renderer.render(scene, camera);
}

$( document ).ready(function() {
    init();
    render();
});