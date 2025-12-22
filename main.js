import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';



// Инициализация шаблона
const init = () => {
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    const scene = new THREE.Scene();
    const canvas = document.querySelector('.canvas');
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(580, 520, 180);
    scene.add(camera);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    

    // Свет
    const lightHemisphere = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    lightHemisphere.position.set(0, 50, 0);
    scene.add(lightHemisphere);


    // Модель
    const loader = new GLTFLoader();

    let mixer = null;

    loader.load("model/katana3.glb", (gltf) => {
        const model = gltf.scene;
        model.scale.set(950, 950, 950);

        mixer = new THREE.AnimationMixer(model);
        const action1 = mixer.clipAction(gltf.animations[0]);

        action1.setLoop(THREE.LoopOnce);
        action1.clampWhenFinished = true;

        action1.play();
        console.log(mixer)


        model.updateMatrixWorld(true);
        let bounds = new THREE.Box3().setFromObject( model );
        model.position.sub(bounds.getCenter(new THREE.Vector3()))

        model.position.z += 1350;

        scene.add(model);
    });

    // Composer
    const composer = new EffectComposer( renderer );
	composer.addPass( new RenderPass( scene, camera ) );

	const bloomPass = new BloomPass(
		1, // strength
		55, // kernel size
		4, // sigma ?
		6, // blur render target resolution
	);
	composer.addPass( bloomPass );

	const filmPass = new FilmPass(
		0.7, // intensity
		false, // grayscale
	);
	composer.addPass( filmPass );

	const outputPass = new OutputPass();
	composer.addPass( outputPass );


    // Анимация 
    const clock = new THREE.Clock();

    const animate = () => {
        const delta = clock.getDelta();

        if (mixer) {
            mixer.update(delta);
        }
           // renderer.render(scene, camera);
        composer.render(delta);
        window.requestAnimationFrame(animate);
        controls.update();
    }

    animate();

    // Базовые обпаботчики событий длы поддержки ресайза
    window.addEventListener('resize', () => {
        // Обновляем размеры
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        // Обновляем соотношение сторон камеры
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        // Обновляем renderer
        composer.setSize(sizes.width, sizes.height);
        composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // renderer.render(scene, camera);
          composer.render(delta);

    });

    // Сделать во весь экран по двойному клику мыши
    window.addEventListener('dblclick', () => {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
};

init();


