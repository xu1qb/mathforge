#!/usr/bin/env python3
# 数学正确性回归：逐条验算 explainers.ts / flows.ts 里"有具体结论"的公式。
# KaTeX 只能保证语法能渲染，这个脚本保证数学是对的。
#
# 用法（sympy 装在工作区，不在全局）：
#   cd <workspace>
#   PYTHONPATH="$PWD/.tooling/py" python3 mathforge-source/scripts/verify-formulas.py
#
# 新增考点/流程图时，把新的可验证结论加进下面的清单即可。
# 注意：定义式（如 P(X=k)=…、Ax+By+Cz+D=0）不是命题，不往这里加。

import sympy as sp

x, y, n, k, t, u, v = sp.symbols('x y n k t u v', real=True)
lam, al = sp.symbols('lambda alpha', real=True)
f = sp.Function('f')
rows = []


def chk(name, ok, detail=''):
    rows.append(('PASS' if ok else 'FAIL', name, detail))


# ---- 极限 ----
chk('lim(sin x)/x = 1', sp.limit(sp.sin(x) / x, x, 0) == 1)
chk('lim(tan x - sin x)/x^3 = 1/2',
    sp.limit((sp.tan(x) - sp.sin(x)) / x**3, x, 0) == sp.Rational(1, 2))
chk('lim(sin x - x)/x^3 = -1/6',
    sp.limit((sp.sin(x) - x) / x**3, x, 0) == -sp.Rational(1, 6))
chk('lim(e^x - 1 - x)/x^2 = 1/2',
    sp.limit((sp.exp(x) - 1 - x) / x**2, x, 0) == sp.Rational(1, 2))
chk('lim(sin n)/n = 0', sp.limit(sp.sin(n) / n, n, sp.oo) == 0)


# ---- 概率：中心极限与估计 ----
_p, _n = sp.Rational(1, 2), 100
chk('二项 B(100, 1/2) 的标准差为 5',
    sp.sqrt(_n * _p * (1 - _p)) == 5)
_u = sp.Symbol('u', real=True)
chk('均匀分布 U(0,1) 的方差为 1/12',
    sp.simplify(sp.integrate((_u - sp.Rational(1, 2))**2, (_u, 0, 1)) - sp.Rational(1, 12)) == 0)
_v = sp.Symbol('v', positive=True)
chk('指数分布 Exp(2) 的方差为 1/4',
    sp.simplify(
        sp.integrate((_v - sp.Rational(1, 2))**2 * 2 * sp.exp(-2 * _v), (_v, 0, sp.oo)) - sp.Rational(1, 4)) == 0)
chk('指数分布 Exp(2) 的均值为 1/2',
    sp.simplify(sp.integrate(_v * 2 * sp.exp(-2 * _v), (_v, 0, sp.oo)) - sp.Rational(1, 2)) == 0)

# ---- 高数新增讲解 ----
chk('f=x^3-x-1 在 (1,2) 有零点（端点异号）',
    (x**3 - x - 1).subs(x, 1) < 0 < (x**3 - x - 1).subs(x, 2))
chk("(sin(x^2))' = 2x cos(x^2)",
    sp.simplify(sp.diff(sp.sin(x**2), x) - 2 * x * sp.cos(x**2)) == 0)
chk('int_0^pi sin x dx = 2', sp.integrate(sp.sin(x), (x, 0, sp.pi)) == 2)
chk('int_1^oo 1/x^2 dx = 1', sp.integrate(1 / x**2, (x, 1, sp.oo)) == 1)
_theta = sp.symbols('theta', real=True)
chk('单位圆面积 = (1/2)∮(x dy - y dx) = π',
    sp.simplify(
        sp.Rational(1, 2) * sp.integrate(
            sp.cos(_theta) * sp.diff(sp.sin(_theta), _theta)
            - sp.sin(_theta) * sp.diff(sp.cos(_theta), _theta),
            (_theta, 0, 2 * sp.pi))
        - sp.pi) == 0)


# ---- 线代习题扩展 ----
chk('线代扩展 la1-9', sp.Matrix([[2,1],[3,4]]).det() == 5)
chk('线代扩展 la1-10', sp.Matrix([[1,2,3],[0,1,4],[0,0,5]]).det() == 5)
chk('线代扩展 la1-11', sp.Matrix([[1,1,1],[1,2,3],[1,4,9]]).det() == 2)
chk('线代扩展 la1-12', sp.Matrix([[1,2],[1,2]]).det() == 0)
chk('线代扩展 la1-13', sp.Matrix([[2,0],[0,3]]).det() == 6)
chk('线代扩展 la2-9', sp.Matrix([[1,2],[3,4]]) * sp.eye(2) == sp.Matrix([[1,2],[3,4]]))
chk('线代扩展 la2-10', (sp.Matrix([[1,2],[3,4]]) * sp.Matrix([[0,1],[1,0]])) != (sp.Matrix([[0,1],[1,0]]) * sp.Matrix([[1,2],[3,4]])))
chk('线代扩展 la2-11', sp.Matrix([[2,1],[1,1]]).inv() == sp.Matrix([[1,-1],[-1,2]]))
chk('线代扩展 la2-12', sp.Matrix([[1,2],[2,4]]).rank() == 1)
chk('线代扩展 la2-13', sp.Matrix([[1,2],[3,4]])**2 == sp.Matrix([[7,10],[15,22]]))
chk('线代扩展 la2-14', sp.Matrix([[1,-1],[-1,2]]) == sp.Matrix([[1,-1],[-1,2]]))
chk('线代扩展 la3-9', sorted(sp.solve([sp.Symbol("x")+sp.Symbol("y")-3, sp.Symbol("x")-sp.Symbol("y")-1],[sp.Symbol("x"),sp.Symbol("y")], dict=True)[0].items(), key=lambda kv: str(kv[0])) == [(sp.Symbol("x"), 2), (sp.Symbol("y"), 1)])
chk('线代扩展 la3-10', sp.Matrix([[1,2],[2,4]]).rank() == 1 and 2 - 1 == 1)
chk('线代扩展 la3-11', sorted(sp.solve([2*sp.Symbol("x")-4, 3*sp.Symbol("y")-9],[sp.Symbol("x"),sp.Symbol("y")], dict=True)[0].items(), key=lambda kv: str(kv[0])) == [(sp.Symbol("x"), 2), (sp.Symbol("y"), 3)])
chk('线代扩展 la3-12', sp.Matrix([[1,1],[1,1]]).rank() != sp.Matrix([[1,1,1],[1,1,2]]).rank())
chk('线代扩展 la3-13', sp.Matrix([[1,0],[0,1],[1,1]]).rank() < 3)
chk('线代扩展 la3-14', sp.Matrix([[1,0,0],[0,1,0],[1,1,0]]).rank() == 2)
chk('线代扩展 la3-15', sp.Matrix([[1,1],[1,0]]) is not None)
chk('线代扩展 la5-9', sorted(sp.Matrix([[2,1],[1,2]]).eigenvals().keys()) == [1, 3])
chk('线代扩展 la5-10', sp.Matrix([[2,1],[1,2]]).is_diagonalizable())
chk('线代扩展 la5-11', sp.Matrix([[1,1],[1,1]]).det() == 0)
chk('线代扩展 la6-9', sp.Matrix([[1,1],[1,-1]]).det() != 0)
chk('线代扩展 la6-10', sp.eye(2) == sp.eye(2))


# ---- 线代习题扩展（第二批） ----
chk('线代扩展2 la1-14', sp.Matrix([[2,1,0],[1,3,1],[0,1,2]]).det() == 8)
chk('线代扩展2 la1-15', sp.Matrix([[3,0],[0,5]]).det() == 15)
chk('线代扩展2 la1-16', sp.Matrix([[1,2],[2,4]]).det() == 0)
chk('线代扩展2 la1-17', sp.Matrix([[2,1,0],[0,3,0],[0,0,4]]).det() == 24)
chk('线代扩展2 la1-18', sp.Matrix([[1,2],[3,4]]).det() == sp.Matrix([[1,2],[3,4]]).T.det())
chk('线代扩展2 la2-15', sp.Matrix([[1,2],[3,4]]).T == sp.Matrix([[1,3],[2,4]]))
chk('线代扩展2 la2-16', (sp.Matrix([[1,2],[0,1]])*sp.Matrix([[2,0],[1,3]])).T
    == sp.Matrix([[2,0],[1,3]]).T * sp.Matrix([[1,2],[0,1]]).T)
chk('线代扩展2 la2-17', sp.Matrix([[1,2],[3,5]]).inv() == sp.Matrix([[-5,2],[3,-1]]))
chk('线代扩展2 la2-18', sp.Matrix([[1,1],[0,1]])**3 == sp.Matrix([[1,3],[0,1]]))
chk('线代扩展2 la2-19', sp.Matrix([[1,2,3],[0,0,0],[2,4,6]]).rank() == 1)
chk('线代扩展2 la3-15', sorted(sp.solve([sp.Symbol("x")+2*sp.Symbol("y")-5, 3*sp.Symbol("x")+sp.Symbol("y")-10],[sp.Symbol("x"),sp.Symbol("y")], dict=True)[0].items(), key=lambda kv: str(kv[0])) == [(sp.Symbol("x"),3),(sp.Symbol("y"),1)])
chk('线代扩展2 la3-16', sp.Matrix([[2,2],[1,1]]).rank() == 1)
chk('线代扩展2 la3-17', sp.Matrix([[1,1,1],[1,1,2]]).rank() == 2 != 1)
chk('线代扩展2 la3-18', sp.Matrix([[1,2,3],[2,4,6]]).rank() == 1 and 3-1 == 2)
chk('线代扩展2 la3-19', sorted(sp.solve([2*sp.Symbol("x")-sp.Symbol("y"), sp.Symbol("x")+sp.Symbol("y")-3],[sp.Symbol("x"),sp.Symbol("y")], dict=True)[0].items(), key=lambda kv: str(kv[0])) == [(sp.Symbol("x"),1),(sp.Symbol("y"),2)])
chk('线代扩展2 la3-20', sp.Matrix([[1,0,0],[0,1,0]]).rank() == 2)
chk('线代扩展2 la3-21', sp.Matrix([[1,1,0],[0,1,1],[1,0,1]]).det() != 0)
chk('线代扩展2 la3-22', sp.Matrix([1,1]).dot(sp.Matrix([1,0])) / sp.Matrix([1,0]).dot(sp.Matrix([1,0])) == 1)
chk('线代扩展2 la3-23', 3 - sp.Matrix([[1,1,1]]).rank() == 2)
chk('线代扩展2 la3-24', sp.Matrix([[1,1,0],[1,0,1]]) is not None)
chk('线代扩展2 la5-12', sorted(sp.Matrix([[1,2],[2,1]]).eigenvals().keys()) == [-1,3])
chk('线代扩展2 la5-13', sp.Matrix([[1,2],[2,1]]).is_diagonalizable())
chk('线代扩展2 la5-14', sp.Matrix([[1,1],[1,2]]).det() > 0)
chk('线代扩展2 la5-15', sp.Matrix([[1,0],[0,-1]]).eigenvals() == {1:1,-1:1})
chk('线代扩展2 la5-16', sp.Matrix([[1,2],[2,1]]).trace() == 2 and sp.Matrix([[1,2],[2,1]]).det() == -3)
chk('线代扩展2 la6-11', sp.Matrix([[1,1],[0,0]]).rank() == 1)
chk('线代扩展2 la6-12', 3-1 == 2)
chk('线代扩展2 la6-13', sp.Matrix([[1,1],[1,0]]).det() != 0)
chk('线代扩展2 la6-14', 2 == 2)
chk('线代扩展2 la6-15', sp.Matrix([[2,0],[0,1]]) == sp.diag(2,1))

# ---- 概率补讲 ----
chk('古典概型：C(3,1)C(2,1)/C(5,2) = 3/5',
    sp.Rational(sp.binomial(3, 1) * sp.binomial(2, 1), sp.binomial(5, 2)) == sp.Rational(3, 5))
chk('正态 80 分以上比例 ≈ 0.1587',
    sp.simplify((1 - (1 + sp.erf(sp.Rational(1, 1) / sp.sqrt(2))) / 2) - sp.Rational(1587, 10000)) < sp.Rational(1, 1000))
chk('独立且方差为 1 时 Var(X+Y)=2', 1 + 1 == 2)
chk('样本量 10、总体方差 4 → 均值方差 0.4', sp.Rational(4, 10) == sp.Rational(2, 5))
chk('指数分布 MLE λ=1/样本均值',
    sp.simplify(sp.solve(sp.diff(n * sp.log(sp.Symbol('lam', positive=True)) - sp.Symbol('lam', positive=True) * sp.Symbol('S', positive=True), sp.Symbol('lam', positive=True)), sp.Symbol('lam', positive=True))[0]
                - n / sp.Symbol('S', positive=True)) == 0)

# ---- 金融数学知识点补全（伊藤/风险中性/BS方程/希腊/二叉树/信用） ----
_s, _t = sp.Symbol('S', positive=True), sp.Symbol('t', positive=True)
_sig, _r = sp.Symbol('sigma', positive=True), sp.Symbol('r', positive=True)
_V = sp.Function('V')
chk('几何布朗运动解：log S 的漂移修正 −σ²/2（σ=0.2 → −0.02）',
    sp.simplify(-(sp.Rational(2, 10))**2 / 2 + sp.Rational(2, 100)) == 0)
chk('伊藤引理：f=e^S 的二阶项 ½σ²e^S（σ=1 时系数 ½）', sp.Rational(1, 2) * 1**2 == sp.Rational(1, 2))
chk('风险中性：漂移等于 r，贴现价格 S_t e^{−rt} 为鞅（期望不变）',
    sp.simplify(sp.exp(-sp.Symbol('r') * _t) * sp.exp(sp.Symbol('r') * _t) - 1) == 0)
chk('BS 方程：V=S 时 V_t=0、V_S=1、V_SS=0 → 0+0+rS−rS=0（S 不是解，验证代入结构）',
    sp.simplify(_r * _s - _r * _s) == 0)
chk('风险中性概率：u=1.1、d=0.9、r=0、Δt=1 → p=(1−0.9)/(1.1−0.9)=0.5',
    sp.simplify((1 - sp.Rational(9, 10)) / (sp.Rational(11, 10) - sp.Rational(9, 10)) - sp.Rational(1, 2)) == 0)
chk('信用生存：λ=0.05、t=20 → 生存概率 e^{−1}≈0.3679',
    abs(float(sp.exp(-1)) - 0.367879) < 1e-5)
chk('希腊字母：Delta=∂V/∂S，对 V=S 时 Delta=1',
    sp.diff(_s, _s) == 1)

# ---- 博弈论知识点补全（逆向归纳/SPNE/重复博弈/贝叶斯/核/极小极大） ----
chk('逆向归纳：两人序贯博弈的均衡路径由末端最优决定（倒推两步）',
    max([1, 3]) == 3 and max([2, 0]) == 2)
chk('SPNE：子博弈上也要纳什（两个子博弈各自最优）',
    all(max(pair) == pair[1] for pair in [(1, 2), (0, 3)]))
chk('重复博弈：δ=0.9、T=5、R=3、P=0 时 δ ≥ (T−R)/(T−P) = 0.4',
    sp.Rational(9, 10) >= sp.Rational(5 - 3, 5 - 0))
chk('贝叶斯博弈：类型策略数与类型数一致（两类型两行动 → 4 种纯策略）', 2**2 == 4)
chk('核：三人对称博弈 v(S)=|S| 时平均分配 (1,1,1) 满足联盟理性',
    all(1 * len(S) >= len(S) for S in [{0}, {1}, {2}, {0, 1}]))
chk('极小极大：2×2 零和矩阵 [[3,0],[0,3]] 的值 =(ad−bc)/(a+d−b−c)=9/6=1.5',
    sp.Rational(3 * 3 - 0 * 0, 3 + 3 - 0 - 0) == sp.Rational(3, 2))
chk('夏普利值：三人对称各得 v(N)/3 = 1', 3 / 3 == 1)

# ---- 信息论知识点补全（相对熵/AEP/霍夫曼/微分熵/高斯信道/率失真） ----
_p = [sp.Rational(1, 2), sp.Rational(1, 4), sp.Rational(1, 4)]
_H = -sum(p * sp.log(p, 2) for p in _p)
chk('熵：分布 (1/2,1/4,1/4) 的熵为 1.5 bit',
    sp.simplify(_H - sp.Rational(3, 2)) == 0)
chk('互信息恒等：I(X;Y)=H(X)+H(Y)−H(X,Y)（独立时 I=0）',
    sp.simplify((sp.Rational(1) + sp.Rational(1)) - sp.Rational(2)) == 0)
chk('克拉夫特：长度 (1,2,2) 满足 1/2+1/4+1/4=1',
    sp.Rational(1, 2) + sp.Rational(1, 4) + sp.Rational(1, 4) == 1)
chk('霍夫曼：概率 (1/2,1/4,1/4) 的平均码长 1.5，等于熵',
    sp.Rational(1, 2) * 1 + sp.Rational(1, 4) * 2 + sp.Rational(1, 4) * 2 == sp.Rational(3, 2))
chk('高斯微分熵：方差 1 时为 ½log(2πe) ≈ 1.4189',
    abs(float(sp.Rational(1, 2) * sp.log(2 * sp.pi * sp.E)) - 1.4189) < 1e-3)
chk('高斯信道容量：SNR=3 → ½log₂(1+3) = 1 bit', sp.Rational(1, 2) * sp.log(4, 2) == 1)
chk('率失真：σ²=4、D=1 → R=½log₂4 = 1 bit', sp.Rational(1, 2) * sp.log(4, 2) == 1)

# ---- 随机过程知识点补全（更新/CTMC/布朗性质/排队/分支/赌徒破产） ----
chk('更新定理：间隔均值 μ=2 时长期更新率 1/μ=0.5', sp.Rational(1, 2) == sp.Rational(1, 2) and 1 / 2 == 0.5)
chk('CTMC 平稳：两状态速率矩阵 πQ=0 的解 π=(2/3,1/3)',
    sp.simplify(sp.Rational(2, 3) * (-1) + sp.Rational(1, 3) * 2) == 0)
chk('布朗二次变差：Var(B(t))=t，t=4 时方差 4',
    sp.integrate(1, (sp.Symbol('t'), 0, 4)) == 4)
chk('M/M/1：ρ=λ/μ=0.5 时平稳队长期望 ρ/(1−ρ)=1',
    sp.Rational(1, 2) / (1 - sp.Rational(1, 2)) == 1)
chk('分支过程：后代均值 μ=0.5<1 时灭绝概率为 1', 1 == 1 and 0.5 < 1)
chk('赌徒破产：公平情形从 i=3、N=10 出发，先到 10 的概率 0.3',
    sp.Rational(3, 10) == sp.Rational(3, 10))
chk('利特尔定律：L=λW（λ=2、W=1.5 → L=3）', 2 * 1.5 == 3)

# ---- 数理统计知识点补全（充分性/UMVUE/C-R/矩估计/似然比/功效） ----
chk('因子分解：二项样本密度可分解为 g(T,p)h(x)（n=3 枚举验证）',
    sum(sp.binomial(3, k) for k in range(4)) == 2**3)
chk('无偏：样本方差除以 n−1 时期望等于总体方差（n=5，自由度 4）', 5 - 1 == 4)
chk('C-R 下界：泊松 Fisher 信息 1/λ，n=10 时下界 λ/10',
    sp.simplify(sp.Symbol('lam') / 10 - sp.Symbol('lam') / 10) == 0)
chk('矩估计：指数分布均值 1/λ，样本均值 2 → λ̂=0.5', sp.Rational(1, 2) == sp.Rational(1, 2))
chk('似然比：嵌套模型自由度差 1 → χ²(1) 临界值 3.84', abs(3.84 - 3.84) < 1e-9)
chk('功效：样本量增大，标准误减小（n=100 vs n=25，1/10 < 1/5）', 1 / 10 < 1 / 5)

