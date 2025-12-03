
import React, { useState, useEffect } from 'react';
import { ChemicalItem } from '../types';
import { COLORS, GLOW_COLORS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Atom, X, Zap } from 'lucide-react';

interface WorkbenchProps {
  items: ChemicalItem[];
  onRemoveItem: (id: string) => void;
  onSynthesize: () => void;
  isSynthesizing: boolean;
  onClear: () => void;
}

export const Workbench: React.FC<WorkbenchProps> = ({ 
  items, 
  onRemoveItem, 
  onSynthesize, 
  isSynthesizing,
  onClear 
}) => {
  const [loadingText, setLoadingText] = useState("能量聚合中...");

  useEffect(() => {
    if (isSynthesizing) {
      const texts = [
        "正在分析分子结构...",
        "计算化学键能...",
        "模拟电子云分布...",
        "匹配反应方程式...",
        "稳定反应核心..."
      ];
      // Faster text switching for a more responsive feel
      let i = 0;
      setLoadingText(texts[0]);
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 300); 
      return () => clearInterval(interval);
    }
  }, [isSynthesizing]);

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-[#0B1121] overflow-hidden min-h-[500px]">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0B1121] to-[#0B1121]" />
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', 
               backgroundSize: '30px 30px' 
             }}>
        </div>
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8 md:gap-16">
        
        {/* Reactor Core Area */}
        <div className="relative w-full h-[400px] flex items-center justify-center">
          
          {/* Central Reactor Ring */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-indigo-500/10 flex items-center justify-center transition-all duration-300 ${isSynthesizing ? 'scale-110 border-indigo-400/30' : ''}`}>
             <div className={`absolute inset-0 rounded-full border border-dashed border-indigo-500/20 ${isSynthesizing ? 'animate-[spin_2s_linear_infinite]' : ''}`} />
             <div className={`absolute inset-4 rounded-full border border-indigo-500/10 ${isSynthesizing ? 'animate-[spin_3s_linear_infinite_reverse]' : ''}`} />
          </div>

          <AnimatePresence mode="popLayout">
            {items.length === 0 && !isSynthesizing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-slate-500 flex flex-col items-center gap-4 text-center z-10"
              >
                <div className="p-4 rounded-full bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                  <Atom size={48} className="opacity-50 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-300">反应堆空闲</h3>
                  <p className="text-sm text-slate-500">从左侧拖入元素开始实验</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Items */}
          <div className="relative w-full h-full flex items-center justify-center z-20">
            <AnimatePresence>
              {items.map((item, index) => {
                 const colorKey = item.color as keyof typeof COLORS;
                 const gradient = COLORS[colorKey];
                 const glow = GLOW_COLORS[colorKey];
                 
                 // Calculate position in a circle
                 const total = items.length;
                 const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
                 const radius = 120; // Distance from center
                 const x = Math.cos(angle) * radius;
                 const y = Math.sin(angle) * radius;

                 return (
                  <React.Fragment key={item.id}>
                    {/* Connecting Lines */}
                    {total > 1 && (
                      <motion.svg 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none -z-10"
                        style={{ left: '50%', top: '50%' }}
                      >
                         <line 
                           x1={0} y1={0} 
                           x2={x} y2={y} 
                           stroke="url(#gradient-line)" 
                           strokeWidth="2" 
                           strokeDasharray="4 4"
                         />
                         <defs>
                           <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
                             <stop offset="100%" stopColor="rgba(99, 102, 241, 0.6)" />
                           </linearGradient>
                         </defs>
                      </motion.svg>
                    )}

                    {/* Atom Node */}
                    <motion.div
                      layoutId={`workbench-${item.id}`}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: isSynthesizing ? [1, 1.2, 0] : 1,
                        x: isSynthesizing ? 0 : x, 
                        y: isSynthesizing ? 0 : y,
                        rotate: isSynthesizing ? 360 : 0
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ 
                        type: "spring", stiffness: 200, damping: 20,
                        rotate: { duration: 0.3 }
                      }}
                      className="absolute top-1/2 left-1/2 -ml-10 -mt-10" // Center the div (80px / 2 = 40)
                    >
                      <div className={`
                        w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center
                        bg-gradient-to-br ${gradient} ${glow} shadow-2xl
                        text-white relative cursor-pointer border-4 border-slate-900/50 backdrop-blur-sm
                        transition-transform hover:scale-110 z-20
                      `}>
                        <span className="text-xl md:text-2xl font-bold font-mono drop-shadow-md">{item.symbol}</span>
                        <span className="text-[10px] md:text-xs mt-1 opacity-90">{item.name}</span>
                        
                        {/* Remove Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                          className="absolute -top-1 -right-1 bg-slate-900 text-slate-400 rounded-full p-1 hover:bg-red-500 hover:text-white transition-colors border border-slate-700 shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
            
            {/* Center Energy Core (Visible during synthesis) */}
            {isSynthesizing && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute w-32 h-32 bg-white rounded-full blur-2xl z-0"
              />
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-4 z-20">
          <div className="flex gap-4">
            <button 
              onClick={onClear}
              disabled={items.length === 0 || isSynthesizing}
              className={`
                px-6 py-3 rounded-xl font-medium border border-slate-700 text-slate-400 bg-slate-900/80 backdrop-blur
                transition-all
                ${items.length === 0 ? 'opacity-0 translate-y-4 pointer-events-none' : 'hover:bg-slate-800 hover:text-white hover:border-slate-600'}
              `}
            >
              清空工作台
            </button>

            <button
              onClick={onSynthesize}
              disabled={items.length < 2 || isSynthesizing}
              className={`
                group relative px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 overflow-hidden
                transition-all duration-100 transform
                ${items.length < 2 
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                  : 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:scale-105 hover:bg-indigo-500 hover:shadow-[0_0_50px_rgba(79,70,229,0.6)]'}
              `}
            >
              {isSynthesizing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="min-w-[80px] text-center">{loadingText}</span>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <Zap size={20} className={items.length >= 2 ? "fill-white" : ""} />
                  <span>启动反应堆</span>
                </>
              )}
            </button>
          </div>
          {items.length < 2 && items.length > 0 && (
             <p className="text-sm text-slate-500 animate-pulse">再添加一种元素以继续...</p>
          )}
        </div>

      </div>
    </div>
  );
};
