import * as THREE from 'three';

const BRAND_COLORS = [0x5b4fff, 0x7c72ff, 0x00d4aa, 0xff6b35];

export type NetworkSceneOptions = {
  particleCount?: number;
  connectionDistance?: number;
  showShapes?: boolean;
  mouseParallax?: boolean;
  lineOpacity?: number;
  particleSize?: number;
};

export type NetworkSceneHandle = {
  dispose: () => void;
};

export function initNetworkScene(
  container: HTMLElement,
  options: NetworkSceneOptions = {},
): NetworkSceneHandle {
  const {
    particleCount = 80,
    connectionDistance = 6,
    showShapes = true,
    mouseParallax = true,
    lineOpacity = 0.14,
    particleSize = 0.32,
  } = options;

  const width = container.clientWidth || 1;
  const height = container.clientHeight || 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 120);
  camera.position.z = 26;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const positions = new Float32Array(particleCount * 3);
  const velocities: THREE.Vector3[] = [];
  const colors = new Float32Array(particleCount * 3);
  const spread = showShapes ? 40 : 28;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * (spread * 0.75);
    positions[i * 3 + 2] = (Math.random() - 0.5) * (spread * 0.6);
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.018,
        (Math.random() - 0.5) * 0.018,
        (Math.random() - 0.5) * 0.018,
      ),
    );
    const color = new THREE.Color(BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)]);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pointsMaterial = new THREE.PointsMaterial({
    size: particleSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);

  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x5b4fff,
    transparent: true,
    opacity: lineOpacity,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  const bounds = spread * 0.55;
  const syncLines = () => {
    const segments: number[] = [];
    const maxDistSq = connectionDistance * connectionDistance;
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < maxDistSq) {
          segments.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
          );
        }
      }
    }
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
  };
  syncLines();

  let outerMesh: THREE.Mesh | null = null;
  let innerMesh: THREE.Mesh | null = null;
  let outerGeo: THREE.IcosahedronGeometry | null = null;
  let innerGeo: THREE.OctahedronGeometry | null = null;
  let outerMat: THREE.MeshBasicMaterial | null = null;
  let innerMat: THREE.MeshBasicMaterial | null = null;

  if (showShapes) {
    outerGeo = new THREE.IcosahedronGeometry(4.2, 1);
    outerMat = new THREE.MeshBasicMaterial({
      color: 0x5b4fff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.position.set(9, 1.5, -4);
    scene.add(outerMesh);

    innerGeo = new THREE.OctahedronGeometry(2, 0);
    innerMat = new THREE.MeshBasicMaterial({
      color: 0x00d4aa,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.copy(outerMesh.position);
    scene.add(innerMesh);
  }

  let mouseX = 0;
  let mouseY = 0;
  const onPointerMove = (event: PointerEvent) => {
    if (!mouseParallax) return;
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  if (mouseParallax) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  const resizeObserver = new ResizeObserver(() => {
    const nextWidth = container.clientWidth || 1;
    const nextHeight = container.clientHeight || 1;
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight);
  });
  resizeObserver.observe(container);

  let animationFrame = 0;
  let elapsed = 0;
  const animate = () => {
    animationFrame = requestAnimationFrame(animate);
    elapsed += 0.004;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;
      if (Math.abs(positions[i * 3]) > bounds) velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > bounds * 0.8) velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > bounds * 0.65) velocities[i].z *= -1;
    }
    pointsGeometry.attributes.position.needsUpdate = true;
    syncLines();
    lineGeometry.attributes.position.needsUpdate = true;

    if (outerMesh && innerMesh) {
      outerMesh.rotation.x = elapsed * 0.35;
      outerMesh.rotation.y = elapsed * 0.55;
      innerMesh.rotation.x = -elapsed * 0.45;
      innerMesh.rotation.y = elapsed * 0.7;
    }

    if (mouseParallax) {
      camera.position.x += (mouseX * 2.5 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 1.8 - camera.position.y) * 0.03;
    }
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };
  animate();

  const dispose = () => {
    cancelAnimationFrame(animationFrame);
    if (mouseParallax) window.removeEventListener('pointermove', onPointerMove);
    resizeObserver.disconnect();
    renderer.dispose();
    pointsGeometry.dispose();
    pointsMaterial.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
    outerGeo?.dispose();
    innerGeo?.dispose();
    outerMat?.dispose();
    innerMat?.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  };

  return { dispose };
}
