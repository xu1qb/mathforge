// EXPORTS: GEOMETRY_DRILLS, getGeometryDrill
// 平面几何三组专题训练：塞瓦、梅涅劳斯、圆幂。
// 每题给「提示 → 步骤 → 答案」，题干里的公式用 $...$ 包住，交给 RichTextRenderer。

export interface DrillProblem {
  id: string;
  level: '基础' | '进阶' | '竞赛';
  statement: string;
  hint: string;
  steps: string[];
  answer: string;
}

export interface GeometryDrill {
  id: string;
  title: string;
  subtitle: string;
  /** 一句话方法总结 */
  method: string;
  /** 关联的原理讲解考点 id */
  explainerId?: string;
  problems: DrillProblem[];
}

export const GEOMETRY_DRILLS: GeometryDrill[] = [
  {
    id: 'ceva',
    title: '塞瓦定理',
    subtitle: '三线共点：三段比之积等于一',
    method: '先选三角形，再按同一方向写三段比，乘积为一即共点。',
    explainerId: 'ceva-menelaus',
    problems: [
      {
        id: 'ceva-1',
        level: '基础',
        statement:
          '三角形 $ABC$ 中 $D$ 在 $BC$ 上、$E$ 在 $CA$ 上、$F$ 在 $AB$ 上，且 $AD$、$BE$、$CF$ 共点。已知 $BD:DC=2:1$、$CE:EA=1:2$，求 $AF:FB$。',
        hint: '塞瓦定理的三段比乘积等于一，把已知两项代进去。',
        steps: [
          '写出塞瓦条件：$\\dfrac{BD}{DC}\\cdot\\dfrac{CE}{EA}\\cdot\\dfrac{AF}{FB}=1$。',
          '代入已知：$2\\cdot\\dfrac{1}{2}\\cdot\\dfrac{AF}{FB}=1$。',
          '前两项乘积为一，故 $AF:FB=1:1$。',
        ],
        answer: '$AF:FB=1:1$',
      },
      {
        id: 'ceva-2',
        level: '进阶',
        statement: '证明三角形的三条中线交于一点。',
        hint: '中线把对边分成相等的两段。',
        steps: [
          '每条中线在对边处平分，对应的两段比都等于一。',
          '三段比之积为一乘一乘一，等于一。',
          '由塞瓦定理的逆定理，三条中线共点，这个点就是重心。',
        ],
        answer: '三中线共点于重心',
      },
      {
        id: 'ceva-3',
        level: '进阶',
        statement:
          '三角形 $ABC$ 中 $AD$、$BE$、$CF$ 共点，$D$、$E$、$F$ 分别在 $BC$、$CA$、$AB$ 上。已知 $BD=DC$、$CE:EA=2:1$，求 $AF:FB$。',
        hint: '共点意味着三段比乘积为一，已知两项就能解出第三项。',
        steps: [
          '由 $BD=DC$ 得 $BD:DC=1:1$。',
          '代入塞瓦条件：$1\\cdot 2\\cdot\\dfrac{AF}{FB}=1$。',
          '解得 $AF:FB=1:2$。',
        ],
        answer: '$AF:FB=1:2$',
      },
      {
        id: 'ceva-4',
        level: '竞赛',
        statement: '用塞瓦定理证明三角形的三条内角平分线交于一点，即内心。',
        hint: '每条角平分线都满足「邻边之比等于分点比」。',
        steps: [
          '由角平分线定理，$\\dfrac{BD}{DC}=\\dfrac{AB}{AC}$。',
          '同理 $\\dfrac{CE}{EA}=\\dfrac{BC}{AB}$，$\\dfrac{AF}{FB}=\\dfrac{CA}{BC}$。',
          '三式相乘，分子分母两两相消，乘积为一。',
          '由塞瓦定理，三条角平分线共点，该点到三边等距，即内心。',
        ],
        answer: '三内角平分线共点（内心）',
      },
    ],
  },
  {
    id: 'menelaus',
    title: '梅涅劳斯定理',
    subtitle: '三点共线：有向三段比之积等于负一',
    method: '找一条截线截住三角形三边，按同一绕行方向写有向比，乘积为负一即共线。',
    explainerId: 'ceva-menelaus',
    problems: [
      {
        id: 'men-1',
        level: '基础',
        statement:
          '一条直线截三角形 $ABC$ 的三边所在直线，交点为 $D$、$E$、$F$。已知 $BD:DC=2:1$、$CE:EA=3:1$，求 $AF:FB$ 的绝对值。',
        hint: '梅涅劳斯定理的乘积为负一，先算绝对值再定内外分。',
        steps: [
          '写出梅涅劳斯条件：$\\dfrac{BD}{DC}\\cdot\\dfrac{CE}{EA}\\cdot\\dfrac{AF}{FB}=-1$。',
          '代入：$2\\cdot 3\\cdot\\dfrac{AF}{FB}=-1$。',
          '绝对值满足 $\\left|\\dfrac{AF}{FB}\\right|=\\dfrac{1}{6}$。',
        ],
        answer: '$AF:FB=1:6$',
      },
      {
        id: 'men-2',
        level: '进阶',
        statement:
          '三角形 $ABC$ 中 $M$ 是 $BC$ 的中点，$N$ 在 $AC$ 上且 $AN:NC=2:1$，直线 $MN$ 交 $AB$ 的延长线于 $P$，求 $AP:PB$。',
        hint: '把截线看成 $M$、$N$、$P$ 三点共线，套梅涅劳斯。',
        steps: [
          '对三角形 $ABC$ 与截线 $MNP$ 用梅涅劳斯定理。',
          '$BM:MC=1:1$，$CN:NA=1:2$，代入得 $AP:PB$ 的绝对值为二。',
          '点 $P$ 在 $AB$ 的延长线上，属于外分。',
          '故 $AP:PB=2:1$，且 $P$ 在 $B$ 的外侧。',
        ],
        answer: '$AP:PB=2:1$（外分）',
      },
      {
        id: 'men-3',
        level: '竞赛',
        statement: '说明塞瓦定理与梅涅劳斯定理为什么可以看成同一件事的对偶。',
        hint: '比较两个式子的形状与几何含义。',
        steps: [
          '两者都是「三段比之积」的判据，比的取法完全一致。',
          '塞瓦对应三线共点，乘积为正一；梅涅劳斯对应三点共线，乘积为负一。',
          '把共点看成「直线退化」，共线看成「交点跑到无穷远」，两者可以互相转化。',
        ],
        answer: '同一比例结构，对应共点与共线两种退化情形',
      },
      {
        id: 'men-4',
        level: '竞赛',
        statement:
          '三角形 $ABC$ 中 $D$ 在 $BC$ 的延长线上且 $BD:DC=3:1$，$E$ 在 $CA$ 上且 $CE:EA=1:2$，直线 $DE$ 交 $AB$ 于 $F$，求 $AF:FB$。',
        hint: '先统一方向，再套梅涅劳斯；结果的符号说明内外分。',
        steps: [
          '对三角形 $ABC$ 与截线 $DEF$ 用梅涅劳斯定理。',
          '代入 $BD:DC=3:1$ 与 $CE:EA=1:2$。',
          '解出 $AF:FB$ 的绝对值为 $6$。',
          '由 $D$ 在外侧可知 $F$ 在 $AB$ 的外侧，故为外分。',
        ],
        answer: '$AF:FB=6:1$（外分）',
      },
    ],
  },
  {
    id: 'power-of-point',
    title: '圆幂定理',
    subtitle: '相交弦、切割线与切线长',
    method: '点在圆内用相交弦，点在圆外先找切线，切线长的平方等于割线两段之积。',
    explainerId: 'euclidean-geometry',
    problems: [
      {
        id: 'pow-1',
        level: '基础',
        statement:
          '圆内两弦 $AB$、$CD$ 交于 $P$，$PA=3$、$PB=4$、$PC=2$，求 $PD$。',
        hint: '相交弦定理：交点分出的两段乘积相等。',
        steps: [
          '由相交弦定理，$PA\\cdot PB=PC\\cdot PD$。',
          '代入得 $3\\times 4=2\\times PD$。',
          '解得 $PD=6$。',
        ],
        answer: '$PD=6$',
      },
      {
        id: 'pow-2',
        level: '进阶',
        statement:
          '从圆外一点 $P$ 引切线 $PT$ 与割线 $PAB$，已知 $PT=6$、$PA=4$，求 $PB$。',
        hint: '切割线定理：切线长平方等于割线两段之积。',
        steps: [
          '由切割线定理，$PT^{2}=PA\\cdot PB$。',
          '代入得 $36=4\\cdot PB$。',
          '解得 $PB=9$。',
        ],
        answer: '$PB=9$',
      },
      {
        id: 'pow-3',
        level: '进阶',
        statement:
          '圆的半径为 $5$，圆外一点 $P$ 到圆心的距离为 $13$，求 $P$ 对圆的幂与切线长。',
        hint: '圆幂等于距离平方减去半径平方，切线长是圆幂的平方根。',
        steps: [
          '圆幂等于 $13^{2}-5^{2}$，即 $169-25=144$。',
          '切线长的平方等于圆幂，故切线长为 $12$。',
        ],
        answer: '圆幂为 $144$，切线长为 $12$',
      },
      {
        id: 'pow-4',
        level: '竞赛',
        statement:
          '圆内接四边形 $ABCD$ 的对角线 $AC$、$BD$ 交于 $P$，证明 $PA\\cdot PC=PB\\cdot PD$。',
        hint: '找两对相等的圆周角，得到相似三角形。',
        steps: [
          '同弧所对圆周角相等，故 $\\angle BAC=\\angle BDC$。',
          '同理 $\\angle ABD=\\angle ACD$。',
          '于是三角形 $PAB$ 与三角形 $PDC$ 相似。',
          '由对应边成比例，$\\dfrac{PA}{PD}=\\dfrac{PB}{PC}$，即 $PA\\cdot PC=PB\\cdot PD$。',
        ],
        answer: '$PA\\cdot PC=PB\\cdot PD$',
      },
    ],
  },
];

export function getGeometryDrill(id: string | undefined): GeometryDrill {
  return GEOMETRY_DRILLS.find((d) => d.id === id) ?? GEOMETRY_DRILLS[0];
}
