import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ParticleBackground() {
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 35;

    const geometry = new THREE.BufferGeometry();
    const count = 1800;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 55;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.09,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    const onMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const animate = () => {
      const particlesObj = particlesRef.current;
      if (particlesObj) {
        particlesObj.rotation.y += 0.0008;
        particlesObj.rotation.x = THREE.MathUtils.lerp(particlesObj.rotation.x, mouseRef.current.y * 0.06, 0.03);
        particlesObj.rotation.z = THREE.MathUtils.lerp(particlesObj.rotation.z, mouseRef.current.x * 0.05, 0.03);
      }

      renderer.render(scene, camera);
      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    // ScrollTrigger subtly adjusts the particle field intensity and rotation while the page scrolls.
    const scrollEffect = ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        if (!particlesRef.current) return;
        const progress = self.progress;
        particlesRef.current.rotation.y = progress * Math.PI * 0.6 + 0.2;
        material.opacity = 0.65 + progress * 0.25;
        material.size = 0.08 + progress * 0.03;
      }
    });

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      scrollEffect.kill();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      scene.clear();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" />;
}
