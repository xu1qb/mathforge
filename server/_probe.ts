import katex from 'katex';

type X = { a: number };
const f = (x: X): string => katex.renderToString('x^{2}', { throwOnError: true, strict: 'error' }).slice(0, 10) + x.a;
console.log(f({ a: 1 }));
