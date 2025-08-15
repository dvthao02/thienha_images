// Galaxy Anniversary Script - Clean Version
// Requirements: Pink planet, text rings around planet, stars with images, double-click text formation, 360 rotation, zoom

// Basic Three.js setup
const canvas = document.getElementById('galaxy-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000010, 0.0015);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(0, 0, 50);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);

// Lighting - Simplified
scene.add(new THREE.AmbientLight(0xffffff, 0.8)); // Increased ambient light, removed point light for better performance

// Background - Galaxy with fallback
function createBackground() {
  const loader = new THREE.TextureLoader();
  
  // Try to load galaxy background image
  loader.load('images/thienha.png', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2); // Reduced repeat for better performance
    const geometry = new THREE.SphereGeometry(900, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      side: THREE.BackSide 
    });
    const bg = new THREE.Mesh(geometry, material);
    scene.add(bg);
  }, undefined, (error) => {
    // Fallback to gradient if image fails to load
    console.log('Galaxy image not found, using gradient background');
    const geometry = new THREE.SphereGeometry(900, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x0a0a2e, 
      side: THREE.BackSide 
    });
    const bg = new THREE.Mesh(geometry, material);
    scene.add(bg);
    
    // Add some stars to the background if image fails
    addBackgroundStars();
  });
}

// Add procedural stars if background image fails
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

// Pink Planet - Simple and vibrant
const planetGeometry = new THREE.SphereGeometry(4, 32, 32);

// Create a bright pink material for better visibility
const planetMaterial = new THREE.MeshBasicMaterial({
  color: 0xff1694, // Bright pink
  transparent: true,
  opacity: 1.0
});

// Add a glow effect to the planet
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
  { text: 'I Love You ♥', radius: 12, count: 24, speed: 0.5 }, // Reduced from 36 to 24
  { text: 'Happy Anniversary', radius: 18, count: 32, speed: -0.3 } // Reduced from 48 to 32, removed one ring
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
  ctx.font = `${fontSize}px "Segoe UI", "Arial", sans-serif`; // Better font for ring text too
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createTextRings() {
  RINGS_CONFIG.forEach((config, ringIndex) => {
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
let imageSprites = []; // Array to hold image sprites
const particleCount = 1500; // Reduced from 3000 to 1500 for faster loading

// Load star images for sprites
function loadStarImages() {
  const loader = new THREE.TextureLoader();
  const imageTextures = [];
  const promises = [];
  
  // Use a wide variety of photo images with reduced repetition
  const imageFiles = [
    // Hình ảnh kỷ niệm từ thư mục
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
        console.log(`Loaded ${filename}`);
        resolve();
      }, undefined, (error) => {
        console.log(`Could not load ${filename}, using fallback`);
        // Create a fallback shape texture - using squares and other shapes instead of stars
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Create different shape types based on index
        const shapeType = index % 4; // 0=square, 1=diamond, 2=triangle, 3=hexagon
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Use different colors
        const colors = ['#ff69b4', '#ff9ddb', '#ffb6e6', '#ff45a2', '#ff007f'];
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        
        switch(shapeType) {
          case 0: // Square
            const size = 24;
            ctx.rect(centerX - size/2, centerY - size/2, size, size);
            break;
          case 1: // Diamond
            ctx.moveTo(centerX, centerY - 20);
            ctx.lineTo(centerX + 20, centerY);
            ctx.lineTo(centerX, centerY + 20);
            ctx.lineTo(centerX - 20, centerY);
            break;
          case 2: // Triangle
            ctx.moveTo(centerX, centerY - 20);
            ctx.lineTo(centerX + 20, centerY + 15);
            ctx.lineTo(centerX - 20, centerY + 15);
            break;
          case 3: // Hexagon
            const hexRadius = 15;
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const x = centerX + Math.cos(angle) * hexRadius;
              const y = centerY + Math.sin(angle) * hexRadius;
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            break;
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Add some glow
        ctx.shadowColor = colors[index % colors.length];
        ctx.shadowBlur = 15;
        ctx.fill();
        
        imageTextures[index] = new THREE.CanvasTexture(canvas);
        resolve();
      });
    });
    
    promises.push(promise);
  });
  
  // When all textures are loaded or fallbacks created
  Promise.all(promises).then(() => {
    console.log("All star textures loaded, creating stars with images");
    createStarsWithImages(imageTextures);
  });
  
  return imageTextures;
}

// Create sprites with star images throughout the galaxy
function createImageSprites() {
  loadStarImages();
  
  // Create a smaller number of close-up star sprites that appear immediately
  const closeStarCount = 80; // Increased from 40 to 80
  const defaultTextures = createFallbackTextures();
  
  for (let i = 0; i < closeStarCount; i++) {
    // Position sprites in interesting formations around the scene
    const angle = (i / closeStarCount) * Math.PI * 2;
    const radius = 15 + Math.random() * 20; // Wider distribution
    const elevation = (Math.random() - 0.5) * Math.PI * 0.8;
    
    const x = Math.cos(angle) * Math.cos(elevation) * radius;
    const y = Math.sin(elevation) * radius;
    const z = Math.sin(angle) * Math.cos(elevation) * radius;
    
    // Use different shapes from the fallback textures
    const textureIndex = i % defaultTextures.length;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: defaultTextures[textureIndex],
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    
    // Vary the sizes more
    const scale = 2 + Math.random() * 3;
    sprite.scale.set(scale, scale, 1);
    
    imageSprites.push(sprite);
    scene.add(sprite);
  }
}

