import React, { useRef, useState, useEffect } from 'react';
import { Palette, Trash2, Download, Eraser, Edit3, ShieldAlert } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const BRUSH_COLORS = [
  { name: 'slate', hex: '#475569' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'purple', hex: '#8b5cf6' },
  { name: 'rose', hex: '#f43f5e' },
  { name: 'emerald', hex: '#10b981' },
  { name: 'amber', hex: '#f59e0b' }
];

export default function DoodleBoard() {
  const { socket, roomId } = useChat();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#8b5cf6');
  const [brushWidth, setBrushWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [partnerDrawing, setPartnerDrawing] = useState(false);
  const partnerDrawingTimeout = useRef(null);

  // Initialize canvas drawing settings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Support Retina displays (high DPI)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Reset whiteboard background to white
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, rect.width, rect.height);
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
        ctx.fillStyle = '#ffffff';
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

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    lastPos.current = pos;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const currentPos = getMousePos(e);
    const activeColor = isEraser ? '#ffffff' : brushColor;
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
      socket.emit('doodleAction', {
        type: 'draw',
        x0: lastPos.current.x,
        y0: lastPos.current.y,
        x1: currentPos.x,
        y1: currentPos.y,
        color: activeColor,
        width: activeWidth
      });
    }

    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/40 rounded-2xl overflow-hidden p-3.5">
      {/* Canvas container */}
      <div className="flex-1 relative bg-white border border-slate-150 rounded-xl overflow-hidden shadow-inner-soft min-h-[220px]">
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
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-800/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-pulse z-15">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
            <span>Stranger is drawing...</span>
          </div>
        )}
      </div>

      {/* Toolbox Panel */}
      <div className="mt-3.5 flex flex-col gap-2.5 shrink-0 select-none">
        {/* Colors & Pen selection */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {/* Draw Pen toggle */}
            <button
              type="button"
              onClick={() => setIsEraser(false)}
              className={`p-2 rounded-xl transition ${
                !isEraser
                  ? 'bg-brand-50 text-brand-600 border border-brand-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title="Pen Tool"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Eraser toggle */}
            <button
              type="button"
              onClick={() => setIsEraser(true)}
              className={`p-2 rounded-xl transition ${
                isEraser
                  ? 'bg-brand-50 text-brand-600 border border-brand-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
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
                      ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-sm'
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Size</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="flex-1 accent-brand-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              disabled={isEraser}
            />
            <span className="text-xs font-bold text-slate-500 w-5 text-right">{brushWidth}px</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Clear Board */}
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Save Doodle */}
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
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
