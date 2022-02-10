'use strict';

class BaseScene {
	constructor(canvas) {
		this.engine = new BABYLON.Engine(canvas, true);
		this.scene = this.CreateScene();
	}

	CreateScene() {
		// scene
		const scene = new BABYLON.Scene(this.engine);
		scene.clearColor = new BABYLON.Color3.FromHexString('#94bed0')
		// scene.debugLayer.show();

		// camera
		const camera = new BABYLON.ArcRotateCamera('camera', 0, Math.PI / 2.5, 60, new BABYLON.Vector3(0, 0, 0), scene);
		scene.activeCamera = camera;
		scene.activeCamera.attachControl(canvas, true);

		// light
		const light = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(200, -100, 70), scene);
		light.diFuse = new BABYLON.Color3.FromHexString('#f9f9dc');
		light.specular = new BABYLON.Color3.FromHexString('#f9f9dc');

		const lightCamera = new BABYLON.HemisphericLight('lightCamera', new BABYLON.Vector3(camera.position.x, camera.position.y, camera.position.z), scene);

		// skybox
		const skybox = new BABYLON.CubeTexture('./textures/skybox', scene);
		scene.createDefaultSkybox(skybox, true, 1000);


		// Road
		class Road {
			constructor() {
				this.roadMesh = BABYLON.MeshBuilder.CreateBox('roadMesh', {
					width: 50,
					depth: 1000,
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
				BABYLON.SceneLoader.Append('./models/', 'auto2.glb', scene, (result) => {
					this.mesh = result.meshes[6];
					this.mesh.name = 'autoMesh';

					this.mesh.scaling = new BABYLON.Vector3(6, 6, 6);
					this.mesh.position.y = 1;
				});
			}
		}

		new Auto();


		// Wheel
		class Wheel {
			constructor() {
				BABYLON.SceneLoader.Append('./models/', 'wheel.glb', scene, (result) => {
					// wheelFrontLeft
					this.wheelFrontLeft = result.meshes[2];
					this.wheelFrontLeft.name = 'wheelFrontLeft';
					this.wheelFrontLeft.position = new BABYLON.Vector3(5.1, 2.1, -9.4);
					this.wheelFrontLeft.scaling = new BABYLON.Vector3(1.82, 1.82, 1.82);

					// wheelFrontRight
					this.wheelFrontRight = this.wheelFrontLeft.clone('wheelFrontRight');
					this.wheelFrontRight.position = new BABYLON.Vector3(-5.55, this.wheelFrontRight.position.y, this.wheelFrontRight.position.z);

					// wheelRearRight
					this.wheelRearRight = this.wheelFrontRight.clone('wheelRearRight');
					this.wheelRearRight.position = new BABYLON.Vector3(this.wheelRearRight.position.x, this.wheelRearRight.position.y, 8.07);

					// wheelRearLeft
					this.wheelRearLeft = this.wheelFrontLeft.clone('wheelRearLeft');
					this.wheelRearLeft.position = new BABYLON.Vector3(this.wheelRearLeft.position.x, this.wheelRearLeft.position.y, 8.07);
				});
			}
		}

		new Wheel();


		// GlowLayer
		class GlowLayer {
			constructor() {
				this.glowLayer = new BABYLON.GlowLayer('glowLayer', scene);
				this.glowLayer.intensity = 5;
			}
		}

		new GlowLayer();


		// PhysicsObjects
		class PhysicsObjects {
			constructor() {
				scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.AmmoJSPlugin());

				this.processingPhysics();
			}

			processingPhysics() {
				scene.getMeshByName('roadMesh').physicsImpostor = new BABYLON.PhysicsImpostor(scene.getMeshByName('roadMesh'), BABYLON.PhysicsImpostor.BoxImpostor, {
					mass: 0,
					restitution: 0,
					friction: 100
				});


				this.motorMesh = BABYLON.MeshBuilder.CreateBox('motorMesh', {
					width: 10,
					depth: 15,
					height: 1
				}, scene);
				this.motorMesh.position.y = 3;

				this.motorMesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.motorMesh, BABYLON.PhysicsImpostor.BoxImpostor, {
					mass: 1500,
					restitution: 0,
					friction: 100
				});

				scene.getMeshByName('autoMesh').parent = this.motorMesh;


				const wheels = [scene.getMeshByName('wheelFrontLeft'), scene.getMeshByName('wheelFrontRight'), scene.getMeshByName('wheelRearLeft'), scene.getMeshByName('wheelRearRight')];

				const addPhysicsWheels = (arrWheels) => {
					arrWheels.forEach((wheel) => {
						wheel.physicsImpostor = new BABYLON.PhysicsImpostor(wheel, BABYLON.PhysicsImpostor.MeshImpostor, {
							mass: 150,
							restitution: 0,
							friction: 100
						});
					});
				}

				addPhysicsWheels(wheels);

				const jointWheels = (meshArr) => {
					meshArr.forEach((mesh) => {
						mesh.rotation = new BABYLON.Vector3(0, 0, 0);
						const joint = new BABYLON.HingeJoint({
							mainPivot: new BABYLON.Vector3(mesh.position.x, mesh.position.y - 2, mesh.position.z),
							mainAxis: new BABYLON.Vector3(1, 0, 0)
						});
						this.motorMesh.physicsImpostor.addJoint(mesh.physicsImpostor, joint);
						joint.setMotor(30, 230);
					});
				};

				jointWheels(wheels);
			}
		}

