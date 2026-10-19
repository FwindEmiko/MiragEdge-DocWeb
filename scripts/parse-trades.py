# -*- coding: utf-8 -*-
"""把 13 个职业交易页的 markdown 表格抽成一份 JSON，供前端检索组件使用。"""
import json, os, re

BASE = r"F:\MiragEdge-DocWeb"
TRADES = os.path.join(BASE, r"play\adventure\worlds\stellarity\trades")
OUT = os.path.join(BASE, r"public\data\stellarity-trades.json")

PROF_TITLE = {
    "armorer": "盔甲匠", "butcher": "屠夫", "cartographer": "制图师", "cleric": "牧师",
    "farmer": "农民", "fisherman": "渔夫", "fletcher": "制箭师", "leatherworker": "皮匠",
    "librarian": "图书管理员", "mason": "石匠", "shepherd": "牧羊人",
    "toolsmith": "工具匠", "weaponsmith": "武器匠",
}
LEVEL_RE = re.compile(r"^###\s*(\d)\s*级[^\n]*?共\s*(\d+)\s*个交易格")


def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def parse_file(path, slug):
    rows = []
    level = None
    header = None
    for raw in open(path, encoding="utf-8").read().splitlines():
        line = raw.rstrip()
        m = LEVEL_RE.match(line)
        if m:
            level = int(m.group(1))
            header = None
            continue
        if line.startswith("###"):
            header = None
            continue
        if not line.startswith("|"):
            header = None
            continue
        cs = cells(line)
        if all(re.fullmatch(r":?-{2,}:?", c) for c in cs if c):
            continue                      # 分隔行
        if header is None:
            header = cs                    # 表头
            continue
        rec = dict(zip(header, cs))
        if not rec.get("你获得") and not rec.get("你付出"):
            continue
        rows.append({
            "profession": PROF_TITLE.get(slug, slug),
            "slug": slug,
            "level": level,
            "slot": rec.get("格位", ""),
            "pay": rec.get("你付出", ""),
            "get": rec.get("你获得", ""),
            "note": re.sub(r"\*\*", "", rec.get("补充说明", "")),
            "uses": rec.get("补货前可做次数", ""),
        })
    return rows


def main():
    all_rows = []
    for f in sorted(os.listdir(TRADES)):
        if not f.endswith(".md") or f == "index.md":
            continue
        slug = f[:-3]
        r = parse_file(os.path.join(TRADES, f), slug)
        print(f"{slug:14s} {len(r):3d} 行")
        all_rows += r
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(all_rows, fh, ensure_ascii=False, indent=0)
    print("合计", len(all_rows), "行 ->", OUT, "%.1f KB" % (os.path.getsize(OUT) / 1024))
    missing = [r for r in all_rows if not r["get"]]
    print("解析异常（缺'获得'）:", len(missing))
    for r in all_rows[:3]:
        print("  样例:", r["profession"], r["level"], r["pay"], "->", r["get"])


if __name__ == "__main__":
    main()
