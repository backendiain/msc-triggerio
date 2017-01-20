/* Our Hello World! scene */
var _3dTestsHelloWorld = {
    init : function(){
        var world = new CANNON.World();
        world.gravity.set(0, 0, -9.82);

        /* Collision detecting */
        world.broadphase = new CANNON.NaiveBroadphase();

        /* Create a test body */
        var mass = 5, radius = 1;
        var sphereShape = new CANNON.Sphere(radius);
        var sphereBody = new CANNON.Body({ mass: mass, shape: sphereShape });
        sphereBody.position.set(0, 0, 0);
        world.add(sphereBody);

        var timeStep = 1.0 / 60.0; // seconds

        for(var i = 0; i < 60; ++i){
          world.step(timeStep);
          console.log(sphereBody.position.x, sphereBody.position.y, sphereBody.position.z);
        }
    }
};