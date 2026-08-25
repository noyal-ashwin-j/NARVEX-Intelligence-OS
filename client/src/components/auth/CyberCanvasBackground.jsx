import React, { useEffect, useRef } from 'react';

/**
 * Ultra-Sleek Planetary Command Intelligence Environment
 * Features: Atmospheric Deep Navy -> Tactical Grid -> Constellation Nodes & Photon Arcs -> Slow Radar Sweep -> Mouse Parallax
 */
export function CyberCanvasBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / width - 0.5);
      targetMouseY = (e.clientY / height - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Strategic Command Nodes
    const nodes = [
      { id: 'chn', name: 'CHENNAI_HQ', x: 0.78, y: 0.28, key: true },
      { id: 'cbe', name: 'COIMBATORE_HUB', x: 0.26, y: 0.52, key: true },
      { id: 'mdu', name: 'MADURAI_NODE', x: 0.42, y: 0.74, key: true },
      { id: 'slm', name: 'SALEM_AXIS', x: 0.48, y: 0.44, key: false },
      { id: 'hsr', name: 'HOSUR_BORDER', x: 0.36, y: 0.24, key: true },
      { id: 'ttk', name: 'THOOTHUKUDI_PORT', x: 0.50, y: 0.88, key: true },
      { id: 'try', name: 'TRICHY_CENTRAL', x: 0.56, y: 0.58, key: false }
    ];

    const links = [
      { source: 'chn', target: 'slm' },
      { source: 'slm', target: 'hsr' },
      { source: 'slm', target: 'cbe' },
      { source: 'cbe', target: 'mdu' },
      { source: 'mdu', target: 'ttk' },
      { source: 'chn', target: 'try' },
      { source: 'try', target: 'mdu' }
    ];

    // Travelling Photons along Links
    const photons = [
      { linkIdx: 0, progress: 0.1, speed: 0.003 },
      { linkIdx: 2, progress: 0.4, speed: 0.0025 },
      { linkIdx: 4, progress: 0.7, speed: 0.0035 },
      { linkIdx: 5, progress: 0.2, speed: 0.002 }
    ];

    let radarAngle = 0;

    const render = () => {
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      const px = currentMouseX * 15;
      const py = currentMouseY * 15;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Atmosphere Background
      const bgGrad = ctx.createRadialGradient(
        width / 2 + px * 0.5,
        height / 2 + py * 0.5,
        80,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#0B1120');
      bgGrad.addColorStop(0.5, '#050811');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Tactical Grid Lines
      ctx.save();
      ctx.translate(px * 0.2, py * 0.2);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 64;

      for (let x = 0; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Command Network Constellations
      ctx.save();
      ctx.translate(px * 0.5, py * 0.5);

      const nodeCoords = new Map();
      nodes.forEach((n) => {
        const nx = n.x * width;
        const ny = n.y * height;
        nodeCoords.set(n.id, { x: nx, y: ny, node: n });
      });

      // Connecting Links
      links.forEach((l) => {
        const s = nodeCoords.get(l.source);
        const t = nodeCoords.get(l.target);
        if (!s || !t) return;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Travelling Photons
      if (!prefersReducedMotion) {
        photons.forEach((p) => {
          const l = links[p.linkIdx];
          if (!l) return;
          const s = nodeCoords.get(l.source);
          const t = nodeCoords.get(l.target);
          if (!s || !t) return;

          p.progress += p.speed;
          if (p.progress >= 1) p.progress = 0;

          const fx = s.x + (t.x - s.x) * p.progress;
          const fy = s.y + (t.y - s.y) * p.progress;

          ctx.beginPath();
          ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#22D3EE';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#22D3EE';
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // Render Nodes
      nodes.forEach((n) => {
        const pos = nodeCoords.get(n.id);
        if (!pos) return;

        const time = Date.now() * 0.0018;
        const pulse = (Math.sin(time + pos.x) + 1) * 3 + 4;

        if (!prefersReducedMotion) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pulse + (n.key ? 5 : 2), 0, Math.PI * 2);
          ctx.strokeStyle = n.key ? 'rgba(34, 211, 238, 0.25)' : 'rgba(129, 140, 248, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, n.key ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = n.key ? '#22D3EE' : '#818CF8';
        ctx.shadowBlur = n.key ? 10 : 0;
        ctx.shadowColor = '#22D3EE';
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.fillText(n.name, pos.x + 8, pos.y + 3);
      });
      ctx.restore();

      // 4. Slow Controlled Radar Sweep
      if (!prefersReducedMotion) {
        const radarX = width * 0.5;
        const radarY = height * 0.5;
        const radarRadius = Math.min(width, height) * 0.44;

        radarAngle += 0.0035;

        ctx.save();
        ctx.translate(radarX + px * 0.15, radarY + py * 0.15);

        [0.3, 0.6, 0.9].forEach((rRatio) => {
          ctx.beginPath();
          ctx.arc(0, 0, radarRadius * rRatio, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.03)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radarRadius, radarAngle - 0.2, radarAngle);
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 211, 238, 0.025)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(radarAngle) * radarRadius, Math.sin(radarAngle) * radarRadius);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
