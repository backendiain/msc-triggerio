function createPrism(vertices, offset){

  /* By default we just create a triangular prism */
  if(typeof vertices === 'undefined'){
          var vertices = [
                          new CANNON.Vec3(0,0,0), //0
                          new CANNON.Vec3(60,0,0), //1
                          new CANNON.Vec3(0,30,0), //2
                          new CANNON.Vec3(0,0,42), //3
                          new CANNON.Vec3(60,0,42), //4
                          new CANNON.Vec3(0,30,42) // 5
                        ];
  }

  if(typeof offset === 'undefined') var offset = -0.35;

  for(var i=0; i<vertices.length; i++){
      var v = vertices[i];
      v.x += offset;
      v.y += offset;
      v.z += offset;
  }

  return new CANNON.ConvexPolyhedron(vertices,
                                      [
                                                  [0,2,1], // face pointing -x
                                                  [0,3,5,2], // face pointing -y
                                                  [3,4,5], // face pointing z+
                                                  [2,5,4,1] // face pointing +y
                                      ]);
}

function createPolygon(vertices, offset){

  /* By default we just create a triangular prism */
  if(typeof vertices === 'undefined'){
          var vertices = [
                      new CANNON.Vec3(-5,0,0), //0
                      new CANNON.Vec3(70,0,0), //1
                      new CANNON.Vec3(70,5,0), //2
                      new CANNON.Vec3(-5,40,0), //3
                      new CANNON.Vec3(70,0,-5), //4
                      new CANNON.Vec3(70,5,-5), //5
                      new CANNON.Vec3(-5,40,-5), // 6
                      new CANNON.Vec3(-5,0,-5) // 7
                    ] 
  }

  if(typeof offset === 'undefined') var offset = -0.35;

  for(var i=0; i<vertices.length; i++){
      var v = vertices[i];
      v.x += offset;
      v.y += offset;
      v.z += offset;
  }

  return new CANNON.ConvexPolyhedron(vertices,
                                      [
                                                  [1, 2, 3, 0], // face pointing +z
                                                  [3, 2, 5, 6], // face pointing +y
                                                  [6, 5, 4, 7], // face pointing -z,
                                                  [5, 2, 1, 4], // face pointing +x
                                                  [6, 3, 0, 7], // face pointing -x
                                                  [7, 0, 1, 4] // face pointing -y
                                      ]);
}

function rollingBallsStairs(Experiment){

  var exp = Experiment;

  world = exp.getWorld();
  world.gravity.set(0, -10, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 4;

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

  var spheres_arr = [], counter = 1, loop = 0, x = -3, y = 5, z = -3;

  /* Let's make our slope with a triangular prism! */
  var slope_mat = new CANNON.Material();
  var slope_shape = createPrism();
  var slope_body = new CANNON.Body({ 
    mass: 0,
    position: { x:-30, y:0, z:-15 },
    shape: slope_shape,
    material: slope_mat
  });

  world.addBody(slope_body);
  exp.addVisual(slope_body);

  /*  Slope stopper */
  var slope_stopper_vertices = [
                          new CANNON.Vec3(0,0,0), //0
                          new CANNON.Vec3(5,0,0), //1
                          new CANNON.Vec3(0,6.5,0), //2
                          new CANNON.Vec3(0,0,52), //3
                          new CANNON.Vec3(5,0,52), //4
                          new CANNON.Vec3(0,6.5,52) // 5
                      ];

  var slope_stopper_shape = createPrism(slope_stopper_vertices);
  var slope_stopper_body = new CANNON.Body({ 
    mass: 0,
    position: { x:34.5, y:0, z:31 },
    shape: slope_stopper_shape,
    material: slope_mat
  });

  slope_stopper_body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), exp.convertDegToRad(180)); // Sets it the right way up!

  world.addBody(slope_stopper_body);
  exp.addVisual(slope_stopper_body);

  /* Give the slope some sides to keep things within the boundaries */
  var slope_verts = [ 
                      new CANNON.Vec3(-5,0,0), //0
                      new CANNON.Vec3(65,0,0), //1
                      new CANNON.Vec3(65,5,0), //2
                      new CANNON.Vec3(-5,40,0), //3
                      new CANNON.Vec3(65,0,-5), //4
                      new CANNON.Vec3(65,5,-5), //5
                      new CANNON.Vec3(-5,40,-5), // 6
                      new CANNON.Vec3(-5,0,-5) // 7
                    ];

  var slope_side_shape = createPolygon(slope_verts);
  var slope_side_body_1 = new CANNON.Body({
    mass: 0,
    position: { x:-30, y:0, z:-15 },
    shape: slope_side_shape,
    material: slope_mat
  });

  world.addBody(slope_side_body_1);
  exp.addVisual(slope_side_body_1);

  var slope_side_body_2 = new CANNON.Body({
    mass: 0,
    position: { x:-30, y:0, z:31.5 },
    shape: slope_side_shape,
    material: slope_mat
  });

  world.addBody(slope_side_body_2);
  exp.addVisual(slope_side_body_2);

  var step_x = 27.5, step_y = 0, step_z = 5;

  // Let's make our stairs!
  for(var i = 0; i < 12; i++){
    step_x = i === 0 ? 27.5 : step_x - 5;
    step_y = i === 0 ? 0 : step_y + 2.5;

    var step_shape = new CANNON.Box( new CANNON.Vec3(2.5, 2.5, 20) );
    var step_body = new CANNON.Body({
      mass: 0,
      shape: step_shape,
      position: {x: step_x, y: step_y, z: 5}
    });

    world.addBody(step_body);
    exp.addVisual(step_body);
  }

  /* Add our spheres! */
  var sphere_mat = new CANNON.Material();
  var counter = 0;
  var x = -27.5, y = 31.75, z = 24;

  for(var i = 0; i < 600; i++){

    if(counter === 0 || i === 0){
      z = 24;
    }
    else{
      z = z - 2;
    }

    /* Loop & counter stuff */
    if(counter === 19){
      counter = 0;
    }
    else{
      counter++;
    }

    /* Jump up an amount every row */
    if(i !=0 && i % 20 === 0){
      y = y + 2.5;
    }

    var sphere_shape = new CANNON.Sphere(0.875);
    var sphere = new CANNON.Body({
      mass: 1,
      shape: sphere_shape,
      position: {x: x, y: y, z:z },
      material: sphere_mat,
      velocity: {x:(i % 2 === 0 ? 6 : -2), y:-20, z:0},
      angularVelocity: {x:0, y:10, z:8},
      angularDamping: 0.025,
      collisionResponse: 0.25
    });

    world.addBody(sphere);
    exp.addVisual(sphere);
  }

  var sphere_to_sphere = new CANNON.ContactMaterial(slope_mat, sphere_mat, { friction: 0.1, restitution:0.6 }); 
  var sphere_to_prism = new CANNON.ContactMaterial(slope_mat, sphere_mat, { friction: 0.4, restitution:0.6 });
  var sphere_to_ground = new CANNON.ContactMaterial(groundMaterial, sphere_mat, { friction: 0.8, restitution:0.1 });
  
  world.addContactMaterial(sphere_to_sphere);
  world.addContactMaterial(sphere_to_prism);
  world.addContactMaterial(sphere_to_ground);
};