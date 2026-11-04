#!/usr/bin/env python3
"""独立复核生成器的答案：读 claims.json，用 sympy 重算，输出结果。"""
import json
import re
import sys


def num(s):
    return s.replace("oo", "oo")


def parse(expr, var="x"):
    import sympy as sp
    from sympy.parsing.sympy_parser import (
        parse_expr,
        standard_transformations,
        implicit_multiplication_application,
    )

    return parse_expr(
        expr.replace("^", "**"),
        transformations=standard_transformations + (implicit_multiplication_application,),
        local_dict={var: sp.Symbol(var), "e": sp.E, "pi": sp.pi, "oo": sp.oo},
        evaluate=True,
    )


def equivalent(a, b):
    import sympy as sp

    try:
        diff = sp.simplify(a - b)
        if diff == 0:
            return True
        if not getattr(diff, "free_symbols", set()):
            # 生成器里有些答案保留两位小数，允许半个单位的末位误差
            return abs(complex(diff)) <= 0.005
    except Exception:
        pass
    return False


def compute(claim):
    import sympy as sp

    k = claim["kind"]
    var = claim.get("variable", "x")
    x = sp.Symbol(var)
    if k == "limit":
        point = claim["point"]
        pt = sp.oo if point in ("oo", "inf") else parse(point, var)
        return sp.limit(parse(claim["expr"], var), x, pt)
    if k == "derivative":
        return sp.diff(parse(claim["expr"], var), x)
    if k == "integral":
        f = parse(claim["expr"], var)
        lo = parse(claim["lower"], var) if claim.get("lower") is not None else None
        hi = parse(claim["upper"], var) if claim.get("upper") is not None else None
        if lo is not None and hi is not None:
            return sp.integrate(f, (x, lo, hi))
        return sp.integrate(f, x)
    if k == "value":
        return parse(claim["expr"], var)
    if k == "roots":
        a, b, c = claim["coeffs"]
        X = sp.Symbol("x")
        roots = sp.solve(a * X ** 2 + b * X + c, X)
        which = claim["which"]
        # 韦达定理：重根时 solve 只返回一个元素，用系数更稳
        if which == "sum":
            return sp.Rational(-b, a)
        if which == "product":
            return sp.Rational(c, a)
        return max([sp.simplify(r) for r in roots])
    if k == "gcd":
        return sp.gcd(int(claim["a"]), int(claim["b"]))
    if k == "lcm":
        return sp.lcm(int(claim["a"]), int(claim["b"]))
    if k == "mod":
        return sp.Integer(int(claim["a"]) % int(claim["m"]))
    if k == "convergence":
        t = claim["type"]
        if t == "ratio":
            n = sp.Symbol("n")
            term = parse(claim["term"], "n")
            r = sp.limit(sp.Abs(term.subs(n, n + 1) / term), n, sp.oo)
            return "收敛" if r < 1 else "发散"
        if t == "p-series":
            return "收敛" if claim["p"] > 1 else "发散"
        if t == "geometric":
            return "收敛" if abs(claim["p"]) < abs(claim["q"]) else "发散"
        if t == "alternating":
            return "收敛"
        raise ValueError("unknown convergence type " + t)
    if k == "parity":
        import sympy as sp

        x = sp.Symbol(var)
        f = parse(claim["expr"], var)
        if sp.simplify(f.subs(x, -x) - f) == 0:
            return "偶"
        if sp.simplify(f.subs(x, -x) + f) == 0:
            return "奇"
        return "都不是"
    if k == "ode":
        import sympy as sp

        x = sp.Symbol(var)
        C = sp.Symbol("C")
        y = parse(claim["solution"], var)
        eq = claim["equation"]
        # 一阶线性：y' + a*y = b
        residual = sp.diff(y, x) + eq["a"] * y - eq.get("b", 0)
        return 0 if sp.simplify(residual) == 0 else residual
    raise ValueError("unknown kind " + k)



