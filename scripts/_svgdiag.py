"""检测 SVG 中的 mojibake（UTF-8 字节被当作 GBK 解读后再编码为 UTF-8）
并统计每个文件的 XML 合法性。"""
import os
import xml.etree.ElementTree as ET

root = r'F:\MiragEdge-DocWeb\public\images'

# mojibake 常见特征字（GBK 误读 UTF-8 中文时高频出现）
MOJI_CHARS = set('锛鈥鏂娴鍥鍜鏄鏇鏃鏉鏍鏈娓鐨勪簡浣犳垜浠竴涓釜鍙涓嶄簡鐢ㄦ潵铏界劧杩欎釜鏄庣櫧绠€鍗曞浘鏂囧瓧')

def looks_mojibake(s: str) -> bool:
    n = sum(1 for ch in s if ch in MOJI_CHARS)
    return n >= 3

rows = []
for dirpath, _, files in os.walk(root):
    for fn in files:
        if not fn.endswith('.svg'):
            continue
        p = os.path.join(dirpath, fn)
        rel = os.path.relpath(p, root)
        s = open(p, 'r', encoding='utf-8', errors='replace').read()
        try:
            ET.fromstring(s)
            xml_ok = True
            err = ''
        except Exception as e:
            xml_ok = False
            err = str(e)
        # 只检查 <text>/<desc>/<title> 里的文字
        import re
        texts = re.findall(r'<(?:text|desc|title)[^>]*>([^<]*)', s)
        moji = looks_mojibake(' '.join(texts))
        rows.append((rel, xml_ok, moji, err, len(s)))

print('%-56s %-8s %-10s %s' % ('文件', 'XML', 'mojibake', '错误'))
print('-' * 110)
for rel, xml_ok, moji, err, n in sorted(rows):
    print('%-56s %-8s %-10s %s' % (rel, 'OK' if xml_ok else 'FAIL', 'YES' if moji else 'no', err))

bad_xml = [r for r in rows if not r[1]]
bad_moji = [r for r in rows if r[2]]
print()
print('XML 非法: %d' % len(bad_xml))
print('疑似 mojibake: %d' % len(bad_moji))