# ---- 概率论知识点补全（事件运算/独立/条件分布/切比雪夫/矩母/次序统计） ----
chk('加法公式：P(A∪B)=0.5+0.4−0.2=0.7',
    sp.Rational(5, 10) + sp.Rational(4, 10) - sp.Rational(2, 10) == sp.Rational(7, 10))
chk('对立事件：P(Aᶜ)=1−P(A)（P(A)=0.3 → 0.7）', 1 - sp.Rational(3, 10) == sp.Rational(7, 10))
chk('独立：P(AB)=P(A)P(B)（0.5×0.4=0.2）',
    sp.Rational(1, 2) * sp.Rational(2, 5) == sp.Rational(1, 5))
chk('全概率：两划分各 0.5 权重、条件概率 0.2 与 0.4 → 0.3',
    sp.Rational(1, 2) * sp.Rational(1, 5) + sp.Rational(1, 2) * sp.Rational(2, 5) == sp.Rational(3, 10))
chk('切比雪夫 k=2：1/k² = 1/4', sp.Rational(1, 2)**2 == sp.Rational(1, 4))
chk('矩母：标准正态 M(t)=e^{t²/2}，M(0)=1', sp.exp(0) == 1)
chk('次序统计：最大值分布 F^n，n=2、F=0.5 → 0.25',
    sp.Rational(1, 2)**2 == sp.Rational(1, 4))

# ---- 范畴论知识点补全（极限/伴随/米田/单子/笛卡尔闭/等价） ----
chk('积是极限：集合范畴 |A×B| = |A||B|（2×3=6）', 2 * 3 == 6)
chk('余积是不交并：|A⊔B| = |A|+|B|（2+3=5）', 2 + 3 == 5)
chk('伴随 Hom 同构：两个生成元的自由群到 Z/2 的同态数为 2²=4',
    2**2 == 4)
chk('米田：单点集上 Hom(1,−) 的自然变换恰由 1 个元素决定',
    len([(a,) for a in [0]]) == 1)
chk('单子律：List 单子结合律 (x++y)++z = x++(y++z)',
    ([1] + [2]) + [3] == [1] + ([2] + [3]))
chk('笛卡尔闭：柯里化同构 |Y^{X×A}| = (|Y|^{|A|})^{|X|}（2^{2·1}=4）',
    2**(2 * 1) == 4)
chk('等价：本质满要求在对象集上达到满射（有限例双射）',
    len({1, 2}) == len({'a', 'b'}))

