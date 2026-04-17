import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, DollarSign, Camera, Plane } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const NAV = [
  { to: '/', label: 'Home', jp: '家', icon: Home },
  { to: '/budget', label: 'Budget', jp: '円', icon: DollarSign },
  { to: '/memories', label: 'Memories', jp: '思', icon: Camera },
  { to: '/travel', label: 'Travel', jp: '旅', icon: Plane },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-washi-50/85 backdrop-blur-sm border-b border-washi-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="group flex items-baseline gap-3 hover:opacity-80 transition-smooth">
            <span className="font-serif text-2xl text-ai-500 tracking-mincho-wide">日本</span>
            <span className="h-4 w-px bg-sumi-300" aria-hidden />
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-base text-sumi-900 tracking-mincho">Japan 2026</span>
              <span className="text-[11px] text-sumi-500 tracking-wide">6月1日 — 6月17日</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {NAV.map((item) => {
              const active = isActive(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex flex-col items-center text-sm font-medium tracking-wide transition-smooth ${
                    active ? 'text-ai-500' : 'text-sumi-700 hover:text-ai-500'
                  }`}
                >
                  <span className="font-serif text-[11px] text-sumi-400 group-hover:text-ai-400 transition-colors">
                    {item.jp}
                  </span>
                  <span className="mt-0.5">{item.label}</span>
                  <span
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-px bg-ai-500 transition-all duration-300 ${
                      active ? 'w-6' : 'w-0 group-hover:w-4'
                    }`}
                    aria-hidden
                  />
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-16">
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-washi-50/95 backdrop-blur-sm border-t border-washi-200 z-40">
        <div className="flex justify-around">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                  active ? 'text-ai-500' : 'text-sumi-500'
                }`}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-[11px] tracking-wide">{item.label}</span>
                {active && <span className="h-px w-4 bg-ai-500" aria-hidden />}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="h-20 md:h-0" />

      <footer className="hidden md:block border-t border-washi-200 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-sumi-400 tracking-wide">
          <span className="font-serif">旅の記録 · Travel Journal</span>
          <span>Japan 2026</span>
        </div>
      </footer>
    </div>
  )
}
