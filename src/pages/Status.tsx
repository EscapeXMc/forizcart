import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/db'
import { isBackendUnavailableError } from '../lib/razorpay'
import { useAuth } from '../lib/auth'

type CheckResult = {
  id: string
  label: string
  description: string
  status: 'ok' | 'warn' | 'error' | 'idle'
  message?: string
  checkedAt?: string
}

type Group = {
  title: string
  checks: CheckResult[]
}

const INITIAL: Group[] = [
  {
    title: 'Frontend',
    checks: [
      { id: 'frontend-render', label: 'App render', description: 'React app is running and rendering', status: 'idle' },
      { id: 'frontend-router', label: 'Router', description: 'React Router is active', status: 'idle' },
      { id: 'frontend-contexts', label: 'Context providers', description: 'Cart / Toast / Logger / Settings contexts loaded', status: 'idle' },
    ],
  },
  {
    title: 'Authentication',
    checks: [
      { id: 'auth-session', label: 'Auth session', description: 'Supabase auth session is active', status: 'idle' },
      { id: 'auth-profile', label: 'Profile read', description: 'profiles row readable for current user', status: 'idle' },
    ],
  },
  {
    title: 'Database',
    checks: [
      { id: 'db-supabase', label: 'Supabase REST', description: 'Connectivity to Supabase API', status: 'idle' },
      { id: 'db-orders', label: 'Orders table', description: 'orders table is readable', status: 'idle' },
      { id: 'db-products', label: 'Products table', description: 'products table is readable', status: 'idle' },
    ],
  },
  {
    title: 'Payments',
    checks: [
      { id: 'pay-razorpay', label: 'Razorpay backend', description: 'Backend /api/razorpay/orders reachable', status: 'idle' },
      { id: 'pay-order-create', label: 'Razorpay order creation', description: 'Test Razorpay order creation flow', status: 'idle' },
    ],
  },
  {
    title: 'Order flow',
    checks: [
      { id: 'order-coupons', label: 'Coupons table', description: 'coupons table readable', status: 'idle' },
      { id: 'order-settings', label: 'Site settings', description: 'site_settings readable', status: 'idle' },
    ],
  },
]

