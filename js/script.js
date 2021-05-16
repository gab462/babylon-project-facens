const canvas = document.getElementById("renderCanvas");

const engine = new BABYLON.Engine(canvas);

const scene = new BABYLON.Scene(engine);

const camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0));
camera.setPosition(new BABYLON.Vector3(3, 3, 3));
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

// 1 - HighMap
const box = BABYLON.MeshBuilder.CreateBox("box", {});

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
