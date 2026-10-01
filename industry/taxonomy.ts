// 普通人创业与一人小生意的分类、标签和主体词典。
export const CATEGORIES = [
  { key: "solo-build", label: "独立开发", section: "独立开发与数字产品", guide: "一个人或小团队开发的软件、插件、模板、自动化工具、微型 SaaS 和数字产品" },
  { key: "services", label: "服务生意", section: "服务与自由职业", guide: "咨询、设计、开发、代运营、培训、撮合、上门服务和其他靠技能交付的生意" },
  { key: "commerce", label: "电商与商品", section: "电商与个人品牌", guide: "电商、跨境、小众品牌、二手交易、数字商品和供应链机会" },
  { key: "creator", label: "内容变现", section: "内容与个人品牌", guide: "内容创作、知识产品、社群、订阅、播客、视频和创作者变现" },
  { key: "growth", label: "获客经营", section: "获客、销售与经营", guide: "获客、销售、定价、交付、复购、自动化、现金流和客户经营" },
  { key: "policy", label: "政策平台", section: "政策、平台与风险", guide: "影响个人创业的政策、税务、平台规则、合规、劳动与市场变化" },
  { key: "discussion", label: "讨论观察", section: "讨论与观察", guide: "尚未验证但有人认真讨论的创业想法、趋势和市场信号，必须明确标注为观察" },
] as const;

export const ITEM_TYPES = ["business_opportunity", "product_launch", "case_study", "platform_change", "policy_change", "how_to", "discussion"] as const;

export const CATEGORY_TAGS = [
  "独立开发", "自由职业", "服务生意", "电商/跨境", "数字产品", "内容变现", "获客/销售", "定价/现金流", "平台规则", "政策/税务", "真实案例", "讨论观察", "风险提醒", "工具/自动化", "其他",
] as const;

export const TOPIC_TAGS = [
  "微型SaaS", "插件/模板", "AI工具", "开源项目", "设计服务", "开发服务", "咨询培训", "代运营", "本地生活", "二手交易", "跨境电商", "小众品牌", "知识产品", "付费社群", "播客/视频", "SEO", "社交获客", "邮件/订阅", "自动化", "支付/税务", "平台流量", "复购/留存", "供应链", "低成本启动",
] as const;

export const ENTITY_TAGS = [
  "Product Hunt", "Hacker News", "Indie Hackers", "Shopify", "Stripe", "淘宝", "京东", "抖音电商", "小红书", "微信小店", "美团", "闲鱼", "36氪", "亿邦动力",
] as const;

export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  独立开发者: "独立开发", 微型SaaS: "微型SaaS", SaaS: "微型SaaS", sideproject: "独立开发", "side project": "独立开发",
  自由职业者: "自由职业", 咨询: "咨询培训", 培训: "咨询培训", 代理: "代运营", 运营: "代运营",
  电商: "电商/跨境", 跨境: "跨境电商", 品牌: "小众品牌", 数字商品: "数字产品", 课程: "知识产品",
  获客: "获客/销售", 销售: "获客/销售", 增长: "获客/销售", 现金流: "定价/现金流", 定价: "定价/现金流",
  规则: "平台规则", 平台: "平台规则", 政策: "政策/税务", 税务: "政策/税务", 合规: "风险提醒",
  案例: "真实案例", 实战: "真实案例", 观察: "讨论观察", 想法: "讨论观察", 自动化工具: "工具/自动化",
};

export const CATEGORY_BY_ITEM_TYPE: Readonly<Record<string, string>> = {
  business_opportunity: "独立开发", product_launch: "数字产品", case_study: "真实案例", platform_change: "平台规则",
  policy_change: "政策/税务", how_to: "获客/销售", discussion: "讨论观察",
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
