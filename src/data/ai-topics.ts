// EXPORTS: AI_TOPICS, FUSION_COMBOS, INNOVATION_STYLES, type AiTopic
// AI 出题可选知识点库：覆盖竞赛/考研常见考点，按大类分组。
// 与 PRACTICE_TOPICS（练习页可判分题）解耦，这里允许更细、更难的考点。

export interface AiTopic {
  label: string;
  group: string;
  level: '基础' | '进阶' | '竞赛';
  /** 用于把用户自然语言要求匹配到该考点 */
  keywords?: string[];
}

export const AI_TOPICS: AiTopic[] = [
  // ===== 数学分析 =====
  { label: '极限与连续', group: '数学分析', level: '基础', keywords: ['极限', '连续'] },
  { label: '数列极限', group: '数学分析', level: '进阶', keywords: ['数列极限', '夹逼'] },
  { label: '等价无穷小与泰勒展开', group: '数学分析', level: '进阶', keywords: ['泰勒', '等价无穷小'] },
  { label: '导数与微分', group: '数学分析', level: '基础', keywords: ['导数', '求导'] },
  { label: '微分中值定理', group: '数学分析', level: '竞赛', keywords: ['中值定理', '罗尔', '拉格朗日'] },
  { label: '函数单调性与极值', group: '数学分析', level: '基础', keywords: ['单调性', '极值'] },
  { label: '不等式证明', group: '数学分析', level: '竞赛', keywords: ['不等式证明'] },
  { label: '不定积分', group: '数学分析', level: '基础', keywords: ['不定积分'] },
  { label: '定积分与微积分基本定理', group: '数学分析', level: '进阶', keywords: ['定积分'] },
  { label: '反常积分', group: '数学分析', level: '进阶', keywords: ['反常积分', '广义积分'] },
  { label: '定积分应用（面积/体积/弧长）', group: '数学分析', level: '进阶', keywords: ['面积', '旋转体', '弧长'] },
  { label: '无穷级数', group: '数学分析', level: '进阶', keywords: ['级数', '收敛'] },
  { label: '幂级数与傅里叶级数', group: '数学分析', level: '竞赛', keywords: ['幂级数', '傅里叶'] },
  { label: '多元函数微分', group: '数学分析', level: '进阶', keywords: ['偏导', '全微分'] },
  { label: '多元函数极值与条件极值', group: '数学分析', level: '竞赛', keywords: ['条件极值', '拉格朗日乘数'] },
  { label: '重积分', group: '数学分析', level: '进阶', keywords: ['重积分', '二重积分', '三重积分'] },
  { label: '曲线积分与曲面积分', group: '数学分析', level: '竞赛', keywords: ['曲线积分', '曲面积分', '格林公式', '高斯公式'] },
  { label: '级数与积分综合', group: '数学分析', level: '竞赛', keywords: ['级数积分'] },

  // ===== 高等代数 =====
  { label: '行列式', group: '高等代数', level: '基础', keywords: ['行列式'] },
  { label: '矩阵运算', group: '高等代数', level: '基础', keywords: ['矩阵'] },
  { label: '矩阵的秩', group: '高等代数', level: '进阶', keywords: ['秩'] },
  { label: '向量组与线性相关', group: '高等代数', level: '进阶', keywords: ['向量组', '线性相关'] },
  { label: '线性方程组', group: '高等代数', level: '进阶', keywords: ['线性方程组'] },
  { label: '特征值与特征向量', group: '高等代数', level: '竞赛', keywords: ['特征值', '特征向量'] },
  { label: '矩阵对角化', group: '高等代数', level: '竞赛', keywords: ['对角化', '相似'] },
  { label: '二次型与正定性', group: '高等代数', level: '竞赛', keywords: ['二次型', '正定'] },
  { label: '线性空间与线性变换', group: '高等代数', level: '竞赛', keywords: ['线性空间', '线性变换'] },
  { label: '矩阵分解（LU/QR/SVD）', group: '高等代数', level: '进阶', keywords: ['矩阵分解', 'SVD', 'QR'] },
  { label: '矩阵与递推综合', group: '高等代数', level: '竞赛', keywords: ['矩阵递推', '矩阵幂'] },

  // ===== 概率统计 =====
  { label: '古典概型与计数', group: '概率统计', level: '基础', keywords: ['古典概型', '概率'] },
  { label: '条件概率与贝叶斯', group: '概率统计', level: '进阶', keywords: ['条件概率', '贝叶斯', '全概率'] },
  { label: '随机变量及其分布', group: '概率统计', level: '进阶', keywords: ['随机变量', '分布列', '密度函数'] },
  { label: '常见分布（二项/泊松/正态/指数）', group: '概率统计', level: '基础', keywords: ['二项分布', '泊松', '正态', '指数分布'] },
  { label: '数字特征（期望/方差/协方差）', group: '概率统计', level: '进阶', keywords: ['期望', '方差', '协方差'] },
  { label: '大数定律与中心极限定理', group: '概率统计', level: '竞赛', keywords: ['大数定律', '中心极限'] },
  { label: '参数估计', group: '概率统计', level: '进阶', keywords: ['参数估计', '极大似然', '置信区间'] },
  { label: '假设检验', group: '概率统计', level: '进阶', keywords: ['假设检验', '显著性'] },
  { label: '概率与组合综合', group: '概率统计', level: '竞赛', keywords: ['概率组合'] },
  { label: '随机过程初步', group: '概率统计', level: '竞赛', keywords: ['随机过程', '马尔可夫'] },

  // ===== 几何 =====
  { label: '平面几何', group: '几何', level: '基础', keywords: ['平面几何', '三角形', '圆'] },
  { label: '解析几何', group: '几何', level: '基础', keywords: ['解析几何', '直线', '距离'] },
  { label: '圆锥曲线', group: '几何', level: '进阶', keywords: ['椭圆', '双曲线', '抛物线', '圆锥曲线'] },
  { label: '立体几何', group: '几何', level: '基础', keywords: ['立体几何', '体积', '表面积'] },
  { label: '向量与空间解析几何', group: '几何', level: '进阶', keywords: ['向量', '空间直线', '平面方程'] },
  { label: '几何变换与对称', group: '几何', level: '竞赛', keywords: ['几何变换', '对称'] },
  { label: '微分几何初步', group: '几何', level: '竞赛', keywords: ['曲率', '挠率', '微分几何'] },

  // ===== 数论与组合 =====
  { label: '整除与最大公约数', group: '数论与组合', level: '基础', keywords: ['整除', 'gcd', '最大公约数'] },
  { label: '同余与模运算', group: '数论与组合', level: '进阶', keywords: ['同余', '模运算', '取模'] },
  { label: '不定方程', group: '数论与组合', level: '竞赛', keywords: ['不定方程', '整数解'] },
  { label: '素数分布与数论函数', group: '数论与组合', level: '竞赛', keywords: ['素数', '欧拉函数'] },
  { label: '计数原理', group: '数论与组合', level: '基础', keywords: ['计数', '排列组合'] },
  { label: '鸽巢原理', group: '数论与组合', level: '竞赛', keywords: ['鸽巢', '抽屉'] },
  { label: '容斥原理', group: '数论与组合', level: '进阶', keywords: ['容斥'] },
  { label: '递推与生成函数', group: '数论与组合', level: '竞赛', keywords: ['递推', '生成函数'] },
  { label: '数列与数论综合', group: '数论与组合', level: '竞赛', keywords: ['数列数论'] },
  { label: '组合极值与构造', group: '数论与组合', level: '竞赛', keywords: ['组合构造', '极值组合'] },

  // ===== 复变与变换 =====
  { label: '复数运算与几何意义', group: '复变与变换', level: '基础', keywords: ['复数'] },
  { label: '复变函数与解析函数', group: '复变与变换', level: '竞赛', keywords: ['复变函数', '解析函数'] },
  { label: '留数定理与积分', group: '复变与变换', level: '竞赛', keywords: ['留数'] },
  { label: '傅里叶变换', group: '复变与变换', level: '进阶', keywords: ['傅里叶变换'] },
  { label: '拉普拉斯变换', group: '复变与变换', level: '进阶', keywords: ['拉普拉斯变换'] },

  // ===== 微分方程与数值 =====
  { label: '一阶微分方程', group: '微分方程与数值', level: '进阶', keywords: ['微分方程', '一阶'] },
  { label: '高阶常系数线性方程', group: '微分方程与数值', level: '进阶', keywords: ['二阶微分方程', '常系数'] },
  { label: '微分方程与级数解法', group: '微分方程与数值', level: '竞赛', keywords: ['级数解', '幂级数解'] },
  { label: '数值逼近与误差分析', group: '微分方程与数值', level: '进阶', keywords: ['数值', '插值', '误差'] },
  { label: '数值积分与迭代法', group: '微分方程与数值', level: '进阶', keywords: ['数值积分', '牛顿迭代'] },

  // ===== 创新综合 =====
  { label: '多知识点融合', group: '创新综合', level: '竞赛', keywords: ['融合', '综合'] },
  { label: '实际情境建模', group: '创新综合', level: '竞赛', keywords: ['建模', '应用题'] },
  { label: '反例与辨析', group: '创新综合', level: '竞赛', keywords: ['反例', '辨析'] },
  { label: '含参数分类讨论', group: '创新综合', level: '竞赛', keywords: ['参数', '分类讨论'] },
  { label: '构造性证明', group: '创新综合', level: '竞赛', keywords: ['构造', '证明'] },
  { label: '多问综合大题', group: '创新综合', level: '竞赛', keywords: ['大题', '多问'] },
];

