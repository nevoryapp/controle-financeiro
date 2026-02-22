'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowUpRight, ArrowDownRight, Plus, Search, Download, Loader2, FileText, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { incomeCategories, expenseCategories } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import type { Transaction } from '@/types/database'
import { toast } from '@/hooks/use-toast'

interface LancamentosProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export function Lancamentos({ transactions, onRefresh }: LancamentosProps) {
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterMonth, setFilterMonth] = useState('current')
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('income')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !supabase) return

    setLoading(true)
    try {
      let fileUrl: string | null = null

      // Upload file if exists
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('notas-fiscais')
          .upload(fileName, file)

        if (uploadError) {
          throw uploadError
        }

        // Store the file path (not public URL) since bucket is private
        // Signed URLs will be generated on demand when viewing/downloading
        fileUrl = fileName
      }

      // Insert transaction
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type,
          amount: parseFloat(amount),
          transaction_date: date,
          category,
          description,
          file_url: fileUrl,
        })

      if (error) throw error

      toast({
        title: 'Lançamento adicionado!',
        description: 'Sua transação foi registrada com sucesso.',
      })

      // Reset form
      setType('income')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setCategory('')
      setDescription('')
      setFile(null)
      setDialogOpen(false)
      onRefresh()
    } catch (error: unknown) {
      toast({
        title: 'Erro ao adicionar lançamento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Lançamento excluído',
        description: 'A transação foi removida.',
      })
      onRefresh()
    } catch (error: unknown) {
      toast({
        title: 'Erro ao excluir',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }

  const exportCSV = () => {
    const headers = ['Data', 'Tipo', 'Valor', 'Categoria', 'Descrição']
    const rows = filteredTransactions.map(t => [
      formatDate(t.transaction_date),
      t.type === 'income' ? 'Entrada' : 'Saída',
      formatCurrency(Number(t.amount)),
      t.category || '',
      t.description || '',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `lancamentos_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || t.type === filterType

    let matchesMonth = true
    if (filterMonth === 'current') {
      const now = new Date()
      const tDate = new Date(t.transaction_date)
      matchesMonth = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
    }

    return matchesSearch && matchesType && matchesMonth
  })

  const categories = type === 'income' ? incomeCategories : expenseCategories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lançamentos</h2>
          <p className="text-muted-foreground">Gerencie suas entradas e saídas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Novo Lançamento</DialogTitle>
                  <DialogDescription>
                    Adicione uma entrada ou saída
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={type === 'income' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setType('income')}
                      >
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Entrada
                      </Button>
                      <Button
                        type="button"
                        variant={type === 'expense' ? 'destructive' : 'outline'}
                        className="flex-1"
                        onClick={() => setType('expense')}
                      >
                        <ArrowDownRight className="h-4 w-4 mr-2" />
                        Saída
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Descrição opcional"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Nota Fiscal (opcional)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lançamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(v: 'all' | 'income' | 'expense') => setFilterType(v)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Entradas</SelectItem>
                <SelectItem value="expense">Saídas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Mês Atual</SelectItem>
                <SelectItem value="all">Todos os Meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum lançamento encontrado
              </p>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || transaction.category || 'Sem descrição'}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.transaction_date)}</span>
                        {transaction.category && (
                          <>
                            <span>•</span>
                            <span>{transaction.category}</span>
                          </>
                        )}
                        {transaction.file_url && (
                          <>
                            <span>•</span>
                            <FileText className="h-3 w-3" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
