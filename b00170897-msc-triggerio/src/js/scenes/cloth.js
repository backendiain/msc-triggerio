var CANNON = this.CANNON;
var Detector = this.Detector;

var dt = 1 / 60, R = 0.3;

var clothMass = 1;  // 1 kg in total
var clothSize = 1; // 1 meter
var Nx = 12;
var Ny = 12;
var mass = clothMass / Nx * Ny;

var restDistance = clothSize / Nx;

var ballSize = 0.1;

function plane(width, height) {
    return function(u, v) {
        var x = (u - 0.5) * width;
        var y = (v + 0.5) * height;
        var z = 0;
        return new THREE.Vector3(x, y, z);
    };
}

var clothFunction = plane(restDistance * Nx, restDistance * Ny);

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer;

var cloth_geometry;
var sphere_mesh, sphere_body;
var cloth;
var particles = [];
var world;

/*
initCannon();
initThree();
animate();
*/

function initCannon(){
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0, -9.82, 0);
    world.solver.iterations = 20;

    // Materials
    var cloth_material = new CANNON.Material();
    var sphere_material = new CANNON.Material();
    var cloth_sphere_contact_material = new CANNON.ContactMaterial( cloth_material,
                                                                  sphere_material,
                                                                  0.0, // friction coefficient
                                                                  0.0  // restitution
                                                                  );
    // Adjust constraint equation parameters for ground/ground contact
    cloth_sphere_contact_material.contactEquationStiffness = 1e9;
    cloth_sphere_contact_material.contactEquationRelaxation = 3;

    // Add contact material to the world
    world.addContactMaterial(cloth_sphere_contact_material);

    // Create sphere
    var sphere_shape = new CANNON.Sphere( ballSize * 1.3 );
    sphere_body = new CANNON.Body({
        mass: 0,
        shape: sphere_shape,
        position: {x:0, y:0, z:0}
    });
    world.add(sphere_body);

    // Create cannon particles
    for ( var i = 0, il = Nx + 1; i !== il; i++ ) {
        particles.push([]);
        for ( var j = 0, jl = Ny + 1; j !== jl; j++ ) {

            var idx = j * (Nx + 1) + i;
            var p = clothFunction( i / (Nx + 1), j / (Ny + 1));
            var particle = new CANNON.Body({
                mass: j == Ny ? 0 : mass
            });
            particle.addShape( new CANNON.Particle() );
            particle.linearDamping = 0.5;
            particle.position.set(
                p.x,
                p.y-Ny * 0.9 * restDistance,
                p.z
            );
            particles[i].push( particle );
            world.add( particle );
            particle.velocity.set( 0, 0, -0.1 * (Ny - j));
        }
    }
    function connect(i1,j1,i2,j2){
        world.addConstraint( new CANNON.DistanceConstraint(particles[i1][j1], particles[i2][j2], restDistance) );
    }
    for(var i = 0; i < Nx + 1; i++){
        for(var j = 0; j < Ny + 1; j++){
            if(i < Nx) connect( i, j, i + 1, j);
            if(j < Ny) connect(i, j, i, j + 1);
        }
    }
}

function initThree() {

    container = document.createElement( 'div' );
    document.getElementById('canvas').appendChild( container );

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 500, 10000 );

    // camera
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 );

    camera.position.set(
        Math.cos( Math.PI/4 ) * 3,
        0,
        Math.sin( Math.PI/4 ) * 3
    );

    scene.add( camera );

    var d = 5;

    // lights
    var light, materials;
    scene.add( new THREE.AmbientLight( 0x666666 ) );

    light = new THREE.DirectionalLight( 0xffffff, 1.75 );
    light.position.set( d, d, d );

    light.castShadow = true;

    light.shadowMapWidth = 1024*2;
    light.shadowMapHeight = 1024*2;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.shadowCameraFar = 3*d;
    light.shadowCameraNear = d;
    light.shadowDarkness = 0.5;

    scene.add( light );

    // cloth material

    THREE.ImageUtils.crossOrigin = '';
    var cloth_texture = THREE.ImageUtils.loadTexture( 'img/cloth-texture.jpg' ); // circuit_pattern.png
    cloth_texture.wrapS = cloth_texture.wrapT = THREE.RepeatWrapping;
    cloth_texture.anisotropy = 16;


    var cloth_material = new THREE.MeshPhongMaterial( {
        alphaTest: 0.5,
        ambient: 0x000000,
        color: 0xeeeeee,
        specular: 0x222222,
        emissive: 0x121212,
        //shininess: 5,
        map: cloth_texture,
        side: THREE.DoubleSide
    } );

    // cloth geometry
    cloth_geometry = new THREE.ParametricGeometry( clothFunction, Nx, Ny, true );
    cloth_geometry.dynamic = true;
    cloth_geometry.computeFaceNormals();

    // cloth mesh
    cloth = new THREE.Mesh(cloth_geometry, cloth_material);
    cloth.position.set(0, 0, 0);
    cloth.castShadow = true;
    //cloth.receiveShadow = true;
    scene.add( cloth );

    // sphere
    var ball_geo = new THREE.SphereGeometry( ballSize, 20, 20 );
    var ball_material = new THREE.MeshPhongMaterial( { color: 0x888888 } );

    sphere_mesh = new THREE.Mesh( ball_geo, ball_material );
    sphere_mesh.castShadow = true;
    sphere_mesh.receiveShadow = true;
    scene.add( sphere_mesh );


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( scene.fog.color );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;
    renderer.shadowMapEnabled = true;

    container.appendChild( renderer.domElement );
    camera.lookAt( sphere_mesh.position );

    window.addEventListener( 'resize', onWindowResize, false );
}

//

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    requestAnimationFrame( animate );
    world.step(dt);
    var t = world.time;
    sphere_body.position.set(R * Math.sin(t), R * Math.cos(t), 0);
    render();
}

function render() {

    for ( var i = 0, il = Nx + 1; i !== il; i++ ) {
        for ( var j = 0, jl = Ny + 1; j !== jl; j++ ) {
            var idx = j*(Nx + 1) + i;
            cloth_geometry.vertices[idx].copy(particles[i][j].position);
        }
    }

    cloth_geometry.computeFaceNormals();
    cloth_geometry.computeVertexNormals();

    cloth_geometry.normalsNeedUpdate = true;
    cloth_geometry.verticesNeedUpdate = true;

    sphere_mesh.position.copy(sphere_body.position);

    renderer.render( scene, camera );

}