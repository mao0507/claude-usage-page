import type { PlanLimitsResponse, UsageBucket, ExtraUsage } from '../types/planLimits.js'

export async function fetchPlanLimits(): Promise<PlanLimitsResponse> {
  const orgId = process.env.CLAUDE_ORG_ID
  const sessionKey = process.env.CLAUDE_SESSION_KEY
  const cfClearance = process.env.CLAUDE_CF_CLEARANCE
  const deviceId = process.env.CLAUDE_DEVICE_ID
  const activitySessionId = process.env.CLAUDE_ACTIVITY_SESSION_ID

  if (!orgId || !sessionKey) {
    return { available: false, reason: 'session_key_not_configured' }
  }

  const cookies = [
    `sessionKey=${sessionKey}`,
    cfClearance ? `cf_clearance=${cfClearance}` : '',
    activitySessionId ? `activitySessionId=${activitySessionId}` : '',
  ].filter(Boolean).join('; ')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(
      `https://claude.ai/api/organizations/${orgId}/usage`,
      {
        headers: {
          'Cookie': cookies,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Content-Type': 'application/json',
          'Referer': 'https://claude.ai/settings/usage',
          'Origin': 'https://claude.ai',
          'Anthropic-Client-Platform': 'web_claude_ai',
          'Anthropic-Anonymous-Id': '5bfc777d-743d-4edd-968f-b1ef97fcf8eb',
          'Anthropic-Client-Sha': '16919992a6596d81b0d143547a130c75741b7e80',
          'Anthropic-Client-Version': '1.0.0',
          ...(deviceId ? { 'Anthropic-Device-Id': deviceId } : {}),
          ...(activitySessionId ? { 'X-Activity-Session-Id': activitySessionId } : {}),
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
        },
        signal: controller.signal,
      }
    )

    console.log('[plan-limits] status:', res.status)
    if (res.status === 401 || res.status === 403) {
      const body = await res.text()
      console.log('[plan-limits] body:', body.slice(0, 300))
      return { available: false, reason: 'session_key_invalid' }
    }

    const data = await res.json() as {
      five_hour?: UsageBucket | null
      seven_day?: UsageBucket | null
      seven_day_omelette?: UsageBucket | null
      extra_usage?: ExtraUsage
    }

    return {
      available: true,
      five_hour: data.five_hour ?? null,
      seven_day: data.seven_day ?? null,
      seven_day_omelette: data.seven_day_omelette ?? null,
      extra_usage: data.extra_usage ?? { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null, currency: null },
    }
  } catch {
    return { available: false, reason: 'network_error' }
  } finally {
    clearTimeout(timeout)
  }
}
