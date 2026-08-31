<!-- 来源页面: https://miragedge.top/plugin-guides/fepvp/hunger-games -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: plugin-guides/fepvp/hunger-games.md -->

# 饥饿游戏模式（Hunger Games）

饥饿游戏是 FE_PVP 的**单人求生（FFA）**模式，所有玩家各自为战，靠场地补给箱活到最后。

## 玩法规则

1. **进入方式**：大厅 → **🥣 饥饿游戏** → 房间列表 → 选择一张 `FFA` 类型地图（可用 `/fepvp arena settype <名称> ffa` 转换）
2. **跳过装备选择**：饥饿游戏不经过装备组合选择，直接建房
3. **开局条件**：房间至少 `hunger-games.min-players` 人（默认 3）才能开局；满员自动开，房主也可 `/fepvp room start`
4. **开局流程**：
   - 自动扫描场地区域内所有补给箱（箱子/陷阱箱/木桶，双箱去重）
   - 把场内全部物品收集进池子 → 随机洗牌 → **均匀分散**回所有箱子（每局位置随机）
   - 玩家**清空背包**（`start-empty: false` 可保留自带）
   - 环形出生在 spawn1 周围，出生点冻结 + 倒计时
5. **战斗**：死亡自动转观战（spectator），BossBar 实时显示存活人数
6. **结束**：活到最后 1 人获胜；超时按击杀数最高者获胜，无击杀则平局
7. **赛后**：
   - 场地方块分批复原（tile 实体保真）
   - **补给箱内容恢复为开局前种子状态** → 下一局重新随机分散
   - 掉落物/箭矢/经验球清理（`protection.clean-drops`）

## 配置

```yaml
hunger-games:
  min-players: 3        # 最少玩家数，少于该人数无法开局
  start-empty: true     # 开局清空自带装备（靠补给箱获取）
  loot-distribute: true # 开局自动把场内箱子物品均匀分散到所有箱子
```

## 管理员操作

### 创建饥饿游戏场地

```
/fepvp arena create 饥饿岛 ffa nobreak noplace
/fepvp arena setworld 饥饿岛
/fepvp arena setspawn 饥饿岛 1
/fepvp arena setspawn 饥饿岛 2
```

> 场地级方块保护：若不想让玩家破坏/放置场地（防止拆箱、挖地），创建时加 `nobreak` / `noplace`（场地设置优先于全局 `block-break/block-place`；开箱不受影响）。

### 预览补给箱

```
/fepvp arena scanloot 饥饿岛
```

显示箱子数量 / 物品总数 / 坐标，用于确认补给箱摆放正确。

### 补给箱摆放建议

- 补给箱需放在场地区域（两出生点包围盒 + `protection.restore-region-radius` 外扩）内
- 建议箱子放在场地中心供争夺
- 无补给箱时开局仍可进行（全员空手互搏）

## 统计与结算

- ELO / 胜负：胜者 +win 并按"对手平均分"计算增益；被淘汰者 +loss
- 中途退赛按失败单独结算，避免重复扣分
- 比赛队列/竞技场占用与单挑/团队共用 `arenaGames` 机制，同一竞技场同时只允许一种模式
