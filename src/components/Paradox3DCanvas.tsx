import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function Paradox3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const canvas = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const handleContextRestored = () => {
      setWebglFailed(false);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x081229, 0.048);

    const camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0.9, 8.6);

    // Glossy Y2K Chrome Studio Lights on Navy
    const ambient = new THREE.AmbientLight(0xdbeafe, 1.15);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const iceRim = new THREE.PointLight(0x93c5fd, 3.6, 22);
    iceRim.position.set(-4.5, 2.2, 4);
    scene.add(iceRim);

    const pinkRim = new THREE.PointLight(0xf9a8d4, 2.1, 18);
    pinkRim.position.set(4.5, -1.5, 3);
    scene.add(pinkRim);

    // Soft ice-blue horizon grid over navy
    const gridHelper = new THREE.GridHelper(48, 36, 0x60a5fa, 0x1e3a8a);
    gridHelper.position.y = -2.3;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.42;
    scene.add(gridHelper);

    // Centerpiece: Glossy Y2K Chrome Star + Compact Disc (CD-ROM) Halo
    const centerpiece = new THREE.Group();
    centerpiece.position.set(0, 0.15, 0);

    const cdGeo = new THREE.RingGeometry(1.15, 2.55, 64);
    const cdMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      metalness: 0.9,
      roughness: 0.1,
      iridescence: 1.0,
      iridescenceIOR: 1.38,
      side: THREE.DoubleSide,
    });
    const cdMesh = new THREE.Mesh(cdGeo, cdMat);
    cdMesh.rotation.x = Math.PI * 0.34;
    cdMesh.rotation.y = -Math.PI * 0.14;
    centerpiece.add(cdMesh);

    const hubGeo = new THREE.RingGeometry(0.42, 1.12, 48);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      metalness: 0.4,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.rotation.copy(cdMesh.rotation);
    centerpiece.add(hubMesh);

    const starShape = new THREE.Shape();
    const outerR = 1.05;
    const innerR = 0.36;
    const points = 4;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    starGeo.center();

    const starMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.94,
      roughness: 0.08,
      iridescence: 0.85,
      clearcoat: 1.0,
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    centerpiece.add(starMesh);

    const bubbleGeo = new THREE.SphereGeometry(0.16, 20, 20);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      metalness: 0.5,
      roughness: 0.08,
      clearcoat: 1.0,
    });
    const pinkBubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xf9a8d4,
      metalness: 0.45,
      roughness: 0.08,
      clearcoat: 1.0,
    });

    const b1 = new THREE.Mesh(bubbleGeo, bubbleMat);
    b1.position.set(2.3, 1.1, 0.6);
    const b2 = new THREE.Mesh(bubbleGeo, pinkBubbleMat);
    b2.position.set(-2.2, -0.8, 0.8);
    b2.scale.setScalar(0.8);
    centerpiece.add(b1, b2);

    scene.add(centerpiece);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let rafId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!prefersReduced) {
        starMesh.rotation.y += dt * 0.7;
        starMesh.position.y = Math.sin(now * 0.0018) * 0.14;

        cdMesh.rotation.z += dt * 0.45;
        hubMesh.rotation.z += dt * 0.45;

        b1.position.y = 1.1 + Math.sin(now * 0.002) * 0.22;
        b2.position.y = -0.8 + Math.cos(now * 0.0017) * 0.2;

        camera.position.x += (pointer.x * 0.75 - camera.position.x) * 0.05;
        camera.position.y += (0.9 + pointer.y * 0.35 - camera.position.y) * 0.05;
        camera.lookAt(0, 0.1, 0);
      }

      renderer.render(scene, camera);
      if (!prefersReduced) {
        rafId = requestAnimationFrame(animate);
      }
    };

    if (prefersReduced) {
      renderer.render(scene, camera);
    } else {
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      cdGeo.dispose();
      cdMat.dispose();
      hubGeo.dispose();
      hubMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
      pinkBubbleMat.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center y2k-navy-grid" aria-hidden="true">
        <div className="w-64 h-64 rounded-full border-2 border-[#93C5FD]/40 bg-gradient-to-tr from-[#1E3A8A]/40 via-[#60A5FA]/20 to-[#F9A8D4]/20 opacity-80" />
      </div>
    );
  }

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}