		setTimeout(() => {
			// new PhysicsObjects();
		}, 2000);


		// GenerateShadowsMap
		class GenerateShadowsMap {
			constructor(arrMeshMap, arrMeshReceive) {
				this.shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
				this.shadowGenerator.usePercentageCloserFiltering = true; // PCF

				this.addShadowMap(arrMeshMap);
				this.addReceiveShadows(arrMeshReceive);
			}

			/**
			 * обработка объектов создающих тени
			 * 
			 * проходимся froEach по arrMeshMap
			 * и проверяем есть ли дочерние меши (getChildMeshes),
			 * 
			 * если есть,то
			 * проходимся по каждому дочернему элементу,
			 * 
			 * иначе
			 * только по корневому мешу (roooNodes)
			 * 
			 * @param {array} arrMeshMap - объекты создающие тени
			 */
			addShadowMap(arrMeshMap) {
				arrMeshMap.forEach((mesh) => {
					if (mesh.getChildMeshes().length != 0) {
						mesh.getChildMeshes().forEach((meshChild) => {
							this.shadowGenerator.getShadowMap().renderList.push(meshChild);
						});
					} else {
						this.shadowGenerator.getShadowMap().renderList.push(mesh);
					}
				});
			}


			/**
			 * обработка объекток отображающие (поглощающие) тени
			 * 
			 * проходимся froEach по arrMeshMap
			 * и проверяем есть ли дочерние меши (getChildMeshes),
			 * 
			 * если есть,то
			 * проходимся по каждому дочернему элементу,
			 * 
			 * иначе
			 * только по корневому мешу (roooNodes)
			 * 
			 * @param {array} arrMeshMap - объекты отображающие (поглощающие) тени
			 */
			addReceiveShadows(arrMeshMap) {
				arrMeshMap.forEach((mesh) => {
					if (mesh.getChildMeshes().length != 0) {
						mesh.getChildMeshes().forEach((meshChild) => {
							meshChild.receiveShadows = true;
						});
					} else {
						mesh.receiveShadows = true;
					}
				});
			}
		}

		// дожидаемся полной загрузки сцены
		setTimeout(() => {
			const meshesGetShadowMap = [scene.getMeshByName('autoMesh')]; // объекты от которых падает тень
			const meshesReceiveShadows = [scene.getMeshByName('roadMesh')]; // объеты отображающие тень

			new GenerateShadowsMap(meshesGetShadowMap, meshesReceiveShadows);
		}, 3000);


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