'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Portant 3D : les pièces sont suspendues et se balancent, la vidéo de la boutique joue en fond.
export default function Hero3D({ products, onPick }) {
  const cv = useRef(null);
  const api = useRef({});
  const cb = useRef(onPick);
  cb.current = onPick;

  useEffect(() => {
    const el = cv.current;
    const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const R = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    const S = new THREE.Scene();
    const C = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    C.position.set(0, 0.2, 7);
    const tl = new THREE.TextureLoader();
    const tx = (u) => { const t = tl.load(u); t.colorSpace = THREE.SRGBColorSpace; return t; };

    // Fond : la vidéo de la boutique
    const vid = document.createElement('video');
    vid.src = '/hero.mp4'; vid.muted = true; vid.loop = true; vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    let wa = 0.5625;
    const vt = new THREE.VideoTexture(vid); vt.colorSpace = THREE.SRGBColorSpace;
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: vt, transparent: true, opacity: 0.5 }));
    wall.position.z = -8; S.add(wall);
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      R.setSize(w, h, false); C.aspect = w / h; C.position.z = w < 700 ? 8.5 : 7; C.updateProjectionMatrix();
      const H = 2 * Math.tan((C.fov * Math.PI) / 360) * (C.position.z + 8), k = Math.max((H * C.aspect) / wa, H);
      wall.scale.set(k * wa, k, 1);
    };
    const still = () => { wall.material.map = tx('/products/f5.jpg'); wall.material.needsUpdate = true; wa = 0.75; fit(); };
    vid.onerror = still;
    if (RM) still(); else { const pl = () => vid.play().catch(() => {}); pl(); addEventListener('pointerdown', pl, { once: true }); }
    addEventListener('resize', fit); fit();

    // Portant et pièces suspendues
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 60, 8), new THREE.MeshBasicMaterial({ color: 0x8d8392 }));
    bar.rotation.z = Math.PI / 2; bar.position.y = 1.5; S.add(bar);
    const rail = new THREE.Group(); rail.position.y = 1.5; S.add(rail);
    const G = 2.1;
    const CG = new THREE.PlaneGeometry(1.5, 2), BG = new THREE.PlaneGeometry(1.58, 2.08);
    const HG = new THREE.BoxGeometry(1.2, 0.05, 0.06), KG = new THREE.TorusGeometry(0.1, 0.014, 8, 20, Math.PI * 1.6);
    const WM = new THREE.MeshBasicMaterial({ color: 0x5a3a2e }), BM = new THREE.MeshBasicMaterial({ color: 0xf6f0e8 });
    const ph = (p) => {
      const c = document.createElement('canvas'); c.width = 300; c.height = 400;
      const x = c.getContext('2d'); x.fillStyle = '#8e9f7a'; x.fillRect(0, 0, 300, 400);
      x.fillStyle = '#fff'; x.font = '700 26px sans-serif'; x.textAlign = 'center'; x.fillText(p.name.slice(0, 18), 150, 205);
      return c.toDataURL();
    };
    const meshes = []; let T = 14;
    api.current.build = (L) => {
      while (rail.children.length) { const g = rail.children.pop(), mt = g.userData.m.material; mt.map && mt.map.dispose(); mt.dispose(); }
      meshes.length = 0;
      L.forEach((p, i) => {
        const g = new THREE.Group();
        const m = new THREE.Mesh(CG, new THREE.MeshBasicMaterial({ map: tx(p.image_url || ph(p)) }));
        const b = new THREE.Mesh(BG, BM), h = new THREE.Mesh(HG, WM), k = new THREE.Mesh(KG, WM);
        m.position.y = b.position.y = -1.35; b.position.z = -0.01; h.position.y = -0.33; k.position.y = -0.1; k.rotation.z = -Math.PI * 0.3;
        g.add(b, m, h, k); g.userData = { m, i, p, s: 0 }; m.userData.g = g; rail.add(g); meshes.push(m);
      });
      T = Math.max(L.length * G, 14);
    };

    // Interaction : glisser pour faire défiler, toucher une pièce pour l’ouvrir
    let off = 0, vel = 0, drag = 0, moved = 0, lx = 0, px = 0, py = 0, hov = null, intro = 7, vis = true;
    const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
    const pick = (e) => {
      const r = el.getBoundingClientRect();
      mv.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mv, C);
      const h = ray.intersectObjects(meshes)[0];
      return h ? h.object.userData.g : null;
    };
    el.onpointerdown = (e) => { drag = 1; moved = 0; lx = e.clientX; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; };
    el.onpointermove = (e) => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / r.height - 0.5;
      if (drag) { const dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); vel = dx * 0.011; off += vel; }
      else { hov = pick(e); el.style.cursor = hov ? 'pointer' : 'grab'; }
    };
    el.onpointerup = (e) => { drag = 0; el.style.cursor = 'grab'; if (moved < 6) { const g = pick(e); if (g) cb.current(g.userData.p); } };
    el.onpointercancel = () => { drag = 0; };
    el.onpointerleave = () => { hov = null; };
    const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting; if (!RM) vis ? vid.play().catch(() => {}) : vid.pause(); });
    io.observe(el);

    const clk = new THREE.Clock();
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      const t = clk.getElapsedTime();
      if (!drag) { off += vel; vel *= 0.95; if (!RM && !hov && Math.abs(vel) < 0.002) off -= 0.004; }
      intro *= 0.94;
      rail.children.forEach((g) => {
        const i = g.userData.i;
        g.position.x = ((((i * G + off + intro) % T) + T) % T) - T / 2;
        const sw = RM ? 0 : Math.sin(t * 1.2 + i * 1.7) * 0.03 - Math.max(-1, Math.min(1, vel * 9)) * 0.18;
        g.userData.s += (sw - g.userData.s) * 0.1; g.rotation.z = g.userData.s;
        g.rotation.y += (px * 0.4 - g.rotation.y) * 0.06;
        const sc = g === hov ? 1.08 : 1; g.scale.x += (sc - g.scale.x) * 0.15; g.scale.y = g.scale.z = g.scale.x;
      });
      C.position.x += (px * 0.8 - C.position.x) * 0.04; C.position.y += (0.2 - py * 0.4 - C.position.y) * 0.04; C.lookAt(0, 0.1, 0);
      wall.position.x = -px * 0.6;
      R.render(S, C);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); removeEventListener('resize', fit); io.disconnect();
      vid.pause(); vid.removeAttribute('src'); vid.load(); R.dispose();
      el.onpointerdown = el.onpointermove = el.onpointerup = el.onpointercancel = el.onpointerleave = null;
    };
  }, []);

  useEffect(() => { api.current.build?.(products); }, [products]);

  return <canvas id="gl" ref={cv} aria-label="Portant en 3D avec les pièces de la boutique. Glissez pour le faire défiler, touchez une pièce pour la découvrir." />;
}
