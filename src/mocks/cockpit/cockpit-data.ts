// NovaBrand Q4 2025 mock data — mirrors ls4x CockpitData shape (POC subset).

export type SpendStatus = "on_pace" | "under_pacing" | "over_pacing"
export type AlertSeverity = "high" | "medium" | "low"

export interface SpendRecommendation {
  id: string
  channel: string
  tactic?: string
  level: "channel" | "tactic"
  status: SpendStatus
  pacing_rate: number
  planned_spend: number
  actual_spend: number
  recommendation: string
}

export interface ExperimentAlert {
  id: string
  name: string
  platform: string
  status: "live" | "completed" | "paused"
  type: string
  days_running: number
  lift_estimate: string | null
  confidence: number | null
  message: string
}

export interface DataAnomalyAlert {
  id: string
  source: string
  type: string
  severity: AlertSeverity
  message: string
  detected_at: string
}

export interface ConnectorWarning {
  id: string
  connector: string
  platform: string
  severity: AlertSeverity
  message: string
  last_sync: string
}

export interface LiveMarketingPlan {
  name: string
  horizon: string
  strategy: string
  budget: number
  days_elapsed: number
  days_total: number
}

export interface CockpitMockData {
  updatedAt: string
  liveMarketingPlan: LiveMarketingPlan | null
  spendRecommendations: SpendRecommendation[]
  experimentAlerts: ExperimentAlert[]
  dataAnomalyAlerts: DataAnomalyAlert[]
  connectorWarnings: ConnectorWarning[]
  agentLive: {
    alignment: boolean
    goals: boolean
    media: boolean
    data: boolean
    model: boolean
    onboarding: boolean
  }
}

export const COCKPIT_MOCK_DATA: CockpitMockData = {
  updatedAt: "Jun 15, 2026 at 7:02 AM",

  liveMarketingPlan: {
    name: "NovaBrand Q4 Aggressive Growth",
    horizon: "3 months",
    strategy: "aggressive",
    budget: 560000,
    days_elapsed: 14,
    days_total: 90,
  },

  spendRecommendations: [
    {
      id: "rec-paid-social",
      channel: "Paid Social",
      level: "channel",
      status: "under_pacing",
      pacing_rate: 0.77,
      planned_spend: 240000,
      actual_spend: 184000,
      recommendation: "Increase daily budget by $8K/day across top-performing ad sets to recover Q4 pace.",
    },
    {
      id: "rec-tiktok",
      channel: "TikTok",
      level: "channel",
      status: "under_pacing",
      pacing_rate: 0.87,
      planned_spend: 60000,
      actual_spend: 52000,
      recommendation: "Expand top-performing UGC creative reach to close $8K pace gap.",
    },
    {
      id: "rec-search",
      channel: "Paid Search",
      level: "channel",
      status: "on_pace",
      pacing_rate: 0.98,
      planned_spend: 120000,
      actual_spend: 118000,
      recommendation: "On track. Monitor branded search CTR drop flagged by Media Agent.",
    },
    {
      id: "rec-display",
      channel: "Display",
      level: "channel",
      status: "over_pacing",
      pacing_rate: 1.09,
      planned_spend: 80000,
      actual_spend: 87000,
      recommendation: "Over-pacing. Consider reallocating $7K excess to Paid Social to recover overall pace.",
    },
    {
      id: "rec-affiliate",
      channel: "Affiliate",
      level: "channel",
      status: "on_pace",
      pacing_rate: 1.02,
      planned_spend: 40000,
      actual_spend: 41000,
      recommendation: "Healthy pacing. No action required.",
    },
    {
      id: "rec-search-branded",
      channel: "Paid Search",
      tactic: "Branded Keywords",
      level: "tactic",
      status: "under_pacing",
      pacing_rate: 0.81,
      planned_spend: 45000,
      actual_spend: 36000,
      recommendation: "Branded keyword CTR dropping. Investigate competitor bid pressure — may need bid adjustment.",
    },
    {
      id: "rec-social-video",
      channel: "Paid Social",
      tactic: "Video Ads",
      level: "tactic",
      status: "under_pacing",
      pacing_rate: 0.71,
      planned_spend: 90000,
      actual_spend: 64000,
      recommendation: "Video creative fatigue reducing delivery. Rotate creative to recover pace.",
    },
  ],

  experimentAlerts: [
    {
      id: "exp-meta-holdout",
      name: "Meta Holdout — US Q4",
      platform: "Meta Ads",
      status: "live",
      type: "Geo Holdout",
      days_running: 12,
      lift_estimate: "2.1x iROAS",
      confidence: 76,
      message: "12 days in. Early lift signal: iROAS 2.1x, p=0.04. Monitor through day 21 before concluding.",
    },
    {
      id: "exp-pmax-vs-standard",
      name: "PMax vs Standard Shopping — UK",
      platform: "Google Ads",
      status: "live",
      type: "A/B Campaign",
      days_running: 8,
      lift_estimate: null,
      confidence: null,
      message: "8 days in. Insufficient data for lift estimate. Standard shopping variant performing +3% CTR.",
    },
  ],

  dataAnomalyAlerts: [
    {
      id: "anomaly-meta-gap",
      source: "Meta Ads Manager",
      type: "Reporting Gap",
      severity: "medium",
      message: "6-hour reporting gap detected in Meta Ads Manager (02:00–08:00 UTC). Yesterday spend data may be incomplete. Re-check after 09:00 UTC.",
      detected_at: "Today at 06:15 AM",
    },
  ],

  connectorWarnings: [
    {
      id: "warn-shopify",
      connector: "Shopify Webhook",
      platform: "Shopify",
      severity: "low",
      message: "Shopify order webhook delayed by ~3 hours last night. Revenue attribution for late-night orders may be misaligned. Engineering notified.",
      last_sync: "Yesterday at 11:47 PM",
    },
  ],

  agentLive: {
    alignment: true,
    goals: true,
    media: true,
    data: true,
    model: false,
    onboarding: true,
  },
}
