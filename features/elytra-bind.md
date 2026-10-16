---
title: 契约之翼
description: 契约之翼的玩家使用说明，包含一人一翼的名额限制、从原版鞘翅到下界合金鞘翅与高阶鞘翅的升阶方式、幻翼觉醒、星辉解缚符换线与日常保管规则。
outline: [2, 3]
---

# 契约之翼

契约之翼让每一件正式鞘翅都和主人同行。你可以从原版鞘翅一路升阶、随时调整路线，它也不会在日常操作中被误放或随手丢掉。

## 一人一翼

一名玩家同时只能拥有一件已经绑定的正式鞘翅。首次取得原版鞘翅时，契约会交给取得者；通过幻翼觉醒得到原版鞘翅时也是一样。

已有契约后，不能再拾取普通或高阶鞘翅，也不能拾取其他玩家已经绑定的鞘翅。只有**幻翼之翼**不受此限制：它是升级材料，不会绑定，也不占用正式鞘翅名额。

输入 `/elytrabind` 查看自己的契约状态、绑定日期和鞘翅位置。

解除契约由服务器处理，玩家没有自行解除的入口。

## 从原版鞘翅一路升阶

正式鞘翅的阶位固定如下：

1. <McItem id="elytra" size="lg" /> **原版鞘翅**：从末地城开始你的飞行旅程。
2. <McItem name="下界合金鞘翅" texture="/mc-textures/item/elytra/netherite-wings.png" size="lg" /> **下界合金鞘翅**
3. **炼狱之翼**
4. <McItem name="龙翼" texture="/mc-textures/item/elytra/dragon-wings.png" size="lg" /> **龙翼**
5. <McItem name="光翼" texture="/mc-textures/item/elytra/light-wings.png" size="lg" /> **光翼**

下界合金鞘翅是固定的第一阶锻造升级。炼狱之翼、龙翼和光翼等后续阶位，可以在地面上作为 Q 跃迁目标。同级或更低的鞘翅不能作为升阶目标。

## 第一阶：在锻造台升级

下界合金鞘翅不通过 Q 跃迁获得。将自己的已绑定原版鞘翅带到锻造台，依次放入三槽：

1. 模板槽：<McItem id="netherite_upgrade_smithing_template" /> 下界合金升级模板。
2. 装备槽：自己的原版鞘翅。
3. 材料槽：<McItem id="netherite_ingot" /> 下界合金锭。

完成后获得下界合金鞘翅。契约、已有附魔和耐久损耗比例都会继承。原鞘翅损耗约 30% 时，升级后的鞘翅也保持约 30% 的损耗比例。

## 在地面上完成后续 Q 跃迁

Q 跃迁用于让炼狱之翼、龙翼、光翼等后续高阶鞘翅进入你的契约。下界合金鞘翅不在 Q 跃迁目标中。操作前，将自己的低阶绑定鞘翅拿在手上，并走近地面上严格更高阶的鞘翅。

1. 走到目标 **3 格内**。
2. 动作栏会显示最近、且可以升阶的目标名称，并提示「按 Q 升级」。
3. 按下 Q 扔出后，手中的鞘翅会与地上的高阶鞘翅交换，新鞘翅直接回到背包。

附近有多件高阶鞘翅时，系统只会选择最近的一件。想换目标时，先走近你真正想要的那一件。

::: tip 契约会完整继承
跃迁后会保留契约、已有附魔和耐久损耗比例。原鞘翅已经损耗约 30% 时，升阶后的鞘翅也保持约 30% 的损耗比例。
:::

背包没有空位时，先清出位置再试。目标超过 3 格、阶位不更高，或手中不是自己的绑定鞘翅时，Q 都不会触发升级。绑定鞘翅在平时也不能直接 Q 丢弃。

## 幻翼之翼与觉醒

<McItem name="幻翼之翼" texture="/mc-textures/item/elytra/phantom-wings.png" size="lg" /> **幻翼之翼**是材料，不是正式鞘翅。你可以积累多件；当自己还没有正式契约时，可以在工作台将它觉醒为一件全新的原版鞘翅。

<CraftingTable
  shaped
  size="sm"
  :grid="[
    [{name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}, {name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}, {name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}],
    [{name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}, {name:'幻翼之翼', texture:'/mc-textures/item/elytra/phantom-wings.png'}, {name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}],
    [{name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}, {name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}, {name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}]
  ]"
  :result="{id:'elytra'}"
/>

觉醒产出的原版鞘翅会直接绑定给合成者。已有正式契约时，不能用这条方式制造第二件正式鞘翅。

## 用星辉解缚符调整路线

如果想从一条高阶路线换到另一条，先把当前高阶鞘翅还原为原版鞘翅，再选择新的高阶目标。制作星辉解缚符：

<CraftingTable
  shaped
  size="sm"
  :grid="[
    [{name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}, {id:'dragon_breath'}, {name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}],
    [{id:'phantom_membrane'}, {name:'幻翼之翼', texture:'/mc-textures/item/elytra/phantom-wings.png'}, {id:'phantom_membrane'}],
    [{id:'phantom_membrane'}, {id:'experience_bottle'}, {id:'phantom_membrane'}]
  ]"
  :result="{name:'星辉解缚符', texture:'/mc-textures/item/elytra/restoration-charm.png'}"
/>

然后在锻造台放入：

- 模板槽：<McItem name="星辉解缚符" texture="/mc-textures/item/elytra/restoration-charm.png" /> 星辉解缚符。
- 装备槽：当前的高阶鞘翅。
- 材料槽：<McItem name="末影合金碎片" texture="/mc-textures/item/enderite_shard.png" /> 末影合金碎片。

结果是一件原版鞘翅。契约、已有附魔和耐久损耗比例会保留；高阶鞘翅原有的特殊外观或效果会回到原版鞘翅。幻翼之翼不走还原流程，想得到正式鞘翅请使用觉醒。

## 日常使用与保管

这些场景可以正常使用：飞行、装备、附魔、铁砧修理、研磨、附魔台、工作台与锻造台。放在自己的背包、末影箱和已识别的随身背包中同样可以。

为防止鞘翅被转交或丢失，绑定鞘翅不能放入普通箱子、潜影盒、漏斗与熔炉。展示框、盔甲架和公共垃圾桶也不允许，直接 Q 丢弃同样不行。

死亡时系统会保护并返还绑定鞘翅；极端情况下如果它落在死亡点，也只有契约主人可以拾取。没有按预期返还时，联系服务器管理团队。

## 常见问题

### 为什么拾取不了鞘翅？

你已经拥有正式契约，或这件鞘翅属于其他玩家。幻翼之翼不受这项限制。

### 为什么 Q 没有升级？

确认手持的是自己的绑定鞘翅，目标在 3 格内且阶位更高。下界合金鞘翅需要在锻造台升级，不会触发 Q 跃迁。附近有多件目标时，走近想选的那一件，让它成为最近目标。

### 为什么不能放进箱子或垃圾桶？

这是契约保护的一部分。请将鞘翅放在自己的背包、末影箱或可用的功能台中。

### 怎么更换升阶路线？

先制作星辉解缚符，将当前高阶鞘翅还原为原版鞘翅。再按目标选择：在锻造台升级为下界合金鞘翅，或向地面上的更高阶鞘翅进行 Q 跃迁。

### 如何查询自己的契约？

输入 `/elytrabind`。

## 相关页面

- [锻造升级](/features/forge)
- [服务器功能总览](/features/)
