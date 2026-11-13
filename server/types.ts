// EXPORTS: AiQuestion, AiQuestionRequest
// 服务端与前端的共享数据结构（前端在 src/lib/ai-client.ts 里有同名类型）

export interface AiQuestion {
  id: string;
  topic: string;
  difficulty: 'basic' | 'advanced' | 'competition';
  /** 题型：计算 / 证明 / 综合大题（缺省按计算题处理） */
  questionType?: 'calculation' | 'proof' | 'comprehensive';
  /** 综合大题的小问数（2–4） */
  parts?: number;
  question: string;
  questionLatex: string;
  answer: string;
  answerDisplay?: string;
  answerType: 'numeric' | 'expression';
  steps: string[];
  /** 模型给出的知识点组合，例如 ["数列", "数论"] */
  fusion?: string[];
  /** 服务端校验结果 */
  validation: {
    latexOk: boolean;
    notationOk: boolean;
    issues: string[];
    attempts: number;
    /** 双解一致：模型独立求解后的答案是否与原答案等价 */
    dualSolve: 'match' | 'judged' | 'mismatch' | 'skipped';
    /** 独立求解得到的答案（便于人工核对） */
    secondAnswer?: string;
    /** 等价判定使用的方法（sympy/string/numeric/…） */
    method?: string;
    /** 新颖度判定 */
    novelty?: 'novel' | 'similar';
    /** 与已有题目的最高结构相似度 */
    noveltyScore?: number;
    /** 本次使用的校验档位 */
    verifyMode?: 'strict' | 'balanced' | 'off';
    /** 是否未经语义验证（balanced/off 下可能出现） */
    unverified?: boolean;
    /** 未验证的原因 */
    unverifiedReason?: string;
  };
}

export interface AiQuestionBatch {
  questions: AiQuestion[];
  model: string;
  mode: 'live' | 'mock';
  cached: number;
  generatedAt: string;
}

export interface AiQuestionRequest {
  topic: string;
  difficulty: 'basic' | 'advanced' | 'competition';
  count?: number;
  /** 可选：指定融合的知识点，空则单点 */
  fusion?: string[];
  /** 可选：题型；缺省 auto 由模型决定 */
  questionType?: 'auto' | 'calculation' | 'proof' | 'comprehensive';
  /** 可选：综合大题小问数（2–4），仅 questionType=comprehensive 生效 */
  parts?: number;
  /** 可选：额外的风格要求，如「应用题背景」 */
  style?: string;
  /** 可选：本次请求的校验档位，覆盖服务端默认 */
  verifyMode?: 'strict' | 'balanced' | 'off';
  /** 可选：随机种子。预生成池每次都要不同，否则会命中同一份缓存 */
  seed?: string;
}
