import * as THREE from 'three';

export type GlobeSceneOptions = {
  radius?: number;
  position?: { x: number; y: number; z: number };
  nodeCount?: number;
  arcCount?: number;
  mouseParallax?: boolean;
  rotationSpeed?: number;
  wireOpacity?: number;
};

export type GlobeSceneHandle = {
  dispose: () => void;
};

function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius,
        Math.sin(theta) * r * radius,
      ),
    );
  }
  return points;
}

function createArcPoints(from: THREE.Vector3, to: THREE.Vector3, segments = 24): number[] {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(from.length() * 1.35);
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  const pts = curve.getPoints(segments);
  const flat: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    flat.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
  }
  return flat;
}

export function createGlobeGroup(options: GlobeSceneOptions = {}): {
  group: THREE.Group;
  dispose: () => void;
} {
  const {
    radius = 5,
    nodeCount = 28,
    arcCount = 12,
    wireOpacity = 0.28,
    rotationSpeed = 0.003,
  } = options;

  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const sphereGeo = new THREE.SphereGeometry(radius, 36, 24);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x5b4fff,
    wireframe: true,
    transparent: true,
    opacity: wireOpacity,
  });
  const wireSphere = new THREE.Mesh(sphereGeo, wireMat);
  group.add(wireSphere);
  disposables.push(sphereGeo, wireMat);

  const glowGeo = new THREE.SphereGeometry(radius * 1.06, 24, 18);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00d4aa,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const glowSphere = new THREE.Mesh(glowGeo, glowMat);
  group.add(glowSphere);
  disposables.push(glowGeo, glowMat);

  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(radius * (1.15 + i * 0.12), 0.025, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0x7c72ff : i === 1 ? 0x00d4aa : 0xff6b35,
      transparent: true,
      opacity: 0.35 - i * 0.08,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 + i * 0.35;
    ring.rotation.y = i * 0.5;
    group.add(ring);
    disposables.push(ringGeo, ringMat);
  }

  const nodes = fibonacciSphere(nodeCount, radius);
  const nodePositions = new Float32Array(nodes.length * 3);
  const nodeColors = new Float32Array(nodes.length * 3);
  nodes.forEach((node, i) => {
    nodePositions[i * 3] = node.x;
    nodePositions[i * 3 + 1] = node.y;
    nodePositions[i * 3 + 2] = node.z;
    const c = new THREE.Color([0x5b4fff, 0x00d4aa, 0xff6b35][i % 3]);
    nodeColors[i * 3] = c.r;
    nodeColors[i * 3 + 1] = c.g;
    nodeColors[i * 3 + 2] = c.b;
  });
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
  const nodeMat = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nodePoints = new THREE.Points(nodeGeo, nodeMat);
  group.add(nodePoints);
  disposables.push(nodeGeo, nodeMat);

  const arcSegments: number[] = [];
  for (let i = 0; i < arcCount; i++) {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    if (a !== b) arcSegments.push(...createArcPoints(a, b));
  }
  const arcGeo = new THREE.BufferGeometry();
  arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(arcSegments, 3));
  const arcMat = new THREE.LineBasicMaterial({
    color: 0x00d4aa,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  });
  const arcs = new THREE.LineSegments(arcGeo, arcMat);
  group.add(arcs);
  disposables.push(arcGeo, arcMat);

  group.userData.rotationSpeed = rotationSpeed;

  return {
    group,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}

export function initGlobeScene(
  container: HTMLElement,
  options: GlobeSceneOptions = {},
): GlobeSceneHandle {
  const {
    position = { x: 0, y: 0, z: 0 },
    mouseParallax = true,
    rotationSpeed = 0.003,
  } = options;

  const width = container.clientWidth || 1;
  const height = container.clientHeight || 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 18;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const { group, dispose: disposeGlobe } = createGlobeGroup({ ...options, rotationSpeed });
  group.position.set(position.x, position.y, position.z);
  scene.add(group);

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
  const animate = () => {
    animationFrame = requestAnimationFrame(animate);
    group.rotation.y += rotationSpeed;
    group.rotation.x = Math.sin(Date.now() * 0.0003) * 0.12;

    if (mouseParallax) {
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 1.2 - camera.position.y) * 0.04;
    }
    camera.lookAt(group.position);

    renderer.render(scene, camera);
  };
  animate();

  return {
    dispose: () => {
      cancelAnimationFrame(animationFrame);
      if (mouseParallax) window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      disposeGlobe();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
