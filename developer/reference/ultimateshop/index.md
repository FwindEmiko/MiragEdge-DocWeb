# UltimateShop 商店系统配置

> 插件版本: 3.4.8+ Premium  
> 官方Wiki: [ultimateshop.superiormc.cn](https://ultimateshop.superiormc.cn/)  
> 插件目录: `plugins/UltimateShop/`  

UltimateShop 是一个高灵活性商店插件，支持多对多的商品-价格关系、动态价格、库存系统、每日商店等高级功能。本文档为 MiragEdge 服务器定制配置参考。

## 目录结构

```
plugins/UltimateShop/
├── config.yml                  # 主配置
├── shops/                      # 商店配置（每个文件=一个商店）
├── menus/                      # 菜单配置（GUI布局）
├── items/                      # 保存的物品
├── languages/                  # 语言文件
├── random_placeholders/        # 随机占位符（每日商店用）
├── conditional_placeholders/   # 条件占位符
├── sell_sticks/                # 出售棒 (Premium)
├── sell_chests/                # 出售箱子 (Premium)
└── shared_use_times/           # 共享交易次数 (Premium)
```

## 商店配置 (shops/*.yml)

### 最小示例

```yaml
settings:
  menu: 'shop-menu'           # menus/ 目录下的菜单文件名
  buy-more: true              # 允许批量购买
  shop-name: '&e&l矿物商店'
  hide-message: false
  secret-shop-items: true     # 隐藏不满足条件的商品

items:
  A:                          # 商品ID（必须单字符 A-Z/a-z）
    price-mode: CLASSIC_ALL   # 不用动态价格时用 CLASSIC_ 前缀
    product-mode: CLASSIC_ALL
    products:
      1:
        material: DIAMOND
        amount: 1
    buy-prices:
      1:
        economy-plugin: Vault
        amount: 1600
        placeholder: '{amount} 灵叶'
        start-apply: 0
    sell-prices:
      1:
        economy-plugin: Vault
        amount: 1200
        placeholder: '{amount} 灵叶'
        start-apply: 0
```

### 商品完整字段

```yaml
A:
  display-item:               # 菜单展示物品（可不同于实际商品）
    material: DIAMOND
    name: '&b钻石'
  display-name: "钻石"        # 占位符 {product} 显示的名字
  add-lore:                   # 自定义 lore
    - '@a&e购买: {buy-price}'
    - '@b&e出售: {sell-price}'
  click-event:                # 自定义点击事件
    buy: 'SHIFT_LEFT'
    sell: 'RIGHT'
  bedrock:                    # 基岩版 UI
    hide: false
    icon: 'url;;https://example.com/diamond.png'
  buy-more: true
  sell-all: true
  hide-message: false

  price-mode: CLASSIC_ALL     # CLASSIC_ALL / CLASSIC_ANY / ALL / ANY
  product-mode: CLASSIC_ALL

  products:                   # 商品内容
    1:
      material: DIAMOND
      amount: 1
      # hook-plugin: ItemsAdder          # 第三方物品
      # hook-item: 'customcrops:dry_pot'
      # give-item: false                 # 命令商店：不给实际物品
      # give-actions:                    # 给予时执行
      #   1:
      #     type: console_command
      #     command: 'crate give {player} magic'
      # apply-conditions:                # 是否参与交易
      # require-conditions:              # 交易是否允许继续

  buy-prices:                 # 购买价格
    1:
      economy-plugin: Vault
      amount: 1600            # 固定值或动态公式
      # max-amount: 2000      # 动态价格上限
      # min-amount: 1200      # 动态价格下限
      placeholder: '{amount} 灵叶'
      start-apply: 0
  sell-prices:                # 出售价格
    1:
      economy-plugin: Vault
      amount: 1200
      placeholder: '{amount} 灵叶'
      start-apply: 0

  buy-limits:                 # 购买限制
    global: 100               # 全服上限
    default: 10               # 每人默认
    vip: 20                   # VIP
  buy-limits-conditions:
    vip:
      1:
        type: permission
        permission: 'group.vip'
  buy-times-reset-mode: 'TIMED'
  buy-times-reset-time: '00:00:00'

  sell-limits:                # 出售限制
    global: 461
    default: 18
    vip: 22
  sell-limits-conditions:
    vip:
      1:
        type: permission
        permission: 'group.vip'
  sell-times-reset-mode: 'TIMED'
  sell-times-reset-time: '00:00:00'

  buy-actions:                # 购买成功动作
    1:
      type: sound
      sound: 'ui.button.click'
  sell-actions:               # 出售成功动作
    1:
      type: console_command
      command: 'ferp add mineral_limit_diamond 1'
  fail-actions:               # 失败动作
    1:
      type: sound
      sound: 'block.note_block.bass'
```

### 价格模式

| 模式 | 含义 | 性能 | 适用 |
|------|------|------|------|
| CLASSIC_ALL | 所有条目立即应用 | 低（推荐） | 固定价格 |
| CLASSIC_ANY | 首个满足条件的条目 | 低 | 条件价格 |
| ALL | 支持start-apply等 | 高 | 动态价格 |
| ANY | 首个满足条件的条目 | 高 | 分支价格 |

不用 `start-apply` 或动态价格时，必须用 `CLASSIC_` 前缀模式。

## 菜单配置 (menus/*.yml)

```yaml
title: '{shop-name}'
size: 54

open-actions:
  1:
    type: sound
    sound: item.book.page_turn
    open-once: true

layout:                       # 每行9字符
  - '110020011'               # 0=空, 1-9/a-z=按钮, A-Z=商品位
  - '1ABCDEFG1'
  - '0HIJKLMN0'
  - '0OPQRSTU0'
  - '000000000'
  - 'a0003000b'

buttons:
  1:
    display-item:
      bedrock:
        hide: true
      material: black_stained_glass_pane
  2:
    display-item:
      material: clock
      name: '&6&l%player_name%'
      lore:
        - '&f钱包: &7%xconomy_balance_formatted% 灵叶'
  3:
    display-item:
      material: ARROW
      name: '&c返回'
    actions:
      1:
        type: open_menu
        menu: main
```

## 经济格式 (EconomyFormat)

### 灵叶 (Vault)

```yaml
buy-prices:
  1:
    economy-plugin: Vault
    amount: 100
    placeholder: '{amount} 灵叶'
```

### 星痕石 (PlayerPoints)

```yaml
buy-prices:
  1:
    economy-plugin: PlayerPoints
    amount: 50
    placeholder: '{amount} 星痕石'
```

### 经验

```yaml
buy-prices:
  1:
    economy-type: exp         # exp 或 levels
    amount: 5
    placeholder: '{amount} 经验'
```

### 物品价格

```yaml
buy-prices:
  1:
    material: DIAMOND
    amount: 8
    placeholder: '{amount} 钻石'
```

## 动态价格

### 前置配置

`config.yml` 必须启用：

```yaml
math:
  enabled: true
  scale: 2
placeholder:
  data:
    can-used-in-amount: true
```

### 公式示例

```yaml
buy-prices:
  1:
    economy-plugin: Vault
    amount: '800*(1+{sell-times-server}/10000)'  # 基础价随全服卖出次数上涨
    max-amount: 1000          # 必须设上限
    min-amount: 600           # 必须设下限
    placeholder: '{amount} 灵叶'
    start-apply: 0
```

### 内置占位符

| 占位符 | 含义 |
|--------|------|
| `{buy-times-player}` | 玩家购买次数 |
| `{buy-times-server}` | 全服购买次数 |
| `{sell-times-player}` | 玩家出售次数 |
| `{sell-times-server}` | 全服出售次数 |
| `{buy-total-player}` | 玩家总购买次数（不重置）|
| `{buy-limit-player}` | 玩家购买上限 |

### 套利防护

买卖公式必须确保任何情况下买入再卖出都亏钱：

- `max-amount`(买) 必须小于 `min-amount`(卖)
- 买卖涨跌幅度建议相同
- 验证：n 次交易后买入价仍大于卖出价

## 库存系统（供应池）

玩家卖出后商店才有库存可买：

```yaml
A:
  buy-limits:
    global: '{sell-times-server}'   # 买入上限=全服卖出次数
    # global: '{sell-times-server}+10'  # 初始库存+卖出次数
  buy-times-reset-mode: 'NEVER'     # 不自动补货
```

::: warning 使用 FE_RefreshPapi 变量作为库存
MiragEdge 的稀有资源商店使用 `FE_RefreshPapi` 变量驱动供应池：
- `buy-limits.global: '%ferp_value_mineral_limit_diamond%'` — 库存 = 变量值
- `buy-actions` 执行 `ferp add mineral_limit_diamond -{amount}` — 买入扣库存
- `sell-actions` 执行 `ferp add mineral_limit_diamond {amount}` — 卖出加库存
- 变量在 `plugins/FE_RefreshPapi/config.yml` 配置，每年 1 月 1 日重置
:::

## 基岩版兼容 (Bedrock UI - Premium)

### 概述

Premium 版会自动把 Java 箱子商店转换为基岩版 Form 表单 UI，无需手动编写脚本。转换依赖 Geyser + Floodgate（后端子服也要装）。

### 前置条件

1. Geyser + Floodgate 安装（后端子服 + Velocity 代理）
2. Geyser `auth-type: floodgate`
3. 插件启动时控制台应出现 `Hooking into floodgate`

### config.yml 关键配置

```yaml
# 基岩版 UI 开关
menu:
  bedrock:
    enabled: true                # 开启表单 UI
    auto-add-icon:               # 自动为原版物品生成图标 (4.7.0+)
      enabled: true
      format: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/{version}/assets/minecraft/textures/{path}.png"
    check-method: FLOODGATE      # 识别基岩版玩家的方式
    # 购买/出售成功后再开菜单
    not-auto-close: true
    # 按钮第二行显示价格
    price-extra-line:
      default: '§a购买: §f{buy-price} §6| §b出售: §f{sell-price}'
      only-buy: '§a购买: §f{buy-price}'
      only-sell: '§b出售: §f{sell-price}'
```

::: warning 颜色代码
基岩版按钮文字必须用 **§** 前缀颜色代码（不是 `&`）。
:::

### 自动图标生成（auto-add-icon）

让插件自动为原版物品按钮添加贴图：

1. config.yml 开启 `minecraft-item-material-file.enabled: true` + `generate-new-one: true`
2. 重启服务器 → 插件自动下载 Material→纹理路径映射
3. 成功后把 `generate-new-one` 改回 `false`
4. 服务器升级 MC 版本后需删除 `item-materials.json` 重新生成

```yaml
config-files:
  minecraft-item-material-file:
    enabled: true
    generate-new-one: false
    file: 'item-materials.json'
```

### 商品手动配置图标

auto-add-icon 只匹配原版材质。自定义纹理/物品（ItemsAdder、CraftEngine 等）需手动给商品加 `bedrock` 图标：

```yaml
A:
  display-item:
    material: DIAMOND
    name: '&b钻石'           # 中文名（否则表单显示英文材质名）
    bedrock:
      hide: false             # 是否对基岩版隐藏
      icon: 'path;;textures/items/diamond.png'  # 纹理路径
```

icon 格式：
- `path;;textures/items/diamond.png` — 本地 Bedrock 资源包路径
- `url;;https://example.com/diamond.png` — 远程 URL

### Bedrock 按钮 action

```yaml
buttons:
  X:
    display-item:
      material: GRASS_BLOCK
      bedrock:
        hide: false
        icon: 'url;;https://raw.githubusercontent.com/Jens-Co/MinecraftItemImages/main/1.20/melon_slice.png'
```

### 菜单级 Bedrock 配置

```yaml
title: '{shop-name}'
size: 54
bedrock:
  enabled: true               # 此菜单对基岩版用表单
  content: '&f欢迎来到商店!'  # 表单顶部说明文字
```

### MiragEdge 服务器现状（2026-08-10）

- 所有商店商品已补中文 `display-item`（`&e中文名` / `&c中文名`）
- 原版物品靠 auto-add-icon 自动生成图标
- 稀有资源交易所手动配置了 4 个图标
- 红石商店手动配置了 13 个图标

## 重置模式

| 模式 | 说明 | 存储时间 |
|------|------|---------|
| NEVER | 不重置 | - |
| TIMER | 间隔后重置 | 否 |
| TIMED | 定时重置 | 否 |
| COOLDOWN_TIMER | 冷却间隔 | 是 |
| COOLDOWN_TIMED | 冷却定时 | 是 |

TIMED 每次交易后才开始计算重置时间；COOLDOWN_TIMED 查看商品时立即生成，重启不变。

## 常用命令

```
/shop menu <商店名>              # 打开商店
/shop reload                     # 重载配置
/shop sellall                    # 全部出售
/shop sellhand                   # 出售手持物品堆
/shop saveitem <id> <shop>       # 保存物品
/shop generateitemformat         # 生成手持物品格式
/shop setbuytimes <shop> <item> [player|global] [times]  # 设置购买次数
```

## 版本升级排查

旧配置升级到 3.4.8+ 时必须检查：

1. `buy-limits-reset-mode` 改为 `buy-times-reset-mode`（3.3.0 改名）
2. `sell-limits-reset-mode` 改为 `sell-times-reset-mode`（3.3.0 改名）
3. config.yml 补充 `debuild-item-method: 'LEGACY'`
4. config.yml 补充 `force-display-fail-message: false`
5. config.yml 补充 `menu.anti-dupe-checker: false`
6. config.yml 补充 `use-times.auto-reset-mode: true`
7. `sell-limits-conditions` 旧字符串格式 `- 'permission: group.vip'` 改为条件对象格式

## 经济基准

详见 [经济基准参考](/developer/reference/economy)

| 物品 | 卖出价 | 买入价 |
|------|--------|--------|
| 钻石 | 1,200 | 1,600 |
| 远古残骸 | 3,000 | 4,000 |
| 下界合金锭 | 5,000 | 7,000 |
