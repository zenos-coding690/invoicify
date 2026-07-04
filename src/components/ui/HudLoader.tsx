"use client";

import React, { useEffect, useState } from 'react';

export function HudLoader() {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const BOOT_LOGS = [
    "INITIALIZING QUANTUM CORE...",
    "ESTABLISHING NEURAL LINK...",
    "LOADING INVOICIFY PROTOCOLS...",
    "DECRYPTING FINANCIAL MATRIX...",
    "CALIBRATING PAYMENT ENGINES...",
    "SYNCING REALTIME CHANNELS...",
    "ALL SYSTEMS NOMINAL."
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 1;
      });
    }, 300);

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < BOOT_LOGS.length) {
        setLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 450);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center overflow-hidden z-50 font-mono">
      {/* Scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-6 bg-indigo-500/15 blur-md animate-scanline pointer-events-none z-20"></div>

      {/* Ambient glows */}
      <div className="absolute w-[600px] h-[600px] bg-indigo-500/[0.06] rounded-full filter blur-[150px] pointer-events-none"></div>
      <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-cyan-500/[0.04] rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Arc Reactor Rings */}
        <div className="absolute w-full h-full rounded-full border border-indigo-900/30 animate-spin-slow"></div>
        <div className="absolute w-[85%] h-[85%] rounded-full border-2 border-dashed border-indigo-500/40 animate-spin-reverse opacity-70"></div>
        <div className="absolute w-[70%] h-[70%] rounded-full border border-cyan-500/30 animate-spin-slow opacity-80">
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_12px_#818cf8]"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee]"></div>
        </div>
        <div className="absolute w-[50%] h-[50%] rounded-full border-[3px] border-indigo-600/20"></div>
        
        {/* Central Core */}
        <div className="absolute z-10 text-center">
          <div className="text-indigo-400 text-5xl font-extrabold tracking-tighter animate-pulse-neon">
            {Math.min(progress, 100)}%
          </div>
          <div className="text-slate-500 text-[10px] tracking-[0.3em] mt-2 uppercase font-bold">
            System Boot
          </div>
        </div>
      </div>

      {/* Boot Logs */}
      <div className="absolute bottom-12 left-12 max-w-sm w-full space-y-1.5 text-xs opacity-60">
        {logs.map((log, i) => (
          <div key={i} className="text-indigo-400/80 tracking-wider flex gap-2 font-mono">
            <span className="text-indigo-600/60">[SYS]</span>
            <span className="animate-[decoding_0.2s_ease-out]">{log}</span>
          </div>
        ))}
        {progress < 100 && (
          <div className="text-indigo-400 animate-pulse mt-2 flex gap-2">
            <span className="text-indigo-600/60">[...]</span>
            <span className="w-2 h-3.5 bg-indigo-400/80"></span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>
    </div>
  );
}
