import * as THREE from 'three';

export interface EnvironmentInstance {
  group: THREE.Group;
  accentLight: THREE.PointLight;
  update: (time: number) => void;
  dispose: () => void;
}

export function createSciFiEnvironment(): EnvironmentInstance {
  const group = new THREE.Group();
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  // Floor circular deck
  const floorGeo = new THREE.CylinderGeometry(8, 8, 0.2, 48);
  disposables.push(floorGeo);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.8,
    roughness: 0.4
  });
  disposables.push(floorMat);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  group.add(floor);

  // Outer Glowing Neon Ring
  const ringGeo = new THREE.TorusGeometry(7.8, 0.05, 16, 64);
  ringGeo.rotateX(Math.PI / 2);
  disposables.push(ringGeo);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  disposables.push(ringMat);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.02;
  group.add(ring);

  // Pedestal for Avatar
  const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.25, 32);
  disposables.push(pedestalGeo);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.2
  });
  disposables.push(pedestalMat);
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.set(0, 0.12, 0);
  group.add(pedestal);

  // Pedestal neon inner ring
  const pedRingGeo = new THREE.TorusGeometry(1.35, 0.03, 16, 48);
  pedRingGeo.rotateX(Math.PI / 2);
  disposables.push(pedRingGeo);
  const pedRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  disposables.push(pedRingMat);
  const pedRing = new THREE.Mesh(pedRingGeo, pedRingMat);
  pedRing.position.set(0, 0.26, 0);
  group.add(pedRing);

  // Ambient Floating Dust / Stars
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  disposables.push(particleGeo);
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 16;
    positions[i + 1] = Math.random() * 6;
    positions[i + 2] = (Math.random() - 0.5) * 16;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x06b6d4,
    size: 0.04,
    transparent: true,
    opacity: 0.6
  });
  disposables.push(particleMat);
  const particles = new THREE.Points(particleGeo, particleMat);
  group.add(particles);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  group.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  group.add(dirLight);

  // Dynamic Accent Point Light (colored by active character)
  const accentLight = new THREE.PointLight(0x06b6d4, 3, 10);
  accentLight.position.set(0, 2.5, 0);
  group.add(accentLight);

  const update = (time: number) => {
    // Slowly rotate background ambient particles
    particles.rotation.y = time * 0.03;
  };

  const dispose = () => {
    disposables.forEach((item) => item.dispose());
  };

  return { group, accentLight, update, dispose };
}

