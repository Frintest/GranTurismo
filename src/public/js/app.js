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
		const scene = new BABYLON.Scene(this.engine);

		return scene;
	}
}

const canvas = document.querySelector('#canvas');
new BaseScene(canvas);