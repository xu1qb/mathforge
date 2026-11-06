import type { Course } from './types';

export const CRYPTOGRAPHY_COURSE: Course = {
  id: 'cryptography-course', title: '密码学', tagline: '对称、哈希、公钥与签名',
  textbook: {
    name: 'Introduction to Modern Cryptography（Katz & Lindell） + 现代密码学（杨波）',
    edition: '第 3 版 / 第 5 版',
  },
  prerequisites: ['数论', '概率统计'],
  hours: 32,
  intro: {
    what: '密码学用数学困难性保护信息：对称加密保密，哈希保证完整性，公钥与签名解决分发与不可否认。',
    objects: ['对称密码', '哈希函数', 'RSA 公钥', '数字签名'],
    history: ['古典密码', '1977：DES', '1977：RSA', '21 世纪：后量子密码'],
  },
  chapters: [
    {
      id: 'cr-sym', title: '对称密码', textbookRef: 'Katz-Lindell 第 1 章 / Katz 第 1 章', summary: '一次一密与分组',
      goals: ['理解一次一密', '分析模式'],
      lessonIds: ['symmetric-ciphers', 'perfect-secrecy', 'pseudo-randomness'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'cr1-1', level: '进阶', question: '一次一密的密钥要求？', answer: '随机等长一次', hint: '信息论安全。', steps: ['进', '阶'] }],
    },
    {
      id: 'cr-hash', title: '哈希函数', textbookRef: 'Katz-Lindell 第 2 章 / Katz 第 4 章', summary: '单向与抗碰撞',
      goals: ['理解抗碰撞', '安全存口令'],
      lessonIds: ['hash-functions', 'cpa-security', 'mac-prf'],
      practiceTopics: ['nt-gcd'],
      exercises: [{ id: 'cr2-1', level: '进阶', question: '抗碰撞的含义？', answer: '难找两输入同摘要', hint: '碰撞困难。', steps: ['进', '阶'] }],
    },
    {
      id: 'cr-rsa', title: 'RSA 公钥密码', textbookRef: 'Katz-Lindell 第 3 章 / Katz 第 5 章', summary: '大整数分解困难',
      goals: ['实现 RSA', '理解安全性'],
      lessonIds: ['crypto-rsa', 'elgamal', 'diffie-hellman'],
      practiceTopics: ['nt-gcd'],
      exercises: [{ id: 'cr3-1', level: '进阶', question: 'p=3,q=11,e=3 的私钥？', answer: '7', hint: '模逆。', steps: ['进', '阶'] }],
    },
    {
      id: 'cr-sign', title: '数字签名', textbookRef: 'Katz-Lindell 第 4 章 / Katz 第 6 章', summary: '不可否认',
      goals: ['签名验证', '理解证书'],
      lessonIds: ['digital-signatures'],
      practiceTopics: ['nt-gcd'],
      exercises: [{ id: 'cr4-1', level: '进阶', question: '签名用哪个密钥？', answer: '私钥签、公钥验', hint: '非对称。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '网络安全', scene: '互联网', example: 'TLS 与证书。' }, { title: '区块链', scene: '金融', example: '签名与哈希。' }], crossings: [{ subject: '数论', relation: 'RSA 依赖模运算。', courseId: 'algebra-number' }, { subject: '信息论', relation: '安全性的信息论基础。', courseId: 'information-theory-course' }], toolPath: '/tools',
};
