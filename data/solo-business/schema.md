# 记录字段

建议以 JSONL 维护，每行一条候选或已发布记录：

```json
{"id":"2026-0001","status":"candidate","title":"","url":"","sourceName":"","publishedAt":"2026-01-01T00:00:00Z","collectedAt":"2026-01-01T00:00:00Z","businessType":"solo-build","tags":["微型SaaS"],"claimType":"case","evidenceLevel":"community_discussion","model":"","startupCost":"","timeToFirstSale":"","skills":[],"customer":"","acquisition":"","revenueEvidence":"","risks":"","whyItMatters":"","notes":""}
```

字段约定：`status` 可为 candidate/reviewed/published/rejected；`claimType` 可为 case、discussion、platform_change、policy、how_to、launch；`evidenceLevel` 可为 first_party、reported、community_discussion、inference。金额、时间和收入只在来源明确时填写，未知就留空，不估算成事实。
