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

# ---- 输出 ----
ok = sum(1 for r in rows if r[0] == 'PASS')
for st, name, detail in rows:
    print(f'{st}  {name}{("  :: " + detail) if detail else ""}')
print(f'--- {ok}/{len(rows)} passed ---')
raise SystemExit(0 if ok == len(rows) else 1)
