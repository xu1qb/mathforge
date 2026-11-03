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

# ---- 输出 ----
ok = sum(1 for r in rows if r[0] == 'PASS')
for st, name, detail in rows:
    print(f'{st}  {name}{("  :: " + detail) if detail else ""}')
print(f'--- {ok}/{len(rows)} passed ---')
raise SystemExit(0 if ok == len(rows) else 1)
