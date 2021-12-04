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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/9.png')

/**
 * Particles
 */

// Sphere buffer gemoetry
// // Geometry
// const particlesGeometry = new THREE.SphereBufferGeometry(1, 32, 32)

// // Material
// const particlesMaterial = new THREE.PointsMaterial()
// particlesMaterial.size = 0.01
// particlesMaterial.sizeAttenuation = true
// particlesMaterial.color = new THREE.Color('#ff88cc')

// // Points
// const particles = new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(particles)

// Custom Geometry
// Geometry
const particlesGeometry = new THREE.BufferGeometry();
const count = 5000;
// need to have positions array so that we can add vertices into a geometry
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for(let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.3
particlesMaterial.sizeAttenuation = true;

// // setup the base color
// particlesMaterial.color = new THREE.Color('#ff88cc')

// particlesMaterial.map = particleTexture;
// inorder for alpha map to work, we need to have transparent added 
// However, there are some issues. Some particles still has black blackground
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
// alphaTest is a value between 0 and 1 that tells WebGL when to NOT render the pixel
// particlesMaterial.alphaTest = 0.001

// depth test is used to determine which object is in front of the other
// might create bug; Cz if you have other objects in the scene, We should not be able to see the particles behind.
// Howeverm you can in this case.
// particlesMaterial.depthTest = false

// depth of what's being drawn is stored in a depth buffer
// Instead of not testing the distance like depthTest, we can tell the webGL not to write particles inside the object
particlesMaterial.depthWrite = false;

// WebGL deaws pixels one on top of the other
// With "blending" property, we can tell the WbeGL to add color to existing pixel
// have impact on performaces. 
particlesMaterial.blending = THREE.AdditiveBlending

// use the custom color in the colors array
particlesMaterial.vertexColors = true;

// // Cube
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial
// );
// scene.add(cube);

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)


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

    // Update particles
    // particles.rotation.x = elapsedTime * 0.01;
    // particles.rotation.y = elapsedTime * 0.01;
    
    // we can update each vertices seperatly
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = particlesGeometry.attributes.position.array[i3];
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);
    }
    // need this line to inform three js to update the geometry
    particlesGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()