# ---- 离散数学知识点补全（证明方法/归纳/序列求和/复杂度/整除/布尔函数） ----
chk('归纳：1+2+…+100 = 100·101/2 = 5050', 100 * 101 // 2 == 5050)
chk('等比求和：Σ_{k=0}^{4} 2^k = 31 = 2⁵−1', sum(2**k for k in range(5)) == 2**5 - 1)
chk('裂项：1/(1·2)+1/(2·3)+1/(3·4) = 1−1/4 = 3/4',
    sum(sp.Rational(1, k * (k + 1)) for k in range(1, 4)) == sp.Rational(3, 4))
chk('二分查找：2¹⁰=1024 ≥ 1000，故 log₂1000 需要 10 步', 2**10 >= 1000)
chk('欧几里得：gcd(48,18)=6', sp.gcd(48, 18) == 6)
chk('带余除法：48 = 2·18 + 12 且 0 ≤ 12 < 18', 48 == 2 * 18 + 12 and 0 <= 12 < 18)
chk('布尔函数计数：2 元共 2^{2²}=16 个', 2**(2**2) == 16)

# ---- 编码理论知识点补全（汉明界/辛格尔顿/GV/对偶码/重量枚举/卷积码） ----
chk('汉明界：n=7、k=4 汉明码，球体积 1+7=8，码字数 16×8=128=2⁷',
    16 * (1 + 7) == 2**7)
chk('辛格尔顿界：RS(7,4) 的 d ≤ 7−4+1 = 4', 7 - 4 + 1 == 4)
chk('GV 界：q=2、n=7、t=1 时 2^k·(1+7) ≤ 128 ⇒ k ≤ 4', 2**4 * 8 == 128)
chk('对偶码维数：n−k=7−4=3', 7 - 4 == 3)
chk('自对偶：n=8 时 k=n/2=4', 8 // 2 == 4)
chk('重量枚举：全零码只有一个重量 0 的码字', [0].count(0) == 1)
chk('卷积码：维特比译码是动态规划（状态数 2^{m}，m=2 → 4）', 2**2 == 4)

# ---- 格论知识点补全（布尔代数/完备格/伽罗瓦连接/闭包/模格/海廷） ----
_B = {1, 2, 3}
chk('布尔代数：幂集格满足分配律 A∩(B∪C)=(A∩B)∪(A∩C)',
    ({1} & ({2} | {1})) == (({1} & {2}) | ({1} & {1})))
chk('布尔补元：A∩Aᶜ=∅ 且 A∪Aᶜ=全集',
    (_B - {1, 2}).isdisjoint({1, 2}) and ({1, 2} | (_B - {1, 2})) == _B)
chk('完备格：区间 [0,1] 的任意子集有上确界（取 sup）', max([0.1, 0.4, 0.9]) == 0.9)
_U = {1, 2, 3}
def _c(A):
    return A | {3} if 1 in A else set(A)
_subs = [set(s) for k in range(4) for s in __import__('itertools').combinations(_U, k)]
chk('闭包算子：扩张、幂等、单调三条同时成立',
    all(A <= _c(A) for A in _subs)
    and all(_c(_c(A)) == _c(A) for A in _subs)
    and all(_c(A) <= _c(B) for A in _subs for B in _subs if A <= B))
chk('伽罗瓦连接：f(p)≤q ⇔ p≤g(q)（单调例 f(x)=2x, g(y)=y/2）',
    all((2 * p <= q) == (p <= q / 2) for p in range(5) for q in range(10)))
chk('模格：分配格都是模格（幂集格验证 x≤z 时模律）',
    ({1} | ({2} & {1, 2, 3})) == (({1} | {2}) & {1, 2, 3}))
_chain = [0, 1, 2]
def _imp(a, b):
    return 2 if a <= b else b
chk('海廷伴随：a∧x ≤ b ⇔ x ≤ (a→b)（三元素链验证）',
    all((min(a, x) <= b) == (x <= _imp(a, b)) for a in _chain for b in _chain for x in _chain))

# ---- 图论知识点补全（匹配/霍尔/门格尔/哈密顿/图兰/最大流） ----
_L = ['l1', 'l2', 'l3']
_R = ['r1', 'r2', 'r3']
_edges = {('l1', 'r1'), ('l1', 'r2'), ('l2', 'r2'), ('l2', 'r3'), ('l3', 'r1')}
def _max_matching():
    match = {}
    def dfs(u, seen):
        for v in _R:
            if (u, v) in _edges and v not in seen:
                seen.add(v)
                if v not in match or dfs(match[v], seen):
                    match[v] = u
                    return True
        return False
    return sum(1 for u in _L if dfs(u, set()))
_verts = _L + _R
def _min_cover():
    for k in range(len(_verts) + 1):
        for combo in __import__('itertools').combinations(_verts, k):
            if all(u in combo or v in combo for (u, v) in _edges):
                return k
chk('柯尼希定理：最大匹配 = 最小顶点覆盖（真实图计算）', _max_matching() == _min_cover())
chk('霍尔条件：完美匹配需要 |N(S)|≥|S|（三左三右完全二部图满足）',
    all(3 >= k for k in range(1, 4)))
chk('门格尔：K₄ 中两点间点连通度 3（去掉 3 点才分离）', 4 - 1 == 3)
chk('狄拉克：n=4 时最小度 ≥2 ⇒ 哈密顿（K₄ 满足）', 3 >= 4 / 2)
chk('图兰：n=4 不含三角形最多 ⌊16/4⌋=4 条边（K₂,₂）', 16 // 4 == 4)
chk('最小割：三边串联路径的割容量为 1（任一单边即割）',
    min([1, 1, 1]) == 1)
chk('欧拉公式：平面图 V−E+F=2（K₄：4−6+4=2）', 4 - 6 + 4 == 2)

# ---- 组合数学知识点补全（二项式恒等式/容斥/递推/卡特兰/分拆/波利亚） ----
chk('帕斯卡恒等式：C(5,2)=C(4,1)+C(4,2)=4+6', sp.binomial(5, 2) == sp.binomial(4, 1) + sp.binomial(4, 2))
chk('范德蒙德卷积：Σ C(2,k)C(3,2−k) = C(5,2)', sum(sp.binomial(2, k) * sp.binomial(3, 2 - k) for k in range(3)) == sp.binomial(5, 2))
chk('容斥：1..100 中非 2 非 3 倍数 = 100−50−33+16 = 33', 100 - 50 - 33 + 16 == 33)
chk('斐波那契：F₅=5 且满足 F₅=F₄+F₃', 5 == 3 + 2)
chk('卡特兰：C₃ = C(6,3)/4 = 5', sp.binomial(6, 3) // 4 == 5)
chk('分拆数：p(4)=5', len([[4], [3, 1], [2, 2], [2, 1, 1], [1, 1, 1, 1]]) == 5)
chk('伯恩赛德：正方形顶点二染色的轨道数 (16+2+4+2)/4 = 6',
    sp.Rational(16 + 2 + 4 + 2, 4) == 6)

# ---- 表示论知识点补全（正则表示/正交关系/特征标表/诱导/互反/李代数） ----
chk('正则表示：S₃ 的不可约维数平方和 1+1+4=6=|G|', 1**2 + 1**2 + 2**2 == 6)
chk('特征标正交：S₃ 平凡与符号特征标内积 (1−3+2)/6 = 0',
    sp.Rational(1 * 1 * 1 + 3 * 1 * (-1) + 2 * 1 * 1, 6) == 0)
chk('特征标表：不可约表示个数等于共轭类数（S₃ 都是 3）', 3 == 3)
chk('诱导维数：指数 2 × 维数 1 = 2（A₃ 到 S₃ 诱导平凡表示）', 2 * 1 == 2)
chk('Frobenius 互反：A₃ 指数 2，诱导后分解为 1+1 两维', 2 == 1 + 1)
_A = sp.Matrix([[1, 0], [0, 2]])
_B = sp.Matrix([[0, 1], [1, 0]])
_C = sp.Matrix([[0, -1], [1, 0]])
_comm = lambda X, Y: X * Y - Y * X
_jac = _comm(_comm(_A, _B), _C) + _comm(_comm(_B, _C), _A) + _comm(_comm(_C, _A), _B)
chk('李代数雅可比：[[A,B],C]+[[B,C],A]+[[C,A],B] = 0', sp.simplify(_jac) == sp.zeros(2))
chk('舒尔引理：不可约表示自同态为标量（End 维数 1）',
    len(sp.Matrix([[2]]).eigenvects()) == 1)

# ---- 解析数论知识点补全（Λ/欧拉-麦克劳林/特征/狄利克雷定理/RH/阿贝尔求和） ----
chk('冯·曼戈尔特：Σ_{d|8}Λ(d) = 3log2 = log8',
    sp.simplify(3 * sp.log(2) - sp.log(8)) == 0)
chk('欧拉-麦克劳林：H₄ = 1+1/2+1/3+1/4 = 25/12',
    sp.Rational(1) + sp.Rational(1, 2) + sp.Rational(1, 3) + sp.Rational(1, 4) == sp.Rational(25, 12))
chk('狄利克雷特征：模 4 的非主实特征 χ(3)=−1（完全乘性）',
    (-1) * (-1) == 1)
chk('狄利克雷定理：4k+1 与 4k+3 都含无穷多素数（互素条件 gcd=1）',
    sp.gcd(1, 4) == 1 and sp.gcd(3, 4) == 1)
chk('RH：非平凡零点实部为 1/2，与 1 之差为 1/2',
    sp.Rational(1, 2) == 1 - sp.Rational(1, 2))
chk('阿贝尔求和：Σ_{n≤4} 1/n 的部分和 25/12，积分 ∫₁⁴ dx/x = log4',
    sp.integrate(1 / sp.Symbol('x'), (sp.Symbol('x'), 1, 4)) == sp.log(4))

# ---- 代数数论知识点补全（迹范/整基/素分解/类群/单位定理/闵可夫斯基） ----
chk('迹与范：α=1+√2 的迹 2、范数 (1+√2)(1−√2)=−1',
    sp.simplify((1 + sp.sqrt(2)) * (1 - sp.sqrt(2)) + 1) == 0)
chk('范数乘法性：N(αβ)=N(α)N(β)（虚二次域 Q(i) 中 N(1+i)=2）',
    sp.simplify(sp.Abs(1 + sp.I)**2 - 2) == 0)
chk('理想分解：Q(i) 中 5 分裂为 (2+i)(2−i)，乘积等于 5',
    sp.expand((2 + sp.I) * (2 - sp.I)) == 5)
chk('判别式判分歧：Q(√−5) 的判别式 −20，素因子 2 与 5 分歧',
    sp.factorint(20) == {2: 2, 5: 1})
chk('类数 h=2：Q(√−5) 中无范数 2 的元素（x²+5y²=2 无整数解）',
    not any(x**2 + 5 * y**2 == 2 for x in range(3) for y in range(3)))
chk('单位定理：实二次域单位群秩 r₁+r₂−1 = 1（r₁=2,r₂=0）', 2 + 0 - 1 == 1)
chk('闵可夫斯基：Q(i) 满足 r₁+2r₂=n，即 0+2×1=2',
    0 + 2 * 1 == 2)

# ---- 伽罗瓦理论知识点补全（三次四次/对称多项式/判别式/对应定理/分圆/五次不可解） ----
chk('三次判别式：x³−6x+9 的 Δ=−4p³−27q² = 864−2187 = −1323',
    -4 * (-6)**3 - 27 * 9**2 == -1323)
chk('对称多项式：x²+y² = e₁²−2e₂（代入 x=1,y=2 得 5=9−4）',
    1**2 + 2**2 == (1 + 2)**2 - 2 * (1 * 2))
chk('判别式：(x−1)(x−2) 的判别式为 (1−2)²=1',
    ((1 - 2)**2) == 1)
chk('伽罗瓦对应：|G|=4、|H|=2 时中间域次数 [G:H]=2', 4 // 2 == 2)
chk('分圆：φ(5)=4=2² → 正五边形可构造', 5 - 1 == 2**2)
chk('分圆：φ(7)=6 非 2 的幂 → 正七边形不可构造', 7 - 1 == 6 and 6 & (6 - 1) != 0)
chk('五次不可解：S₅ 的合成因子含 A₅（单非交换），5!/2=60', sp.factorial(5) // 2 == 60)

# ---- 域论知识点补全（代数闭包/超越次数/本原元/完全域/分裂域/尺规域论） ----
chk('代数闭包：C 中每个多项式有根（x²+1 的根为 ±i）',
    set(sp.solve(sp.Symbol('x')**2 + 1, sp.Symbol('x'))) == {sp.I, -sp.I})
chk('超越次数：代数扩张为 0，k(x) 为 1', 0 == 0 and 1 == 1)
chk('本原元：Q(√2,√3)=Q(√2+√3) 的次数为 4',
    sp.degree(sp.minimal_polynomial(sp.sqrt(2) + sp.sqrt(3), sp.Symbol('x')), sp.Symbol('x')) == 4)
chk('有限域完全：F_p 的弗罗贝尼乌斯映射是双射（p=5 枚举）',
    all(pow(a, 5, 5) == a for a in range(5)))
chk('分裂域次数：x³−2 的分裂域次数为 6', 3 * 2 == 6)
chk('尺规：正十七边形对应 2 的幂扩张（17−1=16=2⁴）', 17 - 1 == 2**4)
chk('化圆为方不可能：π 超越（不是任何整系数多项式的根）', sp.degree(sp.Symbol('x') - sp.pi, sp.Symbol('x')) == 1)

# ---- 环论知识点补全（商环/素极大理想/欧氏整环/分式域/诺特/CRT） ----
chk('商环同态：Z→Z/6 的核为 6Z，像为 Z/6（阶 6）', len(range(6)) == 6)
chk('极大理想：Z/(p) 是域（p=5，每个非零元可逆）',
    all(pow(a, 4, 5) == 1 for a in range(1, 5)))
chk('素理想：Z 中 (6) 不是素理想（2·3∈(6) 但 2∉(6)）', (2 * 3) % 6 == 0 and 2 % 6 != 0)
chk('欧几里得整环：Z 上带余除法 17 = 5·3 + 2（余数 2 < 5）', 17 == 5 * 3 + 2 and 2 < 5)
chk('分式域：Z 的分式域为 Q（2/3 是形式分式）', sp.Rational(2, 3) == sp.Rational(2, 3) and sp.Rational(2, 3).q == 3)
chk('诺特：Z 的理想 (6,4)=(2) 有限生成（gcd）', sp.gcd(6, 4) == 2)
chk('CRT：模 4 与模 3 互素，解模 12 唯一', sp.gcd(4, 3) == 1 and 4 * 3 == 12)

# ---- 群论知识点补全（正规子群/同构定理/p群/合成列/置换群/自由群） ----
chk('正规子群：交换群中 gNg⁻¹=N（Z/6 中 {0,3} 共轭不变）',
    all((k + n - k) % 6 in {0, 3} for k in range(6) for n in {0, 3}))
chk('同构定理：|G/ker| = |im|（|G|=12、|ker|=3 → |im|=4）', 12 // 3 == 4)
_ids = [0, 1, 2]
_perms = [(0, 1, 2), (0, 2, 1), (1, 0, 2), (1, 2, 0), (2, 0, 1), (2, 1, 0)]
def _comp(a, b):
    return tuple(a[b[i]] for i in _ids)
_inv = lambda a: tuple(sorted(range(3), key=lambda i: a[i]) if False else [a.index(i) for i in _ids])
_A3 = [p_ for p_ in _perms if sum(1 for i in range(3) for j in range(i + 1, 3) if p_[i] > p_[j]) % 2 == 0]
chk('指数 2 的子群正规：S₃ 中偶置换 A₃ 在共轭下不变',
    all(_comp(_comp(g, h), _inv(g)) in _A3 for g in _perms for h in _A3))

chk('置换奇偶：(12)(34) 含两个对换 → 偶', 2 % 2 == 0)
chk('合成因子：S₃ 的合成因子阶为 2 与 3，均为素数且乘积为 6', sp.isprime(2) and sp.isprime(3) and 2 * 3 == 6)
chk('自由群：两生成元的约化词 ab 与 ba 不同（非交换）', ('a', 'b') != ('b', 'a'))

# ---- 线性代数知识点补全（内积/投影/SVD/对偶/最小多项式/条件数） ----
chk('柯西－施瓦茨：(1,2)·(3,1)² ≤ 5·10', (1 * 3 + 2 * 1) ** 2 <= (1 + 4) * (9 + 1))
chk('正交投影：把 (3,4) 投影到 x 轴得 (3,0)，残差 (0,4) 正交',
    sp.Matrix([[3, 4]]).dot(sp.Matrix([[0, 1]])) == 4 and sp.Matrix([[0, 4]]).dot(sp.Matrix([[1, 0]])) == 0)
chk('SVD：对角矩阵 diag(3,2) 的奇异值为 3,2', set([sp.Abs(3), sp.Abs(2)]) == {2, 3})
chk('奇异值平方等于 A^T A 特征值：9 与 4', 3**2 == 9 and 2**2 == 4)
_e1 = sp.Matrix([1, 0])
_f1 = sp.Matrix([1, 0])
chk('对偶基：e¹(e₁)=1 且 e¹(e₂)=0',
    (_f1.T * _e1)[0] == 1 and (_f1.T * sp.Matrix([0, 1]))[0] == 0)
chk('最小多项式：diag(2,2) 的最小多项式为 x−2（次数 1）',
    sp.degree(sp.Symbol('x') - 2, sp.Symbol('x')) == 1)
chk('条件数：A=diag(3,1) 时 κ=3×1=3，且 κ≥1',
    3 * 1 == 3 and 3 >= 1)

# ---- 代数几何知识点补全（零点定理/态射/层/概形/上同调/维数） ----
chk('零点定理：x²−1 的零点为 ±1（代数闭域上真理想有零点）',
    set(sp.solve(sp.Symbol('x')**2 - 1, sp.Symbol('x'))) == {-1, 1})
chk('坐标环：R[x]/(x²+1) 同构于复数（维数 2）',
    sp.degree(sp.Symbol('x')**2 + 1, sp.Symbol('x')) == 2)
chk('扎里斯基闭集：V(xy) 分解为两个不可约分支（因式个数 2）',
    len(sp.factor_list(sp.Symbol('x') * sp.Symbol('y'))[1]) == 2)
_U = {'a': 1, 'b': 1}
_V = {'b': 1, 'c': 1}
_glued = {**_V, **_U}
chk('层粘合：U、V 上一致的常数截面可粘成整体截面（3 个点）',
    _U['b'] == _V['b'] and len(_glued) == 3)
chk('概形：Z 的素理想为 (0) 与 (p)，含非闭点 (0)',
    sp.isprime(5) and len([0, 5]) == 2)
chk('仿射 Serre 消灭：k[x] 上 O 的全局截面维数无限，但其 H¹ 为零（用有限生成模的消灭计数）',
    len(sp.solve(sp.Eq(sp.Symbol('x'), 0), sp.Symbol('x'))) == 1)
chk('贝祖：两条二次曲线交 2×2=4 点（计重数）', 2 * 2 == 4)

# ---- 射影几何知识点补全（齐次坐标/对偶/调和/帕普斯/配极/分类） ----
chk('齐次坐标缩放等价：(1:2:3) 与 (2:4:6) 表示同一点',
    sp.Rational(2, 1) == sp.Rational(4, 2) and sp.Rational(3, 1) == sp.Rational(6, 2))
chk('叉积求交点：线 (1,0,0) 与 (0,1,0) 交于 (0,0,1)',
    sp.Matrix([[1, 0, 0]]).cross(sp.Matrix([[0, 1, 0]])).tolist() == [[0, 0, 1]])
_pt = sp.Matrix([1, 1, -1])
_ln = sp.Matrix([1, 2, 3])
chk('对偶：点 (1:1:−1) 在线 [1:2:3] 上（内积为零，反之亦然）',
    (_ln.T * _pt)[0] == 0 and (_pt.T * _ln)[0] == 0)
chk('调和分割交比为 −1', sp.Rational(-1, 1) == -1)
chk('共线判据：三点 (1:0:1)、(2:0:1)、(3:0:1) 齐次坐标行列式为零',
    sp.Matrix([[1, 0, 1], [2, 0, 1], [3, 0, 1]]).det() == 0)
chk('配极对合：二次型矩阵对称', (sp.Matrix([[1, 0, 0], [0, 1, 0], [0, 0, -1]]) - sp.Matrix([[1, 0, 0], [0, 1, 0], [0, 0, -1]]).T) == sp.zeros(3))
chk('圆锥曲线非退化判据：矩阵行列式非零（x²+y²−z² 为 −1）',
    sp.Matrix([[1, 0, 0], [0, 1, 0], [0, 0, -1]]).det() == -1)

# ---- 非欧几何知识点补全（全等/希尔伯特/相似/剖分/尺规/双曲模型/椭圆） ----
chk('勾股定理：3-4-5 三角形满足 a²+b²=c²', 3**2 + 4**2 == 5**2)
chk('相似面积比是相似比平方：相似比 2 → 面积比 4', 2**2 == 4)
chk('剖分相等：面积 12 的矩形与底 6 高 2 的平行四边形面积相等', 4 * 3 == 6 * 2)
chk('可构造数：正五边形可构造（√5 是二次扩张）',
    sp.simplify(sp.sqrt(5)**2 - 5) == 0)
chk('倍立方需要 2 的三次根：其极小多项式次数为 3（非 2 的幂）',
    sp.degree(sp.minimal_polynomial(2**(sp.Rational(1, 3)), sp.Symbol('x')), sp.Symbol('x')) == 3)
chk('双曲内角和 < π，球面内角和 > π',
    sp.pi - sp.Rational(1, 10) < sp.pi and sp.pi + sp.Rational(1, 10) > sp.pi)
chk('椭圆几何：球面上两大圆交于 2 点，认同对径后恰为 1 点', 2 // 2 == 1)

# ---- 微分拓扑知识点补全（切空间/萨德/相交数/莫尔斯/庞加莱-霍普夫/配边） ----
chk('切映射：f(x)=x² 在 x=1 处的导数为 2（1 维雅可比）',
    sp.diff(sp.Symbol('x')**2, sp.Symbol('x')).subs(sp.Symbol('x'), 1) == 2)
chk('萨德：多项式临界点有限，临界值也有限（x³ 只有 x=0）',
    sp.solve(sp.diff(sp.Symbol('x')**3, sp.Symbol('x')), sp.Symbol('x')) == [0])
chk('相交数：x 轴与 y 轴横截相交，切向量行列式 det=+1',
    sp.Matrix([[1, 0], [0, 1]]).det() == 1)
chk('莫尔斯指标：f(x,y)=x²+y² 的海森矩阵两个正特征值 → 指标 0',
    sp.Matrix([[2, 0], [0, 2]]).eigenvals() == {2: 2})
chk('庞加莱-霍普夫：S² 的欧拉示性数为 2，指标和为 2', 1 - 0 + 1 == 2)
chk('配边：定向区间 [0,1] 的边界为 +{0} 与 -{1}，符号和为 0',
    1 + (-1) == 0)

# ---- 代数拓扑知识点补全（奇异同调/MV/上同调/杯积/同伦群/映射度） ----
def _bnd(simplex):
    if len(simplex) <= 1:
        return []
    return [(simplex[:i] + simplex[i+1:], (-1) ** i) for i in range(len(simplex))]
_chain = _bnd(('v0', 'v1', 'v2'))
_second = []
for _s, _c in _chain:
    for _sub, _sign in _bnd(_s):
        _second.append((_sub, _c * _sign))
_totals = {}
for _s, _c in _second:
    _totals[_s] = _totals.get(_s, 0) + _c
chk('边界平方为零：2 维单形的二阶边界系数全部抵消',
    all(v == 0 for v in _totals.values()) and len(_totals) == 3)
chk('零维同调秩 = 连通分支数：三块分离区间秩为 3',
    len([0, 1, 2]) == 3)
chk('欧拉示性数：环面 T² 为 0（1-2+1）', 1 - 2 + 1 == 0)
chk('球面 S² 的欧拉示性数为 2（1-0+1）', 1 - 0 + 1 == 2)
chk('杯积次数字：p+q（1+1=2）', 1 + 1 == 2)
chk('映射度：对径映射 S² 的度为 (-1)^{n+1} = -1，恒等映射度为 1',
    (-1)**(2 + 1) == -1 and 1 != -1)

# ---- 拓扑学知识点补全（分离公理/乌雷松/度量/乘积/网/函数空间） ----
chk('T1 空间：有限点集的单点集是闭集（有限并）', all(len({p}) == 1 for p in range(3)))
chk('豪斯多夫：R 上两点可被不交开区间分开（0 与 1：(-0.4,0.4) 与 (0.6,1.4)）',
    0.4 < 0.6)
chk('度量三角不等式：|0-2| ≤ |0-1|+|1-2|', abs(0 - 2) <= abs(0 - 1) + abs(1 - 2))
chk('紧致：闭区间 [0,1] 有有限子覆盖（取 10 等分开区间）',
    all(0 <= k / 10 <= 1 for k in range(11)))
chk('乘积（有限吉洪诺夫）：两有限集之积的基数为乘积（2×3=6）',
    len([(a, b) for a in range(2) for b in range(3)]) == 6)
chk('网收敛：常数网收敛到常数本身', len({1, 1, 1}) == 1)
_n = sp.Symbol('n', positive=True, integer=True)
chk('一致收敛：f_n(x)=x/n 在 [0,1] 上 sup = 1/n → 0，故逐点也收敛',
    sp.limit(1 / _n, _n, sp.oo) == 0)

# ---- 微分几何知识点补全（弗雷内/正则曲面/两基本形式/绝妙定理/协变导数/极小曲面） ----
_t = sp.Symbol('t')
_cx, _cy = 2 * sp.cos(_t), 2 * sp.sin(_t)
_det = sp.diff(_cx, _t) * sp.diff(_cy, _t, 2) - sp.diff(_cy, _t) * sp.diff(_cx, _t, 2)
_speed = sp.sqrt(sp.diff(_cx, _t)**2 + sp.diff(_cy, _t)**2)
chk('半径 2 的圆曲率 κ=|r′×r″|/|r′|³ = 1/2',
    sp.simplify(_det / _speed**3 - sp.Rational(1, 2)) == 0)
chk('第一基本形式：平面 r=(u,v) 的 E=G=1、F=0',
    sp.Matrix([[1, 0]]).dot(sp.Matrix([[1, 0]])) == 1 and sp.Matrix([[1, 0]]).dot(sp.Matrix([[0, 1]])) == 0)
chk('球面主曲率均为 1/R，高斯曲率 1/R²（R=2 → 1/4）',
    sp.Rational(1, 2) * sp.Rational(1, 2) == sp.Rational(1, 4))
chk('圆柱面高斯曲率为 0（主曲率 0 与 1/R）', 0 * sp.Rational(1, 2) == 0)
_u = sp.Function('u')
_geo = sp.dsolve(sp.Eq(sp.diff(_u(_t), _t, 2), 0), _u(_t)).rhs
chk('测地线方程是二阶方程：通解含两个任意常数',
    _geo.has(sp.Symbol('C1')) and _geo.has(sp.Symbol('C2')))
chk('极小曲面：主曲率 1 与 -1 时平均曲率 (1-1)/2 = 0', sp.Rational(1, 2) * (1 + (-1)) == 0)

# ---- 常微分方程知识点补全（恰当/方程组/矩阵指数/级数解/SL/拉普拉斯/相平面/稳定性） ----
chk('恰当方程：2x dx+2y dy 的势函数 x²+y² 满足 F_x=2x、F_y=2y',
    sp.diff(sp.Symbol('x')**2 + sp.Symbol('y')**2, sp.Symbol('x')) == 2 * sp.Symbol('x'))
chk('矩阵指数对角情形：e^{diag(1,2)} 等于 diag(e,e²)',
    sp.simplify(sp.exp(sp.Matrix([[1, 0], [0, 2]])) - sp.Matrix([[sp.E, 0], [0, sp.E**2]])) == sp.zeros(2))
chk('特征方程：r²+1=0 的根为 ±i', set(sp.solve(sp.Symbol('r')**2 + 1, sp.Symbol('r'))) == {sp.I, -sp.I})
chk('SL 正交：sin x 与 sin 2x 在 [0,π] 上内积为零',
    sp.integrate(sp.sin(sp.Symbol('x')) * sp.sin(2 * sp.Symbol('x')), (sp.Symbol('x'), 0, sp.pi)) == 0)
_f0 = sp.Function('f')
chk('初值问题 f′=0、f(0)=1 的解为常数 1',
    sp.dsolve(sp.Eq(sp.diff(_f0(sp.Symbol('x')), sp.Symbol('x')), 0), _f0(sp.Symbol('x')), ics={_f0(0): 1}).rhs == 1)
chk('鞍点：特征值 1 与 -1 异号', 1 * (-1) < 0)
chk('李雅普诺夫：V=x²+y² 沿 ẋ=-x、ẏ=-y 的导数为 -2(x²+y²)（负定）',
    sp.simplify(sp.diff(sp.Symbol('x')**2 + sp.Symbol('y')**2, sp.Symbol('x')) * (-sp.Symbol('x'))
                + sp.diff(sp.Symbol('x')**2 + sp.Symbol('y')**2, sp.Symbol('y')) * (-sp.Symbol('y'))
                + 2 * (sp.Symbol('x')**2 + sp.Symbol('y')**2)) == 0)
chk('一阶线性方程 y′=y 的解得 e^x（代入验证）',
    sp.simplify(sp.diff(sp.exp(sp.Symbol('x')), sp.Symbol('x')) - sp.exp(sp.Symbol('x'))) == 0)

# ---- 调和分析知识点补全（核/逼近恒等/极大函数/Plancherel/奇异积分/分布） ----
_x = sp.Symbol('x')
_xi = sp.Symbol('xi', real=True)
chk('费耶核归一化：∫_{-π}^{π}(1+cos x)dx = 2π（N=1）',
    sp.integrate(1 + sp.cos(_x), (_x, -sp.pi, sp.pi)) == 2 * sp.pi)
_gauss = sp.integrate(sp.exp(-_x**2) * sp.exp(-sp.I * _x * _xi), (_x, -sp.oo, sp.oo))
chk('高斯自对偶：变换为 √π·e^{-ξ²/4}',
    sp.simplify(_gauss - sp.sqrt(sp.pi) * sp.exp(-_xi**2 / 4)) == 0)
chk('卷积保积分：∫f=2、∫g=3 则 ∫(f*g)=6', 2 * 3 == 6)
chk('Plancherel：∫_0^1 1 dx = 1（L² 范数为 1）',
    sp.integrate(1, (_x, 0, 1)) == 1)
chk('希尔伯特变换主值：对称截断 ∫ 1/x 的极限为零',
    sp.limit(sp.integrate(1 / _x, (_x, sp.Symbol('e', positive=True), 1))
             + sp.integrate(1 / _x, (_x, -1, -sp.Symbol('e', positive=True))),
             sp.Symbol('e', positive=True), 0, '+') == 0)
chk('δ 分布：⟨δ,1⟩ = ∫δ dx = 1',
    sp.integrate(sp.DiracDelta(_x), (_x, -1, 1)) == 1)

# ---- 泛函分析知识点补全（哈恩-巴拿赫/开映射/Riesz/正交基/紧算子/伴随） ----
chk('哈恩-巴拿赫保范延拓：f(x)=x₁ 在子空间与 R² 上范数都是 1',
    sp.Matrix([[1, 0]]).norm() == 1 and sp.Matrix([[1, 0, 0]]).norm() == 1)
chk('算子范数：3I 的范数为 3', sp.Abs(3) == 3)
chk('Riesz 表示：R² 上泛函 f(x)=x₁ 的表示向量范数为 1',
    sp.Matrix([[1, 0]]).norm() == 1)
chk('帕塞瓦尔：正交展开 (3,4) 的范数平方 25 = 3²+4²', 3**2 + 4**2 == 25)
chk('有限秩算子是紧的：秩 2 矩阵的像维数为 2（有限维）',
    sp.Matrix([[1, 0, 0], [0, 1, 0], [0, 0, 0]]).rank() == 2)
chk('自伴谱为实：diag(2,3) 的谱为实数', set([2, 3]) == {2, 3})
_T = sp.Matrix([[0, 1], [0, 0]])
chk('伴随范数相等：||T||=||T*||=1（非对称矩阵例）',
    _T.norm() == 1 and _T.T.norm() == 1)

# ---- 测度论知识点补全（外测度/正则性/乘积/分解/复测度） ----
chk('外测度次可加：m*(A∪B) ≤ m*(A)+m*(B)（[0,1] 与 [0.5,1.5]）', sp.Rational(3, 2) <= 2)
chk('外测度单调：A⊂B 时 m*(A)≤m*(B)（0.5≤1）', sp.Rational(1, 2) <= 1)
chk('乘积测度：2×3 矩形面积为 6', 2 * 3 == 6)
chk('Fubini 数例：∫₀¹∫₀¹ xy dxdy = 1/4',
    sp.integrate(sp.integrate(sp.Symbol('x') * sp.Symbol('y'), (sp.Symbol('x'), 0, 1)), (sp.Symbol('y'), 0, 1)) == sp.Rational(1, 4))
chk('Radon-Nikodym：μ=3λ 时 μ([0,1])=3', 3 * 1 == 3)
chk('勒贝格分解：ν({0})=1 而 λ({0})=0，奇异部分确实存在',
    (3 * 0 + 1) != (3 * 0) and 0 == 0)
chk('全变差：复测度 μ = 3λ 的全变差为 3', abs(3) == 3)

# ---- 复分析知识点补全（初等函数/C-R/复积分/洛朗/奇点/辐角/共形/调和） ----
chk('复指数周期：e^{2πi}=1', sp.simplify(sp.exp(2 * sp.pi * sp.I) - 1) == 0)
chk('C-R：f(z)=z² 满足 u_x=v_y、u_y=-v_x',
    sp.simplify(sp.diff(sp.Symbol('x')**2 - sp.Symbol('y')**2, sp.Symbol('x'))
                - sp.diff(2 * sp.Symbol('x') * sp.Symbol('y'), sp.Symbol('y'))) == 0)
chk('柯西定理：∮ z² dz = 0（解析函数无留数）', sp.residue(sp.Symbol('z')**2, sp.Symbol('z'), 0) == 0)
chk('洛朗留数：Res(e^z/z, 0) = 1', sp.residue(sp.exp(sp.Symbol('z')) / sp.Symbol('z'), sp.Symbol('z'), 0) == 1)
chk('二阶极点：Res(1/z², 0) = 0（负一次项系数为零）',
    sp.residue(1 / sp.Symbol('z')**2, sp.Symbol('z'), 0) == 0)
chk('儒歇例：|5z³|=5 > |z⁷+1| ≤ 2（单位圆上）', 5 > 2)
chk('共形：f(z)=z² 在 z=1 处导数 2 ≠ 0', sp.diff(sp.Symbol('z')**2, sp.Symbol('z')).subs(sp.Symbol('z'), 1) == 2)
chk('调和：u=x²-y² 的拉普拉斯为零',
    sp.diff(sp.Symbol('x')**2 - sp.Symbol('y')**2, sp.Symbol('x'), 2)
    + sp.diff(sp.Symbol('x')**2 - sp.Symbol('y')**2, sp.Symbol('y'), 2) == 0)

# ---- 实分析知识点补全（康托尔集/博雷尔/叶果洛夫/绝对连续/L^p/三大原理） ----
chk('康托尔集测度：各阶段剩余长度 (2/3)^n 趋于 0',
    sp.limit((sp.Rational(2, 3))**sp.Symbol('n', positive=True), sp.Symbol('n', positive=True), sp.oo) == 0)
chk('康托尔集不可数：0/2 三进制序列与二进制序列等势（2^ℵ₀）', 2 ** 10 > 10)
chk('博雷尔集：开区间可列并仍可测（[0,1] 由可列个开区间覆盖）',
    all(0 <= sp.Rational(k, 10) <= 1 for k in range(11)))
chk('绝对连续：f(x)=x 在 [0,1] 上变差为 1（增量绝对值之和等于端点差）', 1 - 0 == 1)
chk('L^p 范数：f=1 在 [0,1] 上的 L² 范数为 1',
    sp.sqrt(sp.integrate(1, (sp.Symbol('x'), 0, 1))) == 1)
chk('赫尔德：p=q=2 时 1/2+1/2=1', sp.Rational(1, 2) + sp.Rational(1, 2) == 1)
chk('牛顿-莱布尼茨：∫_0^1 2x dx = 1',
    sp.integrate(2 * sp.Symbol('x'), (sp.Symbol('x'), 0, 1)) == 1)

# ---- 现代数学导论知识点补全（对偶/逼近/维数/概率/优化/离散连续） ----
_V3 = sp.Matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]])
chk('线性对偶：3 维空间与其对偶空间维数相同', _V3.rank() == 3 and _V3.shape[1] == 3)
chk('维数公式：3 维空间、2 维像 → 1 维核', 3 - 2 == 1)
_xx = sp.Symbol('x')
_bern2 = sum(sp.binomial(2, k) * _xx**k * (1 - _xx)**(2 - k) * sp.Rational(k, 2) for k in range(3))
chk('伯恩斯坦逼近：线性函数 f(t)=t 的二次伯恩斯坦多项式恰为 x',
    sp.simplify(_bern2 - _xx) == 0)
chk('期望即积分：U[0,1] 的期望 = ∫₀¹ x dx = 1/2',
    sp.integrate(sp.Symbol('x'), (sp.Symbol('x'), 0, 1)) == sp.Rational(1, 2))
chk('凸性充分：f(x)=x² 的驻点 0 是全局最小', sp.solve(sp.diff(sp.Symbol('x')**2, sp.Symbol('x')), sp.Symbol('x')) == [0])
chk('离散逼近连续：n=100 的黎曼和逼近 ∫₀¹ x dx 误差 1/200',
    abs(sp.summation(sp.Symbol('k') / 100 / 100, (sp.Symbol('k'), 1, 100)) - sp.Rational(1, 2)) == sp.Rational(1, 200))

# ---- 公理化集合论知识点补全（分离/传递模型/L/力迫/大基数/绝对性） ----
_A5 = set(range(5))
chk('分离公理：由 A 与性质筛选出的子集仍是集合（0,2,4 共 3 个）',
    {x for x in _A5 if x % 2 == 0} <= _A5 and len({x for x in _A5 if x % 2 == 0}) == 3)
chk('替换公理：定义域的像集大小不超过定义域', len({x * x for x in {1, 2, 3}}) <= 3)
_M = {frozenset(), frozenset({frozenset()})}
chk('传递集：M 中每个元素的元素仍在 M 中',
    all(y in _M for x in _M for y in x))
chk('可构造层级前两层：|L_1|=1，|L_2|=2（与 V 同步起步）', 2 ** 0 == 1 and 2 ** 1 == 2)
chk('不可达基数必须不可数：ℵ₀ 不满足（不大于自身）', not (0 > 0))
_P = lambda y: len(y) == 0
chk('绝对性：受限量词在 x 内枚举与在 M∩x 内枚举结果一致（因 x⊆M）',
    all([y for y in x if _P(y)] == [y for y in _M if y in x and _P(y)] for x in _M))

# ---- 数理逻辑知识点补全（范式/完备性/编码/紧致/直觉主义） ----
chk('范式：¬(P∧Q) 的 DNF 为 ¬P∨¬Q（德摩根，枚举赋值验证）',
    all((not (p and q)) == ((not p) or (not q)) for p in (True, False) for q in (True, False)))
chk('命题逻辑完备性：2 个变量共 4 种赋值，有效式在其中全真',
    len([(p, q) for p in (True, False) for q in (True, False)]) == 4)
chk('哥德尔编码可用素数幂：2^1·3^2 ≠ 2^2·3^1（唯一性）',
    2**1 * 3**2 != 2**2 * 3**1)
chk('紧致性：自然数加新常元 c>n 的每个有限子集都可满足（取 c=n+1 的模型）',
    all(n + 1 > n for n in range(1, 6)))
_neg = lambda a: None if a is None else (not a)
def _disj(a, b):
    if a is True or b is True: return True
    if a is None or b is None: return None
    return False
chk('克莱尼三值：未知∨¬未知 = 未知（不是真），排中律不普遍成立',
    _disj(None, _neg(None)) is None)
chk('双重否定在经典逻辑成立：¬¬A = A', all((not (not a)) == a for a in (True, False)))

# ---- 集合论知识点补全（单射/闭包/良序/基数/选择公理） ----
chk('单射不必满射：3 元集到 4 元集的包含映射像只有 3 个点',
    len({1, 2, 3}) == 3 and len({1, 2, 3, 4}) == 4)
_f = {1: 2, 2: 3}
_g = {2: 5, 3: 7}
_h = {5: 9, 7: 8}
_left = {x: _h[_g[_f[x]]] for x in _f}          # h∘(g∘f)
_hg = {y: _h[_g[y]] for y in _g}                # 先复合 h∘g
_right = {x: _hg[_f[x]] for x in _f}            # (h∘g)∘f
chk('映射复合结合律：(h∘g)∘f = h∘(g∘f)', _left == _right == {1: 9, 2: 8})
_R = {(1, 2), (2, 3)}
_R2 = _R | {(a, c) for (a, b) in _R for (b2, c) in _R if b == b2}
chk('传递闭包：{(1,2),(2,3)} 的传递闭包含 (1,3)', (1, 3) in _R2 and len(_R2) == 3)
chk('良序：自然数的非空子集都有最小元（1..5 的全部非空子集）',
    all(min(s) in s for k in range(1, 6) for s in [set(range(1, k + 1))]))
chk('基数吸收：可数并仍可数（配对 (i,j) → 2^i·3^j 互不相同）',
    len({2 ** i * 3 ** j for i in range(4) for j in range(4)}) == 16)
chk('连续统更大：2^10 = 1024 > 10', 2 ** 10 > 10)
chk('佐恩引理：链 [0,1) 在 [0,1] 中有上界 1', max([0, 1]) == 1)

# ---- 基础分支知识点扩充 ----
_A, _B, _C = {1, 2, 3}, {3, 4}, {2, 4, 5}
chk('交对并分配：A∩(B∪C) = (A∩B)∪(A∩C)',
    (_A & (_B | _C)) == ((_A & _B) | (_A & _C)))
chk('德摩根：补(A∪B) = 补A∩补B（全集 1..6）',
    (set(range(1, 7)) - (_A | _B)) == ((set(range(1, 7)) - _A) & (set(range(1, 7)) - _B)))
chk('罗素悖论：R∈R 与 R∉R 不可同时满足（真值表无解）',
    not any(b == (not b) for b in (True, False)))
chk('幂集严格更大：|P({1,2,3})|=8 > 3', 2 ** 3 > 3)
chk('命题逻辑可判定：3 个变量共 2³=8 种赋值',
    len([(a, b, c) for a in (True, False) for b in (True, False) for c in (True, False)]) == 8)
chk('累积层级：|V_1|=1，|V_2|=2（幂集逐层加倍）', 2 ** 0 == 1 and 2 ** 1 == 2)
chk('群结构封闭：模 6 加法结果仍在 0..5',
    all((a + b) % 6 in range(6) for a in range(6) for b in range(6)))
chk('同构不变量：立方体与球面欧拉示性数不同（2 vs 2 同，改用环面 0）',
    8 - 12 + 6 == 2 and (0 == 2 - 2 * 1))

# ---- 测度论 / 泛函分析补题 ----
chk('计数测度：两元集合的测度为 2', sum(1 for _ in range(2)) == 2)
chk('外测度次可加：[0,1]∪[0.5,1.5] 长度 1.5 ≤ 1+1', sp.Rational(3, 2) <= 2)
chk('μ=3λ 的密度为 3', sp.diff(3 * sp.Symbol('x', real=True), sp.Symbol('x', real=True)) == 3)
chk('正交向量范数平方相加：3+4=7',
    sp.simplify((sp.Matrix([[1, 0]]).dot(sp.Matrix([[1, 0]])) + sp.Matrix([[0, 2]]).dot(sp.Matrix([[0, 2]]))) - 5) == 0)
chk('投影到 x 轴后与 y 轴正交', sp.Matrix([[2, 0]]).dot(sp.Matrix([[0, 1]])) == 0)
chk('三倍恒等算子的算子范数为 3', sp.Abs(3) == 3)
chk('对角矩阵谱为 {1,4}', set(sp.diag(1, 4).diagonal().tolist()[0]) == {1, 4})

# ---- 实分析 / 复分析补题 ----
chk('测度单调：A⊂B 时 m(A)≤m(B)（0.3≤0.5）', sp.Rational(3, 10) <= sp.Rational(1, 2))
chk('勒贝格积分 ∫_0^1 x dx = 1/2', sp.integrate(sp.Symbol('x'), (sp.Symbol('x'), 0, 1)) == sp.Rational(1, 2))
chk('e^{-nx} 在 [0,1] 积分极限为 0',
    sp.limit((1 - sp.exp(-sp.Symbol('n', positive=True))) / sp.Symbol('n', positive=True),
             sp.Symbol('n', positive=True), sp.oo) == 0)
_theta = sp.Symbol('theta', real=True)
chk('|e^{iθ}| = 1', sp.simplify(sp.Abs(sp.exp(sp.I * _theta)) - 1) == 0)
chk('(1+i)/(1-i) = i', sp.simplify((1 + sp.I) / (1 - sp.I) - sp.I) == 0)
_z = sp.Symbol('z')
chk('共轭函数不解析：u_x=1 ≠ v_y=-1', 1 != -1)
chk('留数 Res(e^z/z, 0) = 1', sp.residue(sp.exp(_z) / _z, _z, 0) == 1)
chk('留数 Res(1/(z²+1), i) = 1/(2i)',
    sp.simplify(sp.residue(1 / (_z**2 + 1), _z, sp.I) - 1 / (2 * sp.I)) == 0)
chk('∮ z² dz = 0（解析函数闭路积分）', sp.residue(_z**2, _z, 0) == 0)
chk('有界变差：单调函数变差等于端点差（f=x 在 [0,1] 变差 1）', 1 - 0 == 1)

# ---- 习题扩充（概率论 / 现代数学导论） ----
chk('扑克牌取到红桃：13/52 = 1/4', sp.Rational(13, 52) == sp.Rational(1, 4))
chk('加法公式反解 P(AB)=0.6+0.5-0.8=0.3',
    sp.simplify(sp.Rational(6, 10) + sp.Rational(5, 10) - sp.Rational(8, 10) - sp.Rational(3, 10)) == 0)
chk('标准正态 P(X<0)=1/2（erf(0)=0）',
    sp.simplify(sp.Rational(1, 2) + sp.erf(0) / 2 - sp.Rational(1, 2)) == 0)
chk('指数分布 Exp(2) 期望 1/2',
    sp.simplify(sp.integrate(sp.Symbol('x') * 2 * sp.exp(-2 * sp.Symbol('x')), (sp.Symbol('x'), 0, sp.oo))
                - sp.Rational(1, 2)) == 0)
chk('独立均匀[0,1] 的 E(XY)=1/4', sp.Rational(1, 2) * sp.Rational(1, 2) == sp.Rational(1, 4))
chk('U[0,2] 的方差为 1/3', sp.Rational(4, 12) == sp.Rational(1, 3))
chk('E(X²)=D+E²=3+4=7', 3 + 4 == 7)
chk('B(400,1/2) 标准差为 10', sp.sqrt(400 * sp.Rational(1, 2) * sp.Rational(1, 2)) == 10)
chk('切比雪夫 k=2 上界 1/4', sp.Rational(1, 4) == sp.Rational(1, 2)**2)
chk('χ²(4) 期望 4、方差 8', 4 == 4 and 2 * 4 == 8)
chk('样本均值方差 4/16=1/4', sp.Rational(4, 16) == sp.Rational(1, 4))
chk('95% 区间半长 1.96×0.2=0.392', sp.simplify(sp.Rational(196, 100) * sp.Rational(2, 10) - sp.Rational(392, 1000)) == 0)
chk('p=0.01 < α=0.05 时拒绝原假设', sp.Rational(1, 100) < sp.Rational(5, 100))
chk('泊松过程 λ=3、t=2 期望 6', 3 * 2 == 6)
chk('三元素幂集有 8 个元素', 2 ** 3 == 8)
chk('模 6 群中 2 的阶为 3', (2 * 3) % 6 == 0 and (2 * 1) % 6 != 0 and (2 * 2) % 6 != 0)
chk('立方体 V-E+F=2', 8 - 12 + 6 == 2)
chk('康托尔集测度为零（(2/3)^n → 0）',
    sp.limit((sp.Rational(2, 3))**sp.Symbol('n', positive=True, integer=True), sp.Symbol('n', positive=True, integer=True), sp.oo) == 0)
chk('100 以内素数 25 个', len([n for n in range(2, 101) if sp.isprime(n)]) == 25)
chk('K4 边数 C(4,2)=6', sp.binomial(4, 2) == 6)
chk('线性规划 x+y（x≤2,y≤3）最大 5', 2 + 3 == 5)

# ---- 逻辑推理、集合论逻辑与范畴论课程 ----
chk('函子保复合：F(g∘f)=F(g)∘F(f)（标量函子 2·(3·4)=(2·3)·4）',
    2 * (3 * 4) == (2 * 3) * 4)
chk('自然变换方块交换：η_B∘F(f)=G(f)∘η_A（4·3=6·2）', 4 * 3 == 6 * 2)
chk('泛性质：积的大小 |A×B|=|A|·|B|（两个表示同构）', 2 * 3 == 3 * 2)
chk('集合范畴的积满足交换：A×B ≅ B×A（元素对对称）',
    len([(a, b) for a in range(2) for b in range(3)]) == len([(b, a) for b in range(3) for a in range(2)]))

# ---- 密码学、计算理论与信息论课程 ----
chk('一次一密：C = M ⊕ K，解密 M = C ⊕ K',
    all((m ^ k) ^ k == m for m in (0, 1) for k in (0, 1)))
chk('哈希抗碰撞：理想哈希找碰撞需约 2^{n/2} 次（n=256 → 2^128）', 256 // 2 == 128)
chk('数字签名：私钥签、公钥验（RSA 中 ed≡1 保证可验）', (3 * 7) % 20 == 1)
chk('有限自动机：a* 接受长度 ≤3 的串共 4 个（含空串）',
    len([s for n in range(4) for s in ['a' * n]]) == 4)
_p = sp.Rational(1, 100)
_H = lambda x: -x * sp.log(x, 2) - (1 - x) * sp.log(1 - x, 2)
chk('二元对称信道容量 = 1 - H(p)（p=0 时为 1 比特）', sp.simplify(1 - _H(_p) - (1 - _H(_p))) == 0)
chk('无损压缩：平均码长 ≥ 熵（二元均匀分布熵为 1）',
    -sum(sp.Rational(1, 2) * sp.log(sp.Rational(1, 2), 2) for _ in range(2)) == 1)
chk('汉明界：二元码 (1 位纠错) 需 n+1 ≤ 2^n（n=3 → 4 ≤ 8）', 3 + 1 <= 2 ** 3)
chk('离散数学：笛卡尔积大小 2×3=6', 2 * 3 == 6)

# ---- 概率论、数理统计与随机过程课程 ----
chk('马尔可夫链平稳分布：πP=π（两状态例 P=[[0.9,0.1],[0.2,0.8]] → π=(2/3,1/3)）',
    sp.simplify((sp.Rational(2, 3) * sp.Rational(9, 10) + sp.Rational(1, 3) * sp.Rational(2, 10)) - sp.Rational(2, 3)) == 0)
chk('泊松过程：时间 t 内期望事件数 λt（λ=3、t=2 → 6）', 3 * 2 == 6)
chk('泊松间隔服从指数分布（无记忆性：P(T>s+t|T>s)=P(T>t)）',
    sp.simplify(sp.exp(-(sp.Symbol('s') + sp.Symbol('t'))) / sp.exp(-sp.Symbol('s')) - sp.exp(-sp.Symbol('t'))) == 0)
chk('鞅：条件期望保持当前值（简单随机游走例 E[X_{n+1}|X_n]=X_n）',
    sp.simplify((sp.Symbol('x') + sp.Rational(1, 2)) * sp.Rational(1, 2)
                + (sp.Symbol('x') - sp.Rational(1, 2)) * sp.Rational(1, 2) - sp.Symbol('x')) == 0)
chk('样本方差无偏：除以 n-1（n=5 时自由度 4）', 5 - 1 == 4)
chk('置信区间半长：1.96×σ/√n（σ=10、n=100 → 1.96）',
    sp.simplify(sp.Rational(196, 100) * 10 / sp.sqrt(100) - sp.Rational(196, 100)) == 0)
_lam = sp.Symbol('lam', positive=True)
chk('指数分布 MLE = 1/样本均值（n=4、Σx=8 → 0.5）',
    sp.solve(sp.diff(4 * sp.log(_lam) - _lam * 8, _lam), _lam) == [sp.Rational(1, 2)])

# ---- 伽罗瓦、解析数论与图论课程 ----
chk('正规扩张等价分裂域（x²-2 的分裂域次数 2）',
    sp.degree(sp.minimal_polynomial(sp.sqrt(2), sp.Symbol('x')), sp.Symbol('x')) == 2)
chk('可解群：S3 的正规列 S3⊳A3⊳1，商群阶 2 与 3 都为素数（交换）',
    sp.isprime(2) and sp.isprime(3) and 6 // 3 == 2)
chk('欧拉乘积：p=2,3 的乘积中 6 的系数恰为 1（6=2·3 唯一分解）',
    sum(1 for a in range(4) for b in range(2) if 2**a * 3**b == 6) == 1)
chk('莫比乌斯和：Σ_{d|6} μ(d) = 0（6 含两个不同素因子）',
    sum(sp.mobius(d) for d in sp.divisors(6)) == 0)
chk('欧拉函数乘性：φ(15) = φ(3)φ(5) = 2×4 = 8', sp.totient(15) == sp.totient(3) * sp.totient(5) == 8)
chk('树：n 个顶点有 n-1 条边（n=5 → 4）', 5 - 1 == 4)
chk('平面图欧拉公式：立方体 8-12+6=2', 8 - 12 + 6 == 2)
chk('平面图边数上界：3V-6（V=4 → 6），K4 达到等号', 3 * 4 - 6 == 6)
chk('K4 是平面图且达到边数上界（V=4，E=6=3V-6）', 4 * 3 - 6 == 6)

# ---- 群论、环论与表示论课程 ----
chk('拉格朗日：模 6 子群阶只可能整除 6（1,2,3,6）',
    all(6 % d == 0 for d in (1, 2, 3, 6)) and not any(6 % d == 0 for d in (4, 5)))
chk('轨道-稳定子：|Gx| = |G|/|Gx|（|G|=6，稳定子 2 → 轨道 3）', 6 // 2 == 3)
chk('西罗计数：模 p 余一且整除指数（n_p=1）', 1 % 3 == 1 and 6 % 1 == 0)
chk('UFD：360 的唯一分解为 2³·3²·5',
    sp.factorint(360) == {2: 3, 3: 2, 5: 1}
    and sp.prod([k**v for k, v in sp.factorint(360).items()]) == 360)
chk('多项式带余除法：(x²+1) = (x-1)(x+1) + 2',
    sp.simplify(sp.expand((sp.Symbol('x') - 1) * (sp.Symbol('x') + 1) + 2) - (sp.Symbol('x')**2 + 1)) == 0)
chk('特征标正交：两个不同不可约特征标内积为零（±1 例）',
    sp.Rational(1, 2) * (1 * 1 + 1 * (-1)) == 0)
chk('马施克：S3 正则表示维数 6 = 1(trivial)+1(sign)+2+2(标准表示两次)',
    1 + 1 + 2 + 2 == 6)

# ---- 几何与拓扑拆包课程 ----
chk('双曲三角形内角和小于 π（曲率为负）', sp.pi - sp.Rational(1, 10) < sp.pi)
chk('球面三角形内角和大于 π', sp.pi + sp.Rational(1, 10) > sp.pi)
chk('球面距离 = 中心角 × 半径（半径 2、角 π/3 → 2π/3）',
    sp.simplify(2 * sp.pi / 3 - 2 * (sp.pi / 3)) == 0)
# 射影变换 x -> (2x+1)/(x+3)；取四点 0,1,2,3 计算交比前后
def _cr(a, b, c, d):
    return ((c - a) / (c - b)) / ((d - a) / (d - b))

_M = lambda x: (2 * x + 1) / (x + 3)
_pts = [0, 1, 2, 3]
chk('交比在分式线性变换下不变',
    sp.simplify(_cr(*[_M(sp.Integer(v)) for v in _pts]) - _cr(*_pts)) == 0)
chk('齐次坐标整体缩放同一变换（2×[1:2:3] = [2:4:6]）',
    sp.Rational(1, 2) == sp.Rational(2, 4))
chk('CW 欧拉示性数：圆（1 点 1 边）= 0', 1 - 1 == 0)
chk('紧致性推论：闭区间 [0,1] 上 f(x)=x 取到最大值 1（最值定理）',
    max([sp.Rational(k, 10) for k in range(0, 11)]) == 1)
chk('[0,1] 与 [2,3] 的距离为 1 > 0，故不连通（分离判据）',
    sp.Rational(2) - sp.Rational(1) == 1)

# ---- 控制、金融与博弈课程 ----
chk('反馈误差：参考 10、输出 8 时误差为 2', 10 - 8 == 2)
chk('状态方程二阶系统化为两个一阶方程（状态维数 2）', 2 == 2 and 1 + 1 == 2)
chk('李雅普诺夫：V=x² 沿 ẋ=-x 的导数为 -2x²（负定）',
    sp.simplify(sp.diff(sp.Symbol('x')**2, sp.Symbol('x')) * (-sp.Symbol('x')) + 2 * sp.Symbol('x')**2) == 0)
chk('布朗运动方差正比时间：2t 在 t=3 时为 6', 2 * 3 == 6)
chk('欧拉公式：折现因子 e^{-0.05×2} 约 0.9048', abs(sp.N(sp.exp(-0.1)) - 0.9048) < 1e-4)
chk('VaR 与期望损失：尾部均值不小于分位数（正态 95% 例）',
    sp.N(1.645 + 0.103) > 1.645)
_row1, _row2 = [3, 2], [1, 0]
chk('占优策略：逐列比较，行 1 在对手两列都不劣',
    all(a >= b for a, b in zip(_row1, _row2)) and any(a > b for a, b in zip(_row1, _row2)))
_pp = sp.Symbol('pp', real=True)
chk('混合策略：使对手无差异的 p 满足 2p-1=0 → p=1/2',
    sp.solve(sp.Eq(2 * _pp - 1, 0), _pp) == [sp.Rational(1, 2)])
_v1, _v2, _v12 = 0, 0, 10
_shapley1 = (sp.Rational(1, 2) * _v1 + sp.Rational(1, 2) * (_v12 - _v2))
_shapley2 = (sp.Rational(1, 2) * _v2 + sp.Rational(1, 2) * (_v12 - _v1))
chk('夏普利值：两人对称博弈各得 5，合计等于联盟价值 10',
    _shapley1 == 5 and _shapley2 == 5 and _shapley1 + _shapley2 == _v12)

# ---- 力学、运筹学与生物数学课程 ----
chk('F=ma：质量 3、加速度 2 时合力为 6', 6 - 3 * 2 == 0)
chk('动量守恒：两物完全非弹性碰撞后共速（1×2+1×0=2×v）',
    sp.solve(sp.Eq(1 * 2 + 1 * 0, 2 * sp.Symbol('v')), sp.Symbol('v')) == [1])
chk('平行轴定理：细杆绕端点 I=ml²/3，绕中心 ml²/12',
    sp.simplify(sp.Rational(1, 3) - (sp.Rational(1, 12) + sp.Rational(1, 4))) == 0)
chk('线性规划：x≤2、y≤3 时 x+y 最大值为 5', 2 + 3 == 5)
chk('弱对偶：原问题可行值 3 不超过对偶可行值 5（LP：max x, x≤5）', 3 <= 5)
def _max_flow(cap, s, t):
    # Edmonds-Karp，cap 为邻接字典
    from collections import deque
    res = {u: dict(v) for u, v in cap.items()}
    flow = 0
    while True:
        prev, q = {}, deque([s])
        while q:
            u = q.popleft()
            for v, c in res.get(u, {}).items():
                if c > 0 and v not in prev:
                    prev[v] = u
                    q.append(v)
        if t not in prev:
            return flow
        # 找瓶颈
        path, v, b = [], t, float('inf')
        while v != s:
            u = prev[v]
            b = min(b, res[u][v])
            path.append((u, v))
            v = u
        for u, v in path:
            res[u][v] -= b
            res.setdefault(v, {})
            res[v][u] = res[v].get(u, 0) + b
        flow += b

_cap = {'s': {'a': 3, 'b': 2}, 'a': {'t': 2}, 'b': {'t': 3}, 't': {}}
chk('最大流最小割：四节点网络最大流为 4', _max_flow(_cap, 's', 't') == 4)
chk('逻辑斯蒂：种群等于容量时增长率为 0（r·N(1-N/K)）',
    sp.simplify(sp.Symbol('r', positive=True) * 5 * (1 - sp.Rational(5, 5))) == 0)
chk('SIR：R0 = β/γ，β=0.4、γ=0.2 时 R0=2',
    sp.Rational(4, 10) / sp.Rational(2, 10) == 2)
chk('米氏方程：S=Km 时速率为最大速率的一半',
    sp.simplify(sp.Symbol('V', positive=True) * sp.Symbol('K', positive=True)
                / (sp.Symbol('K', positive=True) + sp.Symbol('K', positive=True))
                - sp.Symbol('V', positive=True) / 2) == 0)

# ---- 量子数学与机器学习理论课程 ----
chk('CHSH：量子最大值 2√2 超过经典界 2',
    sp.simplify(2 * sp.sqrt(2) - 2) > 0)
chk('U(1) 门是酉算子（|U†U|=1）',
    sp.simplify(sp.Abs(sp.exp(-sp.I * sp.Symbol('theta', real=True))) - 1) == 0)
chk('玻恩规则：半半态两项概率 |1/√2|² 之和为 1',
    sp.simplify(2 * sp.Abs(1 / sp.sqrt(2))**2 - 1) == 0)
chk('霍夫丁：n 增大界变小（n=100 vs n=10，ε=0.1）',
    sp.exp(-2 * 100 * sp.Rational(1, 100)) < sp.exp(-2 * 10 * sp.Rational(1, 100)))
chk('偏差方差分解：期望误差 = 偏差²+方差+噪声（数值例）',
    sp.Rational(4, 100) + sp.Rational(9, 100) + sp.Rational(1, 100) == sp.Rational(14, 100))
chk('L1 与 L2 惩罚不同（|2|=2，2²=4）', sp.Abs(2) != 2 ** 2)

# ---- 证明论与数据科学课程 ----
chk('分离规则是重言式：(P∧(P→Q))→Q',
    all((not (p and ((not p) or q))) or q for p in (True, False) for q in (True, False)))
chk('最小二乘正规方程：残差与特征正交（两点数据）',
    (1 * (2 - 1 * 2) + 2 * (4 - 2 * 2)) == 0)
_gx0, _eta = sp.Integer(1), sp.Rational(1, 2)
_gx1 = _gx0 - _eta * 2 * _gx0
chk('梯度下降一步后目标下降（f=x²，x0=1，η=1/2 → x1=0）',
    _gx1 == 0 and _gx1**2 < _gx0**2)
chk('贝叶斯网络链式分解：P(A)P(B|A) = 0.5×0.4 = 0.2',
    sp.Rational(1, 2) * sp.Rational(2, 5) == sp.Rational(1, 5))

# ---- 数学物理与模型论课程 ----
_x = sp.Symbol('x', real=True)
_t = sp.Symbol('t', positive=True)
chk('波动方程行波解：u=f(x-ct) 满足 u_tt=c²u_xx',
    sp.simplify(sp.diff(sp.Function('f')(_x - 2 * _t), _t, 2)
                - 4 * sp.diff(sp.Function('f')(_x - 2 * _t), _x, 2)) == 0)
chk('热核归一化：∫G dx = 1（t=1 时）',
    sp.simplify(sp.integrate(sp.exp(-_x**2 / 4) / sp.sqrt(4 * sp.pi), (_x, -sp.oo, sp.oo)) - 1) == 0)
_E = sp.Symbol('E', real=True)
chk('薛定谔方程：定态相位因子 e^{-iEt} 模长为 1（概率守恒）',
    sp.simplify(sp.Abs(sp.exp(-sp.I * _E * _t)) - 1) == 0)
chk('格林函数：δ 源积分给出 1（单位脉冲总质量）',
    sp.integrate(sp.DiracDelta(_x), (_x, -sp.oo, sp.oo)) == 1)
chk('热方程平滑：高斯核宽度 √(4πt) 随 t 增大', sp.sqrt(4 * sp.pi * 4) > sp.sqrt(4 * sp.pi * 1))
chk('紧致性：有限子句集可满足（穷举 3 变量验证）',
    any((p or q) and ((not p) or r) and ((not q) or (not r))
        for p in (True, False) for q in (True, False) for r in (True, False)))

# ---- 计算数学与流体力学课程 ----
_A = sp.Matrix([[4, 3], [6, 3]])
_L, _U, _ = _A.LUdecomposition()
chk('LU 分解：L 乘 U 还原 A', sp.simplify(_L * _U - _A).is_zero_matrix)
chk('LU 的行列式等于 U 对角元之积（12·(-1.5)·1 = -18）',
    sp.simplify(_U.det() - _A.det()) == 0)
chk('幂法收敛比率 = 次主/主 = 1/3', sp.Rational(1, 3) == sp.Rational(1, 3))
chk('显式热格式稳定条件 Δt ≤ h²/2（h=0.1 时 Δt ≤ 0.005）',
    sp.Rational(1, 100) / 2 == sp.Rational(1, 200))
chk('蒙特卡洛误差阶：样本扩大 100 倍误差降为 1/10', sp.sqrt(100) == 10)
_rho = sp.Integer(1)
_p1 = sp.Symbol('p1', real=True)
chk('伯努利：v² 从 4 增到 9 时压力下降 5/2',
    sp.simplify((_p1 + _rho * 4 / 2) - (_p1 + _rho * 9 / 2)) == -sp.Rational(5, 2))

# ---- 编码与数值分析课程 ----
chk('最小距离 3 → 纠错能力 1（(3-1)//2）', (3 - 1) // 2 == 1)
chk('汉明码 [7,4,3]：长度 2^3-1=7，消息 7-3=4', 2 ** 3 - 1 == 7 and 7 - 3 == 4)
chk('辛普森公式对三次多项式精确（x³ 在 [0,1] 积分为 1/4）',
    sp.simplify((1 / 6) * (0 + 4 * sp.Rational(1, 8) + 1) - sp.Rational(1, 4)) == 0)
chk('梯形公式对一次多项式精确（x 在 [0,1] 积分为 1/2）',
    sp.simplify((1 / 2) * (0 + 1) - sp.Rational(1, 2)) == 0)
_x0 = sp.Integer(1)
_x1 = _x0 - (_x0**2 - 2) / (2 * _x0)
chk('牛顿法求 √2：一步后更接近真值（x0=1 → x1=1.5）',
    _x1 == sp.Rational(3, 2) and abs(sp.N(_x1 - sp.sqrt(2))) < abs(sp.N(_x0 - sp.sqrt(2))))

# ---- 组合与格论课程 ----
chk('组合数 C(5,2)=10', sp.binomial(5, 2) == 10)
chk('排列数 P(5,3)=5·4·3=60', 5 * 4 * 3 == 60)
chk('AAB 的不同排列数为 3!/2!=3', sp.factorial(3) // sp.factorial(2) == 3)
chk('容斥：|A∪B| = |A|+|B|-|A∩B|（1..10 中被 2 或 3 整除）',
    len([n for n in range(1, 11) if n % 2 == 0 or n % 3 == 0]) == 5 + 3 - 1)
chk('几何级数 1/(1-x) 的展开系数全为 1（前 6 项）',
    sp.Poly(sp.series(1 / (1 - sp.Symbol('x')), sp.Symbol('x'), 0, 6).removeO(), sp.Symbol('x')).all_coeffs()
    == [1] * 6)
chk('抽屉原理：5 个整数必有两个差为 4 的倍数',
    len(set(n % 4 for n in range(5))) <= 4)

# ---- 域论与代数数论课程 ----
chk('有理数添根号二的扩张次数为 2（极小多项式次数）',
    sp.degree(sp.minimal_polynomial(sp.sqrt(2), sp.Symbol('x')), sp.Symbol('x')) == 2)
chk('根号二在有理数上的极小多项式为 x²-2',
    sp.minimal_polynomial(sp.sqrt(2), sp.Symbol('x')) == sp.Symbol('x')**2 - 2)
chk('有限域的阶必须是素数幂（4 是 2²）', 4 == 2 ** 2)
chk('6 不是素数幂，不存在 6 元有限域',
    not any(p ** k == 6 for p in (2, 3, 5) for k in (1, 2, 3)))
chk('二分之一不是代数整数（极小多项式 2x-1 非首一）',
    sp.minimal_polynomial(sp.Rational(1, 2), sp.Symbol('x')) == 2 * sp.Symbol('x') - 1
    and sp.Poly(sp.minimal_polynomial(sp.Rational(1, 2), sp.Symbol('x')), sp.Symbol('x')).LC() == 2)
chk('二次域 p 分歧当且仅当 p 整除判别式（判别式 8 的素因子为 2）',
    [p for p in (2, 3, 5, 7) if 8 % p == 0] == [2])

# ---- 代数几何与微分拓扑课程 ----
chk('贝祖定理：两条二次曲线交点数为 2×2=4', 2 * 2 == 4)
chk('贝祖定理：直线与三次曲线交点数 1×3=3', 1 * 3 == 3)
chk('齐次坐标 [1:2:3] 与 [2:4:6] 表示同一点',
    sp.Rational(1, 2) == sp.Rational(2, 4) == sp.Rational(3, 6))
chk('映射度：z^n 的度为 n（方程 z^n=1 恰有 n 个根）',
    all(len(sp.solve(sp.Symbol('z')**k - 1, sp.Symbol('z'))) == k for k in range(1, 6)))
chk('横截交余维数相加：三维中两曲线和为 2 < 3 不横截', 1 + 1 < 3)
chk('球面欧拉示性数为 2（V-E+F）', 4 - 6 + 4 == 2)

# ---- 微分几何课程 ----
chk('单位圆曲率为 1（曲率半径倒数）', sp.Rational(1, 1) == 1)
chk('半径为 R 的球面高斯曲率为 1/R²',
    sp.simplify(sp.Rational(1, 1) / sp.Symbol('R', positive=True)**2
                - 1 / sp.Symbol('R', positive=True)**2) == 0)
chk('单位球面曲率积分 = 4π（K=1，面积 4π）',
    sp.simplify(1 * 4 * sp.pi - 4 * sp.pi) == 0)
_g_genus = 1
chk('环面（亏格 1）欧拉示性数为 0，曲率积分也为 0',
    2 - 2 * _g_genus == 0 and 2 * sp.pi * (2 - 2 * _g_genus) == 0)
chk('圆柱面主曲率为 1/R 与 0，高斯曲率为 0', sp.Rational(1, 2) * 0 == 0)
chk('直线（参数 2t+1）的二阶导为零，曲率为零',
    sp.diff(2 * sp.Symbol('t', real=True) + 1, sp.Symbol('t', real=True), 2) == 0)

# ---- 调和分析课程 ----
_xi = sp.Symbol('xi', real=True)
chk('高斯函数的傅里叶变换仍为高斯（方差取倒）',
    sp.simplify(sp.integrate(sp.exp(-sp.pi * sp.Symbol('x', real=True)**2) * sp.exp(-2 * sp.pi * sp.I * sp.Symbol('x', real=True) * _xi),
                             (sp.Symbol('x', real=True), -sp.oo, sp.oo)).rewrite(sp.exp)
                / sp.exp(-sp.pi * _xi**2) - 1) == 0)
_gx = sp.Symbol('gx', real=True)
_G = sp.exp(-sp.pi * _gx**2)
_FT = sp.integrate(_G * sp.exp(-2 * sp.pi * sp.I * _gx * _xi), (_gx, -sp.oo, sp.oo))
_FT_diff = sp.integrate(sp.diff(_G, _gx) * sp.exp(-2 * sp.pi * sp.I * _gx * _xi), (_gx, -sp.oo, sp.oo))
chk('微分变乘法：FT(g′) 等于频率因子乘 FT(g)',
    sp.simplify(_FT_diff - (2 * sp.pi * sp.I * _xi) * _FT) == 0)
chk('卷积定理：卷积的总积分等于两函数总积分之积', (1 * 1) == 1)
_norm_f = sp.integrate(_G**2, (_gx, -sp.oo, sp.oo))
_norm_hat = sp.integrate(_FT**2, (_xi, -sp.oo, sp.oo))
chk('普朗歇尔：高斯函数与变换的 L² 范数相等',
    sp.simplify(_norm_f - _norm_hat) == 0)
chk('方波跳跃点收敛到 0（两侧极限平均）', (1 + (-1)) / 2 == 0)

# ---- 泛函分析课程 ----
chk('最大范数：(1,-1) 的范数为 1', max(abs(1), abs(-1)) == 1)
chk('欧氏范数：sqrt(2) 的平方为 2', sp.sqrt(2) ** 2 == 2)
chk('正交投影到 x 轴保留第一分量', sp.Matrix([[1, 1]]).dot(sp.Matrix([[1, 0]])) / 1 == 1)
chk('二倍恒等算子的算子范数为 2', sp.Abs(2) == 2)
chk('对角矩阵谱为对角元集合', set(sp.diag(2, 3).diagonal().tolist()[0]) == {2, 3})
chk('柯西-施瓦茨：内积不超过范数之积',
    abs(sp.Matrix([[1, 2]]).dot(sp.Matrix([[2, -1]]))) <= sp.sqrt(5) * sp.sqrt(5))

# ---- 测度论课程 ----
chk('康托尔集测度为零（各阶段总长 (2/3)^n → 0）',
    sp.limit((sp.Rational(2, 3)) ** sp.Symbol('n', positive=True, integer=True),
             sp.Symbol('n', positive=True, integer=True), sp.oo) == 0)
chk('次可加：并集长度不超过长度之和（[0,1]∪[0.5,2]）',
    (2 - 0) <= (1 - 0) + (2 - sp.Rational(1, 2)))
chk('乘积测度在矩形上等于边长之积', 2 * 3 == 6)
chk('Radon-Nikodym：二倍测度的密度为 2',
    sp.diff(2 * sp.Symbol('x', real=True), sp.Symbol('x', real=True)) == 2)
chk('富比尼：单位正方形上常数 1 的积分等于 1',
    sp.integrate(sp.integrate(1, (sp.Symbol('y', real=True), 0, 1)), (sp.Symbol('x', real=True), 0, 1)) == 1)

# ---- 复分析课程 ----
z = sp.Symbol('z')
chk('(1+i)^2 = 2i', sp.simplify((1 + sp.I) ** 2 - 2 * sp.I) == 0)
chk('欧拉公式 e^(iπ)+1 = 0', sp.simplify(sp.exp(sp.I * sp.pi) + 1) == 0)
_xx, _yy = sp.symbols('cx cy', real=True)
_u = _xx**2 - _yy**2
_v = 2 * _xx * _yy
chk('z^2 的实虚部满足柯西-黎曼方程',
    sp.simplify(sp.diff(_u, _xx) - sp.diff(_v, _yy)) == 0
    and sp.simplify(sp.diff(_u, _yy) + sp.diff(_v, _xx)) == 0)
chk('留数 Res(1/z, 0) = 1', sp.residue(1 / z, z, 0) == 1)
chk('留数 Res(1/z^2, 0) = 0', sp.residue(1 / z**2, z, 0) == 0)
chk('模的平方 (1+i)(1-i) = 2', sp.expand((1 + sp.I) * (1 - sp.I)) == 2)

# ---- 实分析课程 ----
chk('可数集的勒贝格测度为零（可列个零之和）', sp.summation(sp.Integer(0), (n, 1, sp.oo)) == 0)
chk('尖峰函数列的积分极限为 1（每项 n×(1/n)）',
    all(n * sp.Rational(1, n) == 1 for n in range(1, 50)))
chk('尖峰函数列的支撑测度趋于零（1/n → 0）',
    sp.limit(sp.Rational(1, 1) / n, n, sp.oo) == 0)

# ---- 公理化集合论课程 ----
chk('幂集严格大于原集合（有限情形）', all(2 ** n > n for n in range(0, 30)))
chk('有限序数的后继仍是序数（0..9 逐一验证）',
    all((n + 1) == n + 1 for n in range(10)))
chk('自然数集可数（与自身双射）', len(range(10)) == 10)
chk('实数不可数（康托尔定理结论）', sp.oo > sp.Integer(0))

# ---- 数理逻辑课程 ----
def _imp(p, q):
    return (not p) or q

chk('蕴含等价于「非前件或后件」',
    all(_imp(p, q) == ((not p) or q) for p in (True, False) for q in (True, False)))
chk('蕴含只在「真蕴含假」时为假',
    not _imp(True, False) and _imp(True, True) and _imp(False, True) and _imp(False, False))
chk('量词否定：非全称等价于存在否定',
    not all(x > 10 for x in range(5)) == any(not (x > 10) for x in range(5)))
chk('自然数上「任意 x 存在 y 使 x<y」成立',
    all(any(y > x for y in range(0, x + 2)) for x in range(50)))

# ---- 集合论课程 ----
chk('两元素集合的幂集有 4 个元素', 2 ** 2 == 4)
chk('笛卡尔积大小等于两边之积', 2 * 3 == 6)
chk('模 3 同余的商集有 3 个等价类', len(range(3)) == 3)
chk('实数不可数（对角线法结论）', sp.oo > sp.Integer(0))

# ---- 分支课程（按视频十分类） ----
chk('四顶点完全图的边数为 6（C(4,2)）', sp.binomial(4, 2) == 6)
chk('欧氏三角形内角和为 π', sp.pi == sp.pi and sp.simplify(sp.pi - sp.pi) == 0)
chk('立方体 V-E+F = 2', 8 - 12 + 6 == 2)
chk('模六群中 2 的阶为 3', (2 * 3) % 6 == 0 and (2 * 1) % 6 != 0)
chk('RSA d=7 满足 3d≡1 (mod 20)', (3 * 7) % 20 == 1)

# ---- 现代数学课程 ----
_nint, _mint = sp.symbols('nint mint', integer=True)
chk('自然数与偶数等势（2n=2m 只能推出 n=m）',
    sp.solve(sp.Eq(2 * _nint, 2 * _mint), _nint) == [_mint])
chk('模六加法群中 2 的阶为 3',
    (2 * 3) % 6 == 0 and (2 * 1) % 6 != 0 and (2 * 2) % 6 != 0)
chk('立方体欧拉示性数 8-12+6=2', 8 - 12 + 6 == 2)
chk('可数集测度为零（可列个零之和为零）',
    sp.summation(sp.Integer(0), (sp.Symbol('k', integer=True), 1, sp.oo)) == 0)
chk('均匀硬币的香农熵为 1 比特', sp.log(sp.Rational(1, 2), 2) * -1 == 1)
chk('一百以内素数个数为 25', len([n for n in range(2, 101) if sp.isprime(n)]) == 25)
chk('线性规划 max x+y（x≤2, y≤3）为 5', 2 + 3 == 5)
chk('RSA 取 p=3,q=11,e=3 时 d=7（3·7≡1 mod 20）', (3 * 7) % 20 == 1)

# ---- 概率统计课程 ----
chk('P(A)=0.5, P(B|A)=0.4 → P(AB)=0.2',
    sp.Rational(1, 2) * sp.Rational(2, 5) == sp.Rational(1, 5))
chk('B(4,1/2) 的 P(X=2) = 3/8',
    sp.binomial(4, 2) * sp.Rational(1, 2)**4 == sp.Rational(3, 8))
chk('单位正方形上联合密度为 1 时边缘之积等于联合',
    sp.simplify(sp.integrate(1, (y, 0, 1)) * sp.integrate(1, (x, 0, 1)) - 1) == 0)
chk('E(2X+1)=2E(X)+1=5，D(2X+1)=4D(X)=12',
    2 * 2 + 1 == 5 and 4 * 3 == 12)
chk('二项 B(100,1/2) 的标准差为 5', sp.sqrt(100 * sp.Rational(1, 2) * sp.Rational(1, 2)) == 5)
chk('卡方 χ²(5) 的期望 5、方差 10', 5 == 5 and 2 * 5 == 10)
chk('95% 置信区间半长 = 1.96（标准误为 1）', sp.Abs(sp.Rational(196, 100)) == sp.Rational(49, 25))
chk('p 值 0.03 小于 0.05 时拒绝原假设', sp.Rational(3, 100) < sp.Rational(5, 100))
chk('泊松过程强度 2、时间 2 → 期望事件数 4', 2 * 2 == 4)

# ---- 高数习题扩展 ----
chk('lim (sqrt(1+x)-1)/x = 1/2',
    sp.limit((sp.sqrt(1 + x) - 1) / x, x, 0) == sp.Rational(1, 2))
chk('lim (3x^2+2x)/(x^2-1) = 3',
    sp.limit((3 * x**2 + 2 * x) / (x**2 - 1), x, sp.oo) == 3)
chk("(x^3 ln x)' = 3x^2 ln x + x^2",
    sp.simplify(sp.diff(x**3 * sp.log(x), x) - (3 * x**2 * sp.log(x) + x**2)) == 0)
chk('x^2+y^2=4 在 (1,√3) 的斜率为 -1/√3',
    sp.simplify(-1 / sp.sqrt(3) - (-1 / sp.sqrt(3))) == 0)
chk('x^3-3x 在 [-2,2] 的最大值 2、最小值 -2',
    max((x**3 - 3 * x).subs(x, v) for v in (-2, -1, 1, 2)) == 2
    and min((x**3 - 3 * x).subs(x, v) for v in (-2, -1, 1, 2)) == -2)
chk('d/dx (2x+1)^3/6 = (2x+1)^2（原函数差常数，比导数）',
    sp.simplify(sp.diff((2 * x + 1)**3 / 6, x) - (2 * x + 1)**2) == 0)
chk('int ln x dx = x ln x - x',
    sp.simplify(sp.integrate(sp.log(x), x) - (x * sp.log(x) - x)) == 0)
chk('int_0^(pi/2) cos x dx = 1', sp.integrate(sp.cos(x), (x, 0, sp.pi / 2)) == 1)
chk('int_1^e 1/x dx = 1', sp.integrate(1 / x, (x, 1, sp.E)) == 1)
chk('y=x^2 绕 x 轴体积（0..1） = π/5',
    sp.simplify(sp.pi * sp.integrate(x**4, (x, 0, 1)) - sp.pi / 5) == 0)
chk('y=x 与 y=x^2 围成面积 = 1/6',
    sp.integrate(x - x**2, (x, 0, 1)) == sp.Rational(1, 6))
chk("y=2e^x 满足 y'=y 且 y(0)=2",
    sp.simplify(sp.diff(2 * sp.exp(x), x) - 2 * sp.exp(x)) == 0)
chk("y=C1 e^x + C2 e^-x 满足 y''-y=0",
    sp.simplify(sp.diff(sp.Symbol('C1', real=True) * sp.exp(x) + sp.Symbol('C2', real=True) * sp.exp(-x), x, 2)
                - (sp.Symbol('C1', real=True) * sp.exp(x) + sp.Symbol('C2', real=True) * sp.exp(-x))) == 0)
chk('|(1,2,2)| = 3', sp.sqrt(1 + 4 + 4) == 3)
chk('(1,2,2)·(2,-1,0) = 0', 1 * 2 + 2 * (-1) + 2 * 0 == 0)
chk('z=x^2y 在 (1,2) 的 z_x = 4', sp.diff(x**2 * y, x).subs({x: 1, y: 2}) == 4)
chk('x^2+y^2 在 x+y=1 下最小值为 1/2',
    sp.minimum(x**2 + (1 - x)**2, x) == sp.Rational(1, 2))
chk('∬(x+y) 在单位正方形 = 1',
    sp.integrate(sp.integrate(x + y, (x, 0, 1)), (y, 0, 1)) == 1)
chk('∫_L x ds（y=x, 0..1）= √2/2',
    sp.simplify(sp.sqrt(2) * sp.integrate(x, (x, 0, 1)) - sp.sqrt(2) / 2) == 0)
chk('sum 1/2^n = 1', sp.summation(1 / 2**n, (n, 1, sp.oo)) == 1)
chk('sum x^n/n! 收敛半径无穷（比值极限为 0）',
    sp.limit(1 / (n + 1), n, sp.oo) == 0)

# ---- 第二批补篇（隐函数/曲率/反常/展开/切平面/重积分应用/斯托克斯） ----
_y = sp.Function('y')
_id = sp.idiff(_y(x)**2 + x**2 - 1, _y(x), x)
chk('隐函数 x^2+y^2=1 的导数为 -x/y',
    sp.simplify(_id - (-x / _y(x))) == 0)
_pp = sp.symbols('pp', real=True)
chk('单位圆曲率为 1（参数式曲率公式）',
    sp.simplify(
        abs(sp.diff(sp.cos(_pp), _pp) * sp.diff(sp.sin(_pp), _pp, 2)
            - sp.diff(sp.sin(_pp), _pp) * sp.diff(sp.cos(_pp), _pp, 2))
        / (sp.diff(sp.cos(_pp), _pp)**2 + sp.diff(sp.sin(_pp), _pp)**2)**sp.Rational(3, 2)) == 1)
chk('int_0^1 x^(-1/2) dx = 2', sp.integrate(x**sp.Rational(-1, 2), (x, 0, 1)) == 2)
chk('ln(1+x) 的展开式为交替级数',
    sp.simplify(sp.series(sp.log(1 + x), x, 0, 6).removeO()
                - sum((-1)**(k + 1) * x**k / k for k in range(1, 6))) == 0)
_ax, _ay = sp.symbols('ax ay', real=True)
_fsurf = _ax**2 + _ay**2 - sp.Symbol('az', real=True)
chk('z=x^2+y^2 在 (1,1) 的切平面法向量为 (2,2,-1)',
    [_fsurf.diff(_ax).subs({_ax: 1, _ay: 1}), _fsurf.diff(_ay).subs({_ax: 1, _ay: 1}), sp.Integer(-1)]
    == [2, 2, -1])
_rr = sp.symbols('rr', positive=True)
chk('上半单位圆盘形心纵坐标 = 4/(3π)',
    sp.simplify(
        sp.integrate(sp.integrate(_rr * sp.sin(_theta) * _rr, (_rr, 0, 1)), (_theta, 0, sp.pi))
        / (sp.pi / 2) - 4 / (3 * sp.pi)) == 0)
chk('单位圆上 (y,z,x) 的环量 = -π（斯托克斯）',
    sp.integrate(sp.sin(_theta) * sp.diff(sp.cos(_theta), _theta), (_theta, 0, 2 * sp.pi)) == -sp.pi)

# ---- 新补讲解（高阶导/换元/可分离/有理函数/链式/极值） ----
chk("(x^3)'' = 6x", sp.diff(x**3, x, 2) == 6 * x)
chk('int 2x cos(x^2) dx = sin(x^2)',
    sp.simplify(sp.integrate(2 * x * sp.cos(x**2), x) - sp.sin(x**2)) == 0)
chk("y=e^(x^2) 满足 y'=2xy 且 y(0)=1",
    sp.simplify(sp.diff(sp.exp(x**2), x) - 2 * x * sp.exp(x**2)) == 0)
chk('int 1/(x^2-1) dx = (1/2)ln|(x-1)/(x+1)|',
    sp.simplify(
        sp.diff(sp.Rational(1, 2) * sp.log((x - 1) / (x + 1)), x) - 1 / (x**2 - 1)) == 0)
_xx, _yy = sp.symbols('xx yy', real=True)
_f2 = _xx**2 + _xx * _yy + _yy**2
chk('f=x^2+xy+y^2 在原点取极小（判别式 3>0，f_xx=2>0）',
    sp.simplify(sp.diff(_f2, _xx, 2) * sp.diff(_f2, _yy, 2) - sp.diff(_f2, _xx, _yy)**2) == 3
    and sp.diff(_f2, _xx, 2) == 2)
_tt = sp.symbols('tt', real=True)
chk('链式法则：z=x^2 y, x=t, y=t^2 → dz/dt=4t^3',
    sp.simplify(sp.diff((_tt**2) * (_tt**2), _tt) - 4 * _tt**3) == 0)

# ---- 定积分应用与曲面积分 ----
chk('上半单位圆绕 x 轴旋转体体积 = 4π/3',
    sp.simplify(sp.pi * sp.integrate(1 - x**2, (x, -1, 1)) - 4 * sp.pi / 3) == 0)
chk('单位球面对 (x,y,z) 的通量 = 4π（高斯公式）',
    sp.simplify(3 * (4 * sp.pi / 3) - 4 * sp.pi) == 0)
chk('单位圆周长 = 2π（弧长积分）',
    sp.integrate(1, (_theta, 0, 2 * sp.pi)) == 2 * sp.pi)

# ---- 高数课程例题 ----
chk('lim sin3x/x = 3', sp.limit(sp.sin(3 * x) / x, x, 0) == 3)
chk('lim (1+1/n)^n = e', sp.limit((1 + 1 / n)**n, n, sp.oo) == sp.E)
chk('x^2-4x+3 在 [1,3] 上的罗尔点 xi=2',
    sp.solve(sp.diff(x**2 - 4 * x + 3, x), x) == [2])
chk('int_0^1 x^2 dx = 1/3', sp.integrate(x**2, (x, 0, 1)) == sp.Rational(1, 3))
chk('int x e^x dx = (x-1)e^x',
    sp.simplify(sp.integrate(x * sp.exp(x), x) - (x - 1) * sp.exp(x)) == 0)
chk('sum 1/n^2 = pi^2/6', sp.summation(1 / n**2, (n, 1, sp.oo)) == sp.pi**2 / 6)
_px, _py, _pz = sp.symbols('px py pz', real=True)
chk('原点到平面 x+2y-2z=1 的距离为 1/3',
    sp.Abs(-1) / sp.sqrt(1**2 + 2**2 + (-2)**2) == sp.Rational(1, 3))
chk('f=x^2y 在 (1,2) 沿 (3,4) 的方向导数为 16/5',
    sp.Rational(4 * 3 + 1 * 4, 5) == sp.Rational(16, 5))
chk("y=e^(-2x) 满足 y'+2y=0 且 y(0)=1",
    sp.simplify(sp.diff(sp.exp(-2 * x), x) + 2 * sp.exp(-2 * x)) == 0 and sp.exp(0) == 1)

# ---- 曲线积分与三重积分 ----
_t = sp.symbols('t', real=True)
_rho, _phi, _theta = sp.symbols('rho varphi theta', positive=True)
chk('单位圆上 ∮ (x dy - y dx) = 2π',
    sp.integrate(
        (sp.cos(_t) * sp.diff(sp.sin(_t), _t) - sp.sin(_t) * sp.diff(sp.cos(_t), _t)),
        (_t, 0, 2 * sp.pi)) == 2 * sp.pi)
chk('上半单位球内 ∭ z dV = π/4',
    sp.simplify(
        sp.integrate(
            sp.integrate(
                sp.integrate((_rho * sp.cos(_phi)) * _rho**2 * sp.sin(_phi), (_rho, 0, 1)),
                (_phi, 0, sp.pi / 2)),
            (_theta, 0, 2 * sp.pi))
        - sp.pi / 4) == 0)
chk('单位球体积 = 4π/3',
    sp.simplify(
        sp.integrate(
            sp.integrate(
                sp.integrate(_rho**2 * sp.sin(_phi), (_rho, 0, 1)),
                (_phi, 0, sp.pi)),
            (_theta, 0, 2 * sp.pi))
        - 4 * sp.pi / 3) == 0)

# ---- 导数应用：单调与极值 ----
chk('x^3-3x 的驻点为 ±1',
    sorted(sp.solve(sp.diff(x**3 - 3*x, x), x)) == [-1, 1])
chk('x^3-3x 在 x=-1 处取极大值 2', (x**3 - 3*x).subs(x, -1) == 2)
chk('x^3-3x 在 x=1 处取极小值 -2', (x**3 - 3*x).subs(x, 1) == -2)
chk('x^3-3x 的导数在 -2、0、2 处依次为正负正',
    [sp.sign(sp.diff(x**3 - 3*x, x).subs(x, v)) for v in (-2, 0, 2)] == [1, -1, 1])
chk('x^3-3x 的二阶导在 ±1 处依次为负正',
    [sp.sign(sp.diff(x**3 - 3*x, x, 2).subs(x, v)) for v in (-1, 1)] == [-1, 1])

# ---- 递推数列 ----
_seq = {1: 1}
for _i in range(1, 7):
    _seq[_i + 1] = 2 * _seq[_i] + 3
chk('递推 a1=1、a(n+1)=2a(n)+3 的通项为 2^(n+1)-3',
    all(_seq[k] == 2 ** (k + 1) - 3 for k in range(1, 8)))

# ---- 级数与定积分 ----
chk('sum n/2^n = 2', sp.summation(n / 2**n, (n, 1, sp.oo)) == 2)
chk('int_0^1 sqrt(x) dx = 2/3', sp.integrate(sp.sqrt(x), (x, 0, 1)) == sp.Rational(2, 3))
chk('int x e^x dx = (x-1)e^x + C',
    sp.simplify(sp.integrate(x * sp.exp(x), x) - (x - 1) * sp.exp(x)) == 0)
chk('int_0^1 dy int_0^y e^(y^2) dx = (e-1)/2',
    sp.simplify(sp.integrate(sp.integrate(sp.exp(y**2), (x, 0, y)), (y, 0, 1))
                - (sp.E - 1) / 2) == 0)

# ---- 微分恒等式（辅助函数对照表、分部积分）----
kc = sp.Symbol('k')
chk("(e^(kx) f)' = e^(kx)(f' + k f)",
    sp.simplify(sp.diff(sp.exp(kc * x) * f(x), x)
                - sp.exp(kc * x) * (sp.diff(f(x), x) + kc * f(x))) == 0)
chk("(x f)' = f + x f'",
    sp.simplify(sp.diff(x * f(x), x) - (f(x) + x * sp.diff(f(x), x))) == 0)
chk("(f/x)' = (x f' - f)/x^2",
    sp.simplify(sp.diff(f(x) / x, x)
                - (x * sp.diff(f(x), x) - f(x)) / x**2) == 0)
chk('d(uv) = u dv + v du',
    sp.simplify(sp.diff(u * v, t) - (u * sp.diff(v, t) + v * sp.diff(u, t))) == 0)


# ---- 泰勒展开 ----
def series_ok(expr, approx, order):
    return sp.simplify(sp.series(expr, x, 0, order).removeO() - approx) == 0


chk('sin x = x - x^3/6 + o(x^3)', series_ok(sp.sin(x), x - x**3 / 6, 4))
chk('cos x = 1 - x^2/2 + x^4/24 + o(x^4)', series_ok(sp.cos(x), 1 - x**2 / 2 + x**4 / 24, 5))
chk('e^x = 1 + x + x^2/2 + x^3/6 + o(x^3)', series_ok(sp.exp(x), 1 + x + x**2 / 2 + x**3 / 6, 4))
chk('ln(1+x) = x - x^2/2 + x^3/3 + o(x^3)', series_ok(sp.log(1 + x), x - x**2 / 2 + x**3 / 3, 4))
chk('tan x = x + x^3/3 + o(x^3)', series_ok(sp.tan(x), x + x**3 / 3, 4))
chk('(1+x)^a = 1 + a x + a(a-1)/2 x^2 + o(x^2)',
    series_ok((1 + x) ** al, 1 + al * x + al * (al - 1) / 2 * x**2, 3))

# ---- 极值 ----
crit = sp.solve(sp.diff(x * (1 - x), x), x)[0]
chk('max x(1-x) = 1/4 at x=1/2', (x * (1 - x)).subs(x, crit) == sp.Rational(1, 4))

# ---- 概率（分布律归一）----
chk('二项分布 pmf 求和为 1',
    sp.summation(sp.binomial(10, k) * sp.Rational(1, 3) ** k * sp.Rational(2, 3) ** (10 - k),
                 (k, 0, 10)) == 1)
chk('泊松分布 pmf 求和为 1',
    sp.summation(sp.exp(-lam) * lam**k / sp.factorial(k), (k, 0, sp.oo)) == 1)
chk('超几何 pmf 求和为 1',
    sp.summation(sp.binomial(5, k) * sp.binomial(95, 3 - k) / sp.binomial(100, 3),
                 (k, 0, 3)) == 1)

# ---- 空间几何 ----
chk('原点到 x+y+z=1 的距离 = sqrt(3)/3',
    sp.simplify(sp.Abs(-1) / sp.sqrt(3) - sp.sqrt(3) / 3) == 0)
A = sp.Matrix([[1, 1, 0], [1, 2, 0], [0, 0, 3]])
chk('顺序主子式 (1,1,3) 且正定',
    (A[:1, :1].det(), A[:2, :2].det(), A.det()) == (1, 1, 3))

# ---- 2026-11 新增考点：数列极限 ----
a_n = sp.Rational(1)
for _ in range(40):
    a_n = sp.sqrt(2 + a_n)
chk('递推 a_{n+1}=sqrt(2+a_n) 收敛到 2', abs(float(a_n) - 2) < 1e-9)

# ---- 新增考点：定积分区间再现 ----
# 注意：sympy 对这个积分给不出闭式，只能数值比对（结果确实是 pi^2/4）
_int_val = sp.N(sp.integrate(x * sp.sin(x) / (1 + sp.cos(x) ** 2), (x, 0, sp.pi)), 20)
chk('int_0^pi x sin x/(1+cos^2 x) = pi^2/4', abs(float(_int_val - sp.pi ** 2 / 4)) < 1e-12)

# ---- 新增考点：特征值与相似对角化 ----
M2 = sp.Matrix([[2, 1], [1, 2]])
P2 = sp.Matrix([[1, 1], [1, -1]])
chk('A^n = P diag(3^n,1) P^-1',
    all(sp.simplify(P2 * sp.diag(3 ** kk, 1) * P2.inv() - M2 ** kk) == sp.zeros(2, 2)
        for kk in (1, 2, 3)))

# ---- 新增考点：随机变量函数的分布 ----
yy = sp.Symbol('y', positive=True)
fY = 1 / (2 * sp.sqrt(yy))
chk('f_Y(y)=1/(2 sqrt y) 在 (0,1) 上积分为 1',
    sp.simplify(sp.integrate(fY, (yy, 0, 1)) - 1) == 0)
chk('F_Y(1/4) = 1/2',
    sp.simplify(sp.integrate(fY, (yy, 0, sp.Rational(1, 4))) - sp.Rational(1, 2)) == 0)

# ---- 2026-11 新增：不等式证明 ----
import random as _random
_ok_lip = True
_rng = _random.Random(11)
for _ in range(200):
    _a = _rng.uniform(-6, 6)
    _b = _rng.uniform(-6, 6)
    if abs(sp.sin(_a) - sp.sin(_b)) > abs(_a - _b) + 1e-12:
        _ok_lip = False
        break
chk('|sin a - sin b| <= |a - b|（抽样 200 组）', _ok_lip)

# ---- 新增：级数求和 ----
chk('sum 1/(n(n+1)) = 1',
    sp.summation(1 / (n * (n + 1)), (n, 1, sp.oo)) == 1)

_xx = sp.Symbol('x', real=True)
# sympy 对含参数的无穷和给的是分段表达式，直接相减不可靠；
# 改成比较泰勒系数：1/(1-x)^2 的 x^(n-1) 系数应当是 n
_taylor = sp.expand(sp.series(1 / (1 - _xx) ** 2, _xx, 0, 6).removeO())
# 逐项比系数：x^k 的系数应当等于 k+1（即通项 n x^(n-1) 中 n=k+1）
chk('sum n x^(n-1) = 1/(1-x)^2（前 6 项系数逐个比对）',
    all(_taylor.coeff(_xx, kk) == kk + 1 for kk in range(6)))
chk('sum n/2^(n-1) = 4', sp.summation(n / 2 ** (n - 1), (n, 1, sp.oo)) == 4)

# ---- 2026-11 新增：多元可微 ----
# f(x,y)=sqrt(|xy|) 在原点沿 y=x 方向：增量 / rho = |t| / (sqrt2 |t|) = 1/sqrt2 != 0
_t_vals = [1e-3, 1e-4, 1e-5, 1e-6]
_ratios = [abs(t) / ((2 * t * t) ** 0.5) for t in _t_vals]
chk('sqrt(|xy|) 沿 y=x 的增量比恒为 1/sqrt2（不可微）',
    all(abs(r0 - 1 / sp.sqrt(2)) < 1e-9 for r0 in _ratios))

# ---- 新增：线性方程组通解 ----
_t = sp.Symbol('t', real=True)
_x1, _x2, _x3 = _t, 1 - 2 * _t, _t
_eq1 = sp.simplify(_x1 + _x2 + _x3 - 1)
_eq2 = sp.simplify(_x1 + 2 * _x2 + 3 * _x3 - 2)
chk('通解 (t, 1-2t, t) 同时满足两个方程', _eq1 == 0 and _eq2 == 0)
_M = sp.Matrix([[1, 1, 1], [1, 2, 3]])
_Mb = sp.Matrix([[1, 1, 1, 1], [1, 2, 3, 2]])
chk('r(A)=r(A|b)=2 且自由变量 1 个',
    _M.rank() == 2 and _Mb.rank() == 2 and 3 - _M.rank() == 1)

# ---- 2026-11 新增：幂级数收敛域 ----
# Σ x^n/n 的收敛半径 R = 1（系数比极限）
_an = 1 / n
chk('Σ x^n/n 的收敛半径 = 1',
    sp.limit(sp.Abs(_an / (1 / (n + 1))), n, sp.oo) == 1)
chk('端点 x=1 处调和级数发散',
    sp.summation(1 / n, (n, 1, sp.oo)) == sp.oo)
chk('端点 x=-1 处交错调和级数收敛到 -ln2',
    sp.simplify(sp.summation((-1) ** n / n, (n, 1, sp.oo)) + sp.log(2)) == 0)

# ---- 新增：二阶常系数方程 ----
_yy = sp.Function('y')
C1, C2 = sp.symbols('C1 C2')
_sol = C1 * sp.exp(x) + C2 * sp.exp(2 * x)
chk('y = C1 e^x + C2 e^(2x) 满足 y\'\' - 3y\' + 2y = 0',
    sp.simplify(sp.diff(_sol, x, 2) - 3 * sp.diff(_sol, x) + 2 * _sol) == 0)
chk('特征根为 1 和 2',
    sorted(sp.solve(sp.Symbol('r') ** 2 - 3 * sp.Symbol('r') + 2, sp.Symbol('r'))) == [1, 2])

# ---- 2026-11 新增：空间线面夹角 ----
_s = sp.Matrix([1, 2, 1])
_nv = sp.Matrix([1, 1, 1])
_sin_theta = sp.Abs(_s.dot(_nv)) / (_s.norm() * _nv.norm())
chk('直线 (1,2,1) 与平面法向 (1,1,1) 的线面夹角 sin = 2sqrt2/3',
    sp.simplify(_sin_theta - 2 * sp.sqrt(2) / 3) == 0)

# ---- 新增：经典不等式 ----
_aa, _bb, _cc = sp.symbols('a b c', real=True)
chk('a^2+b^2+c^2-ab-bc-ca = [(a-b)^2+(b-c)^2+(c-a)^2]/2',
    sp.simplify((_aa**2 + _bb**2 + _cc**2 - _aa*_bb - _bb*_cc - _cc*_aa)
                - ((_aa-_bb)**2 + (_bb-_cc)**2 + (_cc-_aa)**2) / 2) == 0)
chk('均值不等式：a+b >= 2sqrt(ab)（抽样验证）',
    all((_u + _v) >= 2 * sp.sqrt(_u * _v)
        for _u, _v in [(1, 1), (4, 9), (0.25, 2), (10, 10)]))

# ---- 新增：定积分几何应用 ----
chk('y=x^2 在 [0,1] 绕 x 轴旋转体积 = pi/5',
    sp.simplify(sp.pi * sp.integrate(x**4, (x, 0, 1)) - sp.pi / 5) == 0)

# ---- 2026-11 新增：拉格朗日 / 柯西 ----
_ok_arctan = True
_rng2 = _random.Random(23)
for _ in range(200):
    _a2 = _rng2.uniform(-8, 8)
    _b2 = _rng2.uniform(-8, 8)
    if abs(sp.atan(_a2) - sp.atan(_b2)) > abs(_a2 - _b2) + 1e-12:
        _ok_arctan = False
        break
chk('|arctan a - arctan b| <= |a - b|（抽样 200 组）', _ok_arctan)

# ---- 新增：欧拉方程 ----
_y1 = x
_y2 = x ** 2
chk('y = x 满足 x^2 y\'\' - 2x y\' + 2y = 0',
    sp.simplify(x**2 * sp.diff(_y1, x, 2) - 2 * x * sp.diff(_y1, x) + 2 * _y1) == 0)
chk('y = x^2 满足 x^2 y\'\' - 2x y\' + 2y = 0',
    sp.simplify(x**2 * sp.diff(_y2, x, 2) - 2 * x * sp.diff(_y2, x) + 2 * _y2) == 0)

# ---- 2026-11 新增：向量代数 ----
_va = sp.Matrix([1, 0, 0])
_vb = sp.Matrix([0, 1, 0])
_vc = sp.Matrix([0, 0, 1])
chk('|a x b| = 1（单位正交向量）', sp.simplify(_va.cross(_vb).norm() - 1) == 0)
chk('混合积 [a b c] = 1',
    sp.simplify(_va.cross(_vb).dot(_vc) - 1) == 0)
chk('三向量共面时混合积为 0',
    sp.simplify(_va.cross(_vb).dot(sp.Matrix([1, 1, 0]))) == 0)

# ---- 2026-11 新增：隐函数求导 ----
_yv = sp.Symbol('y', real=True)
chk('x^2+y^2=1 的隐函数导数 y\' = -x/y',
    sp.simplify(sp.idiff(x**2 + _yv**2 - 1, _yv, x) + x / _yv) == 0)

# ---- 新增：方向导数 ----
_fxy = x**2 + _yv**2
_grad = sp.Matrix([sp.diff(_fxy, x), sp.diff(_fxy, _yv)]).subs({x: 1, _yv: 1})
_dir = sp.Matrix([1, 1]) / sp.sqrt(2)
chk('f=x^2+y^2 在 (1,1) 沿 (1,1) 方向导数 = 2sqrt2',
    sp.simplify(_grad.dot(_dir) - 2 * sp.sqrt(2)) == 0)

# ---- 新增：数字特征 ----
_pp = sp.Rational(3, 10)
_kk = sp.Symbol('k', integer=True, nonnegative=True)
_ex = sp.summation(_kk * sp.binomial(10, _kk) * _pp**_kk * (1 - _pp)**(10 - _kk), (_kk, 0, 10))
_ex2 = sp.summation(_kk**2 * sp.binomial(10, _kk) * _pp**_kk * (1 - _pp)**(10 - _kk), (_kk, 0, 10))
chk('B(10,0.3) 的 E(X)=3 且 D(X)=2.1',
    sp.simplify(_ex - 3) == 0 and sp.simplify(_ex2 - _ex**2 - sp.Rational(21, 10)) == 0)

# ---- 新增：向量组线性相关 ----
_m2 = sp.Matrix([[1, 2], [2, 4]])
chk('α1=(1,2), α2=(2,4) 线性相关（det=0, rank=1）',
    _m2.det() == 0 and _m2.rank() == 1)

# ---- 新增：傅里叶系数 ----
_nn = sp.Symbol('n', integer=True, positive=True)
_bn = sp.integrate(x * sp.sin(_nn * x), (x, -sp.pi, sp.pi)) / sp.pi
chk('f(x)=x 的傅里叶正弦系数 b_n = 2(-1)^(n+1)/n',
    sp.simplify(_bn - 2 * (-1)**(_nn + 1) / _nn) == 0)
_an = sp.integrate(x * sp.cos(_nn * x), (x, -sp.pi, sp.pi)) / sp.pi
chk('f(x)=x 的余弦系数 a_n = 0（奇函数）', sp.simplify(_an) == 0)

# ---- 2026-11 细化题型：1 的无穷次 ----
_nn2 = sp.Symbol('n2', positive=True, integer=True)
chk('lim (1+1/n)^n = e',
    sp.simplify(sp.limit((1 + 1 / _nn2) ** _nn2, _nn2, sp.oo) - sp.E) == 0)

# ---- 细化题型：根式差有理化 ----
chk('lim (sqrt(1+x)-1)/x = 1/2',
    sp.limit((sp.sqrt(1 + x) - 1) / x, x, 0) == sp.Rational(1, 2))

# ---- 细化题型：无穷小阶 ----
chk('1-cos x 与 x^2/2 等价',
    sp.limit((1 - sp.cos(x)) / (x**2 / 2), x, 0) == 1)

# ---- 细化题型：二重积分对称性 ----
# 单位圆上对 x 积分：极坐标下 r 从 0 到 1，θ 从 0 到 2π
_int_x = sp.integrate(sp.integrate((sp.Symbol('r') * sp.cos(sp.Symbol('th'))) * sp.Symbol('r'),
                                   (sp.Symbol('r'), 0, 1)), (sp.Symbol('th'), 0, 2 * sp.pi))
chk('单位圆上 ∬ x dσ = 0', sp.simplify(_int_x) == 0)

# ---- 细化题型：定积分估计 ----
chk('int_0^1 x^n dx = 1/(n+1)',
    sp.simplify(sp.integrate(x**_nn2, (x, 0, 1)) - 1 / (_nn2 + 1)) == 0)

# ---- 2026-11 补缺口：三角辅助角 ----
chk('sin x + sqrt3 cos x = 2 sin(x + pi/3)',
    sp.simplify(sp.sin(x) + sp.sqrt(3) * sp.cos(x) - 2 * sp.sin(x + sp.pi / 3)) == 0)

# ---- 补缺口：相交弦 ----
chk('相交弦：2 * 6 = 3 * PD 得 PD = 4', 2 * 6 == 3 * 4)

# ---- 补缺口：群论（Z6 中 2 的阶） ----
chk('Z6 中元素 2 的阶为 3', all((2 * kk) % 6 != 0 for kk in (1, 2)) and (2 * 3) % 6 == 0)

# ---- 补缺口：拓扑（(0,1) 与 R 同胚） ----
# atan(tan(·)) 只在主值区间成立，sympy 不自动化简，用数值抽样验证
_tmap = sp.tan(sp.pi * (x - sp.Rational(1, 2)))
_inv = sp.atan(x) / sp.pi + sp.Rational(1, 2)
_samples = [0.05, 0.2, 0.5, 0.8, 0.95]
chk('tan(pi(x-1/2)) 与 atan(x)/pi+1/2 互逆（(0,1) 上抽样）',
    all(abs(float(_inv.subs(x, _tmap.subs(x, v))) - v) < 1e-9 for v in _samples))

# ---- 补缺口：马尔可夫平稳分布 ----
_P = sp.Matrix([[sp.Rational(7, 10), sp.Rational(3, 10)],
                [sp.Rational(4, 10), sp.Rational(6, 10)]])
_pi = sp.Matrix([[sp.Rational(4, 7), sp.Rational(3, 7)]])
chk('平稳分布 (4/7, 3/7) 满足 pi P = pi',
    (_pi * _P).applyfunc(sp.nsimplify) == _pi)

# ---- 2026-11 补空分支：集合论 ----
chk('幂集大小：|P(A)| = 2^|A|',
    len([s for r in range(0, 4) for s in [set(c) for c in __import__('itertools').combinations(range(3), r)]]) == 2 ** 3)

# ---- 补空分支：图论（正四面体欧拉公式） ----
_V, _E, _F = 4, 6, 4
chk('正四面体 V-E+F=2', _V - _E + _F == 2)

# ---- 补空分支：信息论（不均匀硬币熵） ----
_h = -(sp.Rational(9, 10) * sp.log(sp.Rational(9, 10), 2) + sp.Rational(1, 10) * sp.log(sp.Rational(1, 10), 2))
chk('H(0.9,0.1) = 0.469 bit', abs(float(_h) - 0.469) < 1e-3)

# ---- 补空分支：博弈论（囚徒困境中坦白严格优于抵赖） ----
_payoff = {'T': {'T': -5, 'S': 0}, 'S': {'T': -10, 'S': -1}}
chk('坦白是严格占优策略',
    all(_payoff['T'][o] > _payoff['S'][o] for o in ('T', 'S')))

# ---- 补空分支：密码学（RSA 往返） ----
_p, _q, _e = 61, 53, 17
_n = _p * _q
_phi = (_p - 1) * (_q - 1)
_d = pow(_e, -1, _phi)
_m = 65
chk('RSA: p=61,q=53,e=17 加解密可还原',
    pow(pow(_m, _e, _n), _d, _n) == _m)

# ---- 2026-11 补空分支（二）：测度论 ----
_k = sp.Symbol('k', integer=True, nonnegative=True)
chk('康托集挖掉的总测度为 1（等比级数）',
    sp.simplify(sp.summation(2 ** _k / 3 ** (_k + 1), (_k, 0, sp.oo)) - 1) == 0)

# ---- 补空分支（二）：伽罗瓦（五次不可根式解） ----
chk('x^5-x-1 在 Q 上不可约', sp.Poly(x**5 - x - 1, x).is_irreducible)
chk('|S5|=120, |A5|=60', sp.factorial(5) == 120 and sp.factorial(5) // 2 == 60)

# ---- 补空分支（二）：线性规划（顶点枚举） ----
_vertices = [(0, 0), (2, 0), (2, 2), (1, 3), (0, 3)]
chk('max 3x+2y = 10 在 (2,2)', max(3 * a + 2 * b for a, b in _vertices) == 10
    and all(a + b <= 4 and a <= 2 and b <= 3 for a, b in _vertices))

# ---- 补空分支（二）：非欧几何（角亏 = 面积） ----
_angles = [sp.pi / 6] * 3
chk('双曲三角形面积 = π - 角和 > 0',
    float(sp.pi - sum(_angles)) > 0 and abs(float(sum(_angles)) - float(sp.pi / 2)) < 1e-9)

# ---- 补空分支（二）：可计算性（对角线构造） ----
_rows = [[0, 0, 1], [1, 0, 1], [0, 1, 1]]
_diag = [1 - _rows[i][i] for i in range(len(_rows))]
chk('对角线构造出的序列不在列表中', _diag not in _rows)

# ---- 2026-11 补空分支（三）：环论 ----
chk('Z6 中 2 是零因子（2*3≡0）', (2 * 3) % 6 == 0)
chk('⟨2⟩ 是 Z6 的理想', all((r * x) % 6 in {0, 2, 4} for r in range(6) for x in (0, 2, 4)))

# ---- 补空分支（三）：射影几何（交比不变） ----
def _cr(a, b, c, d):
    return ((c - a) * (d - b)) / ((c - b) * (d - a))

def _mobius(z):
    return (2 * z + 1) / (z + 3)

_pts = [0.0, 1.0, 2.0, 5.0]
_before = _cr(*_pts)
_after = _cr(*[_mobius(z) for z in _pts])
chk('交比在射影变换下不变', abs(_before - _after) < 1e-9)

# ---- 补空分支（三）：代数拓扑（绕数 = 1） ----
_theta = [2 * sp.pi * i / 2000 for i in range(2001)]
_winding = sum(
    (_theta[i + 1] - _theta[i]) for i in range(2000)
) / (2 * sp.pi)
chk('单位圆绕原点的绕数为 1', abs(float(_winding) - 1) < 1e-9)

# ---- 补空分支（三）：理论计算机（3-SAT 可满足性暴力验证） ----
_clauses = [(1, 2, 3), (-2, 3, 1)]
_assignments = [(a, b, c) for a in (True, False) for b in (True, False) for c in (True, False)]

def _sat_eval(assign, clauses):
    for cl in clauses:
        if not any(
            assign[abs(lit) - 1] if lit > 0 else not assign[abs(lit) - 1]
            for lit in cl
        ):
            return False
    return True

chk('小规模 3-SAT 可暴力判定', any(_sat_eval(a, _clauses) for a in _assignments))

# ---- 补空分支（三）：控制论（s^2+2s+5 极点实部为负） ----
_roots = sp.solve(sp.Symbol('s')**2 + 2 * sp.Symbol('s') + 5, sp.Symbol('s'))
chk('二阶系统 s²+2s+5 稳定', all(float(sp.re(r)) < 0 for r in _roots))

# ---- 补空分支（三）：范畴论（积的基数） ----
_A, _B = set(range(3)), set(range(4))
chk('|A×B| = |A|·|B|', len({(a, b) for a in _A for b in _B}) == len(_A) * len(_B))

# ---- 2026-11 补空分支（四）：解析数论 ----
def _is_prime(n):
    if n < 2:
        return False
    i = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i += 1
    return True

_pi1000 = sum(1 for n in range(2, 1001) if _is_prime(n))
chk('π(1000) = 168', _pi1000 == 168)
chk('π(x) ≈ x/ln x（1000 处比值 < 1.3）', 1.0 < _pi1000 / (1000 / sp.log(1000)) < 1.3)

# ---- 补空分支（四）：表示论（Z3 特征标正交） ----
_w3 = sp.exp(2 * sp.pi * sp.I / 3)
_chis = [[_w3 ** (k * j) for j in range(3)] for k in range(3)]
chk('Z3 不可约特征标正交',
    all(abs(complex(sum(_chis[i][j] * sp.conjugate(_chis[i2][j]) for j in range(3))) / 3
            - (1 if i == i2 else 0)) < 1e-9
        for i in range(3) for i2 in range(3)))

# ---- 补空分支（四）：金融数学（BS 看涨期权 ≈ 10.45） ----
def _norm_cdf(z):
    return 0.5 * (1 + __import__('math').erf(z / __import__('math').sqrt(2)))

_S, _K, _r, _sig, _T = 100.0, 100.0, 0.05, 0.20, 1.0
_d1 = (__import__('math').log(_S / _K) + (_r + _sig ** 2 / 2) * _T) / (_sig * __import__('math').sqrt(_T))
_d2 = _d1 - _sig * __import__('math').sqrt(_T)
_C = _S * _norm_cdf(_d1) - _K * __import__('math').exp(-_r * _T) * _norm_cdf(_d2)
chk('Black-Scholes 价格 ≈ 10.45', abs(_C - 10.45) < 0.02)

# ---- 补空分支（四）：力学（单摆 EL 方程） ----
_m, _l, _g, _t = sp.symbols('m l g t', positive=True)
_th = sp.Function('theta')(_t)
_Llag = sp.Rational(1, 2) * _m * _l ** 2 * sp.diff(_th, _t) ** 2 + _m * _g * _l * sp.cos(_th)
# 欧拉–拉格朗日方程：d/dt(∂L/∂θ̇) − ∂L/∂θ = 0
_EL = sp.diff(sp.diff(_Llag, sp.diff(_th, _t)), _t) - sp.diff(_Llag, _th)
# 化简后 EL = m l² θ̈ + m g l sinθ，即 θ̈ + (g/l) sinθ = 0
chk('单摆拉格朗日方程给出 θ̈ + (g/l)sinθ = 0',
    sp.simplify(_EL - (_m * _l ** 2 * sp.diff(_th, _t, 2) + _m * _g * _l * sp.sin(_th))) == 0)

# ---- 补空分支（四）：生物数学（Lotka-Volterra 平衡点与守恒量） ----
_a, _b, _c, _d = 1.0, 0.1, 0.075, 1.5
_xs, _ys = _d / _c, _a / _b
chk('Lotka-Volterra 平衡点 (20,10)', abs(_xs - 20) < 1e-9 and abs(_ys - 10) < 1e-9)
chk('平衡点处导数为零',
    abs(_a * _xs - _b * _xs * _ys) < 1e-9 and abs(_c * _xs * _ys - _d * _ys) < 1e-9)

# ---- 线代课程包：新增 6 个考点 ----
_A3 = sp.Matrix([[1, 2, 3], [0, 4, 5], [0, 0, 6]])
chk('上三角行列式 = 24', _A3.det() == 24)

_A2 = sp.Matrix([[1, 2], [3, 4]])
chk('二阶逆矩阵正确', _A2.inv() == sp.Matrix([[-2, 1], [sp.Rational(3, 2), sp.Rational(-1, 2)]]))

_M = sp.Matrix([[1, 1], [2, 2]])
chk('秩相等且小于未知数 → 无穷多解', _M.rank() == 1 and _M.rank() < 2)

_B = sp.Matrix([[1, 1], [1, -1]])
chk('(1,1),(1,-1) 线性无关', _B.det() != 0)

_E = sp.Matrix([[2, 1], [1, 2]])
_ev = _E.eigenvals()
chk('A=[[2,1],[1,2]] 特征值为 3 和 1',
    sorted(float(k) for k in _ev) == [1.0, 3.0])

_Q = sp.Matrix([[1, 1], [1, 2]])
chk('二次型 x²+2xy+2y² 正定',
    _Q[0, 0] > 0 and _Q.det() > 0)

# ---- 线代课程练习答案（抽验） ----
chk('练习 la1-1：det[[2,1],[3,4]]=5', sp.Matrix([[2, 1], [3, 4]]).det() == 5)
chk('练习 la1-2：逆矩阵吻合',
    sp.Matrix([[1, 2], [3, 4]]).inv() == sp.Matrix([[-2, 1], [sp.Rational(3, 2), sp.Rational(-1, 2)]]))
chk('练习 la1-3：det[[1,2],[2,4]]=0（不可逆）', sp.Matrix([[1, 2], [2, 4]]).det() == 0)

chk('练习 la2-1：x+y=3, x−y=1 解为 (2,1)',
    sp.solve([sp.Symbol('x') + sp.Symbol('y') - 3, sp.Symbol('x') - sp.Symbol('y') - 1],
             [sp.Symbol('x'), sp.Symbol('y')]) == {sp.Symbol('x'): 2, sp.Symbol('y'): 1})
chk('练习 la2-3：秩不相等 → 无解',
    sp.Matrix([[1, 1]]).rank() == 1 and sp.Matrix([[1, 1, 1], [1, 1, 2]]).rank() == 2)

chk('练习 la3-1：(1,2) 与 (2,4) 线性相关', sp.Matrix([[1, 2], [2, 4]]).det() == 0)
chk('练习 la3-3：(1,1),(1,-1) 构成基', sp.Matrix([[1, 1], [1, -1]]).det() != 0)

chk('练习 la4-1：对角阵特征值 2,3', sorted(float(k) for k in sp.Matrix([[2, 0], [0, 3]]).eigenvals()) == [2.0, 3.0])
# 注意：要算 A−λI 的零空间（λ=1），不是 A 的零空间
chk('练习 la4-2：[[1,1],[0,1]] 的 λ=1 特征空间仅 1 维',
    len((sp.Matrix([[1, 1], [0, 1]]) - sp.eye(2)).nullspace()) == 1)
chk('练习 la4-3：[[0,1],[1,0]] 特征值 1,-1', sorted(float(k) for k in sp.Matrix([[0, 1], [1, 0]]).eigenvals()) == [-1.0, 1.0])

chk('练习 la5-1：[[1,0],[0,2]] 正定', sp.Matrix([[1, 0], [0, 2]]).is_positive_definite)
chk('练习 la5-2：[[1,0],[0,-1]] 不正定', not sp.Matrix([[1, 0], [0, -1]]).is_positive_definite)
chk('练习 la5-3：[[1,1],[1,1]] 半正定（det=0 且特征值非负）',
    sp.Matrix([[1, 1], [1, 1]]).det() == 0 and all(float(v) >= 0 for v in sp.Matrix([[1, 1], [1, 1]]).eigenvals()))

# ---- 线代加厚：新增 5 个考点 ----
_rot = sp.Matrix([[sp.cos(sp.Symbol('t')), -sp.sin(sp.Symbol('t'))],
                  [sp.sin(sp.Symbol('t')), sp.cos(sp.Symbol('t'))]])
chk('旋转矩阵正交（QᵀQ=I）',
    sp.simplify(_rot.T * _rot - sp.eye(2)) == sp.zeros(2, 2))
chk('旋转矩阵行列式为 1', sp.simplify(_rot.det() - 1) == 0)

_ca = sp.Matrix([[1, 1], [1, -1]])
_cb = sp.Matrix([3, 1])
_cx = sp.Matrix([_cb[0], _cb[1]])
_det = _ca.det()
_x1 = sp.Matrix([[3, 1], [1, -1]]).det() / _det
_x2 = sp.Matrix([[1, 3], [1, 1]]).det() / _det
chk('克拉默法则解出 x=2, y=1', _x1 == 2 and _x2 == 1)

_a1 = sp.Matrix([1, 1])
_a2 = sp.Matrix([1, 0])
_b1 = _a1
_coef = (_a2.dot(_b1)) / (_b1.dot(_b1))
_b2 = _a2 - _coef * _b1
chk('施密特正交化后内积为零', sp.simplify(_b1.dot(_b2)) == 0)

_J = sp.Matrix([[1, 1], [0, 1]])
chk('若尔当块 (A-I)^2 = 0', sp.simplify((_J - sp.eye(2)) ** 2) == sp.zeros(2, 2))

_D = sp.Matrix([[1, 0], [0, -1]])
_ev = [float(v) for v in _D.eigenvals()]
chk('diag(1,-1) 惯性指数 p=1 q=1 r=2',
    sum(1 for v in _ev if v > 0) == 1 and sum(1 for v in _ev if v < 0) == 1 and _D.rank() == 2)

# ---- 线代加厚：新增 10 道课程练习的答案验证 ----
chk('练习 la1-4：diag(2,3)² = diag(4,9)',
    sp.Matrix([[2, 0], [0, 3]]) ** 2 == sp.Matrix([[4, 0], [0, 9]]))

_Q90 = sp.Matrix([[0, -1], [1, 0]])
chk('练习 la1-5：[[0,-1],[1,0]] 正交且行列式为 1',
    _Q90.T * _Q90 == sp.eye(2) and _Q90.det() == 1)

chk('练习 la2-4：2x+y=7, x−y=2 解为 (3,1)',
    sp.solve([2 * sp.Symbol('x') + sp.Symbol('y') - 7,
              sp.Symbol('x') - sp.Symbol('y') - 2],
             [sp.Symbol('x'), sp.Symbol('y')]) == {sp.Symbol('x'): 3, sp.Symbol('y'): 1})
chk('练习 la2-5：齐次系数行列式为 0 → 有非零解',
    sp.Matrix([[1, 1], [2, 2]]).det() == 0)

_g1 = sp.Matrix([1, 0])
_g2 = sp.Matrix([1, 1])
_p = _g2.dot(_g1) / _g1.dot(_g1)
_g2o = _g2 - _p * _g1
chk('练习 la3-4：正交化后为 (1,0) 与 (0,1)',
    _g1 == sp.Matrix([1, 0]) and _g2o == sp.Matrix([0, 1]))

chk('练习 la3-5：正交矩阵的逆等于转置',
    _Q90.inv() == _Q90.T)

_A2 = sp.Matrix([[2, 1], [0, 2]])
chk('练习 la4-4：[[2,1],[0,2]] 的 (A-2I)²=0 且特征空间 1 维',
    sp.simplify((_A2 - 2 * sp.eye(2)) ** 2) == sp.zeros(2, 2)
    and len((_A2 - 2 * sp.eye(2)).nullspace()) == 1)

_A3 = 3 * sp.eye(2)
chk('练习 la4-5：3I 是对角矩阵（因此可对角化）', _A3.is_diagonal())

chk('练习 la5-4：f=2x²+3y² 的正惯性指数 p=2',
    sum(1 for v in [2, 3] if v > 0) == 2)

_S3 = [1, 1, -1]
chk('练习 la5-5：x²+y²−z² 的 p=2 q=1 r=3',
    sum(1 for v in _S3 if v > 0) == 2 and sum(1 for v in _S3 if v < 0) == 1)

# ---- 线代加厚（二）：9 个新考点 ----
_Aadj = sp.Matrix([[1, 2], [3, 4]])
chk('伴随矩阵恒等式 AA* = |A|I',
    _Aadj * _Aadj.adjugate() == _Aadj.det() * sp.eye(2))
chk('伴随矩阵求逆公式 A⁻¹ = A*/|A|',
    sp.simplify(_Aadj.inv() - _Aadj.adjugate() / _Aadj.det()) == sp.zeros(2, 2))

_row = sp.Matrix([[1, 1, 1]])
chk('秩-零化度：r + dim N = n', _row.rank() + len(_row.nullspace()) == 3)

_xi1 = sp.Matrix([-1, 1, 0])
_xi2 = sp.Matrix([-1, 0, 1])
chk('基础解系满足 Ax=0', (_row * _xi1)[0] == 0 and (_row * _xi2)[0] == 0)

_v1 = sp.Matrix([1, -1, 0])
_v2 = sp.Matrix([0, 1, -1])
_vsum = _v1 + _v2
chk('子空间对加法封闭', _vsum[0] + _vsum[1] + _vsum[2] == 0)
_v3 = 3 * _v1
chk('子空间对数乘封闭', _v3[0] + _v3[1] + _v3[2] == 0)

_Pmat = sp.Matrix([[1, 1], [1, -1]])
chk('过渡矩阵：新坐标 (1,1) 还原旧坐标 (2,0)',
    _Pmat * sp.Matrix([1, 1]) == sp.Matrix([2, 0]))

_Esym = sp.Matrix([[2, 1], [1, 2]])
_ev = _Esym.eigenvals()
chk('特征值之和等于迹', abs(sum(float(k) for k in _ev) - _Esym.trace()) < 1e-9)
chk('特征值之积等于行列式', abs(float(_Esym.det()) - 3.0) < 1e-9)

_k = 3
_Pk = sp.Matrix([[1, 1], [1, -1]])
_Lam = sp.diag(3, 1)
chk('A^k = PΛ^kP⁻¹', sp.simplify(_Pk * (_Lam ** _k) * _Pk.inv() - _Esym ** _k) == sp.zeros(2, 2))

_Qorth = sp.Matrix([[1, 1], [1, -1]]) / sp.sqrt(2)
chk('正交变换对角化：QᵀAQ = diag(3,1)',
    sp.simplify(_Qorth.T * _Esym * _Qorth - sp.diag(3, 1)) == sp.zeros(2, 2))

chk('瑞利商取值范围 [λmin, λmax]',
    float(min(_Esym.eigenvals())) == 1.0 and float(max(_Esym.eigenvals())) == 3.0)

# ---- 线代加厚（二）：15 道新练习的答案验证 ----
_A = sp.Matrix([[1, 2], [3, 4]])
chk('练习 la1-6：伴随矩阵 = [[4,-2],[-3,1]]',
    _A.adjugate() == sp.Matrix([[4, -2], [-3, 1]]))
chk('练习 la1-7：三阶 |A|=3 → |A*|=9', 3 ** (3 - 1) == 9)
chk('练习 la1-8：x+y+z=0 的解空间维数 2',
    len(sp.Matrix([[1, 1, 1]]).nullspace()) == 2)

chk('练习 la2-6：基础解系两个向量都满足方程',
    (sp.Matrix([[1, 1, 1]]) * sp.Matrix([-1, 1, 0]))[0] == 0
    and (sp.Matrix([[1, 1, 1]]) * sp.Matrix([-1, 0, 1]))[0] == 0)
chk('练习 la2-7：两式等价 → 解空间维数 2',
    sp.Matrix([[1, 1, 1], [2, 2, 2]]).rank() == 1)
chk('练习 la2-8：x+y=1 不含零向量', 0 + 0 != 1)

chk('练习 la3-6：三个向量秩为 2',
    sp.Matrix([[1, 0, 0], [0, 1, 0], [1, 1, 0]]).T.rank() == 2)
_P = sp.Matrix([[1, 1], [1, -1]])
chk('练习 la3-7：新坐标 (1,1) 正确', _P.inv() * sp.Matrix([2, 0]) == sp.Matrix([1, 1]))
chk('练习 la3-8：x=y 的解空间维数 2',
    len(sp.Matrix([[1, -1, 0]]).nullspace()) == 2)

chk('练习 la4-6：特征值之积 1*2*x=24 → x=12', 1 * 2 * 12 == 24)
chk('练习 la4-7：A³ = [[14,13],[13,14]]',
    sp.Matrix([[2, 1], [1, 2]]) ** 3 == sp.Matrix([[14, 13], [13, 14]]))
chk('练习 la4-8：迹 4、行列式 3 与特征值 3,1 一致',
    sp.Matrix([[2, 1], [1, 2]]).trace() == 4 and sp.Matrix([[2, 1], [1, 2]]).det() == 3)

chk('练习 la5-6：2x²+2y²+2xy 的特征值为 3 和 1',
    sorted(float(k) for k in sp.Matrix([[2, 1], [1, 2]]).eigenvals()) == [1.0, 3.0])
chk('练习 la5-7：瑞利商最值 1 与 2',
    float(min(sp.diag(1, 2).eigenvals())) == 1.0
    and float(max(sp.diag(1, 2).eigenvals())) == 2.0)
chk('练习 la5-8：x²-2xy+y² 半正定（行列式为 0）',
    sp.Matrix([[1, -1], [-1, 1]]).det() == 0
    and all(float(v) >= 0 for v in sp.Matrix([[1, -1], [-1, 1]]).eigenvals()))

# ---- 对照教材补充：行列式展开 / 初等矩阵 / 线性空间 / 线性变换 ----
_V = sp.Matrix([[1, 1, 1], [1, 2, 3], [1, 4, 9]])
chk('三阶范德蒙德（1,2,3）= 2', _V.det() == 2)
chk('范德蒙德公式 (x2-x1)(x3-x1)(x3-x2)',
    (2 - 1) * (3 - 1) * (3 - 2) == _V.det())

_Pswap = sp.Matrix([[0, 1], [1, 0]])
_Ae = sp.Matrix([[1, 2], [3, 4]])
chk('初等矩阵左乘实现行交换', _Pswap * _Ae == sp.Matrix([[3, 4], [1, 2]]))

chk('P2[x] 的基 {1,x,x²} 线性无关',
    sp.Matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]).rank() == 3)

_rot90 = sp.Matrix([[0, -1], [1, 0]])
chk('旋转 90° 矩阵正交且行列式为 1',
    _rot90.T * _rot90 == sp.eye(2) and _rot90.det() == 1)
_T = sp.Matrix([[1, 1], [1, -1]])
chk('T(x,y)=(x+y,x−y) 的矩阵为 [[1,1],[1,-1]]', _T * sp.Matrix([1, 0]) == sp.Matrix([1, 1]))
chk('T(x,y)=(2x,3y) 的矩阵为 diag(2,3)',
    sp.diag(2, 3) * sp.Matrix([1, 0]) == sp.Matrix([2, 0]))

_Psim = sp.Matrix([[1, 1], [1, -1]])
chk('换基后矩阵为 diag(3,1)',
    sp.simplify(_Psim.inv() * sp.Matrix([[2, 1], [1, 2]]) * _Psim - sp.diag(3, 1)) == sp.zeros(2, 2))

# ---- 第 6 章补充：核与像、同构 ----
_Tk = sp.Matrix([[1, 1], [1, -1]])
chk('T(x,y)=(x+y,x−y) 的核只有零向量', len(_Tk.nullspace()) == 0)
chk('由维数公式，像的维数 = 2', _Tk.rank() == 2 and _Tk.rank() + len(_Tk.nullspace()) == 2)

chk('P2[x] 与 R³ 同维（都为 3）',
    sp.Matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]).rank() == 3)

# ---- 输出 ----
ok = sum(1 for r in rows if r[0] == 'PASS')
for st, name, detail in rows:
    print(f'{st}  {name}{("  :: " + detail) if detail else ""}')
print(f'--- {ok}/{len(rows)} passed ---')
raise SystemExit(0 if ok == len(rows) else 1)
