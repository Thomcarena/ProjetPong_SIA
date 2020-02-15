let container, w, h, scene, camera, controls, renderer, stats;
let urls;
let loop = {};
let x, y, z, i;
let collidableMeshList = [], tab = [];

window.addEventListener('load', go);
window.addEventListener('resize', resize);

function go() {
  console.log("Go!");
  init();
  gameLoop();
}

// Direction et vitesse de la balle au debut de la partie.
var ballDirX = 0;
var ballDirZ = -0.05;
var ballSpeed = 2;
var paddleDirX = 0.05;
var paddleDirNX = -0.2;
var paddleSpeed = 1;
var tailleTerrain = 20 * 0.95;
var level = 5;
// Classe Balle
class Balle {

  Balle(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  initBalle() {
    const geometryBalle = new THREE.BoxBufferGeometry(x,y,z);
    //const materialBalle = new THREE.MeshPhongMaterial( { color: 'gold'} );
    //const textureBalle = new THREE.TextureLoader().load("https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/caisse.png");
    const textureBalle = new THREE.TextureLoader().load("https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/tnt.png");
    const materialBalle = new THREE.MeshBasicMaterial( { map : textureBalle} );


    this.mesh = new THREE.Mesh( geometryBalle, materialBalle, );
    scene.add( this.mesh );
    this.mesh.position.y=1; // Pose la balle sur le terrain
    this.rays = [
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(1, 0, -1),
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(-1, 0, -1),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(-1, 0, 1)
      ];
      tab = this.rays

    this.caster = new THREE.Raycaster();
  }

  mouvement() {
    this.mesh.translateX(ballDirX * ballSpeed); // La balle est en mouvement constant sur l'axe des x
    this.mesh.translateZ(ballDirZ * ballSpeed); // La balle est en mouvement constant sur l'axe des z

    const distance = 0.5;

    for (i = 0; i < tab.length; i += 1) {
      this.caster.set(this.mesh.position, this.rays[i]); // On ajoute les raycasters sur la balle
      var obstacles = this.caster.intersectObjects(scene.children); // Collisions -> les rayons de la balle peuvent entrer en contact avec les objets de la scène
      if (obstacles.length > 0 && obstacles[0].distance <= distance) { // si la distance de collision est plus petite que celle définie alors il y a collision
        if (i === 4) {
          console.log("Collision De Face");
          ballDirZ = -ballDirZ;

        }
        else if (i === 0) {
          console.log("Collision De Dos");
          ballDirZ = -ballDirZ;
        }
        if (i === 1 || i === 2 || i === 3) {
          console.log("Collision De Droite");
          ballDirX = 0.05;
          ballDirX = -ballDirX;
        }
        else if (i === 5 || i === 6 || i ===7) {
          console.log("Collision De Gauche");
          ballDirX = -0.05;
          ballDirX = -ballDirX;
        }
      }
    }

    // Si le joueur a marqué un point
    if (this.mesh.position.z <= -tailleTerrain/2)
    {
      console.log("Le joueur a marqué");
      // update scoreboard
      this.reset();
    }

// if ball goes off the 'right' side (CPU's side)
    if (this.mesh.position.z >= tailleTerrain/2)
    {
      console.log("L'IA a marqué");
      // update scoreboard
      this.reset();
    }
  }

  reset(){
    this.mesh.position.set(0,1,0);
    ballDirX = 0;
  }
};


//Classe Terrain
class Terrain {
  initTerrain() {
    const geometryTerrain = new THREE.BoxBufferGeometry( 15, 0, 20 );
    const textureTerrain = new THREE.TextureLoader().load("https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/caisse.png");
    const materialTerrain = new THREE.MeshBasicMaterial ({map : textureTerrain});
    this.mesh = new THREE.Mesh(geometryTerrain, materialTerrain);
    scene.add( this.mesh );
  }
};

// Classe Mur
class Mur {
  initMur() {
    const murGeometry = new THREE.BoxBufferGeometry( 0, 1, 20, 1, 1, 1 );
    const murMaterial = new THREE.MeshBasicMaterial( {color: 0x8888ff} );
    const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe:true } );