// Create an array of fallback textures with different shapes
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
      case 'square':
        const size = 24;
        ctx.rect(centerX - size/2, centerY - size/2, size, size);
        break;
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
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
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
          
          if(j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        break;
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Add some glow
    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur = 15;
    ctx.fill();
    
    textures.push(new THREE.CanvasTexture(canvas));
  }
  
  return textures;
}

// Create stars with image textures after loading
function createStarsWithImages(textures) {
  // Create additional star sprites with the loaded textures
  const spritesCount = 300; // Reduced from 400 to 300 to minimize repetition
  
  // Tracking already used indices to prevent repetition
  const usedTextureIndices = new Set();
  
  // Create spiraling patterns for photos
  const spiralArms = 5; // Number of spiral arms
  
  for (let i = 0; i < spritesCount; i++) {
    let x, y, z;
    
    // Choose texture - avoid repeating the same texture too often
    let textureIndex;
    if (usedTextureIndices.size < textures.length) {
      // First use all textures at least once
      do {
        textureIndex = Math.floor(Math.random() * textures.length);
      } while (usedTextureIndices.has(textureIndex));
      usedTextureIndices.add(textureIndex);
    } else {
      // Then select textures with better distribution
      textureIndex = (i % textures.length);
    }
    
    // Different distribution patterns for better visual appeal
    const patternType = i % 4;
    
    if (patternType === 0) {
      // Spiral galaxy pattern
      const armIndex = i % spiralArms;
      const armOffset = (2 * Math.PI / spiralArms) * armIndex;
      const distanceFromCenter = 20 + (i / spritesCount) * 170;
      const spiralTightness = 0.3;
      const spiralAngle = (i / spritesCount) * 12 * Math.PI + armOffset;
      
      x = Math.cos(spiralAngle + distanceFromCenter * spiralTightness) * distanceFromCenter;
      y = (Math.random() - 0.5) * 40; // Thinner vertical distribution
      z = Math.sin(spiralAngle + distanceFromCenter * spiralTightness) * distanceFromCenter;
    } 
    else if (patternType === 1) {
      // Ring formations
      const ringRadius = 40 + (i % 4) * 30;
      const ringAngle = (i / (spritesCount / 4)) * Math.PI * 2;
      const ringWidth = 5;
      
      x = Math.cos(ringAngle) * (ringRadius + (Math.random() - 0.5) * ringWidth);
      y = (Math.random() - 0.5) * 30;
      z = Math.sin(ringAngle) * (ringRadius + (Math.random() - 0.5) * ringWidth);
    }
    else if (patternType === 2) {
      // Cluster patterns
      const clusterCount = 8;
      const clusterIndex = i % clusterCount;
      const angle = (clusterIndex / clusterCount) * Math.PI * 2;
      const clusterDistance = 60 + (clusterIndex % 3) * 40;
      
      const clusterX = Math.cos(angle) * clusterDistance;
      const clusterY = (clusterIndex % 3 - 1) * 30;
      const clusterZ = Math.sin(angle) * clusterDistance;
      
      // Position around cluster center
      x = clusterX + (Math.random() - 0.5) * 20;
      y = clusterY + (Math.random() - 0.5) * 20;
      z = clusterZ + (Math.random() - 0.5) * 20;
    }
    else {
      // Some random distribution for variety
      const radius = 30 + Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.6;
      
      x = Math.cos(angle) * Math.cos(elevation) * radius;
      y = Math.sin(elevation) * radius;
      z = Math.sin(angle) * Math.cos(elevation) * radius;
    }
    
    if (textures[textureIndex]) {
      // Make special treatment for photos vs geometric shapes
      const isPhoto = textureIndex < textures.length - 5; // Assuming all photos are loaded first
      
      const spriteMaterial = new THREE.SpriteMaterial({
        map: textures[textureIndex],
        transparent: true,
        opacity: isPhoto ? 0.9 : 0.7,
        blending: THREE.AdditiveBlending
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y, z);
      
      // Random sizes based on type
      let scale;
      if (isPhoto) {
        // Photos should be larger and more visible
        scale = 4 + Math.random() * 3;
        // Add depth variation for photos
        sprite.position.z += (Math.random() - 0.5) * 10;
      } else {
        // Geometric shapes can be smaller
        scale = 2 + Math.random() * 2;
      }
      
      sprite.scale.set(scale, scale * 0.75, 1); // Make slightly rectangular for photos
      
      // Add some random rotation
      sprite.rotation.z = Math.random() * Math.PI * 2;
      
      // Store if this is a photo for animation purposes
      sprite.userData.isPhoto = isPhoto;
      sprite.userData.baseScale = scale;
      sprite.userData.textureIndex = textureIndex;
      
      imageSprites.push(sprite);
      scene.add(sprite);
    }
  }
  
  console.log(`Created ${imageSprites.length} star sprites with images`);
}createImageSprites();

function createStars() {
  // Increased particle count for more stars
  const particleCount = 1200; // Increased from 800 to 1200
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount); // Add size attribute
  
  // Create different patterns for the stars
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    let x, y, z;
    
    // Different distribution patterns
    const patternType = i % 5;
    
    if (patternType === 0) {
      // Spherical distribution
      const radius = Math.random() * 200 + 30;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.5;
      
      x = Math.cos(angle) * Math.cos(elevation) * radius;
      y = Math.sin(elevation) * radius;
      z = Math.sin(angle) * Math.cos(elevation) * radius;
    } 
    else if (patternType === 1) {
      // Disk distribution (flatter)
      const radius = Math.random() * 200 + 30;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.2; // Flatter
      
      x = Math.cos(angle) * Math.cos(elevation) * radius;
      y = Math.sin(elevation) * radius * 0.3; // Compressed vertical
      z = Math.sin(angle) * Math.cos(elevation) * radius;
    }
    else if (patternType === 2) {
      // Spiral arm pattern
      const armAngle = Math.random() * Math.PI * 8;
      const armRadius = 30 + armAngle * 3;
      const elevation = (Math.random() - 0.5) * 20;
      
      x = Math.cos(armAngle) * armRadius;
      y = elevation;
      z = Math.sin(armAngle) * armRadius;
    }
    else if (patternType === 3) {
      // Clustered pattern
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
    }
    else {
      // Random cubic distribution
      const distance = 40 + Math.random() * 160;
      x = (Math.random() - 0.5) * distance;
      y = (Math.random() - 0.5) * distance;
      z = (Math.random() - 0.5) * distance;
    }
    
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    
    // Beautiful pink twinkling colors - with more variety
    const colorType = Math.random();
    if (colorType < 0.5) { // Deep pink stars
      colors[i3] = 1;
      colors[i3 + 1] = 0.3 + Math.random() * 0.3;
      colors[i3 + 2] = 0.6 + Math.random() * 0.2;
    } else if (colorType < 0.7) { // Light pink stars
      colors[i3] = 1;
      colors[i3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    } else if (colorType < 0.85) { // White-pink stars
      colors[i3] = 1;
      colors[i3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i3 + 2] = 0.95 + Math.random() * 0.05;
    } else if (colorType < 0.95) { // Pure white bright stars
      colors[i3] = 1;
      colors[i3 + 1] = 1; 
      colors[i3 + 2] = 1;
    } else { // Few blue-white stars for contrast
      colors[i3] = 0.8 + Math.random() * 0.2;
      colors[i3 + 1] = 0.9 + Math.random() * 0.1; 
      colors[i3 + 2] = 1;
    }
    
    // More varied sizes for visual interest
    if (Math.random() > 0.95) {
      // Few larger stars as highlights
      sizes[i] = 2 + Math.random() * 2;
    } else {
      // Most stars smaller to medium
      sizes[i] = 0.6 + Math.random() * 1.4;
    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Create different types of point materials for varied star appearance
  // Main star field
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
  
  // Add a secondary field of square-shaped stars using custom shader
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
        
        // Pink colors for squares
        squareColors[i3] = 1;
        squareColors[i3 + 1] = 0.4 + Math.random() * 0.4;
        squareColors[i3 + 2] = 0.7 + Math.random() * 0.3;
        
        squareSizes[i] = 1 + Math.random() * 2;
      }
      
      squareGeometry.setAttribute('position', new THREE.BufferAttribute(squarePositions, 3));
      squareGeometry.setAttribute('color', new THREE.BufferAttribute(squareColors, 3));
      squareGeometry.setAttribute('size', new THREE.BufferAttribute(squareSizes, 1));
      
      // Custom shader material for square points
      const squareMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 }
        },
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
            
            // Square shape with slightly rounded corners
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
      
      // Store for animation
      squarePoints.userData.material = squareMaterial;
      
      // Add to the starPoints object for animation
      starPoints.userData.squarePoints = squarePoints;
    } catch (error) {
      console.log('Error creating square stars:', error);
    }
  }
}
createStars();

