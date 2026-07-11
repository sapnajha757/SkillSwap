"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { ArrowLeft, Code, Paintbrush, Eraser, RotateCcw, Sparkles } from "lucide-react";
import { OSLoader } from "@/components/os/OSShared";

interface PathPoint {
  x: number;
  y: number;
}

interface DrawingPath {
  points: PathPoint[];
  color: string;
  width: number;
}

export default function CollaborativeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as Id<"sessions">;

  // Convex mutations & queries
  const getOrCreateRoom = useMutation(api.sessions.getOrCreateRoomState);
  const updateRoom = useMutation(api.sessions.updateRoomState);

  // States
  const [roomId, setRoomId] = useState<Id<"sessionRooms"> | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [whiteboardPaths, setWhiteboardPaths] = useState<DrawingPath[]>([]);
  const [loading, setLoading] = useState(true);

  // Whiteboard drawing tools
  const [brushColor, setBrushColor] = useState("#cebef9");
  const [brushWidth, setBrushWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Fetch room initially
  useEffect(() => {
    async function initRoom() {
      try {
        const room = await getOrCreateRoom({ sessionId });
        setRoomId(room._id);
        setCode(room.code);
        setLanguage(room.language);
        setWhiteboardPaths(JSON.parse(room.whiteboardPathsJson || "[]"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initRoom();
  }, [sessionId, getOrCreateRoom]);

  // Reactive subscription to room state
  const activeRoomData = useQuery(
    api.sessions.getRoomState,
    roomId ? { sessionId } : "skip"
  );

  // Sync from live db state → local state
  useEffect(() => {
    if (activeRoomData) {
      setCode(activeRoomData.code);
      setLanguage(activeRoomData.language);
      const remotePaths = JSON.parse(activeRoomData.whiteboardPathsJson || "[]");
      setWhiteboardPaths(remotePaths);
      drawAllPaths(remotePaths);
    }
  }, [activeRoomData]);

  // Set up Canvas
  useEffect(() => {
    if (loading || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 500;

    const context = canvas.getContext("2d");
    if (context) {
      context.lineCap = "round";
      context.lineJoin = "round";
      contextRef.current = context;
    }
  }, [loading]);

  // Helper: Draw all paths to canvas
  const drawAllPaths = (paths: DrawingPath[]) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
      if (path.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
      ctx.closePath();
    });
  };

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.strokeStyle = brushColor;
    contextRef.current.lineWidth = brushWidth;
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);

    const newPath: DrawingPath = {
      points: [{ x, y }],
      color: brushColor,
      width: brushWidth,
    };
    setWhiteboardPaths((prev) => [...prev, newPath]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !contextRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    setWhiteboardPaths((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last) {
        last.points.push({ x, y });
      }
      return copy;
    });
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (roomId) {
      // Sync paths to database
      await updateRoom({
        roomId,
        whiteboardPathsJson: JSON.stringify(whiteboardPaths),
      });
    }
  };

  const clearCanvas = async () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx || !roomId) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setWhiteboardPaths([]);
    await updateRoom({
      roomId,
      whiteboardPathsJson: JSON.stringify([]),
    });
  };

  // Code editor updates
  const handleCodeChange = async (newVal: string) => {
    setCode(newVal);
    if (roomId) {
      await updateRoom({
        roomId,
        code: newVal,
      });
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    if (roomId) {
      await updateRoom({
        roomId,
        language: newLang,
      });
    }
  };

  if (loading) {
    return <OSLoader label="Configuring Workspace Room..." />;
  }

  return (
    <div className="h-screen w-screen bg-background text-white flex flex-col overflow-hidden">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 blur-[180px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border-soft glass-panel">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/os/career")}
            className="w-9 h-9 rounded-xl border border-border-strong flex items-center justify-center text-text-faint hover:text-white hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h1 className="font-display font-bold text-lg">SkillSwap Collaboration Room</h1>
            </div>
            <p className="text-xs text-text-faint font-mono mt-0.5">Session Room ID: {sessionId.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono text-text-faint">Live Synchronized</span>
        </div>
      </header>

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Side: Code Editor */}
        <div className="flex-1 flex flex-col border-r border-border-soft bg-surface/10">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-soft bg-surface/20">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Shared Editor</span>
            </div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-surface border border-border-strong rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="rust">Rust</option>
              <option value="html">HTML / CSS</option>
            </select>
          </div>

          <div className="flex-1 relative flex">
            {/* Simple Line Numbers */}
            <div className="w-12 bg-surface/30 border-r border-border-soft/50 py-4 select-none text-right pr-3 font-mono text-xs text-text-faint/40 leading-relaxed">
              {Array.from({ length: code.split("\n").length }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="flex-1 bg-transparent p-4 font-mono text-sm text-white placeholder:text-text-faint/30 resize-none outline-none leading-relaxed overflow-y-auto"
              placeholder="// Start coding here..."
            />
          </div>
        </div>

        {/* Right Side: Whiteboard */}
        <div className="flex-1 flex flex-col bg-surface/5">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-soft bg-surface/20">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold">Shared Whiteboard</span>
            </div>

            {/* Canvas Toolbar */}
            <div className="flex items-center gap-3">
              {/* Colors */}
              <div className="flex items-center gap-1.5 border-r border-border-soft pr-3 mr-1">
                {["#cebef9", "#b6dec3", "#ddd4bf", "#ff4c5a", "#ffffff"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      brushColor === color ? "scale-125 border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Stroke width */}
              <input
                type="range"
                min="2"
                max="12"
                value={brushWidth}
                onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                className="w-16 accent-secondary"
              />

              <button
                onClick={clearCanvas}
                className="p-1.5 rounded-lg text-text-faint hover:text-white hover:bg-surface transition-colors"
                title="Clear Whiteboard"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-background/20 cursor-crosshair overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