def parse_interval_claim(claim):
    """把解集文本解析成谓词；支持 A<x<B、x<A 或 x>B、-A<=x<=A、x>K 等写法"""
    s = claim.replace(" ", "")
    m = re.fullmatch(r"(-?\d+(?:\.\d+)?)(<=|<)x(<=|<)(-?\d+(?:\.\d+)?)", s)
    if m:
        lo, op1, op2, hi = m.group(1), m.group(2), m.group(3), m.group(4)
        lo_f, hi_f = float(lo), float(hi)
        return lambda x: (x >= lo_f if op1 == "<=" else x > lo_f) and (x <= hi_f if op2 == "<=" else x < hi_f)
    parts = s.split("或")
    if len(parts) == 2:
        left, right = parts
        m1 = re.fullmatch(r"x(<=|<|>=|>)(-?\d+(?:\.\d+)?)", left)
        m2 = re.fullmatch(r"x(<=|<|>=|>)(-?\d+(?:\.\d+)?)", right)
        if m1 and m2:
            def pred(x, m1=m1, m2=m2):
                return cmp_pred(x, m1.group(1), float(m1.group(2))) or cmp_pred(x, m2.group(1), float(m2.group(2)))
            return pred
    m = re.fullmatch(r"x!=(-?\d+(?:\.\d+)?)", s)
    if m:
        v = float(m.group(1))
        return lambda x, v=v: x != v
    m = re.fullmatch(r"x(<=|<|>=|>)(-?\d+(?:\.\d+)?)", s)
    if m:
        return lambda x: cmp_pred(x, m.group(1), float(m.group(2)))
    return None


def cmp_pred(x, op, v):
    return {"<": x < v, "<=": x <= v, ">": x > v, ">=": x >= v}[op]


def true_predicate(c):
    t = c["type"]
    p = c["params"]
    if t == "quad":
        r1, r2, rel = p["r1"], p["r2"], p["rel"]
        return lambda x: ((x - r1) * (x - r2) < 0) if rel == "<" else ((x - r1) * (x - r2) > 0)
    if t == "absLe":
        a, strict = p["a"], p.get("strict", False)
        return lambda x: (abs(x) < a) if strict else (abs(x) <= a)
    if t == "absGe":
        a = p["a"]
        return lambda x: abs(x) >= a
    if t == "linear":
        a, b, cc = p["a"], p["b"], p["c"]
        return lambda x: a * x + b > cc
    if t == "domainSqrt":
        a = p["a"]
        return lambda x: x >= a
    if t == "domainFrac":
        a = p["a"]
        return lambda x: x != a
    raise ValueError("unknown interval type " + t)


