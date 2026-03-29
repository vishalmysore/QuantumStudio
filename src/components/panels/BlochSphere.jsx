import { useEffect, useRef } from 'react';

export default function BlochSphere({ x, y, z, size = 300 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const center = { x: W / 2, y: H / 2 };
        const radius = size * 0.4;

        // 3D projection parameters
        const tiltX = 0.5; // Radians
        const tiltY = 0.5;

        const project = (px, py, pz) => {
            // Rotation around Y
            let x1 = px * Math.cos(tiltY) + pz * Math.sin(tiltY);
            let z1 = -px * Math.sin(tiltY) + pz * Math.cos(tiltY);
            // Rotation around X
            let y2 = py * Math.cos(tiltX) - z1 * Math.sin(tiltX);
            let z2 = py * Math.sin(tiltX) + z1 * Math.cos(tiltX);
            // Orthographic projection
            return {
                x: center.x + x1 * radius,
                y: center.y - y2 * radius,
                z: z2
            };
        };

        const drawSphere = () => {
            ctx.clearRect(0, 0, W, H);

            // 1. Draw Globe Circles (Back)
            ctx.strokeStyle = 'rgba(148,163,184,0.1)';
            ctx.lineWidth = 1;

            // Longitudinal circles
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                const angle = (i * Math.PI) / 4;
                for (let j = 0; j <= 40; j++) {
                    const phi = (j * Math.PI * 2) / 40;
                    const p = project(Math.cos(phi) * Math.sin(angle), Math.cos(angle), Math.sin(phi) * Math.sin(angle));
                    if (j === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            // Latitude circle (Equator)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(148,163,184,0.2)';
            for (let i = 0; i <= 40; i++) {
                const phi = (i * Math.PI * 2) / 40;
                const p = project(Math.cos(phi), 0, Math.sin(phi));
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // 2. Axes
            const axes = [
                { end: project(1.2, 0, 0), label: 'X', color: '#ef4444' },
                { end: project(0, 1.2, 0), label: 'Z', color: '#3b82f6' }, // Vertical is Z in physics convention
                { end: project(0, 0, 1.2), label: 'Y', color: '#f59e0b' }
            ];

            axes.forEach(a => {
                ctx.strokeStyle = a.color + '44';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(center.x, center.y);
                ctx.lineTo(a.end.x, a.end.y);
                ctx.stroke();
                ctx.fillStyle = a.color;
                ctx.font = 'bold 10px Inter';
                ctx.fillText(a.label, a.end.x + 4, a.end.y + 4);
            });

            // 3. The State Vector (THE QUBIT!)
            const target = project(x, z, y); // Coordinate swap to match physics convention (Z = up)

            // Draw a subtle line from center to dot
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw the point
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#a78bfa';
            ctx.fillStyle = '#a78bfa';
            ctx.beginPath();
            ctx.arc(target.x, target.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Outer Rim of the sphere
            ctx.strokeStyle = 'rgba(148,163,184,0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        };

        drawSphere();
    }, [x, y, z, size]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas ref={canvasRef} width={size} height={size} />
        </div>
    );
}
