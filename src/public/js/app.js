'use strict';

class BaseScene {
	constructor(canvas) {
		this.engine = new BABYLON.Engine(canvas, true);
		this.scene = this.CreateScene();

		this.engine.runRenderLoop(() => {
			this.scene.render();
		});

		window.addEventListener('resize', () => {
			this.engine.resize();
		});
	}

	CreateScene() {
		// scene
		const scene = new BABYLON.Scene(this.engine);

		// camera
		const camera = new BABYLON.ArcRotateCamera('camera', Math.PI, Math.PI / 2.5, 100, new BABYLON.Vector3(0, 0, 0), scene);
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
					height: 1.5
				}, scene);
			}
		}

		new Road();


		// Road
		class Road2 {
			constructor() {
				this.roadMesh2 = BABYLON.MeshBuilder.CreateBox('roadMesh2', {
					width: 8,
					depth: 8,
					height: 8
				}, scene);

				this.roadMesh2.position.y = 4;
			}
		}

		new Road2();


		// GenerateShadowsMap
		class GenerateShadowsMap {
			constructor(arrMeshMap, arrMeshReceive) {
				this.shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
				this.shadowGenerator.usePercentageCloserFiltering = true;

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

		const meshesGetShadowMap = [scene.meshes[1]];
		const meshesReceiveShadows = [scene.meshes[0]];

		new GenerateShadowsMap(meshesGetShadowMap, meshesReceiveShadows);


		return scene;
	}
}

const canvas = document.querySelector('#canvas');
new BaseScene(canvas);