    this.mesh = new THREE.Mesh(murGeometry, murMaterial);
    this.mesh.position.set(0, 0, 0);
    scene.add(this.mesh);
  }
  positionMur(x,y,z){
    this.mesh.position.set(x, y, z);
  }
};

//Classe Pad
class Pad {
  initPad() {
    const padGeometry = new THREE.BoxBufferGeometry( 4, 1, 1, 1, 1, 1 );
  	const padMaterial = new THREE.MeshBasicMaterial( {color: 0x8888ff} );
  	const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe:true } );

  	this.mesh = new THREE.Mesh(padGeometry, padMaterial);
  	this.mesh.position.set(0, 0, 0);
  	scene.add(this.mesh);
  }
  positionPad(x,y,z){
    this.mesh.position.set(x, y, z);
  }
  mouvementRight(){
    this.mesh.translateX(paddleDirX * paddleSpeed);
    console.log(this.mesh.position.x);
   if (this.mesh.position.x < 5.55 || this.mesh.position.x > -5.55) {

      paddleDirX = paddleSpeed * 0.5;
    }
    else if (this.mesh.position.x > 5.55 || this.mesh.position.x < -5.55) {
     console.log("bloqué");
     paddleDirX = 0;
      //this.mesh.scale.x += (10 - this.mesh.scale.x) * 0.2;
    }
  }
  mouvementLeft(){
    this.mesh.translateX(paddleDirNX * paddleSpeed);
  }

  mouvementIA(){
    //this.mesh.translateX(balleIA.position.x * paddleSpeed * level);
  }
};

class Models {
  initPirateShip() {
  var mtlLoader = new THREE.MTLLoader();
  //mtlLoader.setBaseUrl('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/');
  mtlLoader.setPath('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/');
  var url = 'pirateShip.mtl';
  mtlLoader.load(url , function(materialsPirate){
    materialsPirate.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materialsPirate);
    objLoader.setPath('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/');
    objLoader.load('pirateShip.obj', function(object) {
      object.position.set(4, 0, -12);
      object.rotation.y += 1.5;
      scene.add(object);
    });
  });
  }
}

class Skybox {
  initSkyBox() {
    const skyGeometry = new THREE.BoxGeometry(500, 500, 500)
    const skyMaterials = [
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/ocean_rt.jpg'), //Right
        side: THREE.DoubleSide
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/ocean_lf.jpg'), //Left
        side: THREE.DoubleSide
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/ocean_up.jpg'), //Up
        side: THREE.DoubleSide
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/ocean_dn.jpg'), //Down
        side: THREE.DoubleSide
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/ocean_bk.jpg'), //Back
        side: THREE.DoubleSide
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/ocean_ft.jpg'), //Front
        side: THREE.DoubleSide
      })
    ]
    const skyMaterial = THREE.MeshFaceMaterial(skyMaterials)

    this.mesh = new THREE.Mesh(skyGeometry, skyMaterial)
    scene.add(this.mesh)
  }
}

// Variables globales
var balle = new Balle(1,1,1);
var terrain = new Terrain();
var padAdverse = new Pad();
var padJoueur = new Pad();
var murDroite = new Mur();
var murGauche = new Mur();
var ciel = new Skybox();
var bateauPirate = new Models();

