# 更多附魔

服务器使用Aiyatsbus插件实现添加更多附魔  

配置结构：  
```
Aiyatsbus
└── enchants ························· 附魔目录
    ├── Packet-Sephirah ·············· 初始附魔包
    │   └── simple ··················· 子分类目录
    │       └── example.yml
    ├── Packet-Vanilla ··············· 原版附魔包
    │   └── example.yml
    ├── display.yml ·················· 附魔显示配置
    ├── group.yml ···················· 附魔类别配置
    ├── internal-triggers.yml ········ 内置触发器配置
    ├── rarity.yml ··················· 附魔品质配置
    └── target.yml ··················· 附魔对象配置
```
附魔插件官方文档教程：  
https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/basic/

>这作者文档写的非常烂，官方教程大概看看就行了  



附魔效果逻辑的实现使用了kether脚本（未来将弃用）  

kether脚本语句大全：  
https://taboolib.hhhhhy.kim/kether-list

下面是两个附魔示例配置：  

```yaml
basic:
  id: night_vision
  name: 月光祝福
  max_level: 1

rarity: 史诗

targets:
  - 头盔

limitations: [ ]

display:
  description:
    general: "在黑暗中提供清晰的视野"
    specific: "&7在黑暗中提供清晰的视野&f(夜视效果)&7"

mechanisms:
  tickers:
    durability:
      interval: 60
      handle: |-
        add-potion-effect NIGHT_VISION on &player duration 320 amplifier 1
```

```yaml
basic:
  id: blast_mining
  name: 立方
  max_level: 1

rarity: 精良

targets:
  - 镐

limitations:
  - "CONFLICT_ENCHANT:脉络"

display:
  description:
    general: "每次可以挖掘立方范围的方块"
    specific: "&7可挖掘&a{X范围}*{Y范围}*{Z范围}&7范围的方块"

variables:
  leveled:
    X范围: "格:{level}+1*2"
    Y范围: "格:{level}+1*2"
    Z范围: "格:{level}+1*2"
  ordinary:
    per-tick: 12
    disable-on-sneaking: true
    hardness-check: BEDROCK,OBSIDIAN
    blacklist: SKELETON_SKULL,WITHER_SKELETON_SKULL,CREEPER_HEAD,CREEPER_WALL_HEAD,PIGLIN_HEAD,PIGLIN_WALL_HEAD,PLAYER_HEAD,PLAYER_WALL_HEAD,ZOMBIE_HEAD,ZOMBIE_WALL_HEAD

mechanisms:
  listeners:
    on-break:
      listen: "block-break"
      handle: |-
        if hasMark block-ignored on &event[block] then {
          set &mirror[isCancelled] to true
          exit
        }
        if all [ type boolean &disable-on-sneaking player sneaking ] then {
          exit
        }

        set breaks to array [ ]

        set tX to type int &X范围
        set tY to type int &Y范围
        set tZ to type int &Z范围
        
        set rangeX to calc "(tX - level) / 2 + level"
        set rangeY to calc "(tY - level) / 2 + level"
        set rangeZ to calc "(tZ - level) / 2 + level"

        set world to &event[block.world]
        set x to type int &event[block.x]
        set y to type int &event[block.y]
        set z to type int &event[block.z]

        set hardness-check to split &hardness-check by ","
        set blacklist to split &blacklist by ","

        set tx to math -1 * &rangeX + 1
        set ty to math -1 * &rangeY + 1
        set tz to math -1 * &rangeZ + 1

        set tx1 to math sub [ &rangeX 1 ]
        set ty1 to math sub [ &rangeY 1 ]
        set tz1 to math sub [ &rangeZ 1 ]

        for ox in range &tx to &tx1 then {
          for oy in range &ty to &ty1 then {
            for oz in range &tz to &tz1 then {
              if any [ not check &ox is 0 not check &oy is 0 not check &oz is 0 ] then {

                set bx to math &x + &ox
                set by to math &y + &oy
                set bz to math &z + &oz

                set loc to location &world &bx &by &bz
                set type to &loc[block.type]

                if all [ not check &type is AIR not check &type in &blacklist not check &type in &hardness-check ] then {
                  arr-add &loc to &breaks
                }
              }
            }
          }
        }

        operation fast-multi-break args array [ &player &breaks &per-tick ]
```