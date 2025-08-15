// Galaxy Anniversary Script - No 3D Text, No Double Click Event

// Basic Three.js setup
const canvas = document.getElementById('galaxy-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000010, 0.0015);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(0, 0, 50);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// --- Auto Zoom Effect ---
let autoZoom = false;
let zoomDirection = 1;
const zoomMin = 20;
const zoomMax = 80;
const zoomSpeedAuto = 0.25;

// Toggle auto zoom with key 'Z'
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'z') {
    autoZoom = !autoZoom;
  }
});
// Background - Galaxy with fallback
function createBackground() {
  const loader = new THREE.TextureLoader();
  loader.load('images/thienha.png', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    const geometry = new THREE.SphereGeometry(900, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const bg = new THREE.Mesh(geometry, material);
    scene.add(bg);
  }, undefined, () => {
    const geometry = new THREE.SphereGeometry(900, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0a0a2e, side: THREE.BackSide });
    const bg = new THREE.Mesh(geometry, material);
    scene.add(bg);
    addBackgroundStars();
  });
}

function addBackgroundStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 800;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = 700 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.cos(phi);
    positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    transparent: true,
    opacity: 0.6
  });
  const backgroundStars = new THREE.Points(starGeometry, starMaterial);
  scene.add(backgroundStars);
}

createBackground();

// Pink Planet
const planetGeometry = new THREE.SphereGeometry(4, 32, 32);
const planetMaterial = new THREE.MeshBasicMaterial({
  color: 0xff1694,
  transparent: true,
  opacity: 1.0
});
const glowGeometry = new THREE.SphereGeometry(4.2, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xff69b4,
  transparent: true,
  opacity: 0.4,
  side: THREE.BackSide
});
const planetGlow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(planetGlow);

const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

// Text rings around planet
const RINGS_CONFIG = [
  { text: 'I Love You ♥', radius: 12, count: 24, speed: 0.5 },
  { text: 'Happy Anniversary', radius: 18, count: 32, speed: -0.3 }
];

const ringsGroup = new THREE.Group();
scene.add(ringsGroup);

function createTextTexture(text, fontSize = 48, color = '#ffd6ea') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px "Segoe UI", "Arial", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createTextRings() {
  RINGS_CONFIG.forEach((config) => {
    const group = new THREE.Group();
    const texture = createTextTexture(config.text, 40);
    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2;
      const x = Math.cos(angle) * config.radius;
      const z = Math.sin(angle) * config.radius;
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, 0, z);
      sprite.scale.set(6, 1.6, 1);
      sprite.userData = { baseAngle: angle };
      group.add(sprite);
    }
    group.userData = { speed: config.speed, radius: config.radius };
    ringsGroup.add(group);
  });
}
createTextRings();

// Stars with image textures
let starPoints = null;
let imageSprites = [];
const particleCount = 1500;

function loadStarImages() {
  const loader = new THREE.TextureLoader();
  const imageTextures = [];
  const promises = [];
  const imageFiles = [
    'z6907980152241_ba3175cba703f9ab68de393b88430443.jpg',
    'z6907980566480_0067314bda38229023cd6c5d74a055d1.jpg',
    'z6907986209790_3d5a4f84fcf4f23aa6b72d6ff774e7f9.jpg',
    'z6907986210126_771425da94925f9af5553a94d3bf4f44.jpg',
    'z6907986210504_49e54106556b84cf0570c92046b3d687.jpg',
    'z6907986214022_8f1ecccb73b1d4ce0b6dfa71018f0e82.jpg',
    'z6907986215472_deba02cae431b94f045661db588e22cf.jpg',
    'z6907986227729_4321fd45314a15839c81a34ca5ef7bdd.jpg',
    'z6907986227859_fad5089fc5df2354476c9da58c8199a2.jpg',
    'z6907986228597_52cc822388901190b425877412c61a26.jpg',
    'z6907986228740_bf0e26104178778c4081dc88c48723f2.jpg',
    'z6908013529823_08c2fecd84d340c4048face6d250eeb8.jpg',
    'z6908013532688_10957597e3b965d0324ac8d1c4002361.jpg',
    'z6908013532798_fb6a64c219ea5004d6e1b5ed21d71a18.jpg',
    'z6908013532923_7baadd39826f401c2e4abadfdc6abc60.jpg',
    'z6908013535746_f38e4b59b71282d5cc5aadbc73137dd2.jpg',
    'z6908013537571_5056907a3d756a072e469f488d2a55fb.jpg',
    'z6908013538221_ad8ae2da6445d23a9387125c4b3c797d.jpg',
    'z6908013538349_7dab25ba11d00bde6a186e915e5ec780.jpg',
    'z6908013539815_6d14a4206fb6fff3ffbfe7eb03ea1091.jpg'
  ];
  imageFiles.forEach((filename, index) => {
    const promise = new Promise((resolve) => {
      loader.load(`images/${filename}`, (texture) => {
        imageTextures[index] = texture;
        resolve();
      }, undefined, () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const shapeType = index % 4;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const colors = ['#ff69b4', '#ff9ddb', '#ffb6e6', '#ff45a2', '#ff007f'];
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        switch(shapeType) {
          case 0: ctx.rect(centerX - 12, centerY - 12, 24, 24); break;
          case 1:
            ctx.moveTo(centerX, centerY - 20);
            ctx.lineTo(centerX + 20, centerY);
            ctx.lineTo(centerX, centerY + 20);
            ctx.lineTo(centerX - 20, centerY);
            break;
          case 2:
            ctx.moveTo(centerX, centerY - 20);
            ctx.lineTo(centerX + 20, centerY + 15);
            ctx.lineTo(centerX - 20, centerY + 15);
            break;
          case 3:
            const hexRadius = 15;
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const x = centerX + Math.cos(angle) * hexRadius;
              const y = centerY + Math.sin(angle) * hexRadius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            break;
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = colors[index % colors.length];
        ctx.shadowBlur = 15;
        ctx.fill();
        imageTextures[index] = new THREE.CanvasTexture(canvas);
        resolve();
      });
    });
    promises.push(promise);
  });
  Promise.all(promises).then(() => {
    createStarsWithImages(imageTextures);
  });
  return imageTextures;
}

