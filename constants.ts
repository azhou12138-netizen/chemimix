
import { ChemicalItem } from './types';

export const INITIAL_INVENTORY: ChemicalItem[] = [
  // 非金属
  { id: 'h', symbol: 'H₂', name: '氢气', description: '宇宙中最丰富的元素，高度易燃。', type: 'basic', color: 'cyan', discoveredAt: Date.now() },
  { id: 'o', symbol: 'O₂', name: '氧气', description: '生命之源，助燃剂。', type: 'basic', color: 'blue', discoveredAt: Date.now() },
  { id: 'c', symbol: 'C', name: '碳', description: '有机化学的基础，形式多样。', type: 'basic', color: 'slate', discoveredAt: Date.now() },
  { id: 'n', symbol: 'N₂', name: '氮气', description: '空气的主要成分，性质稳定。', type: 'basic', color: 'indigo', discoveredAt: Date.now() },
  { id: 'cl', symbol: 'Cl₂', name: '氯气', description: '黄绿色有毒气体，强氧化性。', type: 'basic', color: 'green', discoveredAt: Date.now() },
  { id: 's', symbol: 'S', name: '硫', description: '淡黄色固体，易燃，用于制造火药。', type: 'basic', color: 'yellow', discoveredAt: Date.now() },
  { id: 'p', symbol: 'P', name: '磷', description: '有白磷（剧毒易燃）和红磷等同素异形体。', type: 'basic', color: 'red', discoveredAt: Date.now() },
  { id: 'si', symbol: 'Si', name: '硅', description: '半导体材料的核心，地壳中含量第二。', type: 'basic', color: 'stone', discoveredAt: Date.now() },
  { id: 'i', symbol: 'I₂', name: '碘', description: '紫黑色固体，遇淀粉变蓝，易升华。', type: 'basic', color: 'purple', discoveredAt: Date.now() },

  // 金属
  { id: 'na', symbol: 'Na', name: '钠', description: '质软的碱金属，遇水剧烈反应。', type: 'basic', color: 'stone', discoveredAt: Date.now() },
  { id: 'k', symbol: 'K', name: '钾', description: '比钠更活泼的碱金属，紫色火焰反应。', type: 'basic', color: 'purple', discoveredAt: Date.now() },
  { id: 'mg', symbol: 'Mg', name: '镁', description: '燃烧时发出耀眼白光。', type: 'basic', color: 'slate', discoveredAt: Date.now() },
  { id: 'al', symbol: 'Al', name: '铝', description: '地壳中含量最高的金属元素，两性金属。', type: 'basic', color: 'slate', discoveredAt: Date.now() },
  { id: 'fe', symbol: 'Fe', name: '铁', description: '工业的脊梁，变价金属。', type: 'basic', color: 'orange', discoveredAt: Date.now() },
  { id: 'cu', symbol: 'Cu', name: '铜', description: '紫红色金属，优良的导电体。', type: 'basic', color: 'orange', discoveredAt: Date.now() },
  { id: 'zn', symbol: 'Zn', name: '锌', description: '青白色金属，常用于电池和镀层。', type: 'basic', color: 'slate', discoveredAt: Date.now() },
  { id: 'ca', symbol: 'Ca', name: '钙', description: '活泼金属，骨骼的主要成分。', type: 'basic', color: 'stone', discoveredAt: Date.now() },
  { id: 'ba', symbol: 'Ba', name: '钡', description: '黄绿色火焰反应，化合物多有毒。', type: 'basic', color: 'green', discoveredAt: Date.now() },
  { id: 'ag', symbol: 'Ag', name: '银', description: '最好的导电导热金属，用于镜子和首饰。', type: 'basic', color: 'slate', discoveredAt: Date.now() },
];

export const COLORS = {
  cyan: 'from-cyan-400 to-blue-500',
  blue: 'from-blue-400 to-indigo-500',
  indigo: 'from-indigo-400 to-violet-500',
  slate: 'from-slate-300 to-slate-500',
  stone: 'from-stone-200 to-stone-400',
  yellow: 'from-yellow-300 to-amber-500',
  green: 'from-emerald-400 to-green-600',
  orange: 'from-orange-400 to-red-500',
  purple: 'from-purple-400 to-pink-500',
  red: 'from-red-500 to-rose-700',
  teal: 'from-teal-300 to-emerald-500',
};

export const GLOW_COLORS = {
  cyan: 'shadow-cyan-500/50',
  blue: 'shadow-blue-500/50',
  indigo: 'shadow-indigo-500/50',
  slate: 'shadow-slate-500/50',
  stone: 'shadow-stone-500/50',
  yellow: 'shadow-yellow-500/50',
  green: 'shadow-emerald-500/50',
  orange: 'shadow-orange-500/50',
  purple: 'shadow-purple-500/50',
  red: 'shadow-red-500/50',
  teal: 'shadow-teal-500/50',
};

export const BG_COLORS = {
  cyan: 'bg-cyan-500/20',
  blue: 'bg-blue-500/20',
  indigo: 'bg-indigo-500/20',
  slate: 'bg-slate-500/20',
  stone: 'bg-stone-500/20',
  yellow: 'bg-yellow-500/20',
  green: 'bg-emerald-500/20',
  orange: 'bg-orange-500/20',
  purple: 'bg-purple-500/20',
  red: 'bg-red-500/20',
  teal: 'bg-teal-500/20',
};
