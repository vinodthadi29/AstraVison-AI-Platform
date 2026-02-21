import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
interface GlobeHeroProps {
  className?: string;
  onEnterSystem?: () => void;
}
export function GlobeHero({ className, onEnterSystem }: GlobeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number>(0);
  useEffect(() => {
    if (!containerRef.current) return;
    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Camera Setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;
    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    // Globe Mesh (Wireframe Sphere)
    const geometry = new THREE.SphereGeometry(1.2, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globeRef.current = globe;
    // Inner Glow Sphere (Solid, slightly smaller)
    const innerGeometry = new THREE.SphereGeometry(1.15, 64, 64);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    const innerGlobe = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerGlobe);
    // Particles (Stars)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.5
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    // Animation Loop
    const animate = () => {
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.002;
        globeRef.current.rotation.x += 0.0005;
      }
      if (particlesMesh) {
        particlesMesh.rotation.y -= 0.0005;
      }
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();
    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
      return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      material.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  return (
    <div
      className={cn(
        'relative w-full h-screen overflow-hidden bg-astra-bg',
        className
      )}>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 pointer-events-none" />


      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-astra-bg via-transparent to-astra-bg/50 pointer-events-none" />

        <div className="relative z-10 text-center space-y-12 max-w-5xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8
            }}
            className="space-y-8">

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                duration: 0.6,
                delay: 0.2
              }}
              className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-astra-violet/10 border border-astra-violet/30 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.2)]">

              <div className="w-2 h-2 bg-astra-violet rounded-full animate-ping" />
              <span className="relative z-10 text-sm font-bold text-astra-violet tracking-wider uppercase font-mono">
                ASTRA VISION AI PLATFORM
              </span>
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 30
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 1,
                  delay: 0.3
                }}
                className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-bold tracking-tighter leading-[0.9] select-none text-white">

                <span className="block font-light text-white/50 mb-3 text-4xl md:text-6xl lg:text-7xl">
                  See Beyond
                </span>
                <span className="block relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-astra-violet via-white to-astra-blue relative z-10">
                    the Visible
                  </span>
                  <motion.div
                    initial={{
                      width: 0
                    }}
                    animate={{
                      width: '100%'
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 1.2,
                      ease: 'easeOut'
                    }}
                    className="absolute -bottom-6 left-0 h-1 bg-gradient-to-r from-astra-violet via-astra-blue to-transparent rounded-full opacity-50" />

                </span>
              </motion.h1>
            </div>

            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              transition={{
                duration: 0.8,
                delay: 0.8
              }}
              className="max-w-3xl mx-auto space-y-4">

              <p className="text-xl md:text-2xl text-astra-text-secondary leading-relaxed font-medium">
                AstraVision transforms how machines perceive the world — from
                real-time object recognition to deep semantic understanding of
                visual data at planetary scale.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8,
              delay: 1
            }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">

            <motion.button
              onClick={onEnterSystem}
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.98
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg overflow-hidden">

              <div className="absolute inset-0 bg-gradient-to-r from-astra-violet to-astra-blue opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <span className="relative z-10 tracking-wide">Enter System</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.98
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/5 transition-all duration-500 backdrop-blur-xl text-white">

              <Zap className="relative z-10 w-5 h-5 text-astra-blue group-hover:scale-110 transition-all duration-300" />
              <span className="relative z-10 tracking-wide">
                Explore Capabilities
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>);

}