// 3D Text formation function with improved clarity for date display
function animatePixelsToText(message, duration = 4000) {
  if (!starPoints) return;
  
  // Create text canvas with optimized dimensions for date display
  const canvas = document.createElement('canvas');
  canvas.width = 1000;  // Optimized for date format
  canvas.height = 400;  // Reduced height for better concentration of particles
  const ctx = canvas.getContext('2d');
  
  // Create a stronger gradient with more vibrant colors
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#ff1694');    // Vibrant hot pink
  gradient.addColorStop(0.3, '#ff69b4');  // Pink
  gradient.addColorStop(0.5, '#ffffff');  // White for maximum contrast
  gradient.addColorStop(0.7, '#ff69b4');  // Pink
  gradient.addColorStop(1, '#ff1694');    // Vibrant hot pink
  
  // Fill background with deep black for maximum contrast
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set text style with extra-large size for better sampling with fewer pixels
  ctx.fillStyle = gradient;
  
  // Use a larger, bolder font with wider strokes for better sampling
  const fontSize = 280; // Increased font size for bolder text
  ctx.font = `bold ${fontSize}px "Impact", "Arial Black", sans-serif`; // Fonts with thicker strokes
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add focused shadow for better contrast
  ctx.shadowColor = 'rgba(255, 0, 128, 0.9)';
  ctx.shadowBlur = 25; // Reduced blur for sharper text
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw text centered on canvas
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  
  // Reset shadow for outline
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Add precise outline layers for better number visibility
  // White outline
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeText(message, canvas.width / 2, canvas.height / 2);
  
  // Pink outline
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ff3399';
  ctx.strokeText(message, canvas.width / 2, canvas.height / 2);
  
  // Fill again to make sure the gradient is on top
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  
  // Add a bright highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Increased opacity for better visibility
  ctx.font = `bold ${fontSize - 5}px "Consolas", "Monaco", monospace`; // Slightly smaller for inner highlight
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  
  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Target positions for particles
  const targetPositions = [];
  
  // Extract text pixel positions with much wider sampling for clearer, much less dense text
  // Use much wider sampling for maximum clarity with numbers
  // Chỉ lấy pixel có alpha > 128, sampling mỗi 8px để vừa đủ số lượng điểm ảnh
  for (let y = 0; y < canvas.height; y += 8) {
    for (let x = 0; x < canvas.width; x += 8) {
      const index = (y * canvas.width + x) * 4;
      const alpha = imageData.data[index + 3];
      if (alpha > 128) {
        // Scale vị trí về không gian 3D
        const worldX = (x - canvas.width / 2) * 0.08;
        const worldY = (canvas.height / 2 - y) * 0.08;
        const worldZ = 0;
        targetPositions.push([worldX, worldY, worldZ]);
      }
    }
  }
  // Số lượng điểm ảnh đúng bằng số pixel text
  const textParticleCount = targetPositions.length;
  console.log(`Tạo ${textParticleCount} điểm ảnh cho text, sampling hợp lý.`);
  const textGeometry = new THREE.BufferGeometry();
  const textPositions = new Float32Array(textParticleCount * 3);
  const textColors = new Float32Array(textParticleCount * 3);
  const textSizes = new Float32Array(textParticleCount);
  // Khởi tạo vị trí và thuộc tính cho từng điểm ảnh
  for (let i = 0; i < textParticleCount; i++) {
    textPositions[i * 3] = targetPositions[i][0];
    textPositions[i * 3 + 1] = targetPositions[i][1];
    textPositions[i * 3 + 2] = targetPositions[i][2];
    // Màu hồng sáng cho text
    textColors[i * 3] = 1.0;
    textColors[i * 3 + 1] = 0.6;
    textColors[i * 3 + 2] = 0.85;
    textSizes[i] = 5.0; // Size vừa phải, không quá to
  }
  textGeometry.setAttribute('position', new THREE.BufferAttribute(textPositions, 3));
  textGeometry.setAttribute('color', new THREE.BufferAttribute(textColors, 3));
  textGeometry.setAttribute('size', new THREE.BufferAttribute(textSizes, 1));
  // Material cho text rõ ràng
  const textMaterial = new THREE.PointsMaterial({
    size: 5.0,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const textPointsObject = new THREE.Points(textGeometry, textMaterial);
  scene.add(textPointsObject);
  
  // Create another layer of much larger, glowing particles for the text outline
  const outlineGeometry = new THREE.BufferGeometry();
  const outlinePositions = new Float32Array(Math.min(500, targetPositions.length) * 3);
  const outlineColors = new Float32Array(Math.min(500, targetPositions.length) * 3);
  const outlineSizes = new Float32Array(Math.min(500, targetPositions.length));
  
  // Take fewer points for outline - every 3rd point for better outlining
  for (let i = 0, j = 0; i < Math.min(500, targetPositions.length) && j < targetPositions.length; i++, j += 3) {
    const i3 = i * 3;
    if (j >= targetPositions.length) break;
    
    const [tx, ty, tz] = targetPositions[j];
    // Add slight offset for better outline effect
    outlinePositions[i3] = tx + (Math.random() - 0.5) * 0.6;
    outlinePositions[i3 + 1] = ty + (Math.random() - 0.5) * 0.6;
    outlinePositions[i3 + 2] = tz - 0.5; // Position slightly behind main text
    
    // Use hot pink for outline
    outlineColors[i3] = 1;     // Red
    outlineColors[i3 + 1] = 0.1 + Math.random() * 0.2; // Very little green for hot pink
    outlineColors[i3 + 2] = 0.5 + Math.random() * 0.2; // Medium blue for pink tone
    
    // Much larger sizes for outline
    outlineSizes[i] = 10.0 + Math.random() * 4.0;
  }
  
  outlineGeometry.setAttribute('position', new THREE.BufferAttribute(outlinePositions, 3));
  outlineGeometry.setAttribute('color', new THREE.BufferAttribute(outlineColors, 3));
  outlineGeometry.setAttribute('size', new THREE.BufferAttribute(outlineSizes, 1));
  
  const outlineMaterial = new THREE.PointsMaterial({
    size: 10.0, // Much larger size
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.8, // Slightly increased opacity
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const outlinePointsObject = new THREE.Points(outlineGeometry, outlineMaterial);
  scene.add(outlinePointsObject);
  
  // Also use image sprites for text formation
  const imageTextSprites = [];
  const spriteCount = Math.min(300, imageSprites.length / 2);
  
  // Use more image sprites for the text to enhance visibility
  for (let i = 0; i < spriteCount; i++) {
    if (i < targetPositions.length) {
      const sprite = imageSprites[i % imageSprites.length].clone();
      const [tx, ty, tz] = targetPositions[i];
      
      // Start from a random position outside the view
      const radius = 60 + Math.random() * 40; // Start from further away
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      sprite.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
      
      // Store target position in userData
      sprite.userData.targetPos = { x: tx, y: ty, z: tz };
      sprite.userData.originalPos = { 
        x: sprite.position.x, 
        y: sprite.position.y, 
        z: sprite.position.z 
      };
      
      // Make much larger for better visibility
      const scale = 5 + Math.random() * 3; // Significantly increased scale
      sprite.scale.set(scale, scale, 1);
      
      // Make them more visible
      if (sprite.material) {
        sprite.material.opacity = 1.0;
      }
      
      imageTextSprites.push(sprite);
      scene.add(sprite);
    }
  }
  
  const startTime = Date.now();
  
  // Smoother camera transition to get much closer to text for clarity
  const originalCameraPosition = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  };
  
  const targetCameraPosition = {
    x: 0,
    y: 5,  // Position slightly above center to see text better
    z: 25  // Much closer to text for better readability
  };
  
  // Animate particles to text positions
  const animateParticles = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Use a nice easing function for smoother animation
    const easeOutBack = (x) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };
    
    // Use a different easing for camera
    const easeOutCubic = (x) => {
      return 1 - Math.pow(1 - x, 3);
    };
    
    const easedProgress = easeOutBack(progress);
    const cameraProgress = easeOutCubic(progress);
    
    // Move camera smoothly to ideal viewing position
    camera.position.x = originalCameraPosition.x * (1 - cameraProgress) + targetCameraPosition.x * cameraProgress;
    camera.position.y = originalCameraPosition.y * (1 - cameraProgress) + targetCameraPosition.y * cameraProgress;
    camera.position.z = originalCameraPosition.z * (1 - cameraProgress) + targetCameraPosition.z * cameraProgress;
    camera.lookAt(0, 5, 0); // Look at the text
    
    // Animate the text points
    const positions = textPointsObject.geometry.attributes.position.array;
    for (let i = 0; i < Math.min(textParticleCount, targetPositions.length); i++) {
      const i3 = i * 3;
      const [tx, ty, tz] = targetPositions[i];
      
      positions[i3] = textPositions[i3] + (tx - textPositions[i3]) * easedProgress;
      positions[i3 + 1] = textPositions[i3 + 1] + (ty - textPositions[i3 + 1]) * easedProgress;
      positions[i3 + 2] = textPositions[i3 + 2] + (tz - textPositions[i3 + 2]) * easedProgress;
    }
    
    textPointsObject.geometry.attributes.position.needsUpdate = true;
    
    // Animate the outline points
    if (outlinePointsObject && outlinePointsObject.geometry) {
      const outlinePos = outlinePointsObject.geometry.attributes.position.array;
      for (let i = 0, j = 0; i < outlinePos.length / 3 && j < targetPositions.length; i++, j += 5) {
        const i3 = i * 3;
        if (j >= targetPositions.length) break;
        
        const [tx, ty, tz] = targetPositions[j];
        
        // Random offset for outline effect
        const offsetX = (Math.random() - 0.5) * 0.4;
        const offsetY = (Math.random() - 0.5) * 0.4;
        const offsetZ = (Math.random() - 0.5) * 0.2;
        
        outlinePos[i3] = tx + offsetX;
        outlinePos[i3 + 1] = ty + offsetY;
        outlinePos[i3 + 2] = tz + offsetZ;
      }
      
      outlinePointsObject.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate the image sprites
    for (let i = 0; i < imageTextSprites.length; i++) {
      const sprite = imageTextSprites[i];
      const target = sprite.userData.targetPos;
      const original = sprite.userData.originalPos;
      
      sprite.position.x = original.x + (target.x - original.x) * easedProgress;
      sprite.position.y = original.y + (target.y - original.y) * easedProgress;
      sprite.position.z = original.z + (target.z - original.z) * easedProgress;
      
      // Scale up during animation for more dramatic effect
      const scaleMultiplier = 1 + easedProgress * 0.5;
      sprite.scale.x = sprite.scale.y = sprite.scale.z = sprite.userData.originalScale || 
                                                        (sprite.scale.x * scaleMultiplier);
      
      if (!sprite.userData.originalScale) {
        sprite.userData.originalScale = sprite.scale.x;
      }
    }
    
    // Add special glow effect as text forms
    if (progress > 0.7) {
      const glowIntensity = (progress - 0.7) / 0.3; // Ramps from 0 to 1 during last 30%
      
      // Increase point sizes for glowing effect
      const sizes = textPointsObject.geometry.attributes.size.array;
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] = textSizes[i] * (1 + glowIntensity * 0.5);
      }
      textPointsObject.geometry.attributes.size.needsUpdate = true;
      
      // Make outline points pulse
      if (outlinePointsObject && outlinePointsObject.geometry) {
        const outlineSizesArray = outlinePointsObject.geometry.attributes.size.array;
        for (let i = 0; i < outlineSizesArray.length; i++) {
          outlineSizesArray[i] = outlineSizes[i] * (1 + Math.sin(Date.now() * 0.01 + i) * 0.3 * glowIntensity);
        }
        outlinePointsObject.geometry.attributes.size.needsUpdate = true;
      }
    }
    
    if (progress < 1) {
      requestAnimationFrame(animateParticles);
    } else {
      // Store references for animation and cleanup
      starPoints.userData.textPointsObject = textPointsObject;
      starPoints.userData.outlinePointsObject = outlinePointsObject;
      starPoints.userData.imageTextSprites = imageTextSprites;
      
      // Add continuous animation to text to make it stand out
      const pulseText = () => {
        if (!textPointsObject || !textPointsObject.geometry) return; // Check if object still exists
        
        const time = Date.now() * 0.001;
        const sizes = textPointsObject.geometry.attributes.size.array;
        const colors = textPointsObject.geometry.attributes.color.array;
        
        for (let i = 0; i < sizes.length; i++) {
          // Subtle size pulsing
          sizes[i] = textSizes[i] * (1 + Math.sin(time * 2 + i * 0.1) * 0.15);
          
          // Subtle color pulsing for sparkle effect
          const i3 = i * 3;
          colors[i3] = 1; // Red stays at max
          colors[i3 + 1] = 0.9 + Math.sin(time * 3 + i * 0.2) * 0.1; // Green pulses
          colors[i3 + 2] = 0.95 + Math.sin(time * 2.5 + i * 0.15) * 0.05; // Blue pulses
        }
        
        textPointsObject.geometry.attributes.size.needsUpdate = true;
        textPointsObject.geometry.attributes.color.needsUpdate = true;
        
        // Continue animation as long as text is displayed
        if (textDisplayed) {
          requestAnimationFrame(pulseText);
        }
      };
      
      pulseText();
    }
  };
  
  animateParticles();
}

