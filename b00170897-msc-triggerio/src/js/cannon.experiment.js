/**** THIS IS JUST A BACKUP FILE, DUE TO ASYNC SCOPING/DIGEST ISSUES ON LOADING CONTROLLER THIS WAS MERGED INTO cannon.min.js ****/
/* global CANNON,THREE,Detector */
CANNON = CANNON || {};

/**
 * Experiment framework class based off of the Demo framework class provided by CANNON.
 * @class Experiment
 * @constructor
 * @param {Object} options
 */

 CANNON.Experiment = function(options){

 	var that = this;

    // API
    this.addScene = addScene;
    this.convertDegToRad = convertDegToRad;
    //this.restartCurrentScene = restartCurrentScene;
    //this.changeScene = changeScene;
    this.start = start;

    // Global settings
    var settings = this.settings = {
        stepFrequency: 60,
        quatNormalizeSkip: 2,
        quatNormalizeFast: true,
        gx: 0,
        gy: 0,
        gz: 0,
        camAtts: {},
        liAtts: {},
        iterations: 3,
        tolerance: 0.0001,
        k: 1e6,
        d: 3,
        scene: 0,
        paused: false,
        rendermode: "solid",
        constraints: false,
        contacts: false,  // Contact points
        cm2contact: false, // center of mass to contact points
        normals: false, // contact normals
        axes: false, // "local" frame axes
        particleSize: 0.1,
        shadows: false,
        aabbs: false,
        profiling: false,
        maxSubSteps:3
    };

    // Extend settings with options
    options = options || {};
    for(var key in options){
        if(key in settings){
            settings[key] = options[key];
        }
    }

    if(settings.stepFrequency % 60 !== 0){
        throw new Error("stepFrequency must be a multiple of 60.");
    }

    var bodies = this.bodies = [];
    var visuals = this.visuals = [];
    var scenes = [];


    var three_contactpoint_geo = new THREE.SphereGeometry( 0.1, 6, 6);
    var particleGeo = this.particleGeo = new THREE.SphereGeometry( 1, 16, 8 );

    // Material
    var materialColor = 0xdddddd;
    var solidMaterial = new THREE.MeshLambertMaterial( { color: materialColor } );
    //THREE.ColorUtils.adjustHSV( solidMaterial.color, 0, 0, 0.9 );
    var wireframeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe:true } );
    this.currentMaterial = solidMaterial;
    var contactDotMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    var particleMaterial = this.particleMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );

    function makeSureNotZero(vec){
        if(vec.x===0.0){
            vec.x = 1e-6;
        }
        if(vec.y===0.0){
            vec.y = 1e-6;
        }
        if(vec.z===0.0){
            vec.z = 1e-6;
        }
    }

    // An edit of the Demo class' addScene() method, but we only require one scene setup at a time
    function addScene(initfunc){

        if(typeof(initfunc)!=="function"){
            throw new Error("1st argument of Experiment.setupScene(initfunc) must be a function!");
        }

        scenes.push(initfunc);
    }

    function updateVisuals(){
        var N = bodies.length;

        // Read position data into visuals
        for(var i=0; i<N; i++){
            var b = bodies[i], visual = visuals[i];
            visual.position.copy(b.position);
            if(b.quaternion){
                visual.quaternion.copy(b.quaternion);
            }
        }
    }

    if (!Detector.webgl){
        Detector.addGetWebGLMessage();
    }

    var shadow_map_w = 512;
    var shadow_map_h = 512;
    var margin = 0;
    var scr_w = window.innerWidth;
    var scr_h = window.innerHeight;
    var camera, controls, renderer;
    var container;
    var near = 5, far = 2000;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var bodies = this.bodies = [];
    var visuals = this.visuals = [];

    // Create physics world
    var world = this.world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();

    // Initialises our Three.js canvas
    function initThree(){
        container = document.createElement( 'div' );
        document.getElementById('canvas').appendChild( container );

        // Scene
        scene = that.scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x222222, 1000, far );

        // Lights
        ambient = new THREE.AmbientLight( 0x222222 );
        scene.add( ambient );

        /*
        light = new THREE.PointLight( 0xffffff );
        light.position.x = 0;
        light.position.y = 15;
        light.position.z = 15;
        */

        light = new THREE.SpotLight( 0xffffff );
        light.position.set( 30, 30, 40 );

        light.position.x = typeof settings.liAtts.x != 'undefined' ? settings.liAtts.x : 30;
        light.position.y = typeof settings.liAtts.y != 'undefined' ? settings.liAtts.y : 30;
        light.position.z = typeof settings.liAtts.z != 'undefined' ? settings.liAtts.z : 30;

        light.target.position.set( 0, 0, 0 );
        light.castShadow = false;

        light.shadowMapBias = 0.0039;
        light.shadowMapDarkness = 0.5;
        light.shadowMapWidth = shadow_map_w;
        light.shadowMapHeight = shadow_map_h;

        // Camera
        camera = new THREE.PerspectiveCamera( 24, scr_w / scr_h, near, far );
        //try ortho - IS THIS OFF BECAUSE IT'S OWN ORIGIN IS OFF? TRY REVOLVING AROUND Y CENTRED ABOVE STAIRS TO SEE IF WE MOVE AROUND IT.
        camera.up = new THREE.Vector3(0, 1, 0);
        //camera.useQuaternion = true;
        camera.eulerOrder = "ZYX"; // default is "XYZ" but we're having issues so we reverse it

        camera.position.x = typeof settings.camAtts.x != 'undefined' ? settings.camAtts.x : 15;
        camera.position.y = typeof settings.camAtts.y != 'undefined' ? settings.camAtts.y : 20;
        camera.position.z = typeof settings.camAtts.z != 'undefined' ? settings.camAtts.z : 100;

        camera.rotation.x = convertDegToRad( typeof settings.camAtts.rx != 'undefined' ? settings.camAtts.rx : 0 ); // Pitch (up, down)
        camera.rotation.y = convertDegToRad( typeof settings.camAtts.ry != 'undefined' ? settings.camAtts.ry : 0 ); // Yaw (left, right)
        camera.rotation.z = convertDegToRad( typeof settings.camAtts.rz != 'undefined' ? settings.camAtts.rz : 0 ); // Roll (Spin)