// Initialisation du monde 3D
function init() {
  container = document.querySelector('#SIApp');
  w = container.clientWidth;
  h = container.clientHeight;

  scene = new THREE.Scene();

  //scene.background = new THREE.Color('cyan');
  //scene.overrideMaterial = new THREE.MeshBasicMaterial( { color: 'green' } );

//Camera
  camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
  camera.position.set(0, 5.5, 12);
  camera.rotation.x=3.14/4;

  controls = new THREE.TrackballControls(camera, container);
  controls.target = new THREE.Vector3(0, 0, 0.75);
  controls.panSpeed = 0.4;

  //Render
  const renderConfig = {antialias: true, alpha: true};
  renderer = new THREE.WebGLRenderer(renderConfig);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;


//lights
  var light = new THREE.DirectionalLight( 0xdddddd, 0.8 );
  light.position.set( -80, -80, 80 );
  //light.castShadow = true;
  //light = new THREE.AmbientLight( 0x444444 );
  scene.add(light);



  // add Stats.js - https://github.com/mrdoob/stats.js
  stats = new Stats();
  stats.domElement.style.position	= 'absolute';
  stats.domElement.style.bottom	= '0px';
  document.body.appendChild( stats.domElement );


  // add some geometries

  balle.initBalle();
  terrain.initTerrain();
  murDroite.initMur();
  murDroite.positionMur(8,1,1);
  murGauche.initMur();
  murGauche.positionMur(-8,1,1);
  padAdverse.initPad();
  padAdverse.positionPad(0,1,-8);
  padJoueur.initPad();
  padJoueur.positionPad(0,1,8);
  ciel.initSkyBox();

  // add some objects
  bateauPirate.initPirateShip();
  // Ajout Objets
/*
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/');
    objLoader.load('pirateShip.obj', function(object) {
      object.position.set(4, 0, -12);
      object.rotation.y += 1.5;
      scene.add(object);
    });
  });
*/
/*
  var objLoader = new THREE.OBJLoader();
  objLoader.setPath('https://raw.githubusercontent.com/Thomcarena/ProjetPong_SIA/Projet_DASILVA_Thomas/src/medias/images/');
  objLoader.load('pirateShip.obj', function(object) {
    object.position.set(4, 0, -12);
    object.rotation.y += 1.5;
    scene.add(object);
  });*/
//collidableMeshList.push(murTest); // On ajoute le mur au tableau des objets qui admettent des collisions


// Stats
  const fps  = 60;
  const slow = 1; // slow motion! 1: normal speed, 2: half speed...
  loop.dt       = 0,
  loop.now      = timestamp();
  loop.last     = loop.now;
  loop.fps      = fps;
  loop.step     = 1/loop.fps;
  loop.slow     = slow;
  loop.slowStep = loop.slow * loop.step;



}

function gameLoop() {

  // gestion de l'incrément du temps
  loop.now = timestamp();
  loop.dt = loop.dt + Math.min(1, (loop.now - loop.last) / 1000);
//  loop.dt = loop.dt + Math.min(1, (loop.now - loop.last) / 100000);
  while(loop.dt > loop.slowStep) {
    loop.dt = loop.dt - loop.slowStep;
    update(loop.step); // déplace les objets d'une fraction de seconde
  }
  renderer.render(scene, camera);  // rendu de la scène
  loop.last = loop.now;

  requestAnimationFrame(gameLoop); // relance la boucle du jeu

  controls.update();
  stats.update();
}

function update(step) {
  //const angleIncr = Math.PI * 2 * step / 5 ; // une rotation complète en 5 secondes

  balle.mouvement();
  padAdverse.mouvementIA();

    document.onkeydown = function(e) {
      switch (e.keyCode) {
        case 90: //z
          console.log("J'appuie sur Z");
          balle.mouvement();
          break;
        case 83: //s
          console.log("J'appuie sur s");
          balle.mouvementBack();
          break;
        case 68: //d
          console.log("J'appuie sur d");
          padJoueur.mouvementRight();
          break;
        case 81: //q
          console.log("J'appuie sur q");
          padJoueur.mouvementLeft();
          break;
      }
    };



}

function resize() {
  w = container.clientWidth;
  h = container.clientHeight;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function timestamp() {
  return window.performance.now();
}
