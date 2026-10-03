// 生意雷达的分类、标签和主体词典。
// 分类 key 已上线，保持稳定；显示名和指南围绕“具体生意模型”组织。
export const CATEGORIES = [
  { key: "solo-build", label: "软件与微型 SaaS", section: "软件产品", guide: "一个人开发并销售微型 SaaS、App、插件、API、自动化工具或小型网站，重点看客户、定价和收入证据" },
  { key: "services", label: "AI 服务与自由职业", section: "服务生意", guide: "用 AI、设计、开发、营销或专业技能为明确客户交付服务，重点看获客、报价、交付和现金流" },
  { key: "commerce", label: "数字产品与轻商品", section: "可重复交付", guide: "模板、课程、资料包、电子书、素材、轻库存商品或小众电商，重点看制作、渠道、成本和成交" },
  { key: "creator", label: "内容与创作者收入", section: "内容变现", guide: "公众号、Newsletter、YouTube、播客、短视频、社群和个人品牌如何形成广告、订阅、咨询或产品收入" },
  { key: "growth", label: "获客、定价与交付", section: "经营动作", guide: "客户从哪里来、如何成交、如何定价、如何交付、复购和控制现金流；必须落到具体动作" },
  { key: "policy", label: "平台、支付与合规", section: "经营边界", guide: "只有在明确影响某类个人商家下一步行动时，才收录平台规则、支付、税务和合规变化" },
  { key: "discussion", label: "生意实验与讨论", section: "未验证机会", guide: "有人认真讨论或正在验证的单一生意想法；必须明确标注证据不足，不得写成已验证收入" },
] as const;

export const ITEM_TYPES = ["business_opportunity", "product_launch", "case_study", "platform_change", "policy_change", "how_to", "discussion"] as const;

export const CATEGORY_TAGS = [
  "独立开发", "AI服务", "自由职业", "服务生意", "数字产品", "内容变现", "电商/跨境", "本地服务", "获客/销售", "定价/现金流", "真实案例", "讨论观察", "平台规则", "政策/税务", "风险提醒", "工具/自动化", "其他",
] as const;

export const TOPIC_TAGS = [
  "微型SaaS", "App/插件", "网站/API", "AI工具", "AI自动化", "开源项目", "设计服务", "开发服务", "咨询培训", "代运营", "家政/维修", "本地生活", "二手交易", "跨境电商", "小众品牌", "知识产品", "数字模板", "收入案例", "付费社群", "公众号", "Newsletter", "播客/视频", "YouTube", "短视频", "SEO", "冷邮件", "社交获客", "邮件/订阅", "自动化", "支付/税务", "平台流量", "复购/留存", "供应链", "低成本启动",
] as const;

export const ENTITY_TAGS = [
  "Product Hunt", "Hacker News", "Indie Hackers", "Shopify", "Stripe", "淘宝", "京东", "抖音电商", "小红书", "微信小店", "美团", "闲鱼", "36氪", "亿邦动力",
] as const;

export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  独立开发者: "独立开发", 微型SaaS: "微型SaaS", SaaS: "微型SaaS", MicroSaaS: "微型SaaS", sideproject: "独立开发", "side project": "独立开发",
  AI代理: "AI服务", AI自动化: "AI服务", 自由职业者: "自由职业", 咨询: "咨询培训", 培训: "咨询培训", 代理: "代运营", 运营: "代运营",
  电商: "电商/跨境", 跨境: "跨境电商", 品牌: "小众品牌", 数字商品: "数字产品", 模板: "数字模板", 课程: "知识产品",
  公众号: "内容变现", Newsletter: "内容变现", YouTube: "内容变现", 视频号: "内容变现", 播客: "内容变现",
  获客: "获客/销售", 销售: "获客/销售", 增长: "获客/销售", 现金流: "定价/现金流", 定价: "定价/现金流",
  规则: "平台规则", 平台: "平台规则", 政策: "政策/税务", 税务: "政策/税务", 合规: "风险提醒",
  案例: "真实案例", 实战: "真实案例", 观察: "讨论观察", 想法: "讨论观察", 自动化工具: "工具/自动化",
};

export const CATEGORY_BY_ITEM_TYPE: Readonly<Record<string, string>> = {
  business_opportunity: "discussion", product_launch: "solo-build", case_study: "solo-build", platform_change: "policy",
  policy_change: "policy", how_to: "growth", discussion: "discussion",
};

export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[] }> = {
  producthunt: { name: "Product Hunt", displayTag: "Product Hunt", aliases: ["Product Hunt"] },
  hackernews: { name: "Hacker News", displayTag: "Hacker News", aliases: ["Hacker News", "HN"] },
  indiehackers: { name: "Indie Hackers", displayTag: "Indie Hackers", aliases: ["Indie Hackers"] },
  shopify: { name: "Shopify", displayTag: "Shopify", aliases: ["Shopify"] },
  stripe: { name: "Stripe", displayTag: "Stripe", aliases: ["Stripe"] },
  taobao: { name: "淘宝", displayTag: "淘宝", aliases: ["淘宝", "天猫"] },
  douyin: { name: "抖音电商", displayTag: "抖音电商", aliases: ["抖音电商", "抖音"] },
  xiaohongshu: { name: "小红书", displayTag: "小红书", aliases: ["小红书"] },
  wechat: { name: "微信小店", displayTag: "微信小店", aliases: ["微信小店", "微信"] },
  meituan: { name: "美团", displayTag: "美团", aliases: ["美团"] },
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = Object.entries(ENTITIES).map(([id, item]) => ({
  id,
  name: item.name,
  patterns: item.aliases.map((alias) => new RegExp(escapeRegExp(alias), "i")),
}));

export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "producthunt", domains: ["producthunt.com"] },
  { entityId: "hackernews", domains: ["ycombinator.com", "news.ycombinator.com"] },
  { entityId: "indiehackers", domains: ["indiehackers.com"] },
  { entityId: "shopify", domains: ["shopify.com", "changelog.shopify.com"] },
  { entityId: "stripe", domains: ["stripe.com"] },
];

export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];
