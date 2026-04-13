'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, Calendar, Scissors, ShoppingBag, 
  Receipt, Wallet, BarChart3, Settings, MessageCircle,
  LogOut, Menu, X, Bell
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [salonName, setSalonName] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check')
      if (res.ok) {
        const data = await res.json()
        setIsAuthed(data.authenticated || data.isSuperAdmin)
        if (data.salonName) setSalonName(data.salonName)
      }
    } catch {
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5E41FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const menuItems = [
    { href: '/admin/gestao', icon: LayoutDashboard, label: 'Gestão' },
    { href: '/admin/agenda', icon: Calendar, label: 'Agenda' },
    { href: '/admin/clientes', icon: Users, label: 'Clientes' },
    { href: '/admin/servicos', icon: Scissors, label: 'Serviços' },
    { href: '/admin/vendas', icon: ShoppingBag, label: 'Vendas' },
    { href: '/admin/despesas', icon: Receipt, label: 'Despesas' },
    { href: '/admin/relatorios', icon: BarChart3, label: 'Relatórios' },
    { href: '/admin/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0D0D1A] border-r border-white/5 flex flex-col transition-all duration-300 fixed h-full z-50`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-black italic text-white">GESTÃO</h1>
                <p className="text-[#5E41FF] text-xs font-bold">E SALÃO</p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg">
              {sidebarOpen ? <X size={20} className="text-gray-500" /> : <Menu size={20} className="text-gray-500" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5 ${
                typeof window !== 'undefined' && window.location.pathname === item.href
                  ? 'bg-[#5E41FF]/20 text-[#5E41FF]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/login')
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-[#0D0D1A] border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg lg:hidden">
              <Menu size={20} className="text-gray-500" />
            </button>
            {salonName && <span className="text-gray-400 text-sm">{salonName}</span>}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-lg relative">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#5E41FF] rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