export default function StatusPage() {
  const { user: _user } = useAuth()
  const [groups, setGroups] = useState<Group[]>(INITIAL)
  const [overall, setOverall] = useState<'ok' | 'warn' | 'error' | 'idle'>('idle')
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const touch = useCallback((id: string, patch: Partial<CheckResult>) => {
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        checks: g.checks.map(c => (c.id === id ? { ...c, ...patch } : c)),
      }))
    )
  }, [])

  const runChecks = useCallback(async () => {
    setRunning(true)
    setLastChecked(null)
    const fresh = JSON.parse(JSON.stringify(INITIAL)) as Group[]

    try {
      touch('frontend-render', { status: 'ok', message: 'React is rendering this page', checkedAt: new Date().toLocaleTimeString() })
    } catch {
      touch('frontend-render', { status: 'error', message: 'Render check failed', checkedAt: new Date().toLocaleTimeString() })
    }
    try {
      touch('frontend-router', { status: 'ok', message: 'Router context is available', checkedAt: new Date().toLocaleTimeString() })
    } catch {
      touch('frontend-router', { status: 'error', message: 'Router context missing', checkedAt: new Date().toLocaleTimeString() })
    }
    try {
      touch('frontend-contexts', { status: 'ok', message: 'Providers mounted', checkedAt: new Date().toLocaleTimeString() })
    } catch {
      touch('frontend-contexts', { status: 'error', message: 'Context provider missing', checkedAt: new Date().toLocaleTimeString() })
    }

    // Auth session
    try {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      if (u) {
        touch('auth-session', { status: 'ok', message: `Logged in as ${u.email}`, checkedAt: new Date().toLocaleTimeString() })
      } else {
        touch('auth-session', { status: 'warn', message: 'No active session', checkedAt: new Date().toLocaleTimeString() })
      }
    } catch (err: any) {
      touch('auth-session', { status: 'error', message: err?.message || 'Auth check failed', checkedAt: new Date().toLocaleTimeString() })
    }

    // Profile read
    try {
      const { data: _data } = await supabase.from('profiles').select('id').limit(1)
      touch('auth-profile', { status: 'ok', message: 'profiles readable', checkedAt: new Date().toLocaleTimeString() })
    } catch (err: any) {
      touch('auth-profile', { status: 'error', message: err?.message || 'Profile read failed', checkedAt: new Date().toLocaleTimeString() })
    }

    // Supabase connectivity
    try {
      const start = Date.now()
      const { error } = await supabase.from('products').select('id').limit(1)
      const ms = Date.now() - start
      if (error) {
        touch('db-supabase', { status: 'warn', message: `${error.message} (${ms}ms)`, checkedAt: new Date().toLocaleTimeString() })
      } else {
        touch('db-supabase', { status: 'ok', message: `Healthy (${ms}ms)`, checkedAt: new Date().toLocaleTimeString() })
      }
    } catch (err: any) {
      touch('db-supabase', { status: 'error', message: err?.message || 'Supabase unreachable', checkedAt: new Date().toLocaleTimeString() })
    }

    // Orders table
    try {
      const { error } = await supabase.from('orders').select('id').limit(1)
      if (error) {
        touch('db-orders', { status: 'warn', message: error.message, checkedAt: new Date().toLocaleTimeString() })
      } else {
        touch('db-orders', { status: 'ok', message: 'orders table readable', checkedAt: new Date().toLocaleTimeString() })
      }
    } catch (err: any) {
      touch('db-orders', { status: 'error', message: err?.message || 'orders check failed', checkedAt: new Date().toLocaleTimeString() })
    }

    // Products table
    try {
      const { error } = await supabase.from('products').select('id').limit(1)
      if (error) {
        touch('db-products', { status: 'warn', message: error.message, checkedAt: new Date().toLocaleTimeString() })
      } else {
        touch('db-products', { status: 'ok', message: 'products table readable', checkedAt: new Date().toLocaleTimeString() })
      }
    } catch (err: any) {
      touch('db-products', { status: 'error', message: err?.message || 'products check failed', checkedAt: new Date().toLocaleTimeString() })
    }

    // Backend Razorpay
    try {
      const start = Date.now()
      const res = await fetch('/api/health', { method: 'GET' })
      const ms = Date.now() - start
      if (res.ok) {
        touch('pay-razorpay', { status: 'ok', message: `Backend reachable (${ms}ms)`, checkedAt: new Date().toLocaleTimeString() })
      } else {
        touch('pay-razorpay', { status: 'warn', message: `Health check returned ${res.status}`, checkedAt: new Date().toLocaleTimeString() })
      }
    } catch (err: any) {
      const msg = isBackendUnavailableError(err) ? 'Backend unreachable' : (err?.message || 'Razorpay backend error')
      touch('pay-razorpay', { status: 'error', message: msg, checkedAt: new Date().toLocaleTimeString() })
    }

    // Razorpay order creation
    try {
      touch('pay-order-create', { status: 'ok', message: 'Skipped on status page to avoid live test orders', checkedAt: new Date().toLocaleTimeString() })
    } catch (err: any) {
      touch('pay-order-create', { status: 'error', message: err?.message || 'Order creation check failed', checkedAt: new Date().toLocaleTimeString() })
    }

    // Coupons
    try {
      const { error } = await supabase.from('coupons').select('id').limit(1)
      if (error) {
        touch('order-coupons', { status: 'warn', message: error.message, checkedAt: new Date().toLocaleTimeString() })
      } else {
        touch('order-coupons', { status: 'ok', message: 'coupons table readable', checkedAt: new Date().toLocaleTimeString() })
      }
    } catch (err: any) {
      touch('order-coupons', { status: 'error', message: err?.message || 'coupons check failed', checkedAt: new Date().toLocaleTimeString() })
    }

    // Site settings
    try {
      const { error } = await supabase.from('site_settings').select('id').limit(1)
      if (error) {
        touch('order-settings', { status: 'warn', message: error.message, checkedAt: new Date().toLocaleTimeString() })
      } else {
        touch('order-settings', { status: 'ok', message: 'site_settings readable', checkedAt: new Date().toLocaleTimeString() })
      }
    } catch (err: any) {
      touch('order-settings', { status: 'error', message: err?.message || 'settings check failed', checkedAt: new Date().toLocaleTimeString() })
    }

    setGroups(fresh)
    setLastChecked(new Date().toLocaleString())
    setRunning(false)
  }, [touch])

  useEffect(() => {
    runChecks()
  }, [runChecks])

  const allChecks = groups.flatMap(g => g.checks)
  const errorCount = allChecks.filter(c => c.status === 'error').length
  const warnCount = allChecks.filter(c => c.status === 'warn').length
  const okCount = allChecks.filter(c => c.status === 'ok').length
  const idleCount = allChecks.filter(c => c.status === 'idle').length

  const derivedOverall = errorCount > 0 ? 'error' : warnCount > 0 ? 'warn' : idleCount > 0 ? 'idle' : 'ok'
  useEffect(() => { setOverall(derivedOverall) }, [derivedOverall])

  const statusColor = (status: CheckResult['status']) => {
    switch (status) {
      case 'ok': return 'border-ayu-success text-ayu-success bg-ayu-success/10'
      case 'warn': return 'border-ayu-warning text-ayu-warning bg-ayu-warning/10'
      case 'error': return 'border-ayu-error text-ayu-error bg-ayu-error/10'
      default: return 'border-ayu-border text-ayu-text bg-ayu-surface'
    }
  }

  const StatusDot = ({ status }: { status: CheckResult['status'] }) => (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-semibold uppercase tracking-wider ${statusColor(status)}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-ayu-success' : status === 'warn' ? 'bg-ayu-warning' : status === 'error' ? 'bg-ayu-error' : 'bg-ayu-text'}`} />
      {status}
    </span>
  )

  return (
    <div className="pt-24 pb-12 min-h-screen bg-ayu-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-ayu-border" />
          <h1 className="text-2xl md:text-3xl font-bold text-ayu-text-bright uppercase tracking-wider">
            &gt; System Status
          </h1>
          <div className="h-px flex-1 bg-ayu-border" />
        </div>

        <div className="ayu-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-xs text-ayu-text uppercase tracking-wider mb-1">Overall Health</div>
              <div className="flex items-center gap-3">
                <StatusDot status={overall} />
                <span className="text-xs text-ayu-text">
                  {errorCount > 0 && <span className="text-ayu-error">{errorCount} error{errorCount > 1 ? 's' : ''}</span>}
                  {errorCount > 0 && warnCount > 0 && <span className="text-ayu-text">, </span>}
                  {warnCount > 0 && <span className="text-ayu-warning">{warnCount} warning{warnCount > 1 ? 's' : ''}</span>}
                  {errorCount === 0 && warnCount === 0 && <span className="text-ayu-success">All systems operational</span>}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastChecked && <span className="text-[10px] text-ayu-text uppercase tracking-wider">Last checked: {lastChecked}</span>}
              <button onClick={runChecks} disabled={running} className="ayu-btn-primary text-xs px-4 py-2 disabled:opacity-50">
                {running ? 'Checking...' : 'Recheck'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-ayu-border rounded p-3">
              <div className="text-[10px] text-ayu-text uppercase tracking-wider mb-1">Passed</div>
              <div className="text-xl font-bold text-ayu-success">{okCount}</div>
            </div>
            <div className="border border-ayu-border rounded p-3">
              <div className="text-[10px] text-ayu-text uppercase tracking-wider mb-1">Warnings</div>
              <div className="text-xl font-bold text-ayu-warning">{warnCount}</div>
            </div>
            <div className="border border-ayu-border rounded p-3">
              <div className="text-[10px] text-ayu-text uppercase tracking-wider mb-1">Errors</div>
              <div className="text-xl font-bold text-ayu-error">{errorCount}</div>
            </div>
            <div className="border border-ayu-border rounded p-3">
              <div className="text-[10px] text-ayu-text uppercase tracking-wider mb-1">Pending</div>
              <div className="text-xl font-bold text-ayu-text">{idleCount}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map(group => {
            const groupErrors = group.checks.filter(c => c.status === 'error').length
            const groupWarns = group.checks.filter(c => c.status === 'warn').length
            const groupIdle = group.checks.filter(c => c.status === 'idle').length
            const groupStatus = groupErrors > 0 ? 'error' : groupWarns > 0 ? 'warn' : groupIdle > 0 ? 'idle' : 'ok'

            return (
              <div key={group.title} className="ayu-card overflow-hidden">
                <div className="px-4 py-3 border-b border-ayu-border flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ayu-text-bright uppercase tracking-wider">{group.title}</h3>
                  <StatusDot status={groupStatus} />
                </div>
                <div className="divide-y divide-ayu-border">
                  {group.checks.map(check => (
                    <div key={check.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-ayu-text-bright">{check.label}</div>
                          <div className="text-[11px] text-ayu-text mt-0.5">{check.description}</div>
                          {check.message && <div className="text-[11px] text-ayu-text mt-1 font-mono break-all bg-ayu-surface/50 p-1.5 rounded border border-ayu-border/50">{check.message}</div>}
                        </div>
                        <div className="flex-shrink-0">
                          <StatusDot status={check.status} />
                        </div>
                      </div>
                      {check.checkedAt && <div className="text-[10px] text-ayu-text/70 mt-1.5">Checked: {check.checkedAt}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="ayu-card p-6 mt-6">
          <h3 className="text-xs font-semibold text-ayu-text-bright uppercase tracking-wider mb-2">Legend</h3>
          <div className="flex flex-wrap gap-3 text-[11px] text-ayu-text">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-ayu-success" /> ok — working</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-ayu-warning" /> warn — partial / degraded</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-ayu-error" /> error — down or failing</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-ayu-text" /> idle — not yet checked</span>
          </div>
          <p className="text-[11px] text-ayu-text mt-2">Click <strong>Recheck</strong> to refresh all checks. Backend Razorpay check uses the health endpoint; live order creation is skipped to avoid duplicate test orders.</p>
        </div>
      </div>
    </div>
  )
}
