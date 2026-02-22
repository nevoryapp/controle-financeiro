'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, Loader2, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { recurringCategories } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import type { RecurringDebt } from '@/types/database'
import { toast } from '@/hooks/use-toast'

interface DebitosRecorrentesProps {
  recurringDebts: RecurringDebt[]
  onRefresh: () => void
}

export function DebitosRecorrentes({ recurringDebts, onRefresh }: DebitosRecorrentesProps) {
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingDebt, setEditingDebt] = useState<RecurringDebt | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('10')
  const [category, setCategory] = useState('')
  const [isActive, setIsActive] = useState(true)

  const resetForm = () => {
    setName('')
    setAmount('')
    setDueDay('10')
    setCategory('')
    setIsActive(true)
    setEditingDebt(null)
  }

  const handleEdit = (debt: RecurringDebt) => {
    setEditingDebt(debt)
    setName(debt.name)
    setAmount(debt.amount.toString())
    setDueDay(debt.due_day.toString())
    setCategory(debt.category || '')
    setIsActive(debt.is_active)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !supabase) return

    setLoading(true)
    try {
      if (editingDebt) {
        // Update existing
        const { error } = await supabase
          .from('recurring_debts')
          .update({
            name,
            amount: parseFloat(amount),
            due_day: parseInt(dueDay),
            category,
            is_active: isActive,
          })
          .eq('id', editingDebt.id)

        if (error) throw error

        toast({
          title: 'Débito atualizado!',
          description: 'As alterações foram salvas.',
        })
      } else {
        // Create new
        const { error } = await supabase
          .from('recurring_debts')
          .insert({
            user_id: user.id,
            name,
            amount: parseFloat(amount),
            due_day: parseInt(dueDay),
            category,
            is_active: isActive,
          })

        if (error) throw error

        toast({
          title: 'Débito adicionado!',
          description: 'O débito recorrente foi registrado.',
        })
      }

      resetForm()
      setDialogOpen(false)
      onRefresh()
    } catch (error: unknown) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm('Tem certeza que deseja excluir este débito recorrente?')) return

    try {
      const { error } = await supabase
        .from('recurring_debts')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Débito excluído',
        description: 'O débito recorrente foi removido.',
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

  const handleToggleActive = async (debt: RecurringDebt) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('recurring_debts')
        .update({ is_active: !debt.is_active })
        .eq('id', debt.id)

      if (error) throw error
      onRefresh()
    } catch (error: unknown) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (dueDay: number) => {
    const today = new Date().getDate()
    if (today > dueDay) return 'text-destructive'
    if (today === dueDay) return 'text-warning'
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Débitos Recorrentes</h2>
          <p className="text-muted-foreground">Assinaturas e contas fixas mensais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Assinatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingDebt ? 'Editar' : 'Nova'} Assinatura</DialogTitle>
                <DialogDescription>
                  Adicione um débito recorrente mensal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Netflix, Aluguel..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
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
                  <Label htmlFor="dueDay">Dia do Vencimento</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
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
                      {recurringCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Ativo</Label>
                  <Switch
                    id="active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingDebt ? 'Atualizar' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringDebts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma assinatura cadastrada. Clique em "Nova Assinatura" para começar.
            </CardContent>
          </Card>
        ) : (
          recurringDebts.map((debt) => (
            <Card key={debt.id} className={!debt.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{debt.name}</CardTitle>
                    <CardDescription>{debt.category || 'Sem categoria'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(debt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(debt.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-2xl font-bold text-foreground">
                        {formatCurrency(Number(debt.amount))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={getStatusColor(debt.due_day)}>
                        Dia {debt.due_day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ativo</span>
                      <Switch
                        checked={debt.is_active}
                        onCheckedChange={() => handleToggleActive(debt)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {recurringDebts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Total de Débitos Recorrentes Ativos</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(
                    recurringDebts
                      .filter(d => d.is_active)
                      .reduce((sum, d) => sum + Number(d.amount), 0)
                  )}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {recurringDebts.filter(d => d.is_active).length} assinatura(s) ativa(s)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
