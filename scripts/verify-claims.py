#!/usr/bin/env python3
"""独立复核生成器的答案：读 claims.json，用 sympy 重算，输出结果。"""
import json
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
        local_dict={var: sp.Symbol(var)},
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
    raise ValueError("unknown kind " + k)


def main():
    path = sys.argv[1]
    items = json.load(open(path))
    out = []
    for it in items:
        try:
            computed = compute(it["claim"])
            ok = equivalent(computed, parse(it["claim"]["claim"]))
            out.append({"id": it["id"], "topic": it["topic"], "ok": bool(ok),
                        "computed": str(computed), "claim": it["claim"]["claim"]})
        except Exception as e:
            out.append({"id": it["id"], "topic": it["topic"], "ok": False,
                        "computed": "ERROR", "claim": it["claim"]["claim"], "error": str(e)[:120]})
    json.dump(out, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
