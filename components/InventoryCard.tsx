
import React from 'react';
import { ChemicalItem } from '../types';
import { COLORS, GLOW_COLORS } from '../constants';
import { motion } from 'framer-motion';

interface InventoryCardProps {
  item: ChemicalItem;
  onClick: (item: ChemicalItem) => void;
  disabled?: boolean;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onClick, disabled }) => {
  const colorKey = item.color as keyof typeof COLORS;
  const gradient = COLORS[colorKey] || COLORS.slate;
  const glow = GLOW_COLORS[colorKey] || GLOW_COLORS.slate;

  return (
    <motion.div
      layoutId={`inventory-${item.id}`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !disabled && onClick(item)}
      className={`
        relative group cursor-pointer select-none
        bg-slate-800/40 backdrop-blur-md border border-white/10
        rounded-xl p-3 flex items-center gap-3 overflow-hidden
        transition-all duration-300
        ${disabled ? 'opacity-40 grayscale' : `hover:bg-slate-700/60 hover:border-white/20 hover:shadow-lg hover:${glow}`}
      `}
    >
      {/* Background Sheen */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

      {/* Symbol Circle */}
      <div className={`
        w-10 h-10 rounded-lg flex shrink-0 items-center justify-center
        text-white font-bold font-mono text-sm
        bg-gradient-to-br ${gradient} shadow-md z-10
      `}>
        {item.symbol}
      </div>

      {/* Text Info */}
      <div className="flex flex-col min-w-0 z-10">
        <span className="text-sm font-bold text-slate-200 group-hover:text-white truncate">
          {item.name}
        </span>
        <span className="text-[10px] text-slate-400 truncate">
          {item.type === 'basic' ? '元素' : '化合物'}
        </span>
      </div>
      
      {/* Rare/Dangerous Indicators */}
      <div className="absolute top-2 right-2 flex gap-1">
        {item.type === 'dangerous' && (
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
        )}
        {item.type === 'rare' && (
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
        )}
      </div>
    </motion.div>
  );
};