// Mouse controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// 360-degree rotation with mouse drag
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

// Double-click to trigger text formation with enhanced visibility
let clickCount = 0;
let clickTimer = null;
let textDisplayed = false;

renderer.domElement.addEventListener('click', () => {
  clickCount++;
  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    if (clickCount === 2 && !textDisplayed) {
      // Tính số ngày yêu nhau từ 14-02-2022 đến hôm nay
      const startDate = new Date(2022, 1, 14);
      const currentDate = new Date();
      const days = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
      // Làm mờ các sprite ảnh để nổi bật chữ
      imageSprites.forEach(sprite => {
        if (sprite.material) {
          const startOpacity = sprite.material.opacity;
          sprite.userData.startOpacity = startOpacity;
          const fadeOut = (progress) => {
            if (progress > 1) progress = 1;
            sprite.material.opacity = startOpacity * (1 - progress * 0.7);
            if (progress < 1) {
              requestAnimationFrame(() => fadeOut(progress + 0.05));
            }
          };
          fadeOut(0);
        }
      });
      // Hiển thị ngày bắt đầu
      animatePixelsToText("14-02-2022", 3000);
      textDisplayed = true;
      // Sau 3 giây, hiển thị số ngày yêu nhau
      setTimeout(() => {
        if (textDisplayed) {
          animatePixelsToText(`${days} ngày yêu nhau`, 4000);
        }
      }, 3000);
    } else if (clickCount === 2 && textDisplayed) {
      // Reset stars if double-clicked again
      resetStars();
      // Restore opacity of image sprites
      imageSprites.forEach(sprite => {
        if (sprite.material && sprite.userData.startOpacity !== undefined) {
          const targetOpacity = sprite.userData.startOpacity;
          const currentOpacity = sprite.material.opacity;
          // Animate opacity back up
          const fadeIn = (progress) => {
            if (progress > 1) progress = 1;
            sprite.material.opacity = currentOpacity + (targetOpacity - currentOpacity) * progress;
            if (progress < 1) {
              requestAnimationFrame(() => fadeIn(progress + 0.05));
            }
          };
          fadeIn(0);
        }
      });
      textDisplayed = false;
    }
    clickCount = 0;
  }, 300);
});

