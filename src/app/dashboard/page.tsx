'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard, 
  ArrowDownUp, 
  Repeat, 
  FileText, 
  AlertTriangle,
  ExternalLink,
  Menu,
  X,
  LogOut,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Building2,
  FileSpreadsheet,
  Receipt,
  Search,
  GraduationCap,
  Shield,
  Mail,
  ClipboardList,
  Loader2
} from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDay20, isNearDasDeadline } from '@/lib/utils'
import { usefulLinks, incomeCategories, expenseCategories, recurringCategories } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import type { Transaction, RecurringDebt, DasPayment, Profile } from '@/types/database'
import { toast } from '@/hooks/use-toast'

// Import dashboard sections
import { ResumoGeral } from '@/components/dashboard/resumo-geral'
import { Lancamentos } from '@/components/dashboard/lancamentos'
import { DebitosRecorrentes } from '@/components/dashboard/debitos-recorrentes'
import { LembreteDas } from '@/components/dashboard/lembrete-das'
import { NotasFiscais } from '@/components/dashboard/notas-fiscais'
import { LinksUteis } from '@/components/dashboard/links-uteis'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('resumo')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringDebts, setRecurringDebts] = useState<RecurringDebt[]>([])
  const [dasPayments, setDasPayments] = useState<DasPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && supabase) {
      fetchData()
    } else if (!user) {
      setLoading(false)
    }
  }, [user])

  const fetchData = async () => {
    if (!supabase || !user) return
    
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
      setTransactions(transactionsData || [])

      // Fetch recurring debts
      const { data: recurringData } = await supabase
        .from('recurring_debts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
      setRecurringDebts(recurringData || [])

      // Fetch DAS payments
      const { data: dasData } = await supabase
        .from('das_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('reference_month', { ascending: false })
        .limit(12)
      setDasPayments(dasData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Tente recarregar a página',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Calculate totals
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthTransactions = transactions.filter((t: Transaction) => {
    const date = new Date(t.transaction_date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const totalIncome = monthTransactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)

  const totalExpense = monthTransactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  const menuItems = [
    { id: 'resumo', label: 'Resumo Geral', icon: LayoutDashboard },
    { id: 'lancamentos', label: 'Lançamentos', icon: ArrowDownUp },
    { id: 'recorrentes', label: 'Débitos Recorrentes', icon: Repeat },
    { id: 'notas', label: 'Notas Fiscais', icon: FileText },
    { id: 'das', label: 'Lembrete DAS', icon: AlertTriangle },
    { id: 'links', label: 'Links Úteis', icon: ExternalLink },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-primary">FinMEI</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">FinMEI</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <p className="font-medium truncate">{profile?.full_name || user.email}</p>
          <p className="text-sm text-muted-foreground">MEI</p>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        {/* Top Bar - Desktop */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b bg-card">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Wallet className={`h-5 w-5 ${balance >= 0 ? 'text-success' : 'text-destructive'}`} />
                <div>
                  <p className="text-xs text-muted-foreground">Saldo do Mês</p>
                  <p className={`font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </header>

        {/* DAS Alert Banner */}
        {isNearDasDeadline() && (
          <div className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              ⚠️ Faltam {getDaysUntilDay20()} dias para o vencimento do DAS MEI!
            </span>
            <Button
              size="sm"
              variant="secondary"
              className="ml-2"
              onClick={() => setActiveTab('das')}
            >
              Ver DAS
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 lg:p-6">
          {activeTab === 'resumo' && (
            <ResumoGeral
              transactions={transactions}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              recurringDebts={recurringDebts}
            />
          )}
          {activeTab === 'lancamentos' && (
            <Lancamentos
              transactions={transactions}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'recorrentes' && (
            <DebitosRecorrentes
              recurringDebts={recurringDebts}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'notas' && (
            <NotasFiscais
              transactions={transactions}
            />
          )}
          {activeTab === 'das' && (
            <LembreteDas
              dasPayments={dasPayments}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'links' && (
            <LinksUteis />
          )}
        </div>
      </main>

      {/* Floating Action Button - Mobile */}
      <button
        onClick={() => setActiveTab('lancamentos')}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
