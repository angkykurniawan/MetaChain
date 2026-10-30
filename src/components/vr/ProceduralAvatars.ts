import * as THREE from 'three';
import { AvatarModelType } from '../../types';

export interface AvatarInstance {
  group: THREE.Group;
  update: (time: number, isSpeaking: boolean, cameraPos: THREE.Vector3) => void;
  dispose: () => void;
}

export function createProceduralAvatar(
  type: AvatarModelType,
  primaryColorHex: string,
  secondaryColorHex: string
): AvatarInstance {
  const group = new THREE.Group();

  const primaryColor = new THREE.Color(primaryColorHex);
  const secondaryColor = new THREE.Color(secondaryColorHex);

  const materials: THREE.Material[] = [];

  // Core reusable glow material
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: primaryColor,
    emissive: primaryColor,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8
  });
  materials.push(glowMaterial);

  const darkMetalMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.3
  });
  materials.push(darkMetalMaterial);

  const secondaryMaterial = new THREE.MeshStandardMaterial({
    color: secondaryColor,
    emissive: secondaryColor,
    emissiveIntensity: 0.4,
    roughness: 0.3
  });
  materials.push(secondaryMaterial);

  let headMesh: THREE.Object3D | null = null;
  let coreMesh: THREE.Mesh | null = null;
  const animatedParts: { obj: THREE.Object3D; speed: number; axis: 'x' | 'y' | 'z' }[] = [];

  if (type === 'cyber_humanoid') {
    // === CYBER HUMANOID ===
    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torso = new THREE.Mesh(torsoGeo, darkMetalMaterial);
    torso.position.y = 1.35;
    group.add(torso);

    // Chest reactor
    const reactorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    reactorGeo.rotateX(Math.PI / 2);
    coreMesh = new THREE.Mesh(reactorGeo, glowMaterial);
    coreMesh.position.set(0, 1.45, 0.21);
    group.add(coreMesh);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.95, 0);

    const headGeo = new THREE.BoxGeometry(0.4, 0.45, 0.4);
    const head = new THREE.Mesh(headGeo, darkMetalMaterial);
    headGroup.add(head);

    // Cyber visor / eye
    const visorGeo = new THREE.BoxGeometry(0.32, 0.08, 0.1);
    const visor = new THREE.Mesh(visorGeo, glowMaterial);
    visor.position.set(0, 0.04, 0.18);
    headGroup.add(visor);

    group.add(headGroup);
    headMesh = headGroup;

    // Floating shoulder pads
    const padGeo = new THREE.BoxGeometry(0.25, 0.15, 0.35);
    const leftPad = new THREE.Mesh(padGeo, secondaryMaterial);
    leftPad.position.set(-0.55, 1.7, 0);
    group.add(leftPad);

    const rightPad = new THREE.Mesh(padGeo, secondaryMaterial);
    rightPad.position.set(0.55, 1.7, 0);
    group.add(rightPad);

  } else if (type === 'floating_orb') {
    // === FLOATING QUANTUM ORB ===
    const coreGeo = new THREE.SphereGeometry(0.45, 32, 32);
    coreMesh = new THREE.Mesh(coreGeo, glowMaterial);
    coreMesh.position.y = 1.6;
    group.add(coreMesh);

    // Outer Gyro Rings
    const ring1Geo = new THREE.TorusGeometry(0.7, 0.03, 16, 64);
    const ring1 = new THREE.Mesh(ring1Geo, secondaryMaterial);
    ring1.position.y = 1.6;
    group.add(ring1);
    animatedParts.push({ obj: ring1, speed: 1.2, axis: 'x' });

    const ring2Geo = new THREE.TorusGeometry(0.85, 0.025, 16, 64);
    const ring2 = new THREE.Mesh(ring2Geo, darkMetalMaterial);
    ring2.position.y = 1.6;
    group.add(ring2);
    animatedParts.push({ obj: ring2, speed: -0.8, axis: 'y' });

    const ring3Geo = new THREE.TorusGeometry(1.0, 0.02, 16, 64);
    const ring3 = new THREE.Mesh(ring3Geo, glowMaterial);
    ring3.position.y = 1.6;
    group.add(ring3);
    animatedParts.push({ obj: ring3, speed: 0.6, axis: 'z' });

    headMesh = coreMesh;

  } else if (type === 'mech_guard') {
    // === HEAVY MECH GUARD ===
    const bodyGeo = new THREE.BoxGeometry(0.9, 1.1, 0.55);
    const body = new THREE.Mesh(bodyGeo, darkMetalMaterial);
    body.position.y = 1.35;
    group.add(body);

    // Heavy shoulder armor
    const shoulderGeo = new THREE.BoxGeometry(0.4, 0.35, 0.5);
    const leftArm = new THREE.Mesh(shoulderGeo, secondaryMaterial);
    leftArm.position.set(-0.7, 1.75, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(shoulderGeo, secondaryMaterial);
    rightArm.position.set(0.7, 1.75, 0);
    group.add(rightArm);

    // Chest Core
    const coreGeo = new THREE.OctahedronGeometry(0.18);
    coreMesh = new THREE.Mesh(coreGeo, glowMaterial);
    coreMesh.position.set(0, 1.45, 0.3);
    group.add(coreMesh);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.05, 0);

    const headGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.35, 8);
    const head = new THREE.Mesh(headGeo, darkMetalMaterial);
    headGroup.add(head);

    const eyeGeo = new THREE.BoxGeometry(0.25, 0.06, 0.1);
    const eye = new THREE.Mesh(eyeGeo, glowMaterial);
    eye.position.set(0, 0, 0.2);
    headGroup.add(eye);

    group.add(headGroup);
    headMesh = headGroup;

  } else {
    // === HOLOGRAPHIC SAGE ===
    const holoMaterial = new THREE.MeshStandardMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    materials.push(holoMaterial);

    const sageCoreGeo = new THREE.IcosahedronGeometry(0.5, 1);
    coreMesh = new THREE.Mesh(sageCoreGeo, holoMaterial);
    coreMesh.position.y = 1.6;
    group.add(coreMesh);
    animatedParts.push({ obj: coreMesh, speed: 0.5, axis: 'y' });

    const innerSphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const innerSphere = new THREE.Mesh(innerSphereGeo, secondaryMaterial);
    innerSphere.position.y = 1.6;
    group.add(innerSphere);

    // Orbiting data particles
    for (let i = 0; i < 6; i++) {
      const bitGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const bit = new THREE.Mesh(bitGeo, glowMaterial);
      const angle = (i / 6) * Math.PI * 2;
      bit.position.set(Math.cos(angle) * 0.8, 1.6 + Math.sin(angle) * 0.2, Math.sin(angle) * 0.8);
      group.add(bit);
      animatedParts.push({ obj: bit, speed: 0.9 + i * 0.1, axis: 'y' });
    }

    headMesh = coreMesh;
  }

  // Animation update loop
  const update = (time: number, isSpeaking: boolean, cameraPos: THREE.Vector3) => {
    // Gentle floating bob
    group.position.y = Math.sin(time * 2) * 0.08;

    // Speaking glow pulse effect
    if (coreMesh) {
      const baseIntensity = isSpeaking ? 1.2 + Math.sin(time * 12) * 0.5 : 0.6;
      glowMaterial.emissiveIntensity = baseIntensity;
    }

    // Rotations for animated parts
    animatedParts.forEach((part) => {
      part.obj.rotation[part.axis] += part.speed * 0.02;
    });

    // Subtle look-at camera tracking
    if (headMesh) {
      const targetLook = new THREE.Vector3(cameraPos.x, headMesh.position.y, cameraPos.z);
      headMesh.lookAt(targetLook);
    }
  };

  const dispose = () => {
    materials.forEach((mat) => mat.dispose());
  };

  return { group, update, dispose };
}