/** 常用跨知识点融合组合：点一下即可填入融合要求 */
export const FUSION_COMBOS: { label: string; parts: string[] }[] = [
  { label: '数列 × 数论', parts: ['数列', '数论'] },
  { label: '矩阵 × 递推', parts: ['矩阵', '递推数列'] },
  { label: '三角 × 复数', parts: ['三角函数', '复数'] },
  { label: '概率 × 组合', parts: ['概率', '组合数学'] },
  { label: '中值定理 × 极限', parts: ['微分中值定理', '极限'] },
  { label: '级数 × 积分', parts: ['无穷级数', '定积分'] },
  { label: '多元微分 × 最值', parts: ['多元函数微分', '条件极值'] },
  { label: '圆锥曲线 × 向量', parts: ['圆锥曲线', '向量'] },
  { label: '微分方程 × 级数', parts: ['微分方程', '幂级数'] },
  { label: '线代 × 概率', parts: ['矩阵', '随机变量'] },
  { label: '积分 × 不等式', parts: ['定积分', '不等式证明'] },
  { label: '几何 × 概率', parts: ['平面几何', '几何概型'] },
];

/** 创新风格预设：给模型的额外要求 */
export const INNOVATION_STYLES: { label: string; text: string }[] = [
  { label: '新情境应用', text: '用真实情境包装（物理/经济/生活），但数学结构必须严谨' },
  { label: '含参数讨论', text: '引入参数，需要分类讨论，答案随参数变化' },
  { label: '反例辨析', text: '设计容易踩坑的表述，考查反例与概念边界' },
  { label: '多问综合', text: '写成 2–3 小问的综合大题，前一问为后一问铺垫' },
  { label: '构造性证明', text: '要求构造辅助函数/数列/矩阵完成证明' },
  { label: '跨章节串联', text: '把两个以上章节的方法串起来，不能一步套公式' },
];

/** 把自然语言要求匹配到最接近的考点（简单关键词打分） */
export function matchAiTopic(text: string): AiTopic | null {
  const t = text.toLowerCase();
  let best: { topic: AiTopic; score: number } | null = null;
  for (const topic of AI_TOPICS) {
    const words = [topic.label, ...(topic.keywords ?? [])];
    let score = 0;
    for (const w of words) {
      if (w && t.includes(w.toLowerCase())) score += w.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic ?? null;
}