// Create special stars functionality is now built into the animatePixelsToText function
// This function is just a wrapper now for backward compatibility
function createSpecialStarsForText() {
  // All functionality is now handled directly in animatePixelsToText
  console.log("Creating special text stars directly in animation function");
}

// Reset stars to original formation with enhanced transition
function resetStars() {
  // Create a smoother transition for text disappearance
  const fadeOutText = () => {
    // Fade out main text points
    if (starPoints.userData.textPointsObject) {
      const textObject = starPoints.userData.textPointsObject;
      let opacity = textObject.material.opacity;
      
      const fadeOutStep = () => {
        opacity -= 0.05;
        if (opacity <= 0) {
          // Remove when fully transparent
          scene.remove(textObject);
          delete starPoints.userData.textPointsObject;
        } else {
          textObject.material.opacity = opacity;
          requestAnimationFrame(fadeOutStep);
        }
      };
      
      fadeOutStep();
    }
    
    // Fade out outline points if they exist
    if (starPoints.userData.outlinePointsObject) {
      const outlineObject = starPoints.userData.outlinePointsObject;
      let outlineOpacity = outlineObject.material.opacity;
      
      const fadeOutOutline = () => {
        outlineOpacity -= 0.07;
        if (outlineOpacity <= 0) {
          scene.remove(outlineObject);
          delete starPoints.userData.outlinePointsObject;
        } else {
          outlineObject.material.opacity = outlineOpacity;
          requestAnimationFrame(fadeOutOutline);
        }
      };
      
      fadeOutOutline();
    }
    
    // Animate image sprites used for text to disappear with a special effect
    if (starPoints.userData.imageTextSprites) {
      const sprites = starPoints.userData.imageTextSprites;
      
      sprites.forEach((sprite, index) => {
        // Stagger the animation for more interesting effect
        setTimeout(() => {
          let scaleValue = sprite.scale.x;
          let opacityValue = sprite.material.opacity;
          
          // Random direction to fly off
          const direction = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
          };
          
          const animateSprite = () => {
            scaleValue -= 0.1;
            opacityValue -= 0.05;
            
            if (scaleValue <= 0.1 || opacityValue <= 0) {
              scene.remove(sprite);
              
              // When the last sprite is removed, delete the reference
              if (index === sprites.length - 1) {
                delete starPoints.userData.imageTextSprites;
              }
            } else {
              sprite.scale.set(scaleValue, scaleValue, 1);
              sprite.material.opacity = opacityValue;
              
              // Move in random direction as it disappears
              sprite.position.x += direction.x;
              sprite.position.y += direction.y;
              sprite.position.z += direction.z;
              
              requestAnimationFrame(animateSprite);
            }
          };
          
          animateSprite();
        }, index * 20); // Staggered timing
      });
    }
  };
  
  // Start the fade out transition
  fadeOutText();
  
  // Reset camera with smooth animation
  const startCamX = camera.position.x;
  const startCamY = camera.position.y;
  const startCamZ = camera.position.z;
  
  const targetX = 0;
  const targetY = 0;
  const targetZ = 50;
  
  let progress = 0;
  
  const animateCamera = () => {
    progress += 0.015; // Slower for smoother transition
    if (progress > 1) progress = 1;
    
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    camera.position.x = startCamX + (targetX - startCamX) * easeOut;
    camera.position.y = startCamY + (targetY - startCamY) * easeOut;
    camera.position.z = startCamZ + (targetZ - startCamZ) * easeOut;
    
    camera.lookAt(0, 0, 0);
    
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    }
  };
  
  animateCamera();
  
  // Recreate original star distribution for standard star points with an animated transition
  const positions = starPoints.geometry.attributes.position.array;
  const currentPositions = positions.slice(); // Copy current positions
  
  // Calculate target positions
  const targetPositions = new Float32Array(positions.length);
  
  for (let i = 0; i < positions.length / 3; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 200 + 30;
    const angle = Math.random() * Math.PI * 2;
    const elevation = (Math.random() - 0.5) * Math.PI * 0.5;
    
    targetPositions[i3] = Math.cos(angle) * Math.cos(elevation) * radius;
    targetPositions[i3 + 1] = Math.sin(elevation) * radius;
    targetPositions[i3 + 2] = Math.sin(angle) * Math.cos(elevation) * radius;
  }
  
  // Animate transition to new positions
  let starAnimProgress = 0;
  
  const animateStars = () => {
    starAnimProgress += 0.02;
    if (starAnimProgress > 1) starAnimProgress = 1;
    
    // Use an ease-in-out function for smoother transition
    const easeFactor = starAnimProgress < 0.5 ? 
                      2 * starAnimProgress * starAnimProgress : 
                      1 - Math.pow(-2 * starAnimProgress + 2, 2) / 2;
    
    for (let i = 0; i < positions.length; i++) {
      positions[i] = currentPositions[i] + (targetPositions[i] - currentPositions[i]) * easeFactor;
    }
    
    starPoints.geometry.attributes.position.needsUpdate = true;
    
    if (starAnimProgress < 1) {
      requestAnimationFrame(animateStars);
    }
  };
  
  animateStars();
  
  // Redistribute image sprites with an enhanced animation
  redistributeImageSprites();
}

