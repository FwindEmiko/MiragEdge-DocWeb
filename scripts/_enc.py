import os

root = r'F:\MiragEdge-DocWeb\public\images'
targets = [
    r'start\account\bind-flow.svg',
    r'features\chest-shop\trade-flow.svg',
    r'developer\workflows\datapack\stage-flow.svg',
]
for t in targets:
    p = os.path.join(root, t)
    raw = open(p, 'rb').read()
    print('=== %s (%d bytes)' % (t, len(raw)))
    # 严格 UTF-8 能否解码
    try:
        s = raw.decode('utf-8')
        ok = True
    except UnicodeDecodeError as e:
        s = None
        ok = False
        print('  UTF-8 解码失败: %s' % e)
    if ok:
        print('  UTF-8 解码成功')
        # 中文样本
        idx = s.find('<text')
        print('  首处 <text>: %s' % s[idx:idx+120].replace('\n', ' | '))
    # 试 GBK 解码
    try:
        g = raw.decode('gbk')
        print('  GBK 解码也成功（说明可能是误写的 GBK 文件）')
        i = g.find('<text')
        print('  GBK 视图首处 <text>: %s' % g[i:i+120].replace('\n', ' | '))
    except Exception as e:
        print('  GBK 解码失败: %s' % e)
    print()
