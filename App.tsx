
import React, { useState } from 'react';
import { INITIAL_INVENTORY } from './constants';
import { ChemicalItem, SynthesisResult } from './types';
import { InventoryCard } from './components/InventoryCard';
import { Workbench } from './components/Workbench';
import { ResultModal } from './components/ResultModal';
import { synthesizeElements } from './services/geminiService';
import { Beaker, Search, Atom, Sparkles } from 'lucide-react';

export default function App() {
  const [inventory, setInventory] = useState<ChemicalItem[]>(INITIAL_INVENTORY);
  const [workbenchItems, setWorkbenchItems] = useState<ChemicalItem[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<SynthesisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort inventory: Newly discovered first, then by name
  const sortedInventory = [...inventory].sort((a, b) => {
    return (b.discoveredAt || 0) - (a.discoveredAt || 0);
  });

  const filteredInventory = sortedInventory.filter(item => 
    item.name.includes(searchQuery) || item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToWorkbench = (item: ChemicalItem) => {
    if (workbenchItems.length >= 4) {
      // 4 is a reasonable limit for complex reactions
      return; 
    }
    // Create unique instance
    const instanceItem = { ...item, id: item.id + '-' + Date.now() };
    setWorkbenchItems([...workbenchItems, instanceItem]);
  };

  const handleRemoveFromWorkbench = (id: string) => {
    setWorkbenchItems(workbenchItems.filter(i => i.id !== id));
  };

  const handleClearWorkbench = () => {
    setWorkbenchItems([]);
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    
    // Map back to original items to save context length (removing visual IDs)
    const materials = workbenchItems.map(w => {
       const originalId = w.id.split('-')[0];
       return inventory.find(i => i.id === originalId) || w;
    });

    const result = await synthesizeElements(materials);
    
    setIsSynthesizing(false);
    setSynthesisResult(result);

    if (result.success && result.product) {
      const exists = inventory.find(i => i.name === result.product!.name);
      if (!exists) {
        setInventory(prev => [{...result.product!, discoveredAt: Date.now()}, ...prev]);
      }
    }
  };

  const closeResultModal = () => {
    // Clear workbench regardless of success/failure to streamline gameplay
    setWorkbenchItems([]); 
    setSynthesisResult(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#050914] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar - Inventory */}
      <div className="w-80 md:w-96 border-r border-slate-800/60 bg-[#0B1121]/95 flex flex-col z-30 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Atom size={100} className="text-indigo-500 animate-[spin_20s_linear_infinite]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400/20">
                 <Beaker size={22} className="text-white" strokeWidth={2.5} />
               </div>
               <div>
                 <h1 className="text-xl font-bold tracking-tight text-white leading-tight">ChemiMix</h1>
                 <p className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">元素炼金术士</p>
               </div>
            </div>
          </div>
        </div>

        {/* Stats & Search */}
        <div className="p-4 space-y-4">
           {/* Stats Card */}
           <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <div className="p-1.5 bg-yellow-500/10 rounded text-yellow-500"><Sparkles size={14} /></div>
               <span className="text-xs text-slate-400">已发现元素</span>
             </div>
             <span className="font-mono text-lg font-bold text-white">{inventory.length}</span>
           </div>

           {/* Search Input */}
           <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="搜索元素名称或符号..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 text-slate-200"
            />
          </div>
        </div>

        {/* Inventory List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div className="grid grid-cols-1 gap-2">
            {filteredInventory.map(item => (
              <InventoryCard 
                key={item.id} 
                item={item} 
                onClick={handleAddToWorkbench}
              />
            ))}
          </div>
          {filteredInventory.length === 0 && (
             <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-2">
               <Search size={24} className="opacity-20" />
               <p className="text-xs">未找到匹配的元素</p>
             </div>
          )}
        </div>
      </div>

      {/* Main Workbench Area */}
      <Workbench 
        items={workbenchItems}
        onRemoveItem={handleRemoveFromWorkbench}
        onSynthesize={handleSynthesize}
        isSynthesizing={isSynthesizing}
        onClear={handleClearWorkbench}
      />

      {/* Result Modal */}
      {synthesisResult && (
        <ResultModal result={synthesisResult} onClose={closeResultModal} />
      )}
      
    </div>
  );
}
