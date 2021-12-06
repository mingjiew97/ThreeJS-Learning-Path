import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {
    count: 100000,
    size: 0.02,
    // for the shape of the galaxy
    radius: 5,
    branches: 10,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff5588',
    outsideColor: '#1b3984',
};

// However, by using this, it will not remove the old galaxy, it will add a new galaxy on top of the old one
// Thus, instead of declaring all variable inside the function, we declare them outside, which will destroy the old galaxy
let geometry = null;
let material = null;
let points = null;

// create random particles based on the count parameter
const generateGalaxy = () => {
    /**
     * Destroy the old Galaxy
     * Can remove it wile the application is still running
     * No need to disponse Points / Mesh bcs its a combination of geometry and material -> no memory usage. 
     * Instead, we need to remove the points from the scene
     */
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const currentRadius = Math.random() * parameters.radius;
        const branchAngle = (i % parameters.branches) / parameters.branches  * Math.PI * 2;
        const spinAngle = currentRadius * parameters.spin;
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1)

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * currentRadius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * currentRadius + randomZ;

        // Color
        // need to clone the inside color bcs lerp will change the original color value
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, currentRadius / parameters.radius);
        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    /**
     * Points
     */
    points = new THREE.Points(geometry, material);
    scene.add(points);
}
generateGalaxy();

// this is not working bcs parameter is used only once
// onChange will cause too much cpu usage
// we can use onFinishChange
gui.add(parameters, 'count', 100, 1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size', 0.001, 0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius', 0.01, 10).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches', 1, 100).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin', -10, 10).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness', 0, 2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower', 0, 10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()