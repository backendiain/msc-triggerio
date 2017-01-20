$( function() {
  function bouncingBalls(Experiment){
    var exp = Experiment;

    world = exp.getWorld();
    world.gravity.set(0, -10, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    /* Time for some materialism! */
    var groundMaterial = new CANNON.Material();
    var sphere_mat_1  = new CANNON.Material();
    var sphere_mat_2  = new CANNON.Material();

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

    /* All we're doing is creating spheres, we can automate this a bit */
    for(var i = 0; i < 9; i++){

      /* Lazy (dynamic) positioning */
      if(counter == 1){ x = -3; }else{ x = x + 3; }

      if(loop < 2){ 
        z = -3; 
      }
      else if(loop > 2 && loop < 5){
        z = 0; 
      }
      else if(loop > 5){
        z = 3;
      }

      /* A shape of things to come */ 
      var shape = new CANNON.Sphere(1);
      var mat = (loop % 2 === 0) ? sphere_mat_1 : sphere_mat_2;
      var body = new CANNON.Body({
        mass: 10,
        material: mat,
        shape: shape,
        position: {x: x, y: ( loop % 2 === 0 ? 7.5 : 5 ), z: z},
        linearDamping: 0.01
      });

      world.addBody(body);
      spheres_arr[i] = body;

      if(counter === 3){ counter = 1; } else{ counter++; }
      loop++;
    }
    exp.addVisuals(spheres_arr);

    /* Add our materials */
    var sphere_to_ground_1 = new CANNON.ContactMaterial(groundMaterial, sphere_mat_1, { friction: 0, restitution:0.8 });
    var sphere_to_ground_2 = new CANNON.ContactMaterial(groundMaterial, sphere_mat_2, { friction: 0.5, restitution:0.8 });
    world.addContactMaterial(sphere_to_ground_1);
    world.addContactMaterial(sphere_to_ground_2);

  };
  
  var CANNON = window.CANNON;
  var Experiment = new CANNON.Experiment({ camAtts: { x: -5, y: 20, z: 20, rx:-46, ry:-10, rz:0 } });

  Experiment.addScene( function(){ 
    bouncingBalls(Experiment) 
  });

  Experiment.start();
});