function testSphereWorld(Experiment){
  var exp = Experiment;

  world = exp.getWorld();
  world.gravity.set(0, -10, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  // ground plane
  var groundMaterial = new CANNON.Material();
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI / 2); // Sets it the right way up!
  groundBody.position.set(0,0,0);

  world.addBody(groundBody);
  exp.addVisual(groundBody);

  var mat1 = new CANNON.Material();
  shape = new CANNON.Box(new CANNON.Vec3(1,1,1));
  body = new CANNON.Body({
    mass: 1,
    material: mat1
  });
  body.position.set(0, 2, 0);

  body.addShape(shape);
  world.addBody(body);
  exp.addVisual(body);

  shape2 = new CANNON.Sphere(5);
  body2 = new CANNON.Body({
    mass: 4,
    material: mat1
  });
  body2.position.set(0, 10, -40);
  body2.velocity.set(0, 0, 25);

  body2.addShape(shape2);
  world.addBody(body2);
  exp.addVisual(body2);

    var mat1_ground = new CANNON.ContactMaterial(groundMaterial, mat1, { friction: 0.2, restitution: 0.2 });
    var mat1_mat1 = new CANNON.ContactMaterial(mat1, mat1, { friction: 0.1, restitution: 2 });

    world.addContactMaterial(mat1_ground);
};