/*
        q_x = typeof settings.camAtts.rx != 'undefined' ? new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(1,0,0), convertDegToRad(settings.camAtts.rx) ) : 0;
        q_y = typeof settings.camAtts.ry != 'undefined' ? new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(0,1,0), convertDegToRad(settings.camAtts.ry) ) : 0;
        q_z = typeof settings.camAtts.rz != 'undefined' ? new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(0,0,1), convertDegToRad(settings.camAtts.rz) ) : camera;

        camera.quaternion.x = q_x.x;
        camera.quaternion.y = q_y.y;
        camera.quaternion.z = q_z.z;
*/

        scene.add( light );
        scene.add( camera );

        // Action!
        renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialias: false } );
        renderer.setSize( scr_w, scr_h );
        container.appendChild( renderer.domElement );

        document.addEventListener('mousemove',onDocumentMouseMove);
        window.addEventListener('resize',onWindowResize);

        renderer.setClearColor( scene.fog.color, 1 );
        renderer.autoClear = false;

        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;

        /* Trackball controls
        controls = new THREE.TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.2;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = false;
        controls.dynamicDampingFactor = 0.3;
        var radius = 100;
        controls.minDistance = 0.0;
        controls.maxDistance = radius * 1000;
        //controls.keys = [ 65, 83, 68 ]; // [ rotateKey, zoomKey, panKey ]
        controls.screen.width = scr_w;
        controls.screen.height = scr_h;
        */
    }

    function onDocumentMouseMove( event ) {
        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );
    }

    function onWindowResize( event ) {
        scr_w = window.innerWidth;
        scr_h = window.innerHeight;

        renderer.setSize( scr_w, scr_h );

        camera.aspect = scr_w / scr_h;
        camera.updateProjectionMatrix();

        camera.radius = ( scr_w + scr_h ) / 4;
    }

    function render(){
        renderer.clear();
        renderer.render( that.scene, camera );
    }

    var lastCallTime = 0;
    function updatePhysics(){
        // Step world
        var timeStep = 1 / settings.stepFrequency;

        var now = Date.now() / 1000;

        if(!lastCallTime){
            // last call time not saved, cant guess elapsed time. Take a simple step.
            world.step(timeStep);
            lastCallTime = now;
            return;
        }

        var timeSinceLastCall = now - lastCallTime;

        world.step(timeStep, timeSinceLastCall, settings.maxSubSteps);

        lastCallTime = now;
    }

    function convertDegToRad(deg){
        if(typeof deg === 'undefined' || typeof deg != 'number') return false;

        var rad = deg * (Math.PI / 180);
        return rad;
    }

    function start(){
        buildScene(0);
    }

    function animate(){
        requestAnimationFrame( animate );
        updateVisuals();
        updatePhysics();
        render();
    }

    function buildScene(n){

        // Run the user defined "build scene" function
        scenes[n]();

        // Read the newly set data to the gui
        settings.iterations = world.solver.iterations;
        settings.gx = world.gravity.x+0.0;
        settings.gy = world.gravity.y+0.0;
        settings.gz = world.gravity.z+0.0;
        settings.quatNormalizeSkip = world.quatNormalizeSkip;
        settings.quatNormalizeFast = world.quatNormalizeFast;
    }

    // Set up our Three.js scene
    initThree();
    animate();
 };

