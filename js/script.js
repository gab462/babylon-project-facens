const canvas = document.getElementById("renderCanvas");

const engine = new BABYLON.Engine(canvas);
engine.enableOfflineSupport = false;

const scene = new BABYLON.Scene(engine);
scene.collisionsEnabled = true;
scene.enablePhysics();

const camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0));
camera.setPosition(new BABYLON.Vector3(-5, 15, -5));
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

var gameOver = false;

// 1, 6 - HighMap
var ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "res/ground.png", { radius: 0, subdivisions: 50, minHeight: 0, maxHeight: 10 });
ground.material = new BABYLON.StandardMaterial("groundMaterial", scene);
ground.material.diffuseTexture = new BABYLON.Texture("res/ground-image.png", scene);
// ground.material.opacityTexture = new BABYLON.Texture("res/ground-image.png", scene);
// ground.material.opacityTexture.hasAlpha = true;

ground.scaling = new BABYLON.Vector3(10,1,10);

ground.checkCollisions = true;

// 2 - Skybox
// var skybox = BABYLON.MeshBuilder.CreateBox("skybox", {size: 500}, scene);
// skybox.material = new BABYLON.StandardMaterial("skybox", scene);
// skybox.material.backFaceCulling = false;
// skybox.material.reflectionTexture = new BABYLON.CubeTexture("res/skybox4", scene);
// skybox.material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
// skybox.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
// skybox.material.specularColor = new BABYLON.Color3(0, 0, 0);

// 3, 4 - Model, Animations
var inputMap = {};
scene.actionManager = new BABYLON.ActionManager(scene);
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
    inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
}));
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
    inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
}));

var hero;

BABYLON.SceneLoader.ImportMesh("", "https://assets.babylonjs.com/meshes/", "HVGirl.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
    hero = newMeshes[0];

    hero.scaling.scaleInPlace(0.1);

    camera.target = hero;

    var heroSpeed = 0.1;
    var heroSpeedBackwards = 0.01;
    var heroRotationSpeed = 0.1;

    var animating = true;

    const walkAnim = scene.getAnimationGroupByName("Walking");
    const walkBackAnim = scene.getAnimationGroupByName("WalkingBack");
    const idleAnim = scene.getAnimationGroupByName("Idle");
    const sambaAnim = scene.getAnimationGroupByName("Samba");

    hero.checkCollisions = false;
    hero.applyGravity = true;
    hero.ellipsoid = new BABYLON.Vector3(0.1,0.1,0.3);
    hero.position = new BABYLON.Vector3(-5, 0.1, -5);

    scene.onBeforeRenderObservable.add(() => {
	if (!gameOver) {
            var keydown = false;
            if (inputMap["w"]) {
		hero.moveWithCollisions(hero.forward.scaleInPlace(heroSpeed));
		keydown = true;
            }
            if (inputMap["s"]) {
		hero.moveWithCollisions(hero.forward.scaleInPlace(-heroSpeedBackwards));
		keydown = true;
            }
            if (inputMap["a"]) {
		hero.rotate(BABYLON.Vector3.Up(), -heroRotationSpeed);
		keydown = true;
            }
            if (inputMap["d"]) {
		hero.rotate(BABYLON.Vector3.Up(), heroRotationSpeed);
		keydown = true;
            }
            if (inputMap["b"]) {
		keydown = true;
            }

            if (keydown) {
		if (!animating) {
                    animating = true;
                    if (inputMap["s"]) {
			walkBackAnim.start(true, 1.0, walkBackAnim.from, walkBackAnim.to, false);
                    }
                    else if
			(inputMap["b"]) {
                            sambaAnim.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
			}
                    else {
			walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
                    }
		}
            }
            else {

		if (animating) {
                    idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);

                    sambaAnim.stop();
                    walkAnim.stop();
                    walkBackAnim.stop();

                    animating = false;
		}
            }
	}
    });
});