def check_property(claim_obj):
    """性质判定：奇偶 / 单调 / 值域下界 / 垂直 / 数列奇偶"""
    import sympy as sp

    c = claim_obj
    check = c["check"]
    claim = str(c["claim"])
    p = c.get("params", {})
    var = p.get("variable", "x")
    x = sp.Symbol(var)

    if check == "parity":
        f = parse(p["expr"], var)
        if sp.simplify(f.subs(x, -x) - f) == 0:
            result = "偶"
        elif sp.simplify(f.subs(x, -x) + f) == 0:
            result = "奇"
        else:
            result = "非奇非偶"
        return result == claim, result

    if check == "monotone":
        f = parse(p["expr"], var)
        a = sp.sympify(p["from"])
        d = sp.diff(f, x)
        # 在 a 右侧抽样：导数非负且函数递增
        for k in range(1, 6):
            xv = a + sp.Rational(k, 2)
            dv = sp.simplify(d.subs(x, xv))
            if dv.is_real and dv < 0:
                return False, "x=" + str(xv) + " 处导数 " + str(dv)
        return ("x>=" + str(a)) == claim, "x>=" + str(a)

    if check == "range":
        f = parse(p["expr"], var)
        lower = sp.sympify(p["lower"])
        # 抽样检查 f >= lower，且最小值取到 lower
        best = None
        for i in range(-60, 61):
            xv = sp.Rational(i, 2)
            v = sp.simplify(f.subs(x, xv))
            if best is None or v < best:
                best = v
            if v < lower:
                return False, "x=" + str(xv) + " 处 f=" + str(v) + " < " + str(lower)
        ok = sp.simplify(best - lower) == 0 or abs(float(best - lower)) < 1e-9
        return ok, "最小值 " + str(best)

    if check == "fibParity":
        n = int(p["n"])
        v = sp.fibonacci(n)
        return (("奇" if v % 2 == 1 else "偶") == claim), ("奇" if v % 2 == 1 else "偶")

    if check == "harmonic":
        y = parse(p["solution"], var)
        w = sp.sympify(p["w"])
        residual = sp.diff(y, x, 2) + w ** 2 * y
        ok = sp.simplify(residual) == 0
        return ok, "残差 " + str(sp.simplify(residual))

    if check == "eSeq":
        n = sp.Symbol("n")
        k = sp.sympify(p["k"])
        val = sp.limit((1 + k / n) ** n, n, sp.oo)
        ok = sp.simplify(sp.log(val) - k) == 0
        return ok, str(val)

    if check == "prime":
        n = int(p["n"])
        ok = sp.isprime(n)
        return (("是" if ok else "不是") == claim), ("是" if ok else "不是")

    if check == "perp":
        val = parse(p["expr"], var)
        ok = sp.simplify(val) == 0
        return ok, ("是" if ok else "否")

    raise ValueError("unknown property check " + check)


def check_interval(claim_obj):
    claim = claim_obj["claim"]
    pred_claim = parse_interval_claim(claim)
    if pred_claim is None:
        return False, "无法解析解集文本: " + claim
    pred_true = true_predicate(claim_obj)
    xs = [i * 0.5 for i in range(-80, 81)]
    for x in xs:
        if pred_claim(x) != pred_true(x):
            return False, "x=" + str(x) + " 处不一致"
    return True, ""

def main():
    path = sys.argv[1]
    items = json.load(open(path))
    out = []
    for it in items:
        try:
            kind = it["claim"]["kind"]
            if kind == "property":
                ok, detail = check_property(it["claim"])
                out.append({"id": it["id"], "topic": it["topic"], "ok": bool(ok),
                            "computed": str(detail), "claim": it["claim"]["claim"]})
                continue
            if kind == "interval":
                ok, why = check_interval(it["claim"])
                out.append({"id": it["id"], "topic": it["topic"], "ok": bool(ok),
                            "computed": "ok" if ok else why, "claim": it["claim"]["claim"]})
                continue
            computed = compute(it["claim"])
            if kind == "ode":
                # 残差为 0 即通解正确，无需和显示文本比对
                import sympy as sp
                simplified = sp.simplify(computed)
                # 浮点系数会留下机器精度残差
                ok = simplified == 0 or (
                    not getattr(simplified, "free_symbols", set())
                    and abs(complex(simplified)) < 1e-9
                )
            elif getattr(computed, "is_infinite", False) and computed is not None:
                # ±∞：直接比较符号，不能做减法
                import sympy as sp
                ok = parse(it["claim"]["claim"]) == computed
            elif isinstance(computed, str):
                ok = computed.strip() == str(it["claim"]["claim"]).strip()
            else:
                ok = equivalent(computed, parse(it["claim"]["claim"]))
            out.append({"id": it["id"], "topic": it["topic"], "ok": bool(ok),
                        "computed": str(computed), "claim": it["claim"]["claim"]})
        except Exception as e:
            out.append({"id": it["id"], "topic": it["topic"], "ok": False,
                        "computed": "ERROR", "claim": it["claim"]["claim"], "error": str(e)[:120]})
    json.dump(out, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
