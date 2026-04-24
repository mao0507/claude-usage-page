export interface UsageBucket {
  utilization: number
  resets_at: string
}

export interface ExtraUsage {
  is_enabled: boolean
  monthly_limit: number | null
  used_credits: number | null
  utilization: number | null
  currency: string | null
}

export type PlanLimitsResponse =
  | {
      available: true
      five_hour: UsageBucket | null
      seven_day: UsageBucket | null
      seven_day_omelette: UsageBucket | null
      extra_usage: ExtraUsage
    }
  | {
      available: false
      reason: 'session_key_not_configured' | 'session_key_invalid' | 'network_error'
    }