function createImageSprites() {
  loadStarImages();
  const closeStarCount = 80;
  const defaultTextures = createFallbackTextures();
  for (let i = 0; i < closeStarCount; i++) {
    const angle = (i / closeStarCount) * Math.PI * 2;
    const radius = 15 + Math.random() * 20;
    const elevation = (Math.random() - 0.5) * Math.PI * 0.8;
    const x = Math.cos(angle) * Math.cos(elevation) * radius;
    const y = Math.sin(elevation) * radius;
    const z = Math.sin(angle) * Math.cos(elevation) * radius;
    const textureIndex = i % defaultTextures.length;
    const spriteMaterial = new THREE.SpriteMaterial({
      map: defaultTextures[textureIndex],
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    const scale = 2 + Math.random() * 3;
    sprite.scale.set(scale, scale, 1);
    imageSprites.push(sprite);
    scene.add(sprite);
  }
}

function createFallbackTextures() {
  const textures = [];
  const shapes = ['square', 'diamond', 'triangle', 'hexagon', 'star'];
  const colors = ['#ff69b4', '#ff9ddb', '#ffb6e6', '#ff45a2', '#ff007f'];
  for (let i = 0; i < shapes.length; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    switch(shapes[i]) {
      case 'square': ctx.rect(centerX - 12, centerY - 12, 24, 24); break;
      case 'diamond':
        ctx.moveTo(centerX, centerY - 20);
        ctx.lineTo(centerX + 20, centerY);
        ctx.lineTo(centerX, centerY + 20);
        ctx.lineTo(centerX - 20, centerY);
        break;
      case 'triangle':
        ctx.moveTo(centerX, centerY - 20);
        ctx.lineTo(centerX + 20, centerY + 15);
        ctx.lineTo(centerX - 20, centerY + 15);
        break;
      case 'hexagon':
        const hexRadius = 15;
        for (let j = 0; j < 6; j++) {
          const angle = (Math.PI / 3) * j;
          const x = centerX + Math.cos(angle) * hexRadius;
          const y = centerY + Math.sin(angle) * hexRadius;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        break;
      case 'star':
        const spikes = 5;
        const outerRadius = 20;
        const innerRadius = 10;
        for(let j = 0; j < spikes * 2; j++) {
          const radius = j % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / spikes) * j;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if(j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        break;
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur = 15;
    ctx.fill();
    textures.push(new THREE.CanvasTexture(canvas));
  }
  return textures;
}

function createStarsWithImages(textures) {
  const spritesCount = 300;
  const usedTextureIndices = new Set();
  const spiralArms = 5;
  for (let i = 0; i < spritesCount; i++) {
    let x, y, z;
    let textureIndex;
    if (usedTextureIndices.size < textures.length) {
      do {
        textureIndex = Math.floor(Math.random() * textures.length);
      } while (usedTextureIndices.has(textureIndex));
      usedTextureIndices.add(textureIndex);
    } else {
      textureIndex = (i % textures.length);
    }
    const patternType = i % 4;
    if (patternType === 0) {
      const armIndex = i % spiralArms;
      const armOffset = (2 * Math.PI / spiralArms) * armIndex;
      const distanceFromCenter = 20 + (i / spritesCount) * 170;
      const spiralTightness = 0.3;
      const spiralAngle = (i / spritesCount) * 12 * Math.PI + armOffset;
      x = Math.cos(spiralAngle + distanceFromCenter * spiralTightness) * distanceFromCenter;
      y = (Math.random() - 0.5) * 40;
      z = Math.sin(spiralAngle + distanceFromCenter * spiralTightness) * distanceFromCenter;
    } else if (patternType === 1) {
      const ringRadius = 40 + (i % 4) * 30;
      const ringAngle = (i / (spritesCount / 4)) * Math.PI * 2;
      const ringWidth = 5;
      x = Math.cos(ringAngle) * (ringRadius + (Math.random() - 0.5) * ringWidth);
      y = (Math.random() - 0.5) * 30;
      z = Math.sin(ringAngle) * (ringRadius + (Math.random() - 0.5) * ringWidth);
    } else if (patternType === 2) {
      const clusterCount = 8;
      const clusterIndex = i % clusterCount;
      const angle = (clusterIndex / clusterCount) * Math.PI * 2;
      const clusterDistance = 60 + (clusterIndex % 3) * 40;
      const clusterX = Math.cos(angle) * clusterDistance;
      const clusterY = (clusterIndex % 3 - 1) * 30;
      const clusterZ = Math.sin(angle) * clusterDistance;
      x = clusterX + (Math.random() - 0.5) * 20;
      y = clusterY + (Math.random() - 0.5) * 20;
      z = clusterZ + (Math.random() - 0.5) * 20;
    } else {
      const radius = 30 + Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.6;
      x = Math.cos(angle) * Math.cos(elevation) * radius;
      y = Math.sin(elevation) * radius;
      z = Math.sin(angle) * Math.cos(elevation) * radius;
    }
    if (textures[textureIndex]) {
      const isPhoto = textureIndex < textures.length - 5;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: textures[textureIndex],
        transparent: true,
        opacity: isPhoto ? 0.9 : 0.7,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y, z);
      let scale;
      if (isPhoto) {
        scale = 4 + Math.random() * 3;
        sprite.position.z += (Math.random() - 0.5) * 10;
      } else {
        scale = 2 + Math.random() * 2;
      }
      sprite.scale.set(scale, scale * 0.75, 1);
      sprite.rotation.z = Math.random() * Math.PI * 2;
      sprite.userData.isPhoto = isPhoto;
      sprite.userData.baseScale = scale;
      sprite.userData.textureIndex = textureIndex;
      imageSprites.push(sprite);
      scene.add(sprite);
    }
  }
}
createImageSprites();

function createStars() {
  const particleCount = 1200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    let x, y, z;
    const patternType = i % 5;
    if (patternType === 0) {
      const radius = Math.random() * 200 + 30;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.5;
      x = Math.cos(angle) * Math.cos(elevation) * radius;
      y = Math.sin(elevation) * radius;
      z = Math.sin(angle) * Math.cos(elevation) * radius;
    } else if (patternType === 1) {
      const radius = Math.random() * 200 + 30;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.2;
      x = Math.cos(angle) * Math.cos(elevation) * radius;
      y = Math.sin(elevation) * radius * 0.3;
      z = Math.sin(angle) * Math.cos(elevation) * radius;
    } else if (patternType === 2) {
      const armAngle = Math.random() * Math.PI * 8;
      const armRadius = 30 + armAngle * 3;
      const elevation = (Math.random() - 0.5) * 20;
      x = Math.cos(armAngle) * armRadius;
      y = elevation;
      z = Math.sin(armAngle) * armRadius;
    } else if (patternType === 3) {
      const clusterCenters = [
        {x: 60, y: 40, z: 80},
        {x: -70, y: -30, z: 60},
        {x: 90, y: -50, z: -90},
        {x: -50, y: 70, z: -60}
      ];
      const center = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
      const spread = 35;
      x = center.x + (Math.random() - 0.5) * spread;
      y = center.y + (Math.random() - 0.5) * spread;
      z = center.z + (Math.random() - 0.5) * spread;
    } else {
      const distance = 40 + Math.random() * 160;
      x = (Math.random() - 0.5) * distance;
      y = (Math.random() - 0.5) * distance;
      z = (Math.random() - 0.5) * distance;
    }
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    const colorType = Math.random();
    if (colorType < 0.5) {
      colors[i3] = 1;
      colors[i3 + 1] = 0.3 + Math.random() * 0.3;
      colors[i3 + 2] = 0.6 + Math.random() * 0.2;
    } else if (colorType < 0.7) {
      colors[i3] = 1;
      colors[i3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    } else if (colorType < 0.85) {
      colors[i3] = 1;
      colors[i3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i3 + 2] = 0.95 + Math.random() * 0.05;
    } else if (colorType < 0.95) {
      colors[i3] = 1;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    } else {
      colors[i3] = 0.8 + Math.random() * 0.2;
      colors[i3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i3 + 2] = 1;
    }
    if (Math.random() > 0.95) {
      sizes[i] = 2 + Math.random() * 2;
    } else {
      sizes[i] = 0.6 + Math.random() * 1.4;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const material = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  starPoints = new THREE.Points(geometry, material);
  scene.add(starPoints);

  // Square stars (shader)
  if (window.THREE && THREE.ShaderMaterial) {
    try {
      const squareGeometry = new THREE.BufferGeometry();
      const squareCount = particleCount / 4;
      const squarePositions = new Float32Array(squareCount * 3);
      const squareColors = new Float32Array(squareCount * 3);
      const squareSizes = new Float32Array(squareCount);
      for (let i = 0; i < squareCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 250 + 20;
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        squarePositions[i3] = Math.cos(angle) * Math.cos(elevation) * radius;
        squarePositions[i3 + 1] = Math.sin(elevation) * radius;
        squarePositions[i3 + 2] = Math.sin(angle) * Math.cos(elevation) * radius;
        squareColors[i3] = 1;
        squareColors[i3 + 1] = 0.4 + Math.random() * 0.4;
        squareColors[i3 + 2] = 0.7 + Math.random() * 0.3;
        squareSizes[i] = 1 + Math.random() * 2;
      }
      squareGeometry.setAttribute('position', new THREE.BufferAttribute(squarePositions, 3));
      squareGeometry.setAttribute('color', new THREE.BufferAttribute(squareColors, 3));
      squareGeometry.setAttribute('size', new THREE.BufferAttribute(squareSizes, 1));
      const squareMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0.0 } },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float x = 2.0 * gl_PointCoord.x - 1.0;
            float y = 2.0 * gl_PointCoord.y - 1.0;
            float d = max(abs(x), abs(y));
            float alpha = 1.0 - smoothstep(0.8, 1.0, d);
            if (alpha < 0.1) discard;
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        transparent: true,
        depthTest: true,
        blending: THREE.AdditiveBlending
      });
      const squarePoints = new THREE.Points(squareGeometry, squareMaterial);
      scene.add(squarePoints);
      squarePoints.userData.material = squareMaterial;
      starPoints.userData.squarePoints = squarePoints;
    } catch (error) {
      console.log('Error creating square stars:', error);
    }
  }
}
createStars();

// Mouse controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', (event) => {
  isDragging = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('mousemove', (event) => {
  if (isDragging) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };
    const rotationSpeed = 0.005;
    scene.rotation.y += deltaMove.x * rotationSpeed;
    scene.rotation.x += deltaMove.y * rotationSpeed;
    previousMousePosition = { x: event.clientX, y: event.clientY };
  }
});

