/* Our Three.js and Cannon.js test scene that teaches me how to fire these two together in a simple manner */
var _3dTestsThreeCannonTest = {

    /* Put properties that we want to be within the scope of all our methods here */
    settings: {
        't' : 0,
        'newTime' : 0,
        'delta' : 0,
        'lastCallTime' : 0,
        'stepFrequency' : 60
    },

    convertDegToRad : function(deg){
        if(typeof deg === 'undefined' || typeof deg != 'number') return false;

        var rad = deg * Math.PI / 180;
        return rad;
    },

    init : function(options){

        /* Cannon.js is up first for the physics stuff! */
        var world = new CANNON.World();
        world.gravity.set(0, 0, -9.82);

        /* Collision detecting */
        world.broadphase = new CANNON.NaiveBroadphase();

        // First up, our object material - our materials define how our objects INTERACT with each other
        var physicsMaterial = new CANNON.Material("groundMaterial");

        // Now our contact material which defines how certain materials will act with each other
        var physMatOptions = { 
                                friction : 0.4, // Friction coefficient
                                restitution : 0.0 // Restitution (Bounce, basically)
                            };

        var physicsContactMaterial = 
            new CANNON.ContactMaterial(
                physicsMaterial, // Mat #1
                physicsMaterial, // Mat #2
                physMatOptions
            );

        // Add our contact material to our CANNON world
        world.addContactMaterial(physicsContactMaterial);

        // Geometry time, baby! Our geometry defines the SHAPE of our objects
        var halfExtents = new CANNON.Vec3(1, 1, 1); // These x, y, z values are only HALF of what the boxShape will be
        var boxShape = new CANNON.Box(halfExtents);
        var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        
        // Meshy business! Meshes define the APPEARANCE of our objects, these come from Three.js
        var box_mesh_material = new THREE.MeshLambertMaterial({ color: 0xcc0000, wireframe : false, shading: THREE.SmoothShading }); // Create our mesh material
        var box_mesh = new THREE.Mesh(boxGeometry, box_mesh_material); // Mesh it all up together!

        // Let the bodies hit the floor! Bodies "wear" our physics materials, giving our shapes mass and a physical presence
        var mass = 5, radius = 1;
        var boxOptions = { 
                            mass : mass,
                            shape : boxShape
                         };
        var boxBody = new CANNON.Body({ mass: mass, shape: boxShape });

        /* Ground */
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.Body({ mass: 0, material: box_mesh_material });
        groundBody.addShape(groundShape);
        world.addBody(groundBody);

        var groundGeo = new THREE.PlaneGeometry(10, 10, 4, 4);
        mesh = new THREE.Object3D();
        var submesh = new THREE.Object3D();
        var ground = new THREE.Mesh( groundGeo, box_mesh_material );
        ground.scale.set(100, 100, 100);
        ground.position.set(0,0,0);
        submesh.add(ground);

        ground.castShadow = true;
        ground.receiveShadow = true;


        /* Three.js (renderer) stuff */
        var rend_width = window.innerWidth, rend_height = window.innerHeight;        

        // Camera attributes
        var view_angle = 45, aspect = rend_width / rend_height, near = 1, far = 1000;

        // Get the element we're going to inject our canvas into
        var container = document.getElementById('cannon-canvas');

        // Create a WebGL renderer, camera and a nice scene
        var renderer = new THREE.WebGLRenderer();
        var camera = 
            new THREE.PerspectiveCamera(
                view_angle,
                aspect,
                near,
                far
            );

        var scene = new THREE.Scene();

        // Add the camera to the scene
        scene.add(camera);

        // The camera starts at 0, 0, 0 by default but we don't want that
        camera.position.z = 10;

        // Start the renderer!
        renderer.setSize(rend_width, rend_height);

        // Attach the render-supplied DOM element (var container)
        container.appendChild(renderer.domElement);

        // Try and rotate our mesh
        box_mesh.rotation.y = this.convertDegToRad(45);
        box_mesh.rotation.z = this.convertDegToRad(45);

        // Add our box object to the scene
        scene.add(box_mesh);
        scene.add(mesh);

        //boxBody.position.set(0, 4, 0);

        // Create a point light
        var pointLight = new THREE.PointLight(0xFFFFFF);

        // Set its position
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 130;

        scene.add(pointLight);

        // Draw the scene Mr. Bob Ross!
        renderer.render(scene, camera);

        var timeStep = 1 / 60.0; // seconds

        for(var i = 0; i < 60; ++i){
          world.step(timeStep);



        }
    }
};