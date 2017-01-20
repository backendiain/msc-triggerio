function wreckingBall(Experiment){

    var exp = Experiment;

    world = exp.getWorld();
    world.gravity.set(0, -10, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 4;

    /* Time for some materialism! */

    /* Time for some materialism! */
    var groundMaterial = new CANNON.Material();

    // ground plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ 
        mass: 0,
        material: groundMaterial,
        shape: groundShape,
        position: {x:0, y:0, z:0}
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI / 2); // Sets it the right way up!

    world.addBody(groundBody);
    exp.addVisual(groundBody);

    /* Let's make our stack of boxes! */
    for(var i = 0; i < 1; i++){
        var hlf_exts = new CANNON.Vec3(1, 1, 2);
        var box_shape = new CANNON.Box(hlf_exts);
        var box_body = new CANNON.Body({
            mass: 1,
            material: groundMaterial,
            shape: box_shape,
            position: {x:0, y:1, z:0}
        });

        world.addBody(box_body);
        exp.addVisual(box_body);
    }

};