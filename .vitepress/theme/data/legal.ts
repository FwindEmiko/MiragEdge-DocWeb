/**
 * 站点合规条款的单一数据源。
 *
 * 条款页、条款中心卡片、页脚与导航都从这里取标题、路径和摘要，
 * 避免同一份文档在多个位置出现不同名称或不同链接。
 */

export type LegalIconName =
  | 'hub'
  | 'terms'
  | 'privacy'
  | 'disclaimer'
  | 'copyright'
  | 'minors'
  | 'contact'
  | 'arrow'
  | 'check'

export interface LegalDoc {
  /** 稳定标识，用于匹配当前页面与组件筛选 */
  key: string
  /** 两位编号，用于视觉排序（00 为总览） */
  index: string
  /** 页面完整标题 */
  title: string
  /** 侧边栏中的短标题 */
  short: string
  /** 站内绝对路径，渲染时统一经 withBase 处理 */
  href: string
  icon: LegalIconName
  /** 一句话说明，卡片与搜索结果共用 */
  summary: string
  /** 预估阅读时长 */
  reading: string
  /** 页面内容最后更新日期（ISO） */
  updated: string
}

/** 条款版本与日期：改条款时只改这里，所有页面与卡片同步 */
export const LEGAL_VERSION = 'v1.1'
export const LEGAL_EFFECTIVE = '2026-11-13'
export const LEGAL_UPDATED = '2026-11-13'

export const LEGAL_DOCS: LegalDoc[] = [
  {
    key: 'hub',
    index: '00',
    title: '条款与隐私中心',
    short: '总览',
    href: '/legal/',
    icon: 'hub',
    summary: '六份文档的入口、适用关系、版本记录与联系渠道。',
    reading: '约 2 分钟',
    updated: LEGAL_UPDATED,
  },
  {
    key: 'terms',
    index: '01',
    title: '用户协议',
    short: '用户协议',
    href: '/legal/terms',
    icon: 'terms',
    summary: '账号管理、使用规范、服务变更及双方权利义务。',
    reading: '约 6 分钟',
    updated: LEGAL_UPDATED,
  },
  {
    key: 'privacy',
    index: '02',
    title: '隐私政策',
    short: '隐私政策',
    href: '/legal/privacy',
    icon: 'privacy',
    summary: '个人信息处理范围、保存期限、共享规则与用户权利。',
    reading: '约 7 分钟',
    updated: LEGAL_UPDATED,
  },
  {
    key: 'disclaimer',
    index: '03',
    title: '免责声明',
    short: '免责声明',
    href: '/legal/disclaimer',
    icon: 'disclaimer',
    summary: '内容准确性、游戏操作风险、外部链接与责任边界。',
    reading: '约 3 分钟',
    updated: LEGAL_UPDATED,
  },
  {
    key: 'copyright',
    index: '04',
    title: '版权与知识产权声明',
    short: '版权声明',
    href: '/legal/copyright',
    icon: 'copyright',
    summary: '内容权属、代码许可、转载授权与侵权投诉程序。',
    reading: '约 4 分钟',
    updated: LEGAL_UPDATED,
  },
  {
    key: 'minors',
    index: '05',
    title: '未成年人保护与家长须知',
    short: '未成年人保护',
    href: '/legal/minors',
    icon: 'minors',
    summary: '未成年人的信息保护、游戏时长、消费提示与家长联系渠道。',
    reading: '约 3 分钟',
    updated: LEGAL_UPDATED,
  },
  {
    key: 'contact',
    index: '06',
    title: '联系我们与投诉',
    short: '联系我们',
    href: '/legal/contact',
    icon: 'contact',
    summary: '账号申诉、隐私请求、侵权投诉与安全漏洞报告。',
    reading: '约 3 分钟',
    updated: LEGAL_UPDATED,
  },
]

/** 按 key 取文档；未知 key 返回 undefined，调用方自行降级 */
export function getLegalDoc(key: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.key === key)
}

/** 把 ISO 日期格式化为中文长日期，供 <time> 文案使用 */
export function formatLegalDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  return `${match[1]} 年 ${Number(match[2])} 月 ${Number(match[3])} 日`
}

/** 除当前页之外的文档，供页尾「相关条款」使用 */
export function getRelatedLegalDocs(exclude?: string): LegalDoc[] {
  return LEGAL_DOCS.filter((doc) => doc.key !== 'hub' && doc.key !== exclude)
}
