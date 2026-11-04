// EXPORTS: AiQuestion, AiQuestionRequest
// 服务端与前端的共享数据结构（前端在 src/lib/ai-client.ts 里有同名类型）

export interface AiQuestion {
  id: string;
  topic: string;
  difficulty: 'basic' | 'advanced' | 'competition';
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
    dualSolve: 'match' | 'mismatch' | 'skipped';
    /** 独立求解得到的答案（便于人工核对） */
    secondAnswer?: string;
    /** 等价判定使用的方法（sympy/string/numeric/…） */
    method?: string;
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
  /** 可选：额外的风格要求，如「应用题背景」 */
  style?: string;
}
