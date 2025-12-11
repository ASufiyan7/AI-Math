import { ColorSwatch, Group } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES } from '@/constants';

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

interface LatexItemProps {
  latex: string;
  position: { x: number; y: number };
  onStop: (e: any, data: any) => void;
}

function DraggableLatexItem({ latex, position, onStop }: LatexItemProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable nodeRef={nodeRef as React.RefObject<HTMLElement>} defaultPosition={position} onStop={onStop}>
      <div
        ref={nodeRef}
        className="absolute p-2 rounded-lg shadow-xl bg-red-900/80 backdrop-blur-sm border border-red-700/50 hover:border-red-500 transition-all"
      >
        <div className="latex-content text-red-100 font-semibold text-lg tracking-wide">{latex}</div>
      </div>
    </Draggable>
  );
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(SWATCHES[0]);
  const [reset, setReset] = useState(false);
  const [dictOfVars, setDictOfVars] = useState<{ [key: string]: string }>({});
  const [latexExpression, setLatexExpression] = useState<string[]>([]);
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });

  const [strokes, setStrokes] = useState<ImageData[]>([]);

  // Canvas Initialization 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        canvas.style.background = '#000000';
        ctx.lineCap = 'round';
        ctx.lineWidth = 3;
      }
    }

    // Load MathJax
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      window.MathJax?.Hub.Config({
        tex2jax: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setLatexExpression([]);
      setDictOfVars({});
      setReset(false);
    }
  }, [reset]);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]); 
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Remove the last stroke and restore the previous state
    setStrokes((prev) => {
      const newStrokes = prev.slice(0, -1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (newStrokes.length > 0) {
        ctx.putImageData(newStrokes[newStrokes.length - 1], 0, 0);
      }
      return newStrokes;
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);

    // Save the current canvas state for Undo
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setStrokes((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const convertToLatex = (items: Response[]) => {
    return items.map((item) => {
      if (item.expr.toLowerCase() === 'image description') {
        return `\\(\\text{${item.result.replace(/"/g, '\\"')}}\\)`;
      } else {
        return `\\(\\LARGE{${item.expr} = ${item.result}}\\)`;
      }
    });
  };

  // Analyze (Send to Backend) 
  const runRoute = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/calculate`, {
      image: canvas.toDataURL('image/png'),
      dict_of_vars: dictOfVars,
    });
    const resp = response.data;
    console.log('Backend Response:', resp);

    resp.data.forEach((r: Response) => {
      if (r.assign) {
        setDictOfVars((prev) => ({ ...prev, [r.expr]: r.result.toString() }));
      }
    });

    const newLatex = convertToLatex(resp.data);
    setLatexExpression(newLatex);

    // Clear the canvas after analysis
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div
        className="grid grid-cols-3 gap-4 p-4 fixed top-0 w-full z-50"
        style={{
          background: 'linear-gradient(135deg, rgba(40, 0, 0, 0.95) 0%, rgba(80, 0, 0, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(255, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 80, 80, 0.2)',
        }}
      >
        {/* LEFT: Reset + Undo */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setReset(true)}
            className="bg-red-700 hover:bg-red-600 text-red-200 py-4 px-40 rounded-xl 
                       transition-all duration-300 transform hover:scale-105 shadow-red-glow"
          >
            🗑️ Reset
          </Button>

          <Button
            onClick={undoLastStroke}
            className="bg-red-700 hover:bg-red-600 text-red-100 p-4 rounded-full 
                       transition-all duration-300 transform hover:scale-110 shadow-red-glow"
          >
            ↩️
          </Button>
        </div>

        {/* CENTER: Color Swatches */}
        <div className="flex justify-center items-center">
          <Group className="justify-center space-x-2">
            {SWATCHES.map((swatch) => (
              <ColorSwatch
                key={swatch}
                color={swatch}
                onClick={() => setColor(swatch)}
                className={`h-8 w-8 rounded-lg cursor-pointer transition-all 
                  ${color === swatch ? 'ring-4 ring-red-300 scale-110' : 'ring-2 ring-red-100'} 
                  hover:scale-125 shadow-md`}
              />
            ))}
          </Group>
        </div>

        {/* RIGHT: Analyze Button */}
        <div className="flex justify-end items-center">
          <Button
            onClick={runRoute}
            className="bg-red-700 hover:bg-red-600 text-red-100 py-4 px-40 rounded-xl 
                       transition-all duration-300 transform hover:scale-105 shadow-red-glow"
          >
            🔍 Analyze
          </Button>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 w-full h-full bg-black"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />

      {/* Optional Floating Red Particles */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Draggable LaTeX Expressions */}
      {latexExpression.map((latex, idx) => (
        <DraggableLatexItem
          key={idx}
          latex={latex}
          position={latexPosition}
          onStop={(_, data) => setLatexPosition({ x: data.x, y: data.y })}
        />
      ))}
    </>
  );
}
