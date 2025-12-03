
import { GoogleGenAI, Type } from "@google/genai";
import { ChemicalItem, SynthesisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple in-memory cache for AI results
const aiCache = new Map<string, SynthesisResult>();

// --- LOCAL REACTION DATABASE (ZERO LATENCY) ---
// Keys must be sorted unique symbols joined by '+'
const LOCAL_REACTIONS: Record<string, Omit<SynthesisResult, 'product'> & { product: Partial<ChemicalItem> }> = {
  // --- Oxides ---
  "H+O": {
    success: true,
    message: "氢气在氧气中燃烧，产生淡蓝色火焰，杯壁有水珠。",
    product: { name: "水", symbol: "H₂O", description: "生命之源，万能溶剂。", type: "compound", color: "blue" },
    reactionEquation: "2H₂ + O₂ →(点燃) 2H₂O",
    reactionType: "化合反应 / 氧化反应",
    visualPhenomenon: "产生淡蓝色火焰，放出大量热",
    educationalFact: "氢气是密度最小的气体，燃烧产物只有水，是最清洁的燃料。"
  },
  "C+O": {
    success: true,
    message: "碳在氧气中剧烈燃烧，发出白光。",
    product: { name: "二氧化碳", symbol: "CO₂", description: "造成温室效应的主要气体，可用于灭火。", type: "compound", color: "slate" },
    reactionEquation: "C + O₂ →(点燃) CO₂",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，发出白光，生成能使澄清石灰水变浑浊的气体",
    educationalFact: "干冰是固态的二氧化碳，常用于人工降雨。"
  },
  "Mg+O": {
    success: true,
    message: "镁条在空气中剧烈燃烧，发出耀眼白光。",
    product: { name: "氧化镁", symbol: "MgO", description: "白色粉末，熔点极高，可作耐火材料。", type: "compound", color: "stone" },
    reactionEquation: "2Mg + O₂ →(点燃) 2MgO",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，发出耀眼白光，生成白色固体",
    educationalFact: "镁燃烧发出的光可用于制造照明弹和闪光灯。"
  },
  "Fe+O": {
    success: true,
    message: "铁丝在氧气中剧烈燃烧，火星四射。",
    product: { name: "四氧化三铁", symbol: "Fe₃O₄", description: "黑色固体，具有磁性，俗称磁性氧化铁。", type: "compound", color: "slate" },
    reactionEquation: "3Fe + 2O₂ →(点燃) Fe₃O₄",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，火星四射，生成黑色固体",
    educationalFact: "实验时需在瓶底留少量水或细沙，防止溅落的熔化物炸裂瓶底。"
  },
  "Cu+O": {
    success: true,
    message: "红色铜丝加热后变黑。",
    product: { name: "氧化铜", symbol: "CuO", description: "黑色固体，不溶于水。", type: "compound", color: "slate" },
    reactionEquation: "2Cu + O₂ →(△) 2CuO",
    reactionType: "化合反应",
    visualPhenomenon: "红色固体表面变黑",
    educationalFact: "氧化铜可作为催化剂或用于制造玻璃、陶瓷的颜料。"
  },
  "Al+O": {
    success: true,
    message: "铝表面形成致密的氧化膜。",
    product: { name: "氧化铝", symbol: "Al₂O₃", description: "白色固体，硬度大，刚玉的主要成分。", type: "compound", color: "stone" },
    reactionEquation: "4Al + 3O₂ → 2Al₂O₃",
    reactionType: "化合反应",
    visualPhenomenon: "铝熔化但不滴落（表面氧化膜熔点高）",
    educationalFact: "致密的氧化铝薄膜能保护内部金属铝不被继续氧化。"
  },
  "Na+O": {
    success: true,
    message: "钠在空气中加热，剧烈燃烧。",
    product: { name: "过氧化钠", symbol: "Na₂O₂", description: "淡黄色固体，可用作供氧剂。", type: "compound", color: "yellow" },
    reactionEquation: "2Na + O₂ →(△) Na₂O₂",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，发出黄色火焰，生成淡黄色固体",
    educationalFact: "过氧化钠与水或二氧化碳反应都能生成氧气，是潜水艇中的供氧剂。"
  },
  "P+O": {
    success: true,
    message: "磷剧烈燃烧，产生大量白烟。",
    product: { name: "五氧化二磷", symbol: "P₂O₅", description: "白色粉末，极强吸水性。", type: "compound", color: "stone" },
    reactionEquation: "4P + 5O₂ →(点燃) 2P₂O₅",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，产生大量白烟",
    educationalFact: "实验室常用红磷燃烧来测定空气中氧气的含量。"
  },
  "S+O": {
    success: true,
    message: "硫在氧气中燃烧，发出明亮的蓝紫色火焰。",
    product: { name: "二氧化硫", symbol: "SO₂", description: "有刺激性气味的气体，形成酸雨的主要原因。", type: "compound", color: "slate" },
    reactionEquation: "S + O₂ →(点燃) SO₂",
    reactionType: "化合反应",
    visualPhenomenon: "发出明亮的蓝紫色火焰，有刺激性气味气体生成",
    educationalFact: "二氧化硫具有漂白性，能使品红溶液褪色（加热后恢复红色）。"
  },

  // --- Chlorides ---
  "Cl+Na": {
    success: true,
    message: "钠在氯气中剧烈燃烧，产生大量白烟。",
    product: { name: "氯化钠", symbol: "NaCl", description: "食盐的主要成分，白色晶体。", type: "compound", color: "slate" },
    reactionEquation: "2Na + Cl₂ →(点燃) 2NaCl",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，发出黄色火焰，产生大量白烟",
    educationalFact: "钠离子维持细胞外液渗透压，氯离子维持酸碱平衡。"
  },
  "Cl+Fe": {
    success: true,
    message: "铁丝在氯气中燃烧，产生棕红色的烟。",
    product: { name: "氯化铁", symbol: "FeCl₃", description: "棕黑色晶体，水溶液呈黄色。", type: "compound", color: "orange" },
    reactionEquation: "2Fe + 3Cl₂ →(点燃) 2FeCl₃",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，产生棕红色的烟",
    educationalFact: "氯气具有强氧化性，能将变价金属氧化到最高价态。"
  },
  "Cl+Cu": {
    success: true,
    message: "铜丝在氯气中燃烧，产生棕黄色的烟。",
    product: { name: "氯化铜", symbol: "CuCl₂", description: "棕黄色的烟，溶于水后溶液呈蓝色（稀）或绿色（浓）。", type: "compound", color: "green" },
    reactionEquation: "Cu + Cl₂ →(点燃) CuCl₂",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈燃烧，产生棕黄色的烟",
    educationalFact: "铜的焰色反应为绿色。"
  },
  "Cl+H": {
    success: true,
    message: "氢气在氯气中燃烧，发出苍白色火焰。",
    product: { name: "氯化氢", symbol: "HCl", description: "无色有刺激性气味气体，极易溶于水形成盐酸。", type: "compound", color: "slate" },
    reactionEquation: "H₂ + Cl₂ →(点燃) 2HCl",
    reactionType: "化合反应",
    visualPhenomenon: "苍白色火焰，瓶口有白雾",
    educationalFact: "工业上用氢气在氯气中燃烧来制备盐酸。"
  },

  // --- Others ---
  "Fe+S": {
    success: true,
    message: "混合粉末加热后剧烈反应，保持红热。",
    product: { name: "硫化亚铁", symbol: "FeS", description: "黑色固体，不溶于水。", type: "compound", color: "slate" },
    reactionEquation: "Fe + S →(△) FeS",
    reactionType: "化合反应",
    visualPhenomenon: "剧烈反应，发光放热，生成黑色固体",
    educationalFact: "硫的氧化性较弱，只能将铁氧化成+2价。"
  },
  "H+N": {
    success: true,
    message: "工业合成氨反应。",
    product: { name: "氨气", symbol: "NH₃", description: "无色有刺激性气味气体，易液化，极易溶于水。", type: "compound", color: "blue" },
    reactionEquation: "N₂ + 3H₂ ⇌(高温高压催化剂) 2NH₃",
    reactionType: "化合反应 / 可逆反应",
    visualPhenomenon: "无明显现象（需特定条件）",
    educationalFact: "合成氨工业是人类解决粮食问题的重要里程碑（制造化肥）。"
  },
  "H+I": {
    success: true,
    message: "持续加热才能缓慢反应。",
    product: { name: "碘化氢", symbol: "HI", description: "无色气体，强酸性。", type: "compound", color: "purple" },
    reactionEquation: "H₂ + I₂ ⇌(△) 2HI",
    reactionType: "化合反应 / 可逆反应",
    visualPhenomenon: "碘蒸气逐渐减少",
    educationalFact: "碘化氢很不稳定，受热易分解。"
  },
};

export const synthesizeElements = async (elements: ChemicalItem[]): Promise<SynthesisResult> => {
  if (elements.length < 2) {
    return {
      success: false,
      message: "需要至少两种物质才能启动反应堆。",
    };
  }

  // 1. Normalize Keys: Remove duplicates for local lookup to be more forgiving
  // e.g., "H+H+O" -> "H+O"
  const uniqueSymbols = [...new Set(elements.map(e => e.symbol))];
  const localKey = uniqueSymbols.sort().join('+');

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