// 5 - Meshes
const items = [
    {
	"name": "boombox",
	"x": 10,
	"y": 1,
	"z": 10,
	"scale": 100
    },
    {
	"name": "haunted_house",
	"x": 20,
	"y": 0,
	"z": 20,
	"scale": 100
    }
];

items.forEach((item) => {
    BABYLON.SceneLoader.ImportMeshAsync(null, "https://assets.babylonjs.com/meshes/" + item.name + ".glb", "", scene)
	.then((res) => {
	    let mesh = res.meshes[0];
	    mesh.scaling.scaleInPlace(item.scale);
	    mesh.position = new BABYLON.Vector3(item.x, item.y, item.z);
	    res.meshes.forEach(newMesh => {
		newMesh.checkCollisions = true;
	    });
	});
});

// 7 - Exploding Barrels
var barrel;
var explodeSound = new BABYLON.Sound("explosion", "res/explosion.mp3", scene);

BABYLON.SceneLoader.ImportMeshAsync(null, "https://assets.babylonjs.com/meshes/ExplodingBarrel.glb", "", scene)
    .then((res) => {
	let mesh = res.meshes[0];

	mesh.scaling.scaleInPlace(0.03);
	mesh.position = new BABYLON.Vector3(8, 0, 8);

	res.meshes.forEach(newMesh => {
		newMesh.checkCollisions = true;
	});

	barrel = res.meshes[0];
    })

var box = BABYLON.Mesh.CreateBox("box", 2, scene);
box.isVisible = false;
box.checkCollisions = true;

scene.registerBeforeRender(() => {
    if (hero && box && !gameOver) {
	box.position = hero.position;

	if (barrel && box.intersectsMesh(barrel, false) && !barrel.position._isDirty) {
	    BABYLON.ParticleHelper.CreateAsync("explosion", scene).then((set) => {
		set.emitterNode = new BABYLON.Vector3(8, 0, 8);
                set.systems.forEach(s => {
                    s.disposeOnStop = true;
                });
                set.start();
            });

	    barrel.dispose();
	    barrel = null;

	    explodeSound.play();
	}
    }
});

// 8, 9 - Collectibles
var targets = []
var cont = 0;
var collectSound = new BABYLON.Sound("tan", "res/tan.mp3", scene);

for (let i = 0; i < 10; i++) {
    BABYLON.SceneLoader.ImportMeshAsync(null, "https://assets.babylonjs.com/meshes/target.glb", "", scene)
	.then((res) => {
	    let mesh = res.meshes[0];

	    mesh.scaling.scaleInPlace(0.1 + i * 0.1);
	    mesh.position = new BABYLON.Vector3(- 15 - i * 2 , 0, - 8 - i);

	    res.meshes.forEach(newMesh => {
		newMesh.checkCollisions = true;
	    });

	    mesh.name = i;

	    targets.push(mesh);
	});
}

scene.registerBeforeRender(() => {
    if (!gameOver) {
	collectNext = scene.getMeshByName(cont);
	if (box && collectNext) {
	    if (box.intersectsMesh(collectNext, true) && !collectNext.position._isDirty){
		collectNext.dispose();
		cont++;
		collectSound.play();
		const sambaAnim = scene.getAnimationGroupByName("Samba");
		sambaAnim.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
	    }
	}
    }
});

// 10 - End Game
scene.registerBeforeRender(() => {
    if (cont == 10 && !gameOver) {
	const samba = scene.getAnimationGroupByName("Samba");
	samba.start(true, 1.0, samba.from, samba.to, false);

	var endScreen = new BABYLON.GUI.TextBlock();
	endScreen.fontSize = 100;
	endScreen.text = "WINNER - " + cont + " coletados!";
	endScreen.top = "-400px";
	endScreen.color = "white";

	var resetButton = BABYLON.GUI.Button.CreateSimpleButton("reset", "Restart");
	resetButton.width = "100px"
	resetButton.height = "100px"
	resetButton.background = "white";
	resetButton.onPointerDownObservable.add(() => {
	    location.reload();
	});

	gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
	gui.addControl(endScreen);
	gui.addControl(resetButton);

	gameOver = true;
    }
});

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
