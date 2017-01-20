/* Our Hello World! scene */
var _3dTestsTHREEJS = {
    init : function(){

        /* Three.js (renderer) stuff */
        var rend_width = window.innerWidth, rend_height = window.innerHeight;        

        // Camera attributes
        var view_angle = 45, aspect = rend_width / rend_height, near = 0.1, far = 10000;

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
        camera.position.z = 300;

        // Start the renderer!
        renderer.setSize(rend_width, rend_height);

        // Attach the render-supplied DOM element (var container)
        container.appendChild(renderer.domElement);

        /* Let's make a Three.js test sphere */
        var radius = 50, segments = 16, rings = 16;

        // Create the sphere's material
        var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xcc0000 });

        // Create a new mesh with sphere geometry
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                radius,
                segments,
                rings
            ),
        sphereMaterial);

        scene.add(sphere);

        // Create a point light
        var pointLight = new THREE.PointLight(0xFFFFFF);

        // Set its position
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 130;

        scene.add(pointLight);

        // Draw the scene Mr. Bob Ross!
        renderer.render(scene, camera);
    }
};