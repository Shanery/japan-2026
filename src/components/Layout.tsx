import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, DollarSign, Camera, Plane } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen bg-japan-cream flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-japan-slate text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-smooth">
            <span className="text-2xl">⛩️</span>
            <div>
              <h1 className="text-xl font-bold">Japan 2026</h1>
              <p className="text-xs text-gray-300">Jun 1 - Jun 17</p>
            </div>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link
              to="/"
              className={`flex items-center gap-2 pb-2 ${
                isActive('/') ? 'border-b-2 border-sakura-pink' : 'border-b-2 border-transparent'
              } hover:border-sakura-pink transition-smooth`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link
              to="/budget"
              className={`flex items-center gap-2 pb-2 ${
                isActive('/budget') ? 'border-b-2 border-sakura-pink' : 'border-b-2 border-transparent'
              } hover:border-sakura-pink transition-smooth`}
            >
              <DollarSign size={18} />
              <span>Budget</span>
            </Link>
            <Link
              to="/memories"
              className={`flex items-center gap-2 pb-2 ${
                isActive('/memories') ? 'border-b-2 border-sakura-pink' : 'border-b-2 border-transparent'
              } hover:border-sakura-pink transition-smooth`}
            >
              <Camera size={18} />
              <span>Memories</span>
            </Link>
            <Link
              to="/travel"
              className={`flex items-center gap-2 pb-2 ${
                isActive('/travel') ? 'border-b-2 border-sakura-pink' : 'border-b-2 border-transparent'
              } hover:border-sakura-pink transition-smooth`}
            >
              <Plane size={18} />
              <span>Travel</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around">
          <Link
            to="/"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 ${
              isActive('/') ? 'text-japan-red' : 'text-gray-600'
            } hover:bg-japan-cream transition-colors`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/budget"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 ${
              isActive('/budget') ? 'text-japan-red' : 'text-gray-600'
            } hover:bg-japan-cream transition-colors`}
          >
            <DollarSign size={24} />
            <span className="text-xs font-medium">Budget</span>
          </Link>
          <Link
            to="/memories"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 ${
              isActive('/memories') ? 'text-japan-red' : 'text-gray-600'
            } hover:bg-japan-cream transition-colors`}
          >
            <Camera size={24} />
            <span className="text-xs font-medium">Memories</span>
          </Link>
          <Link
            to="/travel"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 ${
              isActive('/travel') ? 'text-japan-red' : 'text-gray-600'
            } hover:bg-japan-cream transition-colors`}
          >
            <Plane size={24} />
            <span className="text-xs font-medium">Travel</span>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom padding to account for nav */}
      <div className="h-20 md:h-0" />
    </div>
  )
}