CANNON.Experiment.prototype = new CANNON.EventTarget();
CANNON.Experiment.constructor = CANNON.Experiment;

CANNON.Experiment.prototype.getWorld = function(){
    return this.world;
};

CANNON.Experiment.prototype.addVisual = function(body){
    var s = this.settings;
    // What geometry should be used?
    var mesh;
    if(body instanceof CANNON.Body){
        mesh = this.shape2mesh(body);
    }
    if(mesh) {
        // Add body
        this.bodies.push(body);
        this.visuals.push(mesh);
        body.visualref = mesh;
        body.visualref.visualId = this.bodies.length - 1;
        //mesh.useQuaternion = true;
        this.scene.add(mesh);
    }
};

CANNON.Experiment.prototype.addVisuals = function(bodies){
    for (var i = 0; i < bodies.length; i++) {
        this.addVisual(bodies[i]);
    }
};

CANNON.Experiment.prototype.removeVisual = function(body){
    if(body.visualref){
        var bodies = this.bodies,
            visuals = this.visuals,
            old_b = [],
            old_v = [],
            n = bodies.length;

        for(var i=0; i<n; i++){
            old_b.unshift(bodies.pop());
            old_v.unshift(visuals.pop());
        }

        var id = body.visualref.visualId;
        for(var j=0; j<old_b.length; j++){
            if(j !== id){
                var i = j>id ? j-1 : j;
                bodies[i] = old_b[j];
                visuals[i] = old_v[j];
                bodies[i].visualref = old_b[j].visualref;
                bodies[i].visualref.visualId = i;
            }
        }
        body.visualref.visualId = null;
        this.scene.remove(body.visualref);
        body.visualref = null;
    }
};

CANNON.Experiment.prototype.removeAllVisuals = function(){
    while(this.bodies.length) {
        this.removeVisual(this.bodies[0]);
    }
};

