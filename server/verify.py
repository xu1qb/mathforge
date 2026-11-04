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
    s = re.sub(r"\*\*\(([^()]*)\)", lambda m: "**(" + m.group(1) + ")", s)
    s = s.replace("{", "(").replace("}", ")")
    return s.strip()


def norm(v):
    s = (v or "").strip().replace(" ", "")
    s = latex_to_plain(s)
    # 去掉变量前缀：n=7 / x=7 / \{7\} 与 7 视为同一答案
    s = re.sub(r"^[a-zA-Z]\s*=\s*", "", s)
    s = s.strip("{}")
    return s


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
