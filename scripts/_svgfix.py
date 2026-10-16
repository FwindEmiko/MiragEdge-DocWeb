"""修复 SVG 里的 mojibake：把「UTF-8 字节被误读为 GBK」的中文还原。

原理：mojibake 串的成因是 原UTF-8字节 -> 被当作GBK解码成字符 -> 再编码为UTF-8。
逆转：对 mojibake 片段 encode('gbk') 得到原始 UTF-8 字节，再 decode('utf-8')。

三道保险，任一不过就跳过该文件：
  1) encode('gbk') 必须成功
  2) 结果必须能按 utf-8 严格解码
  3) 还原后必须不再含 mojibake 特征字，且 XML 合法
"""
import os
import re
import xml.etree.ElementTree as ET

root = r'F:\MiragEdge-DocWeb\public\images'

# 只处理正文文字节点，避免动到属性里的英文
TEXT_RE = re.compile(r'(<(?:text|desc|title)\b[^>]*>)([^<]*)(</)', re.S)

MOJI_CHARS = set('锛鈥鏂娴鍥鍜鏄鏇鏃鏉鏍鏈娓鐨勪簡浣犳垜浠竴涓釜鍙涓嶄簡鐢ㄦ潵铏界劧杩欎釜鏄庣櫧绠€鍗曞浘鏂囧瓧')

def recover(s: str):
    """把整段文字做 mojibake 逆转；失败返回 None"""
    try:
        raw = s.encode('gbk')
    except Exception:
        return None
    try:
        return raw.decode('utf-8')
    except Exception:
        return None

def process(path):
    src = open(path, 'r', encoding='utf-8').read()

    changed = [False]

    def repl(m):
        open_tag, body, close = m.group(1), m.group(2), m.group(3)
        if not body.strip():
            return m.group(0)
        # 含中文且可疑才尝试
        rec = recover(body)
        if rec is None or rec == body:
            return m.group(0)
        # 还原后不应再含 mojibake 特征字
        if any(ch in MOJI_CHARS for ch in rec):
            return m.group(0)
        changed[0] = True
        return open_tag + rec + close

    out = TEXT_RE.sub(repl, src)

    # 补回被吃掉的闭合标签：形如 `>文字?/text>` 缺 `<`
    out = re.sub(r'(?<=[^\s<>])/(text|desc|title)>', r'</\1>', out)

    if not changed[0] and out == src:
        return 'skip'
    # 校验 XML
    try:
        ET.fromstring(out)
    except Exception as e:
        return 'XML_FAIL: %s' % e
    open(path, 'w', encoding='utf-8', newline='\n').write(out)
    return 'fixed'

for dirpath, _, files in os.walk(root):
    for fn in files:
        if not fn.endswith('.svg'):
            continue
        p = os.path.join(dirpath, fn)
        rel = os.path.relpath(p, root)
        s = open(p, 'r', encoding='utf-8', errors='replace').read()
        if not any(ch in MOJI_CHARS for ch in s):
            continue
        r = process(p)
        print('%-56s %s' % (rel, r))
