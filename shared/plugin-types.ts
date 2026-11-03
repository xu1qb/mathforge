// ---- plugin:math_photo_question_solver_1 ----
// ============================================================
// 插件 math_photo_question_solver_1 (拍照识题AI解答) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export type MathPhotoQuestionSolverOneInput = {
  /** 待识别解答的数学题目图片 */
  question_image: string[];
};

/**
 * const input: MathPhotoQuestionSolverOneInput = { question_image };
 * capabilityClient.load('math_photo_question_solver_1').callStream<MathPhotoQuestionSolverOneOutput>('imageUnderstanding', input)
 * 每个 chunk 就是下面这个扁平对象，字段名与 MathPhotoQuestionSolverOneOutput 一致，外面没有 data / choices / message 包装：
 *   {"content":"示例文本","reasoningContent":"","response":"示例文本"}
 * 返回值可能是 AsyncIterable<chunk>，也可能是 { output: AsyncIterable<chunk> }，取流前先归一化。
 * 逐段累加：
 *   for await (const chunk of stream) { result += chunk.content ?? ''; }
 */
export type MathPhotoQuestionSolverOneOutput = {
  content: string;
  reasoningContent?: string;
  response?: string;
};
// ---- end:math_photo_question_solver_1 ----