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

    hero.checkCollisions = true;
    hero.applyGravity = true;
    hero.ellipsoid = new BABYLON.Vector3(0.1,0.1,0.1);
    hero.position = new BABYLON.Vector3(-5, 0.1, -5);

    scene.onBeforeRenderObservable.add(() => {
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
    });
});

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
