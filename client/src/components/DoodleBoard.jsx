import React, { useRef, useState, useEffect } from 'react';
import { Palette, Trash2, Download, Eraser, Edit3, ShieldAlert } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const BRUSH_COLORS = [
  { name: 'cyan', hex: '#06b6d4' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'purple', hex: '#a855f7' },
  { name: 'rose', hex: '#f43f5e' },
  { name: 'emerald', hex: '#10b981' },
  { name: 'amber', hex: '#fbbf24' }
];

export default function DoodleBoard() {
  const { socket, roomId, dataSaverMode } = useChat();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#a855f7');
  const [brushWidth, setBrushWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [partnerDrawing, setPartnerDrawing] = useState(false);
  const partnerDrawingTimeout = useRef(null);

  // Initialize canvas drawing settings with resize / orientation change support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // 1. Temporarily cache the current drawing state
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);

      // 2. Adjust physical resolution of the canvas for Retina/HiDPI screens
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      context.scale(2, 2);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;

      // 3. Reset background to dark slate
      context.fillStyle = '#0f172a';
      context.fillRect(0, 0, rect.width, rect.height);

      // 4. Paint the cached drawings back, mapping coordinates correctly
      context.drawImage(
        tempCanvas, 
        0, 
        0, 
        tempCanvas.width, 
        tempCanvas.height, 
        0, 
        0, 
        rect.width, 
        rect.height
      );
    };

    // Trigger initial calculation
    resizeCanvas();

    // Listen to resize and orientationchange events
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, []);

  // Listen to remote drawing actions
  useEffect(() => {
    if (!socket) return;

    const handleDoodleAction = (data) => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (!canvas || !ctx || !data) return;

      if (data.type === 'draw') {
        setPartnerDrawing(true);
        if (partnerDrawingTimeout.current) clearTimeout(partnerDrawingTimeout.current);
        partnerDrawingTimeout.current = setTimeout(() => setPartnerDrawing(false), 1000);

        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width;
        ctx.beginPath();
        ctx.moveTo(data.x0, data.y0);
        ctx.lineTo(data.x1, data.y1);
        ctx.stroke();
        ctx.closePath();
      } else if (data.type === 'clear') {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    };

    socket.on('doodleAction', handleDoodleAction);
    return () => {
      socket.off('doodleAction', handleDoodleAction);
      if (partnerDrawingTimeout.current) clearTimeout(partnerDrawingTimeout.current);
    };
  }, [socket]);

  // Handle local drawing actions
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Support both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const lastPos = useRef({ x: 0, y: 0 });
  const lastEmittedPos = useRef({ x: 0, y: 0 });
  const lastEmitTime = useRef(0);

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    lastPos.current = pos;
    lastEmittedPos.current = pos;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const currentPos = getMousePos(e);
    const activeColor = isEraser ? '#0f172a' : brushColor;
    const activeWidth = isEraser ? 20 : brushWidth;

    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeWidth;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    ctx.closePath();

    // Broadcast drawing stroke
    if (socket && roomId) {
      const now = Date.now();
      // Throttle broadcast to 35ms (approx 30fps) to save bandwidth on mobile/slow networks
      if (now - lastEmitTime.current > 35) {
        socket.emit('doodleAction', {
          type: 'draw',
          x0: lastEmittedPos.current.x,
          y0: lastEmittedPos.current.y,
          x1: currentPos.x,
          y1: currentPos.y,
          color: activeColor,
          width: activeWidth
        });
        lastEmitTime.current = now;
        lastEmittedPos.current = currentPos;
      }
    }

    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    if (isDrawing && socket && roomId) {
      // Emit the final segment if it hasn't been emitted yet to ensure smooth shapes
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx && (lastPos.current.x !== lastEmittedPos.current.x || lastPos.current.y !== lastEmittedPos.current.y)) {
        const activeColor = isEraser ? '#0f172a' : brushColor;
        const activeWidth = isEraser ? 20 : brushWidth;
        socket.emit('doodleAction', {
          type: 'draw',
          x0: lastEmittedPos.current.x,
          y0: lastEmittedPos.current.y,
          x1: lastPos.current.x,
          y1: lastPos.current.y,
          color: activeColor,
          width: activeWidth
        });
      }
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (socket && roomId) {
      socket.emit('doodleAction', { type: 'clear' });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `shared_doodle_${Date.now()}.png`;
    link.click();
  };

  if (dataSaverMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0d1424]/40 border border-slate-850/65 rounded-2xl min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl mb-4 text-amber-400">
          ⚠️
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Doodle Board Paused</h4>
        <p className="text-xs text-slate-400 max-w-[240px] mb-4">
          Doodle Board is disabled in <strong>Data & RAM Saver Mode</strong> to reduce battery drain, RAM lag, and slow internet packet usage.
        </p>
        <p className="text-[10px] text-slate-500 italic">
          Turn off Data Saver in settings to draw.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/10 rounded-2xl overflow-hidden p-3.5">
      {/* Canvas container */}
      <div className="flex-1 relative bg-[#0f172a] border border-slate-800/80 rounded-xl overflow-hidden shadow-inner min-h-[220px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />

        {/* Partner is drawing banner */}
        {partnerDrawing && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-900/90 border border-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-pulse z-15">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
            <span>Stranger is drawing...</span>
          </div>
        )}
      </div>

      {/* Toolbox Panel */}
      <div className="mt-3.5 flex flex-col gap-2.5 shrink-0 select-none text-slate-350">
        {/* Colors & Pen selection */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {/* Draw Pen toggle */}
            <button
              type="button"
              onClick={() => setIsEraser(false)}
              className={`p-2 rounded-xl transition border ${
                !isEraser
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
              }`}
              title="Pen Tool"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Eraser toggle */}
            <button
              type="button"
              onClick={() => setIsEraser(true)}
              className={`p-2 rounded-xl transition border ${
                isEraser
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Colors */}
          {!isEraser && (
            <div className="flex items-center gap-1.5">
              {BRUSH_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setBrushColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-5 h-5 rounded-full transition hover:scale-115 active:scale-95 ${
                    brushColor === c.hex
                      ? 'ring-2 ring-offset-2 ring-offset-[#090d16] ring-slate-400 scale-110 shadow-sm'
                      : 'opacity-85'
                  }`}
                  title={`Color: ${c.name}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brush size & utility buttons */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Size slider */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Size</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="flex-1 accent-brand-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              disabled={isEraser}
            />
            <span className="text-xs font-bold text-slate-400 w-5 text-right">{brushWidth}px</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Clear Board */}
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Save Doodle */}
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-800"
              title="Export Doodle"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
