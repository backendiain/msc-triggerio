function funnel(Experiment){

    var exp = Experiment;

    world = exp.getWorld();
    world.gravity.set(0, -10, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 4;

    /* Time for some materialism! */

    // Create a matrix of height values
    var matrix = [];
    var sizeX = 15,
        sizeY = 15;

    for (var i = 0; i < sizeX; i++) {

        matrix.push([]);

        for (var j = 0; j < sizeY; j++) {
            var height = -Math.cos( i / sizeX + Math.PI * 2 ) * Math.cos( j / sizeY * Math.PI * 2 );

            /* This sets our edges at all the same height */
            if(i === 0 || i === sizeX - 1 || j === 0 || j === sizeY - 1) height = 3;
            matrix[i].push(height);
        }
    }
    console.log(matrix);

    // Create the heightfield
    var hfShape = new CANNON.Heightfield(matrix, {
        elementSize: 4
    });
    var hfBody = new CANNON.Body({ mass: 0 });
    hfBody.addShape(hfShape);
    hfBody.position.set(-sizeX * hfShape.elementSize / 2, -20, -10);
    hfBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI / 2); // Sets it the right way up!

    world.addBody(hfBody);
    exp.addVisual(hfBody);
};