/* Converts CANNON shapes to Three meshes */
CANNON.Experiment.prototype.shape2mesh = function(body){
    var wireframe = this.settings.renderMode === "wireframe";
    var obj = new THREE.Object3D();

    for (var l = 0; l < body.shapes.length; l++) {
        var shape = body.shapes[l];

        var mesh;

        switch(shape.type){

        case CANNON.Shape.types.SPHERE:
            var sphere_geometry = new THREE.SphereGeometry( shape.radius, 8, 8);
            mesh = new THREE.Mesh( sphere_geometry, this.currentMaterial );
            break;

        case CANNON.Shape.types.PARTICLE:
            mesh = new THREE.Mesh( this.particleGeo, this.particleMaterial );
            var s = this.settings;
            mesh.scale.set(s.particleSize,s.particleSize,s.particleSize);
            break;

        case CANNON.Shape.types.PLANE:
            var geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
            mesh = new THREE.Object3D();
            var submesh = new THREE.Object3D();
            var ground = new THREE.Mesh( geometry, this.currentMaterial );
            ground.scale.set(100, 100, 100);
            submesh.add(ground);

            ground.castShadow = true;
            ground.receiveShadow = true;

            mesh.add(submesh);
            break;

        case CANNON.Shape.types.BOX:
            var box_geometry = new THREE.BoxGeometry(  shape.halfExtents.x*2,
                                                        shape.halfExtents.y*2,
                                                        shape.halfExtents.z*2 );
            mesh = new THREE.Mesh( box_geometry, this.currentMaterial );
            break;

        case CANNON.Shape.types.CONVEXPOLYHEDRON:
            var geo = new THREE.Geometry();

            // Add vertices
            for (var i = 0; i < shape.vertices.length; i++) {
                var v = shape.vertices[i];
                geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
            }

            for(var i=0; i < shape.faces.length; i++){
                var face = shape.faces[i];

                // add triangles
                var a = face[0];
                for (var j = 1; j < face.length - 1; j++) {
                    var b = face[j];
                    var c = face[j + 1];
                    geo.faces.push(new THREE.Face3(a, b, c));
                }
            }
            geo.computeBoundingSphere();
            geo.computeFaceNormals();
            mesh = new THREE.Mesh( geo, this.currentMaterial );
            break;

        case CANNON.Shape.types.HEIGHTFIELD:
            var geometry = new THREE.Geometry();

            var v0 = new CANNON.Vec3();
            var v1 = new CANNON.Vec3();
            var v2 = new CANNON.Vec3();
            for (var xi = 0; xi < shape.data.length - 1; xi++) {
                for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
                    for (var k = 0; k < 2; k++) {
                        shape.getConvexTrianglePillar(xi, yi, k===0);
                        v0.copy(shape.pillarConvex.vertices[0]);
                        v1.copy(shape.pillarConvex.vertices[1]);
                        v2.copy(shape.pillarConvex.vertices[2]);
                        v0.vadd(shape.pillarOffset, v0);
                        v1.vadd(shape.pillarOffset, v1);
                        v2.vadd(shape.pillarOffset, v2);
                        geometry.vertices.push(
                            new THREE.Vector3(v0.x, v0.y, v0.z),
                            new THREE.Vector3(v1.x, v1.y, v1.z),
                            new THREE.Vector3(v2.x, v2.y, v2.z)
                        );
                        var i = geometry.vertices.length - 3;
                        geometry.faces.push(new THREE.Face3(i, i+1, i+2));
                    }
                }
            }
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
            mesh = new THREE.Mesh(geometry, this.currentMaterial);
            break;

        case CANNON.Shape.types.TRIMESH:
            var geometry = new THREE.Geometry();

            var v0 = new CANNON.Vec3();
            var v1 = new CANNON.Vec3();
            var v2 = new CANNON.Vec3();
            for (var i = 0; i < shape.indices.length / 3; i++) {
                shape.getTriangleVertices(i, v0, v1, v2);
                geometry.vertices.push(
                    new THREE.Vector3(v0.x, v0.y, v0.z),
                    new THREE.Vector3(v1.x, v1.y, v1.z),
                    new THREE.Vector3(v2.x, v2.y, v2.z)
                );
                var j = geometry.vertices.length - 3;
                geometry.faces.push(new THREE.Face3(j, j+1, j+2));
            }
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
            mesh = new THREE.Mesh(geometry, this.currentMaterial);
            break;

        default:
            throw "Visual type not recognized: "+shape.type;
        }

        mesh.receiveShadow = true;
        mesh.castShadow = true;
        if(mesh.children){
            for(var i=0; i<mesh.children.length; i++){
                mesh.children[i].castShadow = true;
                mesh.children[i].receiveShadow = true;
                if(mesh.children[i]){
                    for(var j=0; j<mesh.children[i].length; j++){
                        mesh.children[i].children[j].castShadow = true;
                        mesh.children[i].children[j].receiveShadow = true;
                    }
                }
            }
        }

        var o = body.shapeOffsets[l];
        var q = body.shapeOrientations[l];
        mesh.position.set(o.x, o.y, o.z);
        mesh.quaternion.set(q.x, q.y, q.z, q.w);

        obj.add(mesh);
    }

    return obj;
};