'use strict';

class BaseScene {
	constructor(canvas) {
		this.engine = new BABYLON.Engine(canvas, true);
		this.scene = this.CreateScene();
	}

	CreateScene() {
		// scene
		const scene = new BABYLON.Scene(this.engine);
		scene.clearColor = new BABYLON.Color3.FromHexString('#94bed0');

		// camera
		const camera = new BABYLON.ArcRotateCamera('camera', 0, Math.PI / 2.5, 60, new BABYLON.Vector3(0, 0, 0), scene);
		scene.activeCamera = camera;
		scene.activeCamera.attachControl(canvas, true);

		// light
		const light = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(-200, -100, 30), scene);

		const lightCamera = new BABYLON.HemisphericLight('lightCamera', new BABYLON.Vector3(camera.position.x, camera.position.y, camera.position.z), scene);


		// Road
		class Road {
			constructor() {
				this.roadMesh = BABYLON.MeshBuilder.CreateBox('roadMesh', {
					width: 65,
					depth: 40,
					height: 1.4
				}, scene);

				this.roadMaterial = new BABYLON.StandardMaterial('roadMaterial', scene);
				this.roadMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#222222');
				this.roadMesh.material = this.roadMaterial;
			}
		}

		new Road();


		// Auto
		class Auto {
			constructor() {
				BABYLON.SceneLoader.Append('./models/', 'auto.glb', scene, (result) => {
					const mesh = result.meshes[1];

					mesh.scaling = new BABYLON.Vector3(5, 5, -5); //TODO
					mesh.position.y = 1.27;
				});
			}
		}

		new Auto();


		// GlowLayer
		class GlowLayer {
			constructor() {
				this.glowLayer = new BABYLON.GlowLayer('glowLayer', scene);
				this.glowLayer.intensity = 2;
			}
		}

		new GlowLayer();


		// GenerateShadowsMap
		class GenerateShadowsMap {
			constructor(arrMeshMap, arrMeshReceive) {
				this.shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
				this.shadowGenerator.usePercentageCloserFiltering = true; // PCF

				this.getShadowMap(arrMeshMap);
				this.addReceiveShadows(arrMeshReceive);
			}

			getShadowMap(arrMeshMap) {
				arrMeshMap.forEach((mesh) => {
					this.shadowGenerator.getShadowMap().renderList.push(mesh);
				});
			}

			addReceiveShadows(arrMeshReceive) {
				arrMeshReceive.forEach((mesh) => {
					mesh.receiveShadows = true;
				});
			}
		}

		const meshesGetShadowMap = []; // объекты от которых падает тень
		const meshesReceiveShadows = [scene.meshes[0]]; // объеты отображающие тень

		new GenerateShadowsMap(meshesGetShadowMap, meshesReceiveShadows);


		// render
		this.engine.runRenderLoop(() => {
			lightCamera.direction = camera.position;

			this.scene.render();
		});

		// resize
		window.addEventListener('resize', () => {
			this.engine.resize();
		});

		return scene;
	}
}

const canvas = document.querySelector('#canvas');
new BaseScene(canvas);