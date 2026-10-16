"""检测 SVG 中的 mojibake（UTF-8 字节被当作 GBK 解读后再编码为 UTF-8）
并统计每个文件的 XML 合法性。"""
import os
import xml.etree.ElementTree as ET

root = r'F:\MiragEdge-DocWeb\public\images'

# mojibake 判据：不能用「命中个数」，因为「界」「一」「了」等合法常用字会被误伤。
# 改用密度：真实 mojibake 片段几乎逐字命中（如「浠庢憜鎽婂埌鎴愬氦」= 11/11），
# 而正常中文里这些字只是零星出现。阈值 0.35 经实测可分开两类。
MOJI_CHARS = set('锛鈥鏂娴鍥鍜鏄鏇鏃鏉鏍鏈娓鐨勪簡浣犳垜浠竴涓釜鍙涓嶄簡鐢ㄦ潵铏界劧杩欎釜鏄庣櫧绠€鍗曞浘鏂囧瓧')

def looks_mojibake(s: str) -> bool:
    """仅统计中文字符，按命中比例判断，避免把「界」这类常用字误判。"""
    han = [c for c in s if '\u4e00' <= c <= '\u9fff']
    if len(han) < 4:
        return False
    hit = sum(1 for c in han if c in MOJI_CHARS)
    return hit / len(han) > 0.35

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
