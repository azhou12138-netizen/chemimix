
import React from 'react';
import { motion } from 'framer-motion';
import { SynthesisResult } from '../types';
import { COLORS, GLOW_COLORS, BG_COLORS } from '../constants';
import { X, Microscope, BookOpen, AlertOctagon, Flame } from 'lucide-react';

interface ResultModalProps {
  result: SynthesisResult | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const product = result.product;
  const colorKey = product?.color as keyof typeof COLORS || 'slate';
  const gradient = COLORS[colorKey];
  const glow = GLOW_COLORS[colorKey];
  const bgColor = BG_COLORS[colorKey as keyof typeof BG_COLORS] || 'bg-slate-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="bg-[#1e293b] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px]"
      >
        
        {/* Left Side: Visual & Identity */}
        <div className={`
          relative w-full md:w-2/5 p-8 flex flex-col items-center justify-center text-center overflow-hidden
          ${result.success ? bgColor : 'bg-red-900/20'}
        `}>
          {/* Background Decor */}
          <div className="absolute inset-0 opacity-30" 
               style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
          />
          
          <div className="relative z-10">
            {result.success && product ? (
              <>
                <motion.div 
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${gradient} ${glow} shadow-2xl flex items-center justify-center text-white text-4xl font-bold font-mono border-4 border-white/10 mb-6`}
                >
                  {product.symbol}
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  {product.name}
                </motion.h2>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 border border-white/10"
                >
                  {product.type === 'basic' ? '元素单质' : product.type === 'compound' ? '化合物' : '特殊物质'}
                </motion.span>
              </>
            ) : (
              <div className="flex flex-col items-center text-red-400">
                 <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center mb-4">
                    <X size={48} />
                 </div>
                 <h2 className="text-xl font-bold">反应失败</h2>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Scientific Data */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0f172a]">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>

          {!result.success ? (
            <div className="h-full flex flex-col justify-center items-center text-center">
              <p className="text-slate-400 text-lg leading-relaxed mb-6">{result.message}</p>
              <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                返回重试
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Header Info */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Microscope size={14} /> 实验记录
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.product?.description}
                </p>
              </div>

              {/* Equation Box */}
              {result.reactionEquation && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                  <p className="text-xs text-indigo-400 mb-1 font-mono">化学方程式</p>
                  <p className="text-lg md:text-xl font-mono text-emerald-400 font-bold">
                    {result.reactionEquation}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {result.reactionType && (
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/20">
                        {result.reactionType}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Phenomenon */}
              {result.visualPhenomenon && (
                <div className="flex gap-3 items-start">
                  <div className="mt-1 text-orange-400 shrink-0"><Flame size={18} /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">实验现象</h4>
                    <p className="text-sm text-slate-400">{result.visualPhenomenon}</p>
                  </div>
                </div>
              )}

              {/* Educational Fact (Exam Point) */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                 <div className="flex gap-2 items-center mb-2 text-blue-400">
                   <BookOpen size={16} />
                   <span className="text-sm font-bold">知识拓展 / 考点</span>
                 </div>
                 <p className="text-sm text-slate-300 leading-relaxed">
                   {result.educationalFact}
                 </p>
              </div>

              {/* Warnings */}
              {result.product?.type === 'dangerous' && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                  <AlertOctagon size={14} />
                  <span>危险物质：该生成物具有毒性或易爆性，请注意安全。</span>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
              >
                收录到元素库
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
