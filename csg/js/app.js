var container;
var scene, camera, renderer;
var plane, cube;

function init() {
    container = document.createElement('div');
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff );
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(5, 5, 5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cube = new THREE.Mesh( geometry, material );

    plane = createGrid(1, 50);

    scene = new THREE.Scene();
    scene.add( cube );
    scene.add( plane );
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

    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;

    renderer.render(scene, camera);
}

init();
render();