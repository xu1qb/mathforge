#!/usr/bin/env python3
"""答案等价性判定：stdin {"a","b"} -> stdout {"equal","method"}"""
import json
import re
import sys


def take_group(s, start):
    depth = 0
    for i in range(start, len(s)):
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return s[start + 1:i], i + 1
    return s[start + 1:], len(s)


def latex_to_plain(s):
    s = s.replace("\u2212", "-").replace("\u00d7", "*").replace("\u00b7", "*")
    s = s.replace("\\left", "").replace("\\right", "")
    s = s.replace("\\cdot", "*").replace("\\times", "*")
    s = s.replace("\\pi", "pi").replace("\\infty", "oo")
    # 数学符号：√2 → sqrt(2)，方便和 LaTeX 写法统一
    s = re.sub(r"√\s*([0-9]+|[a-zA-Z])", r"sqrt(\1)", s)
    s = re.sub(r"\\text\{[^}]*\}", "", s)

    while True:
        m = re.search(r"\\(?:d|t)?frac\s*\{", s)
        if not m:
            break
        i = m.start()
        num, j = take_group(s, m.end() - 1)
        den, k = take_group(s, j) if j < len(s) and s[j] == "{" else (s[j:j + 1], j + 1)
        s = s[:i] + "((" + latex_to_plain(num) + ")/(" + latex_to_plain(den) + "))" + s[k:]

    while True:
        m = re.search(r"\\sqrt\s*\{", s)
        if not m:
            break
        i = m.start()
        inner, j = take_group(s, m.end() - 1)
        s = s[:i] + "sqrt(" + latex_to_plain(inner) + ")" + s[j:]

    s = re.sub(r"\\[a-zA-Z]+", "", s)
    s = s.replace("^{", "**(")
    # 普通幂次：e^4 → e**(4)；已经带括号的不动
    s = re.sub(r"\^([0-9A-Za-z.]+)", r"**(\1)", s)
    s = re.sub(r"\*\*\(([^()]*)\)", lambda m: "**(" + m.group(1) + ")", s)
    s = s.replace("{", "(").replace("}", ")")
    return s.strip()


def norm(v):
    s = (v or "").strip().replace(" ", "")
    s = latex_to_plain(s)
    # 去掉变量前缀：n=7 / x=7 / x_1=7 / x_(1)=7 都视为同一答案
    s = re.sub(r"^[a-zA-Z](?:_(?:\(?\d+\)?|\{\d+\}))?\s*=\s*", "", s)
    s = s.strip("{}")
    return s


VALUE_SPLIT = re.compile(r"或|,|，|、|;|；|\\,")
VAR_PREFIX = re.compile(r"^[a-zA-Z](?:_(?:\(?\d+\)?|\{\d+\}))?\s*=\s*")


def split_values(s):
    """把「x1=3, x2=2/5」「x=2/5 或 x=3」这类多值答案拆成值列表"""
    parts = [p.strip() for p in VALUE_SPLIT.split(s) if p.strip()]
    return [VAR_PREFIX.sub("", p) for p in parts]


def value_equal(x, y, trans):
    """两个单一值是否相等（符号化简 + 数值容差）"""
    import sympy as sp
    from sympy.parsing.sympy_parser import parse_expr
    try:
        ex = parse_expr(x, transformations=trans, evaluate=True)
        ey = parse_expr(y, transformations=trans, evaluate=True)
    except Exception:
        return False
    diff = sp.simplify(ex - ey)
    if diff == 0:
        return True
    if not getattr(diff, "free_symbols", set()):
        try:
            return abs(float(diff)) < 1e-9
        except Exception:
            return False
    return False


def sets_equal(va, vb, trans):
    """值集合（可重复）相等：无序匹配"""
    if len(va) != len(vb):
        return False
    used = [False] * len(vb)
    for x in va:
        hit = False
        for i, y in enumerate(vb):
            if not used[i] and value_equal(x, y, trans):
                used[i] = True
                hit = True
                break
        if not hit:
            return False
    return True


def main():
    try:
        data = json.loads(sys.stdin.read() or "{}")
    except Exception:
        print(json.dumps({"error": "invalid json"}))
        return

    a, b = norm(data.get("a")), norm(data.get("b"))
    if not a or not b:
        print(json.dumps({"equal": False, "method": "empty"}))
        return
    if a == b:
        print(json.dumps({"equal": True, "method": "string"}))
        return

    try:
        import sympy as sp
        from sympy.parsing.sympy_parser import (
            parse_expr,
            standard_transformations,
            implicit_multiplication_application,
        )
    except ImportError:
        print(json.dumps({"equal": False, "method": "no-sympy"}))
        return

    try:
        trans = standard_transformations + (implicit_multiplication_application,)

        # 多值答案按集合比对（顺序、写法不同也算对）
        va, vb = split_values(a), split_values(b)
        if len(va) > 1 or len(vb) > 1:
            if sets_equal(va, vb, trans):
                print(json.dumps({"equal": True, "method": "set"}))
                return
            print(json.dumps({"equal": False, "method": "set"}))
            return

        ea = parse_expr(a, transformations=trans, evaluate=True)
        eb = parse_expr(b, transformations=trans, evaluate=True)
    except Exception:
        print(json.dumps({"equal": False, "method": "parse-error"}))
        return

    diff = sp.simplify(ea - eb)
    if diff == 0:
        print(json.dumps({"equal": True, "method": "sympy"}))
        return
    if not diff.free_symbols:
        try:
            if abs(float(diff)) < 1e-9:
                print(json.dumps({"equal": True, "method": "numeric"}))
                return
        except Exception:
            pass
    print(json.dumps({"equal": False, "method": "sympy"}))


if __name__ == "__main__":
    main()
