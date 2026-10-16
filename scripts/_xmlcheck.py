import xml.etree.ElementTree as ET
import os, sys

root = r'F:\MiragEdge-DocWeb\public\images'
bad = []
for dirpath, _, files in os.walk(root):
    for fn in files:
        if not fn.endswith('.svg'):
            continue
        p = os.path.join(dirpath, fn)
        try:
            ET.parse(p)
        except Exception as e:
            bad.append((p, str(e)))

print('XML 非法文件数 =', len(bad))
for p, e in bad:
    rel = os.path.relpath(p, root)
    print('  %s' % rel)
    print('     %s' % e)
