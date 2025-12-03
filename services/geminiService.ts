
import { GoogleGenAI, Type } from "@google/genai";
import { ChemicalItem, SynthesisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple in-memory cache for AI results
const aiCache = new Map<string, SynthesisResult>();

// --- LOCAL REACTION DATABASE (ZERO LATENCY) ---
// Keys must be sorted unique symbols joined by '+'
// Updated to use strict chemical symbols (H₂, O₂, Cl₂ etc)
const LOCAL_REACTIONS: Record<string, Omit<SynthesisResult, 'product'> & { product: Partial<ChemicalItem> }> = {
  // ==========================================
  // 1. 基础氧化物 (Basic Oxides)
  // ==========================================
  "H₂+O₂": {
    success: true,
    message: "氢气在氧气中燃烧，产生淡蓝色火焰，杯壁有水珠。",
    product: { name: "水", symbol: "H₂O", description: "生命之源，万能溶剂。", type: "compound", color: "blue" },
    reactionEquation: "2H₂ + O₂ →(点燃) 2H₂O",
    reactionType: "化合反应",
    visualPhenomenon: "产生淡蓝色火焰，放出大量热",
    educationalFact: "氢气是密度最小的气体，燃烧产物只有水，是最清洁的能源。"
  },
  "C+O₂": {
    success: true,
    message: "碳在氧气中剧烈燃烧，发出白光。",
    product: { name: "二氧化碳", symbol: "CO₂", description: "造成温室效应的主要气体，可用于灭火。", type: "compound", color: "slate" },
    reactionEquation: "C + O₂ →(点燃) CO₂",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，发出白光，生成能使澄清石灰水变浑浊的气体",
    educationalFact: "干冰是固态的二氧化碳，常用于人工降雨和舞台烟雾。"
  },
  "Mg+O₂": {
    success: true,
    message: "镁条在空气中剧烈燃烧，发出耀眼白光。",
    product: { name: "氧化镁", symbol: "MgO", description: "白色粉末，熔点极高，可作耐火材料。", type: "compound", color: "stone" },
    reactionEquation: "2Mg + O₂ →(点燃) 2MgO",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，发出耀眼白光，生成白色固体",
    educationalFact: "镁燃烧发出的光可用于制造照明弹和闪光灯。"
  },
  "Fe+O₂": {
    success: true,
    message: "铁丝在氧气中剧烈燃烧，火星四射。",
    product: { name: "四氧化三铁", symbol: "Fe₃O₄", description: "黑色固体，具有磁性，俗称磁性氧化铁。", type: "compound", color: "slate" },
    reactionEquation: "3Fe + 2O₂ →(点燃) Fe₃O₄",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，火星四射，生成黑色固体",
    educationalFact: "实验时需在瓶底留少量水或细沙，防止溅落的熔化物炸裂瓶底。"
  },
  "Cu+O₂": {
    success: true,
    message: "红色铜丝加热后变黑。",
    product: { name: "氧化铜", symbol: "CuO", description: "黑色固体，不溶于水。", type: "compound", color: "slate" },
    reactionEquation: "2Cu + O₂ →(△) 2CuO",
    reactionType: "化合反应",
    visualPhenomenon: "红色固体表面变黑",
    educationalFact: "氧化铜可作为催化剂，或用于制造玻璃、陶瓷的颜料。"
  },
  "Al+O₂": {
    success: true,
    message: "铝表面形成致密的氧化膜。",
    product: { name: "氧化铝", symbol: "Al₂O₃", description: "白色固体，硬度大，刚玉的主要成分。", type: "compound", color: "stone" },
    reactionEquation: "4Al + 3O₂ → 2Al₂O₃",
    reactionType: "化合反应",
    visualPhenomenon: "铝熔化但不滴落（表面氧化膜熔点高）",
    educationalFact: "致密的氧化铝薄膜能保护内部金属铝不被继续氧化（钝化）。"
  },
  "Na+O₂": {
    success: true,
    message: "钠在空气中加热，剧烈燃烧。",
    product: { name: "过氧化钠", symbol: "Na₂O₂", description: "淡黄色固体，可用作供氧剂。", type: "compound", color: "yellow" },
    reactionEquation: "2Na + O₂ →(△) Na₂O₂",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，发出黄色火焰，生成淡黄色固体",
    educationalFact: "过氧化钠与水或CO₂反应都能生成氧气，是潜水艇中的供氧剂。"
  },
  "O₂+P": {
    success: true,
    message: "磷剧烈燃烧，产生大量白烟。",
    product: { name: "五氧化二磷", symbol: "P₂O₅", description: "白色粉末，极强吸水性。", type: "compound", color: "stone" },
    reactionEquation: "4P + 5O₂ →(点燃) 2P₂O₅",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，产生大量白烟",
    educationalFact: "实验室常用红磷燃烧来测定空气中氧气的含量。"
  },
  "O₂+S": {
    success: true,
    message: "硫在氧气中燃烧，发出明亮的蓝紫色火焰。",
    product: { name: "二氧化硫", symbol: "SO₂", description: "有刺激性气味的气体，形成酸雨的主要原因。", type: "compound", color: "slate" },
    reactionEquation: "S + O₂ →(点燃) SO₂",
    reactionType: "化合反应",
    visualPhenomenon: "发出明亮的蓝紫色火焰，有刺激性气味气体生成",
    educationalFact: "二氧化硫具有漂白性，能使品红溶液褪色（加热后恢复红色）。"
  },
  "O₂+Si": {
    success: true,
    message: "硅在氧气中高温反应生成二氧化硅。",
    product: { name: "二氧化硅", symbol: "SiO₂", description: "沙子、石英、光导纤维的主要成分。", type: "compound", color: "stone" },
    reactionEquation: "Si + O₂ →(△) SiO₂",
    reactionType: "化合反应",
    visualPhenomenon: "固体逐渐反应",
    educationalFact: "SiO₂是酸性氧化物，但不溶于水，它是制作光导纤维的核心原料。"
  },
  "N₂+O₂": {
    success: true,
    message: "在放电或高温条件下反应。",
    product: { name: "一氧化氮", symbol: "NO", description: "无色有毒气体，信使分子。", type: "compound", color: "slate" },
    reactionEquation: "N₂ + O₂ →(放电) 2NO",
    reactionType: "化合反应",
    visualPhenomenon: "伴随闪电或电火花产生",
    educationalFact: "这是自然界“雷雨发庄稼”过程的第一步（固氮）。"
  },

  // ==========================================
  // 2. 氯化物与卤素 (Chlorides & Halogens)
  // ==========================================
  "Cl₂+Na": {
    success: true,
    message: "钠在氯气中剧烈燃烧，产生大量白烟。",
    product: { name: "氯化钠", symbol: "NaCl", description: "食盐的主要成分，白色晶体。", type: "compound", color: "slate" },
    reactionEquation: "2Na + Cl₂ →(点燃) 2NaCl",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，发出黄色火焰，产生大量白烟",
    educationalFact: "钠离子维持细胞外液渗透压，氯离子维持酸碱平衡。"
  },
  "Cl₂+K": {
    success: true,
    message: "钾在氯气中剧烈燃烧。",
    product: { name: "氯化钾", symbol: "KCl", description: "白色晶体，常用钾肥。", type: "compound", color: "slate" },
    reactionEquation: "2K + Cl₂ →(点燃) 2KCl",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，透过蓝色钴玻璃看是紫色火焰，产生白烟",
    educationalFact: "钾盐均易溶于水，氯化钾是重要的农用钾肥。"
  },
  "Cl₂+Fe": {
    success: true,
    message: "铁丝在氯气中燃烧，产生棕红色的烟。",
    product: { name: "氯化铁", symbol: "FeCl₃", description: "棕黑色晶体，水溶液呈黄色。", type: "compound", color: "orange" },
    reactionEquation: "2Fe + 3Cl₂ →(点燃) 2FeCl₃",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，产生棕红色的烟",
    educationalFact: "氯气具有强氧化性，能将变价金属（如Fe）氧化到最高价态（+3价）。"
  },
  "Cl₂+Cu": {
    success: true,
    message: "铜丝在氯气中燃烧，产生棕黄色的烟。",
    product: { name: "氯化铜", symbol: "CuCl₂", description: "棕黄色的烟，溶于水后溶液呈蓝色（稀）或绿色（浓）。", type: "compound", color: "green" },
    reactionEquation: "Cu + Cl₂ →(点燃) CuCl₂",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，产生棕黄色的烟",
    educationalFact: "铜的焰色反应为绿色。"
  },
  "Al+Cl₂": {
    success: true,
    message: "铝粉在氯气中燃烧。",
    product: { name: "氯化铝", symbol: "AlCl₃", description: "白色固体，共价化合物。", type: "compound", color: "slate" },
    reactionEquation: "2Al + 3Cl₂ →(点燃) 2AlCl₃",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，产生白烟",
    educationalFact: "AlCl₃是共价化合物而非离子化合物，熔融状态不导电。"
  },
  "Cl₂+P": {
    success: true,
    message: "磷在氯气中燃烧。",
    product: { name: "三氯化磷", symbol: "PCl₃", description: "无色发烟液体，剧毒。", type: "compound", color: "slate" },
    reactionEquation: "2P + 3Cl₂ →(点燃) 2PCl₃",
    reactionType: "化合反应",
    visualPhenomenon: "产生白色烟雾（PCl3是雾，PCl5是烟）",
    educationalFact: "若氯气过量，会生成PCl₅（五氯化磷）。"
  },
  "Cl₂+H₂": {
    success: true,
    message: "氢气在氯气中燃烧，发出苍白色火焰。",
    product: { name: "氯化氢", symbol: "HCl", description: "无色有刺激性气味气体，极易溶于水形成盐酸。", type: "compound", color: "slate" },
    reactionEquation: "H₂ + Cl₂ →(点燃) 2HCl",
    reactionType: "化合反应",
    visualPhenomenon: "苍白色火焰，瓶口有白雾",
    educationalFact: "工业上用氢气在氯气中燃烧来制备盐酸。"
  },
  "H₂+I₂": {
    success: true,
    message: "持续加热才能缓慢反应。",
    product: { name: "碘化氢", symbol: "HI", description: "无色气体，强酸性，不稳定。", type: "compound", color: "purple" },
    reactionEquation: "H₂ + I₂ ⇌(△) 2HI",
    reactionType: "化合反应 / 可逆反应",
    visualPhenomenon: "碘蒸气逐渐减少",
    educationalFact: "碘化氢很不稳定，受热易分解，体现卤素非金属性的递变规律。"
  },
  "Al+I₂": {
    success: true,
    message: "滴水生烟，剧烈放热。",
    product: { name: "碘化铝", symbol: "AlI₃", description: "强路易斯酸，有机合成催化剂。", type: "compound", color: "purple" },
    reactionEquation: "2Al + 3I₂ →(H₂O) 2AlI₃",
    reactionType: "化合反应",
    visualPhenomenon: "混合物剧烈反应，产生紫色碘蒸气和棕色烟雾",
    educationalFact: "水在此反应中起催化剂作用，引发铝和碘的剧烈放热反应。"
  },

  // ==========================================
  // 3. 水的反应 (Reactions with Water)
  // ==========================================
  "H₂O+Na": {
    success: true,
    message: "钠浮在水面上，熔成小球，四处游动。",
    product: { name: "氢氧化钠", symbol: "NaOH", description: "俗称烧碱、火碱，强腐蚀性。", type: "compound", color: "slate" },
    reactionEquation: "2Na + 2H₂O → 2NaOH + H₂↑",
    reactionType: "置换反应",
    visualPhenomenon: "浮、熔、游、响、红（遇酚酞）",
    educationalFact: "实验室处理废钠时，通常将其放入乙醇中，因为乙醇与钠反应较缓和。"
  },
  "H₂O+K": {
    success: true,
    message: "钾与水剧烈反应，甚至发生轻微爆炸。",
    product: { name: "氢氧化钾", symbol: "KOH", description: "强碱，性质与氢氧化钠相似但更活泼。", type: "compound", color: "slate" },
    reactionEquation: "2K + 2H₂O → 2KOH + H₂↑",
    reactionType: "置换反应",
    visualPhenomenon: "剧烈反应，产生的氢气可能被点燃（紫色火焰）",
    educationalFact: "钾比钠的金属性更强，反应更剧烈。"
  },
  "Ca+H₂O": {
    success: true,
    message: "钙与水反应，生成微溶于水的白色物质。",
    product: { name: "氢氧化钙", symbol: "Ca(OH)₂", description: "熟石灰，其水溶液为澄清石灰水。", type: "compound", color: "slate" },
    reactionEquation: "Ca + 2H₂O → Ca(OH)₂ + H₂↑",
    reactionType: "置换反应",
    visualPhenomenon: "反应比较剧烈，溶液变浑浊",
    educationalFact: "澄清石灰水用于检验二氧化碳，反应生成碳酸钙沉淀。"
  },
  "Cl₂+H₂O": {
    success: true,
    message: "氯气溶于水，部分反应。",
    product: { name: "次氯酸", symbol: "HClO", description: "具有强氧化性和漂白性，不稳定。", type: "compound", color: "cyan" },
    reactionEquation: "Cl₂ + H₂O ⇌ HCl + HClO",
    reactionType: "歧化反应",
    visualPhenomenon: "黄绿色气体溶解，溶液呈浅黄绿色",
    educationalFact: "氯水具有漂白性是因为含有HClO，久置氯水会变成稀盐酸。"
  },
  "H₂O+NO₂": {
    success: true,
    message: "红棕色气体溶于水，变为无色。",
    product: { name: "硝酸", symbol: "HNO₃", description: "强氧化性酸。", type: "compound", color: "blue" },
    reactionEquation: "3NO₂ + H₂O → 2HNO₃ + NO",
    reactionType: "歧化反应",
    visualPhenomenon: "红棕色褪去，溶液呈酸性",
    educationalFact: "工业制硝酸的重要步骤，尾气中的NO需进一步氧化处理。"
  },
  "H₂O+SO₃": {
    success: true,
    message: "三氧化硫剧烈溶于水放出大量热。",
    product: { name: "硫酸", symbol: "H₂SO₄", description: "强酸，工业之母。", type: "compound", color: "slate" },
    reactionEquation: "SO₃ + H₂O → H₂SO₄",
    reactionType: "化合反应",
    visualPhenomenon: "放出大量热",
    educationalFact: "工业上用98.3%的浓硫酸吸收SO₃来制备硫酸，防止形成酸雾。"
  },
  "H₂O+Na₂O₂": {
    success: true,
    message: "过氧化钠遇水释放氧气。",
    product: { name: "氧气", symbol: "O₂", description: "该反应常用于潜水艇供氧。", type: "basic", color: "blue" },
    reactionEquation: "2Na₂O₂ + 2H₂O → 4NaOH + O₂↑",
    reactionType: "歧化反应",
    visualPhenomenon: "产生气泡，放热，加酚酞先变红后褪色（HClO或强氧化性影响）",
    educationalFact: "过氧化钠中氧元素为-1价，既是氧化剂也是还原剂。"
  },

  // ==========================================
  // 4. 工业与高温反应 (Industrial & High Temp)
  // ==========================================
  "Al+Fe₂O₃": {
    success: true,
    message: "铝热反应，放出巨大的热量。",
    product: { name: "液态铁", symbol: "Fe(l)", description: "熔融状态的铁，可用于焊接钢轨。", type: "basic", color: "orange" },
    reactionEquation: "2Al + Fe₂O₃ →(高温) 2Fe + Al₂O₃",
    reactionType: "置换反应",
    visualPhenomenon: "剧烈反应，发出耀眼强光，有熔融物生成",
    educationalFact: "铝热反应利用了铝的强还原性和反应放出的高热，可用于冶炼高熔点金属。"
  },
  "Fe+S": {
    success: true,
    message: "混合粉末加热后剧烈反应，保持红热。",
    product: { name: "硫化亚铁", symbol: "FeS", description: "黑色固体，不溶于水。", type: "compound", color: "slate" },
    reactionEquation: "Fe + S →(△) FeS",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈反应，发光放热，生成黑色固体",
    educationalFact: "硫的氧化性较弱，只能将铁氧化成+2价。"
  },
  "Cu+S": {
    success: true,
    message: "铜在硫蒸气中燃烧。",
    product: { name: "硫化亚铜", symbol: "Cu₂S", description: "黑色固体。", type: "compound", color: "slate" },
    reactionEquation: "2Cu + S →(△) Cu₂S",
    reactionType: "化合反应",
    visualPhenomenon: "生成黑色固体",
    educationalFact: "硫氧化性弱，将铜氧化为+1价的亚铜。"
  },
  "Ag+S": {
    success: true,
    message: "银器表面变黑。",
    product: { name: "硫化银", symbol: "Ag₂S", description: "黑色固体，银器变黑的主要原因。", type: "compound", color: "slate" },
    reactionEquation: "2Ag + S → Ag₂S",
    reactionType: "化合反应",
    visualPhenomenon: "银表面变黑",
    educationalFact: "银与空气中的微量H₂S反应也会生成Ag₂S，导致银饰变黑。"
  },
  "H₂+N₂": {
    success: true,
    message: "工业合成氨反应。",
    product: { name: "氨气", symbol: "NH₃", description: "无色有刺激性气味气体，极易溶于水。", type: "compound", color: "blue" },
    reactionEquation: "N₂ + 3H₂ ⇌(高温高压催化剂) 2NH₃",
    reactionType: "化合反应 / 可逆反应",
    visualPhenomenon: "无明显现象（需特定条件）",
    educationalFact: "合成氨工业是人类解决粮食问题的重要里程碑（制造化肥）。"
  },
  "C+H₂O": {
    success: true,
    message: "高温下碳与水蒸气反应。",
    product: { name: "水煤气", symbol: "CO+H₂", description: "一氧化碳和氢气的混合气体，重要燃料。", type: "dangerous", color: "slate" },
    reactionEquation: "C + H₂O(g) →(高温) CO + H₂",
    reactionType: "置换反应",
    visualPhenomenon: "无明显现象（高温密闭容器中）",
    educationalFact: "水煤气有毒（含CO），但在工业上是重要的合成原料。"
  },
  "C+SiO₂": {
    success: true,
    message: "工业制粗硅。",
    product: { name: "硅", symbol: "Si", description: "粗硅，需提纯后用于半导体。", type: "basic", color: "stone" },
    reactionEquation: "SiO₂ + 2C →(高温) Si + 2CO↑",
    reactionType: "置换反应",
    visualPhenomenon: "高温反应",
    educationalFact: "碳在高温下还原二氧化硅，生成粗硅和一氧化碳。"
  },
  "C+CuO": {
    success: true,
    message: "木炭还原氧化铜。",
    product: { name: "铜", symbol: "Cu", description: "紫红色金属。", type: "basic", color: "orange" },
    reactionEquation: "C + 2CuO →(高温) 2Cu + CO₂↑",
    reactionType: "置换反应",
    visualPhenomenon: "黑色粉末逐渐变成红色，生成气体使石灰水变浑浊",
    educationalFact: "这是古代冶炼铜的方法之一。"
  },
  "CuO+H₂": {
    success: true,
    message: "氢气还原氧化铜。",
    product: { name: "铜", symbol: "Cu", description: "紫红色金属。", type: "basic", color: "orange" },
    reactionEquation: "H₂ + CuO →(△) Cu + H₂O",
    reactionType: "置换反应",
    visualPhenomenon: "黑色粉末变红，试管口有水珠",
    educationalFact: "实验开始时要先通氢气排空气，实验结束时要继续通氢气直到冷却，防止铜被氧化。"
  },

  // ==========================================
  // 5. 酸碱与化合物反应 (Acids, Bases & Compounds)
  // ==========================================
  "HCl+NH₃": {
    success: true,
    message: "两气体相遇，产生白烟。",
    product: { name: "氯化铵", symbol: "NH₄Cl", description: "白色固体，常用氮肥。", type: "compound", color: "slate" },
    reactionEquation: "NH₃ + HCl → NH₄Cl",
    reactionType: "化合反应",
    visualPhenomenon: "产生大量白烟",
    educationalFact: "这是检验氨气或氯化氢气体的常用方法（挥发性酸与碱反应）。"
  },
  "HCl+Zn": {
    success: true,
    message: "锌粒在酸中溶解，产生气泡。",
    product: { name: "氢气", symbol: "H₂", description: "实验室制取氢气。", type: "basic", color: "cyan" },
    reactionEquation: "Zn + 2HCl → ZnCl₂ + H₂↑",
    reactionType: "置换反应",
    visualPhenomenon: "锌粒溶解，产生无色气泡",
    educationalFact: "实验室通常用锌和稀硫酸反应制氢气，而不用盐酸（避免HCl挥发混入）。"
  },
  "HCl+Fe": {
    success: true,
    message: "铁与盐酸反应。",
    product: { name: "氯化亚铁", symbol: "FeCl₂", description: "浅绿色溶液。", type: "compound", color: "green" },
    reactionEquation: "Fe + 2HCl → FeCl₂ + H₂↑",
    reactionType: "置换反应",
    visualPhenomenon: "产生气泡，溶液由无色变为浅绿色",
    educationalFact: "铁与非氧化性酸（HCl, 稀H₂SO₄）反应生成亚铁盐。"
  },
  "HCl+NaOH": {
    success: true,
    message: "酸碱中和反应。",
    product: { name: "氯化钠水溶液", symbol: "NaCl(aq)", description: "盐水。", type: "compound", color: "blue" },
    reactionEquation: "HCl + NaOH → NaCl + H₂O",
    reactionType: "复分解反应 / 中和反应",
    visualPhenomenon: "放热，无明显颜色变化（除非有指示剂）",
    educationalFact: "中和反应的实质是H⁺ + OH⁻ = H₂O，反应放出热量。"
  },
  "CuSO₄+Fe": {
    success: true,
    message: "铁钉表面覆盖红色物质。",
    product: { name: "铜", symbol: "Cu", description: "湿法炼铜。", type: "basic", color: "orange" },
    reactionEquation: "Fe + CuSO₄ → FeSO₄ + Cu",
    reactionType: "置换反应",
    visualPhenomenon: "铁表面有红色物质析出，溶液由蓝色变为浅绿色",
    educationalFact: "古代“曾青得铁则化为铜”即指此反应。"
  },
  "CuSO₄+Zn": {
    success: true,
    message: "锌置换铜。",
    product: { name: "铜", symbol: "Cu", description: "紫红色金属。", type: "basic", color: "orange" },
    reactionEquation: "Zn + CuSO₄ → ZnSO₄ + Cu",
    reactionType: "置换反应",
    visualPhenomenon: "锌表面析出红色固体，溶液蓝色变浅",
    educationalFact: "锌比铁更活泼，置换反应速率更快。"
  },
  "AgNO₃+Cu": {
    success: true,
    message: "铜表面析出银白色晶体。",
    product: { name: "银", symbol: "Ag", description: "置换出银。", type: "basic", color: "slate" },
    reactionEquation: "Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag",
    reactionType: "置换反应",
    visualPhenomenon: "铜表面析出银白色固体，溶液由无色变为蓝色",
    educationalFact: "利用金属活动性顺序：Cu > Ag。"
  },
  "CO₂+Ca(OH)₂": {
    success: true,
    message: "澄清石灰水变浑浊。",
    product: { name: "碳酸钙", symbol: "CaCO₃", description: "大理石、石灰石主要成分。", type: "compound", color: "stone" },
    reactionEquation: "Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O",
    reactionType: "复分解反应（广义）",
    visualPhenomenon: "溶液变浑浊，生成白色沉淀",
    educationalFact: "该反应不仅用于检验CO₂，也是粉刷墙壁后墙壁变硬的原因。"
  },
  
  // ==========================================
  // 6. 其他环境与趣味反应
  // ==========================================
  "NO+O₂": {
    success: true,
    message: "无色气体变为红棕色。",
    product: { name: "二氧化氮", symbol: "NO₂", description: "红棕色有毒气体。", type: "compound", color: "orange" },
    reactionEquation: "2NO + O₂ → 2NO₂",
    reactionType: "化合反应",
    visualPhenomenon: "无色气体迅速变为红棕色",
    educationalFact: "这是雷雨天产生氮肥的重要一步，也是光化学烟雾的成因之一。"
  },
  "O₂+SO₂": {
    success: true,
    message: "二氧化硫催化氧化。",
    product: { name: "三氧化硫", symbol: "SO₃", description: "无色固体（标况下），硫酸工业中间体。", type: "compound", color: "slate" },
    reactionEquation: "2SO₂ + O₂ ⇌(催化剂) 2SO₃",
    reactionType: "化合反应",
    visualPhenomenon: "无明显现象（需催化剂加热）",
    educationalFact: "该反应是可逆反应，也是接触法制硫酸的关键步骤。"
  },
  "H₂O+SO₂": {
    success: true,
    message: "二氧化硫溶于水形成酸。",
    product: { name: "亚硫酸", symbol: "H₂SO₃", description: "不稳定的弱酸，易被氧化。", type: "compound", color: "slate" },
    reactionEquation: "SO₂ + H₂O ⇌ H₂SO₃",
    reactionType: "化合反应",
    visualPhenomenon: "气体溶解",
    educationalFact: "亚硫酸是酸雨的主要成分之一，它会被空气中的氧气进一步氧化为硫酸。"
  },
  "Mg+N₂": {
    success: true,
    message: "镁在氮气中燃烧。",
    product: { name: "氮化镁", symbol: "Mg₃N₂", description: "淡黄色固体。", type: "compound", color: "yellow" },
    reactionEquation: "3Mg + N₂ →(点燃) Mg₃N₂",
    reactionType: "化合反应",
    visualPhenomenon: "发出耀眼白光（不如氧气中剧烈），生成淡黄色固体",
    educationalFact: "镁条在空气中燃烧，产物不仅有MgO，还有少量的Mg₃N₂。"
  }
};

export const synthesizeElements = async (elements: ChemicalItem[]): Promise<SynthesisResult> => {
  if (elements.length < 2) {
    return {
      success: false,
      message: "需要至少两种物质才能启动反应堆。",
    };
  }

  // 1. Normalize Keys Logic
  // Sort symbols to ensure order independence: "H+O" same as "O+H"
  const uniqueSymbols = [...new Set(elements.map(e => e.symbol))];
  const localKey = uniqueSymbols.sort().join('+');

  console.log("Attempting synthesis with key:", localKey);

  // 2. CHECK LOCAL DB FIRST (Zero Latency)
  if (LOCAL_REACTIONS[localKey]) {
    const local = LOCAL_REACTIONS[localKey];
    console.log("Local reaction hit:", localKey);
    return {
      ...local,
      product: {
        ...local.product,
        // Ensure required fields for ChemicalItem
        id: (local.product.symbol || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now(),
        symbol: local.product.symbol!,
        name: local.product.name!,
        description: local.product.description!,
        type: local.product.type as any,
        color: local.product.color || 'slate',
        discoveredAt: Date.now()
      } as ChemicalItem
    };
  }

  // 3. Fallback to Gemini AI for complex/unknown combinations
  const aiCacheKey = elements.map(e => e.symbol).sort().join('+');
  if (aiCache.has(aiCacheKey)) {
    return aiCache.get(aiCacheKey)!;
  }

  const inputs = elements.map(e => `${e.name}(${e.symbol})`).join(' + ');

  const systemInstruction = `
    Role: High School Chemistry Teacher.
    Task: Analyze reaction of [${inputs}].
    
    Output JSON (Simplified Chinese):
    1. success: boolean.
    2. product: Main product details.
    3. details:
       - reactionEquation: Balanced equation.
       - reactionType: (e.g., 化合反应).
       - visualPhenomenon: Concise observation (<20 chars).
       - educationalFact: ONE short interesting exam point (<30 chars).
    4. message: Brief reason if fail.
    
    Rules:
    - If strictly no reaction at HS level, success: false.
    - If reaction needs catalyst not present, assume standard lab conditions allow it or fail it, but be fun.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Inputs: ${inputs}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            productName: { type: Type.STRING },
            productSymbol: { type: Type.STRING },
            productDescription: { type: Type.STRING },
            productColor: { type: Type.STRING, enum: ['cyan', 'blue', 'indigo', 'slate', 'stone', 'yellow', 'green', 'orange', 'purple', 'red'] },
            productType: { type: Type.STRING, enum: ['basic', 'compound', 'rare', 'dangerous'] },
            message: { type: Type.STRING },
            reactionEquation: { type: Type.STRING },
            reactionType: { type: Type.STRING },
            visualPhenomenon: { type: Type.STRING },
            educationalFact: { type: Type.STRING }
          },
          required: ["success", "message"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    let finalResult: SynthesisResult;

    if (result.success) {
      const newProduct: ChemicalItem = {
        id: result.productSymbol.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now(),
        name: result.productName,
        symbol: result.productSymbol,
        description: result.productDescription,
        color: result.productColor,
        type: result.productType,
      };

      finalResult = {
        success: true,
        product: newProduct,
        message: result.message,
        reactionEquation: result.reactionEquation,
        reactionType: result.reactionType,
        visualPhenomenon: result.visualPhenomenon,
        educationalFact: result.educationalFact
      };
    } else {
      finalResult = {
        success: false,
        message: result.message || "无明显反应。",
      };
    }

    aiCache.set(aiCacheKey, finalResult);
    return finalResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      message: "反应堆数据连接中断。",
    };
  }
};
