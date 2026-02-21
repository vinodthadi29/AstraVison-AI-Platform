import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '../../lib/utils';
export type GuardianState =
'idle' |
'watching' |
'alert' |
'scanning' |
'approved';
interface AstraGuardianProps {
  state: GuardianState;
  typingActivity?: number;
  keystrokePulse?: number;
  inputLength?: number;
  className?: string;
}
export function AstraGuardian({
  state,
  typingActivity = 0,
  keystrokePulse = 0,
  inputLength = 0,
  className
}: AstraGuardianProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number>(0);
  const stateRef = useRef<GuardianState>(state);
  const typingRef = useRef(typingActivity);
  const pulseRef = useRef(keystrokePulse);
  const lastPulseRef = useRef(0);
  const inputLenRef = useRef(inputLength);
  // Animation state
  const a = useRef({
    // Head
    headTiltX: 0,
    headTiltZ: 0,
    headY: 0,
    headSquash: 1,
    // Eyes
    eyeScaleY: 1,
    pupilX: 0,
    pupilY: 0,
    eyeGlow: 1,
    // Brows
    browY: 0.35,
    browRot: 0,
    // Hands
    leftHandX: -1.1,
    leftHandY: -0.3,
    leftHandZ: 0.3,
    rightHandX: 1.1,
    rightHandY: -0.3,
    rightHandZ: 0.3,
    handScale: 1,
    // Body
    bodyY: -1.2,
    bodyScale: 1,
    // Antenna
    antennaWiggle: 0,
    antennaBallGlow: 1,
    // Mouth
    mouthScale: 0.5,
    mouthY: -0.35,
    // Color
    accentR: 0.545,
    accentG: 0.361,
    accentB: 0.965,
    // Global
    bounce: 0,
    breathe: 0,
    keystrokeBump: 0,
    // Blink timer
    blinkTimer: 0,
    isBlinking: false,
    // Idle random look
    idleLookTarget: 0,
    idleLookTimer: 0,
    // Celebration
    celebrationPhase: 0
  });
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    typingRef.current = typingActivity;
  }, [typingActivity]);
  useEffect(() => {
    inputLenRef.current = inputLength;
  }, [inputLength]);
  useEffect(() => {
    if (keystrokePulse !== lastPulseRef.current) {
      a.current.keystrokeBump = 0.2;
      lastPulseRef.current = keystrokePulse;
    }
    pulseRef.current = keystrokePulse;
  }, [keystrokePulse]);
  useEffect(() => {
    if (!containerRef.current) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(0, 0.2, 7);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    // === LIGHTING (3-Point Setup) ===
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);
    // Key Light (Cyan, Front Right)
    const keyLight = new THREE.PointLight(0x00e5ff, 2.5, 20);
    keyLight.position.set(3, 4, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);
    // Fill Light (Warm Amber, Front Left)
    const fillLight = new THREE.PointLight(0xff8a50, 1.5, 20);
    fillLight.position.set(-4, 1, 4);
    scene.add(fillLight);
    // Rim Light (Violet, Back)
    const rimLight = new THREE.SpotLight(0xb388ff, 4);
    rimLight.position.set(0, 5, -5);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);
    // Bottom accent light (teal)
    const bottomLight = new THREE.PointLight(0x00bfa5, 1, 10);
    bottomLight.position.set(0, -3, 3);
    scene.add(bottomLight);
    // === CHARACTER GROUP ===
    const character = new THREE.Group();
    scene.add(character);
    // Shared Materials
    const metallicMat = new THREE.MeshPhongMaterial({
      color: 0x1a2a3a,
      emissive: 0x061218,
      emissiveIntensity: 0.3,
      specular: 0x66aacc,
      shininess: 80
    });
    const accentMat = new THREE.MeshPhongMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.6,
      specular: 0xffffff,
      shininess: 120
    });
    // --- HEAD ---
    const headGeo = new THREE.SphereGeometry(1, 64, 64);
    const head = new THREE.Mesh(headGeo, metallicMat);
    head.castShadow = true;
    head.receiveShadow = true;
    character.add(head);
    // Face Visor (Darker plate)
    const visorGeo = new THREE.SphereGeometry(
      0.9,
      64,
      64,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.35
    );
    const visorMat = new THREE.MeshPhongMaterial({
      color: 0x0a1520,
      specular: 0x44ccff,
      shininess: 150
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.x = -Math.PI / 2;
    visor.position.z = 0.12;
    visor.scale.set(1, 1, 0.5);
    head.add(visor);
    // Ear Bumps
    const earGeo = new THREE.SphereGeometry(0.15, 32, 32);
    const leftEar = new THREE.Mesh(earGeo, metallicMat);
    leftEar.position.set(-0.95, 0.1, 0);
    head.add(leftEar);
    const rightEar = new THREE.Mesh(earGeo, metallicMat);
    rightEar.position.set(0.95, 0.1, 0);
    head.add(rightEar);
    // --- EYES ---
    const eyeGroup = new THREE.Group();
    head.add(eyeGroup);
    // Eye Whites
    const eyeWhiteGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const eyeWhiteMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xeeffff,
      emissiveIntensity: 0.4,
      specular: 0xffffff,
      shininess: 120
    });
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.35, 0.15, 0.85);
    eyeGroup.add(leftEyeWhite);
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeWhite.position.set(0.35, 0.15, 0.85);
    eyeGroup.add(rightEyeWhite);
    // Iris Rings
    const irisGeo = new THREE.TorusGeometry(0.16, 0.02, 16, 32);
    const irisMat = accentMat.clone();
    const leftIris = new THREE.Mesh(irisGeo, irisMat);
    leftIris.position.set(0, 0, 0.22);
    leftEyeWhite.add(leftIris);
    const rightIris = new THREE.Mesh(irisGeo, irisMat);
    rightIris.position.set(0, 0, 0.22);
    rightEyeWhite.add(rightIris);
    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const pupilMat = new THREE.MeshPhongMaterial({
      color: 0x001a33,
      specular: 0x00e5ff,
      shininess: 200
    });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.2);
    leftEyeWhite.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.2);
    rightEyeWhite.add(rightPupil);
    // Eyelids
    const eyelidGeo = new THREE.SphereGeometry(
      0.3,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5
    );
    const eyelidMat = new THREE.MeshPhongMaterial({
      color: 0x1e1e3a,
      specular: 0x444466,
      shininess: 60
    });
    const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    leftEyelid.position.set(-0.35, 0.15, 0.86);
    leftEyelid.rotation.x = Math.PI;
    head.add(leftEyelid);
    const rightEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    rightEyelid.position.set(0.35, 0.15, 0.86);
    rightEyelid.rotation.x = Math.PI;
    head.add(rightEyelid);
    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.3, 0.05, 0.05);
    const browMat = accentMat.clone();
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.35, 0.5, 0.8);
    head.add(leftBrow);
    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.35, 0.5, 0.8);
    head.add(rightBrow);
    // --- MOUTH ---
    const mouthShape = new THREE.Shape();
    mouthShape.absarc(0, 0, 0.15, 0, Math.PI, false);
    const mouthGeo = new THREE.ShapeGeometry(mouthShape);
    const mouthMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.35, 0.95);
    head.add(mouth);
    // --- BODY ---
    const bodyGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const body = new THREE.Mesh(bodyGeo, metallicMat);
    body.position.y = -1.2;
    body.castShadow = true;
    body.receiveShadow = true;
    character.add(body);
    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 32);
    const neck = new THREE.Mesh(neckGeo, metallicMat);
    neck.position.y = -0.5;
    character.add(neck);
    // Chest Glow
    const chestGeo = new THREE.SphereGeometry(0.15, 32, 32);
    const chestMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.8
    });
    const chest = new THREE.Mesh(chestGeo, chestMat);
    chest.position.set(0, 0.1, 0.5);
    body.add(chest);
    // --- HANDS & ARMS ---
    const handGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const handMat = new THREE.MeshPhongMaterial({
      color: 0x1e3040,
      emissive: 0x061218,
      emissiveIntensity: 0.2,
      specular: 0x66aacc,
      shininess: 60
    });
    const leftHand = new THREE.Mesh(handGeo, handMat);
    leftHand.position.set(-1.1, -0.3, 0.3);
    leftHand.castShadow = true;
    character.add(leftHand);
    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(1.1, -0.3, 0.3);
    rightHand.castShadow = true;
    character.add(rightHand);
    // Arms (connecting body to hands)
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 16);
    const armMat = metallicMat.clone();
    const leftArm = new THREE.Mesh(armGeo, armMat);
    // Initial positioning, will update in animate loop
    character.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    character.add(rightArm);
    // Fingers
    const fingerGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const addFingers = (hand: THREE.Mesh) => {
      const offsets = [
      [-0.12, 0.1, 0.05],
      [0, 0.14, 0.05],
      [0.12, 0.1, 0.05]];

      offsets.forEach(([x, y, z]) => {
        const finger = new THREE.Mesh(fingerGeo, handMat);
        finger.position.set(x, y, z);
        hand.add(finger);
      });
    };
    addFingers(leftHand);
    addFingers(rightHand);
    // --- ANTENNA ---
    const antennaStickGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 16);
    const antennaStick = new THREE.Mesh(antennaStickGeo, metallicMat);
    antennaStick.position.set(0, 1.2, 0);
    character.add(antennaStick);
    const antennaBallGeo = new THREE.SphereGeometry(0.1, 32, 32);
    const antennaBallMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.95
    });
    const antennaBall = new THREE.Mesh(antennaBallGeo, antennaBallMat);
    antennaBall.position.set(0, 1.5, 0);
    character.add(antennaBall);
    // Antenna Light
    const antennaLight = new THREE.PointLight(0x00e5ff, 1.5, 3);
    antennaBall.add(antennaLight);
    // --- GROUND SHADOW ---
    const shadowGeo = new THREE.CircleGeometry(1.8, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -2.2;
    scene.add(shadow);
    // --- PARTICLES ---
    const sparkCount = 80;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkBase = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 1.5;
      sparkPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      sparkPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) - 0.3;
      sparkPos[i * 3 + 2] = r * Math.cos(phi);
      sparkBase[i * 3] = sparkPos[i * 3];
      sparkBase[i * 3 + 1] = sparkPos[i * 3 + 1];
      sparkBase[i * 3 + 2] = sparkPos[i * 3 + 2];
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.6
    });
    const sparkles = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkles);
    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();
    const lerp = (current: number, target: number, speed: number) =>
    current + (target - current) * speed;
    const animate = () => {
      const time = clock.getElapsedTime();
      const st = stateRef.current;
      const typing = typingRef.current;
      const v = a.current;
      // Keystroke bump decay
      v.keystrokeBump *= 0.85;
      // === BLINK LOGIC ===
      v.blinkTimer += 0.016;
      if (!v.isBlinking && v.blinkTimer > 2.5 + Math.random() * 3) {
        v.isBlinking = true;
        v.blinkTimer = 0;
      }
      if (v.isBlinking && v.blinkTimer > 0.15) {
        v.isBlinking = false;
        v.blinkTimer = 0;
      }
      // === IDLE RANDOM LOOK ===
      v.idleLookTimer += 0.016;
      if (v.idleLookTimer > 3 + Math.random() * 2) {
        v.idleLookTarget = (Math.random() - 0.5) * 0.15;
        v.idleLookTimer = 0;
      }
      // === STATE-DRIVEN TARGETS ===
      let tHeadTiltX = 0,
        tHeadTiltZ = 0;
      let tEyeScaleY = 1;
      let tPupilX = 0,
        tPupilY = 0;
      let tLeftHandX = -1.1,
        tLeftHandY = -0.3,
        tLeftHandZ = 0.3;
      let tRightHandX = 1.1,
        tRightHandY = -0.3,
        tRightHandZ = 0.3;
      let tMouthScale = 0.5;
      let tAccentR = 0.0,
        tAccentG = 0.898,
        tAccentB = 1.0;
      let tAntennaWiggle = Math.sin(time * 2) * 0.1;
      let tHandScale = 1;
      let tBodyScale = 1;
      let tBrowY = 0.35,
        tBrowRot = 0;
      const breathe = Math.sin(time * 1.8) * 0.03;
      v.breathe = breathe;
      if (st === 'idle') {
        // Cycle through colors slowly for idle sparkle
        const hue = time * 0.1 % 1;
        const idleColor = new THREE.Color().setHSL(hue, 0.8, 0.6);
        tAccentR = idleColor.r;
        tAccentG = idleColor.g;
        tAccentB = idleColor.b;
        tHeadTiltX = Math.sin(time * 0.5) * 0.05;
        tHeadTiltZ = Math.sin(time * 0.7) * 0.03;
        tPupilX = v.idleLookTarget;
        tMouthScale = 0.4 + Math.sin(time * 0.3) * 0.05;
        tAntennaWiggle = Math.sin(time * 2) * 0.08;
        tBrowY = 0.35;
      } else if (st === 'watching') {
        // Bright cyan when watching
        tAccentR = 0.0;
        tAccentG = 0.898;
        tAccentB = 1.0;
        tHeadTiltX = 0.15 + typing * 0.1;
        tHeadTiltZ = -0.05;
        tEyeScaleY = 1.2 + typing * 0.15;
        tPupilX =
        Math.sin(time * 8 + v.keystrokeBump * 20) * 0.06 * (0.5 + typing);
        tPupilY = -0.03;
        tMouthScale = 0.6 + typing * 0.2;
        tLeftHandY = -0.1 + typing * 0.15;
        tRightHandY = -0.1 + typing * 0.15;
        tLeftHandZ = 0.5;
        tRightHandZ = 0.5;
        tAntennaWiggle = Math.sin(time * 3) * 0.15 + v.keystrokeBump * 0.3;
        tBrowY = 0.45; // raised brows
      } else if (st === 'alert') {
        // Warm amber/orange when covering eyes
        tAccentR = 1.0;
        tAccentG = 0.54;
        tAccentB = 0.31;
        tHeadTiltX = -0.1;
        tEyeScaleY = 0.6 - typing * 0.3;
        tPupilX = 0;
        tPupilY = 0;
        tLeftHandX = -0.4;
        tLeftHandY = 0.15 + typing * 0.05;
        tLeftHandZ = 0.9;
        tRightHandX = 0.4;
        tRightHandY = 0.15 + typing * 0.05;
        tRightHandZ = 0.9;
        tHandScale = 1.15;
        tMouthScale = 0.3;
        tAccentR = 0.39;
        tAccentG = 0.4;
        tAccentB = 0.95;
        tAntennaWiggle = Math.sin(time * 1.5) * 0.05;
        tBrowY = 0.3;
        tBrowRot = 0.2; // worried brows
        if (v.keystrokeBump > 0.05) {
          tEyeScaleY = 0.5 + v.keystrokeBump * 2;
          tLeftHandX = -0.5 - v.keystrokeBump * 0.3;
          tRightHandX = 0.5 + v.keystrokeBump * 0.3;
        }
      } else if (st === 'scanning') {
        // Electric blue-violet when scanning
        tAccentR = 0.44;
        tAccentG = 0.35;
        tAccentB = 1.0;
        tHeadTiltX = 0;
        tEyeScaleY = 1;
        tPupilX = Math.cos(time * 12) * 0.1;
        tPupilY = Math.sin(time * 12) * 0.1;
        tLeftHandX = -1.3;
        tLeftHandY = 0.2;
        tLeftHandZ = 0.3;
        tRightHandX = 1.3;
        tRightHandY = 0.2;
        tRightHandZ = 0.3;
        tMouthScale = 0.2;
        tAccentR = 0.67;
        tAccentG = 0.55;
        tAccentB = 0.98;
        tAntennaWiggle = Math.sin(time * 15) * 0.2;
        tBodyScale = 1 + Math.sin(time * 20) * 0.02;
      } else if (st === 'approved') {
        // Bright green celebration
        tAccentR = 0.0;
        tAccentG = 1.0;
        tAccentB = 0.6;
        v.celebrationPhase += 0.016;
        tHeadTiltX = Math.sin(v.celebrationPhase * 8) * 0.1;
        tEyeScaleY = 0.3;
        tPupilY = 0.05;
        tLeftHandX = -1.4;
        tLeftHandY = 1.2 + Math.sin(time * 6) * 0.2;
        tLeftHandZ = 0.3;
        tRightHandX = 1.4;
        tRightHandY = 1.2 + Math.sin(time * 6 + 1) * 0.2;
        tRightHandZ = 0.3;
        tMouthScale = 0.9;
        tAccentR = 0.06;
        tAccentG = 0.72;
        tAccentB = 0.51;
        tAntennaWiggle = Math.sin(time * 8) * 0.25;
        v.bounce = Math.abs(Math.sin(v.celebrationPhase * 5)) * 0.3;
        tBrowY = 0.45; // happy brows
      } else {
        v.celebrationPhase = 0;
      }
      // === LERP ===
      const L = 0.06;
      const FL = 0.1;
      v.headTiltX = lerp(v.headTiltX, tHeadTiltX, FL);
      v.headTiltZ = lerp(v.headTiltZ, tHeadTiltZ, FL);
      v.eyeScaleY = lerp(
        v.eyeScaleY,
        v.isBlinking ? 0.08 : tEyeScaleY,
        v.isBlinking ? 0.4 : FL
      );
      v.pupilX = lerp(v.pupilX, tPupilX, FL);
      v.pupilY = lerp(v.pupilY, tPupilY, FL);
      v.leftHandX = lerp(v.leftHandX, tLeftHandX, L);
      v.leftHandY = lerp(v.leftHandY, tLeftHandY, L);
      v.leftHandZ = lerp(v.leftHandZ, tLeftHandZ, L);
      v.rightHandX = lerp(v.rightHandX, tRightHandX, L);
      v.rightHandY = lerp(v.rightHandY, tRightHandY, L);
      v.rightHandZ = lerp(v.rightHandZ, tRightHandZ, L);
      v.handScale = lerp(v.handScale, tHandScale, L);
      v.mouthScale = lerp(v.mouthScale, tMouthScale, FL);
      v.accentR = lerp(v.accentR, tAccentR, 0.03);
      v.accentG = lerp(v.accentG, tAccentG, 0.03);
      v.accentB = lerp(v.accentB, tAccentB, 0.03);
      v.antennaWiggle = lerp(v.antennaWiggle, tAntennaWiggle, FL);
      v.bodyScale = lerp(v.bodyScale, tBodyScale, FL);
      v.browY = lerp(v.browY, tBrowY, FL);
      v.browRot = lerp(v.browRot, tBrowRot, FL);
      if (st !== 'approved') v.bounce *= 0.9;
      const accentColor = new THREE.Color(v.accentR, v.accentG, v.accentB);
      // === APPLY TRANSFORMS ===
      character.position.y = v.bounce + v.breathe;
      // Head
      head.rotation.x = v.headTiltX;
      head.rotation.z = v.headTiltZ;
      head.scale.set(1, 1 + v.keystrokeBump * 0.1, 1);
      // Brows
      leftBrow.position.y = v.browY;
      leftBrow.rotation.z = v.browRot;
      rightBrow.position.y = v.browY;
      rightBrow.rotation.z = -v.browRot;
      leftBrow.material.color.copy(accentColor);
      rightBrow.material.color.copy(accentColor);
      // Eyes
      leftEyeWhite.scale.set(1, v.eyeScaleY, 1);
      rightEyeWhite.scale.set(1, v.eyeScaleY, 1);
      leftEyeWhite.rotation.x = v.headTiltX;
      rightEyeWhite.rotation.x = v.headTiltX;
      leftPupil.position.set(v.pupilX, v.pupilY, 0.2);
      rightPupil.position.set(v.pupilX, v.pupilY, 0.2);
      leftIris.material.color.copy(accentColor);
      rightIris.material.color.copy(accentColor);
      const eyelidDrop = (1 - v.eyeScaleY) * 0.25;
      leftEyelid.position.y = 0.15 + 0.15 - eyelidDrop;
      rightEyelid.position.y = 0.15 + 0.15 - eyelidDrop;
      leftEyelid.rotation.x = Math.PI + v.headTiltX;
      rightEyelid.rotation.x = Math.PI + v.headTiltX;
      // Mouth
      mouth.scale.set(v.mouthScale, v.mouthScale, 1);
      mouthMat.color.copy(accentColor);
      // Body
      body.scale.setScalar(0.6 * v.bodyScale);
      body.position.y = -1.2 + v.breathe * 0.5;
      neck.position.y = -0.5 + v.breathe * 0.25;
      chestMat.color.copy(accentColor);
      chestMat.opacity = 0.4 + Math.sin(time * 2.5) * 0.2;
      // Hands
      leftHand.position.set(
        v.leftHandX,
        v.leftHandY + v.breathe * 0.3,
        v.leftHandZ
      );
      rightHand.position.set(
        v.rightHandX,
        v.rightHandY + v.breathe * 0.3,
        v.rightHandZ
      );
      leftHand.scale.setScalar(0.22 * v.handScale);
      rightHand.scale.setScalar(0.22 * v.handScale);
      leftHand.rotation.z = Math.sin(time * 2 + 1) * 0.1;
      rightHand.rotation.z = Math.sin(time * 2) * -0.1;
      // Arms (update to connect body to hands)
      const updateArm = (
      arm: THREE.Mesh,
      handPos: THREE.Vector3,
      isLeft: boolean) =>
      {
        const bodySide = new THREE.Vector3(
          isLeft ? -0.4 : 0.4,
          -1.0 + v.breathe * 0.5,
          0
        );
        const midPoint = new THREE.Vector3().
        addVectors(bodySide, handPos).
        multiplyScalar(0.5);
        arm.position.copy(midPoint);
        arm.lookAt(handPos);
        arm.rotateX(Math.PI / 2);
        const dist = bodySide.distanceTo(handPos);
        arm.scale.set(1, dist * 1.6, 1); // Stretch cylinder
      };
      updateArm(leftArm, leftHand.position, true);
      updateArm(rightArm, rightHand.position, false);
      // Antenna
      antennaStick.rotation.z = v.antennaWiggle;
      antennaStick.position.x = Math.sin(v.antennaWiggle) * 0.1;
      antennaBall.position.set(
        Math.sin(v.antennaWiggle) * 0.25,
        1.5 + Math.abs(v.antennaWiggle) * 0.1,
        0
      );
      antennaBallMat.color.copy(accentColor);
      antennaLight.color.copy(accentColor);
      // Sparkles
      const sPositions = sparkGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < sparkCount; i++) {
        const bx = sparkBase[i * 3];
        const by = sparkBase[i * 3 + 1];
        const bz = sparkBase[i * 3 + 2];
        const spread = st === 'approved' ? 1.5 : 1;
        const drift = Math.sin(time * 1.5 + i * 0.3) * 0.15;
        sPositions.setXYZ(
          i,
          bx * spread + drift,
          by * spread + drift * 0.5,
          bz * spread
        );
      }
      sPositions.needsUpdate = true;
      sparkles.rotation.y += 0.001;
      sparkMat.color.copy(accentColor);
      sparkMat.opacity = st === 'approved' ? 0.8 : 0.3 + typing * 0.2;
      keyLight.color.copy(accentColor);
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => {
      if (!containerRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      if (containerRef.current && renderer.domElement.parentNode) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Dispose
      headGeo.dispose();
      head.material.dispose();
      visorGeo.dispose();
      visorMat.dispose();
      earGeo.dispose();
      eyeWhiteGeo.dispose();
      eyeWhiteMat.dispose();
      irisGeo.dispose();
      irisMat.dispose();
      pupilGeo.dispose();
      pupilMat.dispose();
      eyelidGeo.dispose();
      eyelidMat.dispose();
      browGeo.dispose();
      browMat.dispose();
      mouthMat.dispose();
      bodyGeo.dispose();
      body.material.dispose();
      neckGeo.dispose();
      chestGeo.dispose();
      chestMat.dispose();
      handGeo.dispose();
      handMat.dispose();
      armGeo.dispose();
      armMat.dispose();
      fingerGeo.dispose();
      antennaStickGeo.dispose();
      antennaBallGeo.dispose();
      antennaBallMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      renderer.dispose();
    };
  }, []);
  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full min-h-[300px]', className)} />);


}