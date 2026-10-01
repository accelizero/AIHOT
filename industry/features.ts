// 可选模块。它们只对 AI 行业有意义；本行业关闭这些模块。
// 关掉以后：导航里不再出现入口，对应的定时任务不再运行，页面与接口返回 404。

export const FEATURES = {
  /** 模型榜：汇总公开评测，按公开方法 v15 计算共识排名（/leaderboard）。每天抓 4 次评测来源。 */
  leaderboard: false,
  /** AI 专属重置监控，当前行业不启用。 */
  codexResetMonitor: false,
} as const;
