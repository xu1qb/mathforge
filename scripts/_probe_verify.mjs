import { independentSolve } from '../server/solve.ts';
import { config, hasVerifyModel } from '../server/config.ts';

console.log('主模型:', config.model, '| 第二模型:', hasVerifyModel() ? config.verifyModel : '未配置');
const r = await independentSolve('已知 \\sin\\alpha+\\cos\\alpha=\\frac{1}{5}，0<\\alpha<\\pi，求 \\sin\\alpha-\\cos\\alpha');
console.log('独立解:', JSON.stringify(r));
