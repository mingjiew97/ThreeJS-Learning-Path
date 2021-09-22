// get my canvas dom element
const canvas = document.querySelector(".webgl")

// create a container
const scene = new THREE.Scene();

// create a Mesh -> a red cube in this case
// Mesh is a combination of the geometry (shape) and the material (how it looks)
// width, height, depth
const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshBasicMaterial({
    color: 'red',
});

// create the mesh
const mesh = new THREE.Mesh(geometry, material);
// add the mesh into the scene
scene.add(mesh);

// sizes
const sizes = {
    width: 800,
    height: 600
}

// camera
// view angle, aspect ratio (width / height)
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// move the camera backwards
camera.position.z = 2;
// camera.position.x = 2;
// camera.position.y = 2;
scene.add(camera);

// renderer (webgl draw the render into canvas)
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);