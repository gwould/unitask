import * as THREE from 'three';
import { createGlobeGroup } from './globeSceneFactory';

export type JobsSceneHandle = {
  dispose: () => void;
};

const BRAND_COLORS = [0x5b4fff, 0x00d4aa, 0xff6b35];

export function initJobsScene(container: HTMLElement): JobsSceneHandle {
  const width = container.clientWidth || 1;
  const height = container.clientHeight || 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
  camera.position.set(0, 0, 22);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const count = 70;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 36;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    const c = new THREE.Color(BRAND_COLORS[i % BRAND_COLORS.length]);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  scene.add(new THREE.Points(geo, mat));

  const globe = createGlobeGroup({
    radius: 3.2,
    nodeCount: 20,
    arcCount: 8,
    wireOpacity: 0.25,
  });
  globe.group.position.set(10, 1, -2);
  scene.add(globe.group);

  const resizeObserver = new ResizeObserver(() => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resizeObserver.observe(container);

  let frame = 0;
  const animate = () => {
    frame = requestAnimationFrame(animate);
    globe.group.rotation.y += 0.005;
    camera.position.x = Math.sin(Date.now() * 0.0002) * 0.8;
    renderer.render(scene, camera);
  };
  animate();

  return {
    dispose: () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      globe.dispose();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
