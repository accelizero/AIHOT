// 站点身份和读者文案：普通人创业与一人小生意热点。
export const SITE = {
  name: "生意雷达",
  subject: "创业",
  homeTitle: "生意雷达 — 普通人创业与一人小生意动态",
  description: "盯住独立开发、自由职业、电商、服务业和个人变现，筛选真正值得普通人关注的机会、方法与风险。",
  tagline: "一个人也能做的生意，值得知道的变化",
  locale: "zh-CN",
  defaultUrl: "http://localhost:3000",
  mcpPrefix: "bizradar",
  contactEmail: null as string | null,
  footerNote: "由开源行业热点框架驱动",
  icp: null as string | null,
  organization: { name: "生意雷达", founder: null as null | { name: string; url?: string; description?: string } },
  crawlerName: "BizRadarBot",
} as const;

export const ABOUT = {
  kicker: `关于 ${SITE.name}`,
  headline: ["一个人能做的生意，", "每天只看真正有用的几条。"] as [string, string],
  lead: `${SITE.name} 替你盯住 {sources} 个创业与经营信源：抓取、归并、核验和精选，帮你发现可执行的赚钱路径。`,
  steps: {
    collect: "独立开发者、自由职业者、电商卖家、服务业经营者和官方政策源都在看。",
    store: "把同一个机会、平台变化或经营问题归到一起，保留原始链接和证据。",
    select: "模型先判断是否与一人创业有关，再区分真实案例、可验证讨论和纯营销噪声。",
    publish: "每天整理值得跟进的机会、方法和风险；不承诺暴富，只提供可核验的信息。",
  },
  maker: null as null | { name: string; greeting: string[]; avatarSourceId?: string | null; wechat?: { title: string; note: string }; feishu?: { title: string; note: string } },
  copyright: `${SITE.name} 是聚合摘要和阅读索引，原文版权归各来源所有。如果你是来源方，希望更正、下架或调整展示方式，可以通过`,
} as const;

export function withSubject(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.subject) ? `${SITE.subject} ${noun}` : `${SITE.subject}${noun}`;
}
