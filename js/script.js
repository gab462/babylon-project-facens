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

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
