import * as THREE from 'three';
import { createGlobeGroup } from './globeSceneFactory';
import type { NetworkSceneOptions } from './sceneFactory';

export type HomeSceneOptions = NetworkSceneOptions & {
  showGlobe?: boolean;
  globeScale?: number;
};

export type HomeSceneHandle = {
  dispose: () => void;
};

const BRAND_COLORS = [0x5b4fff, 0x7c72ff, 0x00d4aa, 0xff6b35];

export function initHomeScene(
  container: HTMLElement,
  options: HomeSceneOptions = {},
): HomeSceneHandle {
  const {
    particleCount = 120,
    connectionDistance = 7,
    lineOpacity = 0.18,
    particleSize = 0.38,
    mouseParallax = true,
    showGlobe = true,
    globeScale = 1,
  } = options;

  const width = container.clientWidth || 1;
  const height = container.clientHeight || 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 140);
  camera.position.z = 30;

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
  const spread = 48;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * (spread * 0.7);
    positions[i * 3 + 2] = (Math.random() - 0.5) * (spread * 0.55);
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.022,
        (Math.random() - 0.5) * 0.022,
        (Math.random() - 0.5) * 0.022,
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
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  scene.add(new THREE.Points(pointsGeometry, pointsMaterial));

  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x5b4fff,
    transparent: true,
    opacity: lineOpacity,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  const bounds = spread * 0.52;
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

  const outerGeo = new THREE.IcosahedronGeometry(5 * globeScale, 1);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x5b4fff,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  outerMesh.position.set(-6, 2, -8);
  scene.add(outerMesh);

  const innerGeo = new THREE.OctahedronGeometry(2.4 * globeScale, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x00d4aa,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  innerMesh.position.set(-6, 2, -8);
  scene.add(innerMesh);

  let globeDispose: (() => void) | null = null;
  let globeGroup: THREE.Group | null = null;
  if (showGlobe) {
    const globe = createGlobeGroup({
      radius: 4.8 * globeScale,
      nodeCount: 32,
      arcCount: 14,
      wireOpacity: 0.32,
      rotationSpeed: 0.004,
    });
    globeGroup = globe.group;
    globeGroup.position.set(11, 0.5, -3);
    scene.add(globeGroup);
    globeDispose = globe.dispose;
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
    elapsed += 0.0045;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;
      if (Math.abs(positions[i * 3]) > bounds) velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > bounds * 0.75) velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > bounds * 0.6) velocities[i].z *= -1;
    }
    pointsGeometry.attributes.position.needsUpdate = true;
    syncLines();
    lineGeometry.attributes.position.needsUpdate = true;

    outerMesh.rotation.x = elapsed * 0.3;
    outerMesh.rotation.y = elapsed * 0.5;
    innerMesh.rotation.x = -elapsed * 0.4;
    innerMesh.rotation.y = elapsed * 0.65;

    if (globeGroup) {
      globeGroup.rotation.y += 0.004;
      globeGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.1;
    }

    if (mouseParallax) {
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.025;
      camera.position.y += (-mouseY * 2.2 - camera.position.y) * 0.025;
    }
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };
  animate();

  return {
    dispose: () => {
      cancelAnimationFrame(animationFrame);
      if (mouseParallax) window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      globeDispose?.();
      renderer.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