renderer.domElement.addEventListener('mouseup', () => {
  isDragging = false;
});

renderer.domElement.addEventListener('mouseleave', () => {
  isDragging = false;
});

// Zoom with mouse wheel
renderer.domElement.addEventListener('wheel', (event) => {
  const zoomSpeed = 0.05;
  camera.position.z += event.deltaY * zoomSpeed;
  camera.position.z = Math.max(10, Math.min(100, camera.position.z));
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const time = Date.now() * 0.001;
   // Auto zoom effect
  if (autoZoom) {
    camera.position.z += zoomSpeedAuto * zoomDirection;
    if (camera.position.z >= zoomMax) zoomDirection = -1;
    if (camera.position.z <= zoomMin) zoomDirection = 1;
  }

  ringsGroup.children.forEach((ring) => {
    ring.rotation.y += ring.userData.speed * 0.01;
  });
  ringsGroup.children.forEach((ring) => {
    ring.rotation.y += ring.userData.speed * 0.01;
  });
  if (starPoints) {
    starPoints.rotation.y += 0.0003;
    const sizes = starPoints.geometry.attributes.size.array;
    const colors = starPoints.geometry.attributes.color.array;
    for (let i = 0; i < sizes.length; i++) {
      sizes[i] = 1.2 + Math.sin(time * 3 + i) * 0.6 + Math.random() * 0.3;
      const i3 = i * 3;
      if (colors[i3 + 1] < 0.8) {
        colors[i3 + 1] = 0.4 + Math.sin(time * 2 + i) * 0.2 + Math.random() * 0.1;
        colors[i3 + 2] = 0.7 + Math.sin(time * 1.5 + i) * 0.15 + Math.random() * 0.1;
      }
      if (Math.random() > 0.998) {
        sizes[i] = sizes[i] * 3;
        colors[i3] = 1;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      }
    }
    starPoints.geometry.attributes.size.needsUpdate = true;
    starPoints.geometry.attributes.color.needsUpdate = true;
    if (planetGlow) {
      planetGlow.scale.set(
        1.1 + Math.sin(time * 1.5) * 0.05,
        1.1 + Math.sin(time * 1.5) * 0.05,
        1.1 + Math.sin(time * 1.5) * 0.05
      );
      planetGlow.material.opacity = 0.4 + Math.sin(time * 2) * 0.1;
    }
    if (starPoints.userData.squarePoints) {
      const squarePoints = starPoints.userData.squarePoints;
      if (squarePoints.userData.material && squarePoints.userData.material.uniforms) {
        squarePoints.userData.material.uniforms.time.value = time;
      }
      squarePoints.rotation.y -= 0.0002;
      squarePoints.rotation.x += 0.0001;
      if (squarePoints.geometry.attributes.size) {
        const squareSizes = squarePoints.geometry.attributes.size.array;
        const squareColors = squarePoints.geometry.attributes.color.array;
        for (let i = 0; i < squareSizes.length; i++) {
          squareSizes[i] = 1 + Math.sin(time * 2 + i * 0.2) * 0.7 + Math.random() * 0.2;
          const i3 = i * 3;
          squareColors[i3 + 1] = 0.4 + Math.sin(time * 1.3 + i * 0.1) * 0.3;
          if (Math.random() > 0.999) {
            squareSizes[i] = squareSizes[i] * 3;
            squareColors[i3] = 1;
            squareColors[i3 + 1] = 1;
            squareColors[i3 + 2] = 1;
          }
        }
        squarePoints.geometry.attributes.size.needsUpdate = true;
        squarePoints.geometry.attributes.color.needsUpdate = true;
      }
    }
  }
  imageSprites.forEach((sprite, index) => {
    const isPhoto = sprite.userData.isPhoto;
    if (isPhoto) {
      const orbitSpeed = 0.1 + (index % 7) * 0.02;
      const orbitRadius = 0.01 + (index % 5) * 0.005;
      sprite.position.x += Math.sin(time * orbitSpeed + index) * orbitRadius;
      sprite.position.y += Math.sin(time * 0.3 + index * 0.2) * 0.01;
      sprite.position.z += Math.cos(time * orbitSpeed + index * 0.7) * orbitRadius;
      sprite.rotation.z += 0.001;
      const baseScale = sprite.userData.baseScale || sprite.scale.x;
      if (!sprite.userData.baseScale) sprite.userData.baseScale = baseScale;
      const scale = baseScale + Math.sin(time * 0.5 + index * 0.1) * 0.1;
      sprite.scale.set(scale, scale, 1);
    } else {
      const orbitSpeed = 0.3 + (index % 5) * 0.08;
      const orbitRadius = 0.04 + (index % 4) * 0.02;
      sprite.position.x += Math.sin(time * orbitSpeed + index) * orbitRadius;
      sprite.position.y += Math.sin(time * 0.7 + index * 0.4) * 0.03;
      sprite.position.z += Math.cos(time * orbitSpeed + index) * orbitRadius;
      sprite.rotation.z += 0.005 + (index % 10) * 0.001;
      const pulseSpeed = 1.5 + (index % 4);
      const pulseAmount = 0.4 + (index % 5) * 0.15;
      const baseScale = sprite.userData.baseScale || sprite.scale.x;
      if (!sprite.userData.baseScale) sprite.userData.baseScale = baseScale;
      const scale = sprite.userData.baseScale + Math.sin(time * pulseSpeed + index) * pulseAmount;
      sprite.scale.set(scale, scale, 1);
      if (Math.random() > 0.97) {
        sprite.material.opacity = 0.5 + Math.random() * 0.5;
      }
    }
    if (!isPhoto && Math.random() > 0.995) {
      const colors = [0xff69b4, 0xff45a2, 0xff9ddb, 0xffb6e6, 0xff007f];
      sprite.material.color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
    }
  });
  planet.rotation.y += 0.005;
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