// Function to redistribute image sprites after reset
function redistributeImageSprites() {
  // Only redistribute if there are existing sprites
  if (imageSprites.length === 0) return;
  
  // Different distribution patterns
  const spiralArms = 5; 
  
  imageSprites.forEach((sprite, i) => {
    let x, y, z;
    const patternType = i % 4;
    
    if (patternType === 0) {
      // Spiral galaxy pattern
      const armIndex = i % spiralArms;
      const armOffset = (2 * Math.PI / spiralArms) * armIndex;
      const distanceFromCenter = 20 + (i / imageSprites.length) * 170;
      const spiralTightness = 0.3;
      const spiralAngle = (i / imageSprites.length) * 12 * Math.PI + armOffset;
      
      x = Math.cos(spiralAngle + distanceFromCenter * spiralTightness) * distanceFromCenter;
      y = (Math.random() - 0.5) * 40;
      z = Math.sin(spiralAngle + distanceFromCenter * spiralTightness) * distanceFromCenter;
    } 
    else if (patternType === 1) {
      // Ring formations
      const ringRadius = 40 + (i % 4) * 30;
      const ringAngle = (i / (imageSprites.length / 4)) * Math.PI * 2;
      
      x = Math.cos(ringAngle) * ringRadius;
      y = (Math.random() - 0.5) * 30;
      z = Math.sin(ringAngle) * ringRadius;
    }
    else if (patternType === 2) {
      // Cluster patterns
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
    }
    else {
      // Random distribution
      const radius = 30 + Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.6;
      
      x = Math.cos(angle) * Math.cos(elevation) * radius;
      y = Math.sin(elevation) * radius;
      z = Math.sin(angle) * Math.cos(elevation) * radius;
    }
    
    // Animate to new position
    const startX = sprite.position.x;
    const startY = sprite.position.y;
    const startZ = sprite.position.z;
    
    const animateToNewPosition = (progress) => {
      if (progress > 1) progress = 1;
      
      sprite.position.x = startX + (x - startX) * progress;
      sprite.position.y = startY + (y - startY) * progress;
      sprite.position.z = startZ + (z - startZ) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(() => animateToNewPosition(progress + 0.03));
      }
    };
    
    // Start animation with staggered delay
    setTimeout(() => {
      animateToNewPosition(0);
    }, i * 10);
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const time = Date.now() * 0.001;
  
  // Rotate text rings
  ringsGroup.children.forEach((ring, index) => {
    ring.rotation.y += ring.userData.speed * 0.01;
  });
  
  // Enhanced star rotation with better twinkling effect
  if (starPoints) {
    // Gentle rotation for the entire star field
    starPoints.rotation.y += 0.0003;
    
    // Twinkling effect for normal stars
    const sizes = starPoints.geometry.attributes.size.array;
    const colors = starPoints.geometry.attributes.color.array;
    
    for (let i = 0; i < sizes.length; i++) {
      // More dynamic size animation for twinkling
      sizes[i] = 1.2 + Math.sin(time * 3 + i) * 0.6 + Math.random() * 0.3;
      
      // Animate colors for extra sparkle
      const i3 = i * 3;
      if (colors[i3 + 1] < 0.8) { // Only for pink stars
        colors[i3 + 1] = 0.4 + Math.sin(time * 2 + i) * 0.2 + Math.random() * 0.1;
        colors[i3 + 2] = 0.7 + Math.sin(time * 1.5 + i) * 0.15 + Math.random() * 0.1;
      }
      
      // Occasional bright flashes - increased frequency
      if (Math.random() > 0.998) {
        sizes[i] = sizes[i] * 3;
        colors[i3] = 1;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      }
    }
    
    starPoints.geometry.attributes.size.needsUpdate = true;
    starPoints.geometry.attributes.color.needsUpdate = true;
    
    // Animate text points if they exist (for 3D text effect)
    if (starPoints.userData.textPoints) {
      const textPoints = starPoints.userData.textPoints;
      const textSizes = textPoints.geometry.attributes.size.array;
      const textColors = textPoints.geometry.attributes.color.array;
      
      // Special animation for text particles to make them stand out
      for (let i = 0; i < textSizes.length; i++) {
        const i3 = i * 3;
        
        // Brighter, more vibrant animation for text particles
        textSizes[i] = 1.8 + Math.sin(time * 4 + i * 0.5) * 0.7;
        
        // Animate between white and pink for text particles
        const pinkPulse = Math.sin(time * 2 + i * 0.3) * 0.5 + 0.5;
        textColors[i3] = 1; // Red always max
        textColors[i3 + 1] = 0.7 + pinkPulse * 0.3; // Green pulses 
        textColors[i3 + 2] = 0.8 + pinkPulse * 0.2; // Blue pulses
        
        // Random sparkles in text
        if (Math.random() > 0.99) {
          textSizes[i] = textSizes[i] * 2;
          textColors[i3] = 1;
          textColors[i3 + 1] = 1;
          textColors[i3 + 2] = 1;
        }
      }
      
      textPoints.geometry.attributes.size.needsUpdate = true;
      textPoints.geometry.attributes.color.needsUpdate = true;
    }
    
    // Animate planet glow effect
    if (planetGlow) {
      planetGlow.scale.set(
        1.1 + Math.sin(time * 1.5) * 0.05,
        1.1 + Math.sin(time * 1.5) * 0.05,
        1.1 + Math.sin(time * 1.5) * 0.05
      );
      planetGlow.material.opacity = 0.4 + Math.sin(time * 2) * 0.1;
    }
    
    // Animate square stars if they exist
    if (starPoints.userData.squarePoints) {
      const squarePoints = starPoints.userData.squarePoints;
      
      // Update time uniform for any shader animations
      if (squarePoints.userData.material && squarePoints.userData.material.uniforms) {
        squarePoints.userData.material.uniforms.time.value = time;
      }
      
      // Rotate in opposite direction to main stars for interesting effect
      squarePoints.rotation.y -= 0.0002;
      squarePoints.rotation.x += 0.0001;
      
      // Animate square star sizes
      if (squarePoints.geometry.attributes.size) {
        const squareSizes = squarePoints.geometry.attributes.size.array;
        const squareColors = squarePoints.geometry.attributes.color.array;
        
        for (let i = 0; i < squareSizes.length; i++) {
          // Different animation pattern for squares
          squareSizes[i] = 1 + Math.sin(time * 2 + i * 0.2) * 0.7 + Math.random() * 0.2;
          
          // Color animation
          const i3 = i * 3;
          squareColors[i3 + 1] = 0.4 + Math.sin(time * 1.3 + i * 0.1) * 0.3;
          
          // Occasional bright flashes
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
  
  // Animate image sprites with more dynamic motion
  imageSprites.forEach((sprite, index) => {
    // Different animation behavior based on whether it's a photo or shape
    const isPhoto = sprite.userData.isPhoto;
    
    if (isPhoto) {
      // Photos should have gentler, more subtle movement
      const orbitSpeed = 0.1 + (index % 7) * 0.02;
      const orbitRadius = 0.01 + (index % 5) * 0.005;
      
      // Subtle floating movement
      sprite.position.x += Math.sin(time * orbitSpeed + index) * orbitRadius;
      sprite.position.y += Math.sin(time * 0.3 + index * 0.2) * 0.01;
      sprite.position.z += Math.cos(time * orbitSpeed + index * 0.7) * orbitRadius;
      
      // Very slow rotation for photos
      sprite.rotation.z += 0.001;
      
      // Subtle scale pulsing
      const baseScale = sprite.userData.baseScale || sprite.scale.x;
      if (!sprite.userData.baseScale) {
        sprite.userData.baseScale = baseScale;
      }
      
      const scale = baseScale + Math.sin(time * 0.5 + index * 0.1) * 0.1;
      sprite.scale.set(scale, scale, 1);
    } else {
      // Shapes should have more dynamic movement
      const orbitSpeed = 0.3 + (index % 5) * 0.08;
      const orbitRadius = 0.04 + (index % 4) * 0.02;
      
      // More dynamic orbital motion
      sprite.position.x += Math.sin(time * orbitSpeed + index) * orbitRadius;
      sprite.position.y += Math.sin(time * 0.7 + index * 0.4) * 0.03;
      sprite.position.z += Math.cos(time * orbitSpeed + index) * orbitRadius;
      
      // Faster rotation for shapes
      sprite.rotation.z += 0.005 + (index % 10) * 0.001;
      
      // More pronounced scale pulsing
      const pulseSpeed = 1.5 + (index % 4);
      const pulseAmount = 0.4 + (index % 5) * 0.15;
      const baseScale = sprite.userData.baseScale || sprite.scale.x;
      
      if (!sprite.userData.baseScale) {
        sprite.userData.baseScale = baseScale;
      }
      
      const scale = sprite.userData.baseScale + Math.sin(time * pulseSpeed + index) * pulseAmount;
      sprite.scale.set(scale, scale, 1);
      
      // More frequent opacity changes for twinkling effect
      if (Math.random() > 0.97) {
        sprite.material.opacity = 0.5 + Math.random() * 0.5;
      }
    }
    
    // Add occasional color tint changes to shapes (not photos)
    if (!isPhoto && Math.random() > 0.995) {
      const colors = [0xff69b4, 0xff45a2, 0xff9ddb, 0xffb6e6, 0xff007f];
      sprite.material.color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
    }
  });
  
  // Gentle planet rotation
  planet.rotation.y += 0.005;
  
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
