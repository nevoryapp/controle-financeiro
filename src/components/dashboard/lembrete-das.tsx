'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Calendar, ExternalLink, CheckCircle, Clock, Loader2, History } from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDay20, isNearDasDeadline } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import type { DasPayment } from '@/types/database'
import { toast } from '@/hooks/use-toast'

interface LembreteDasProps {
  dasPayments: DasPayment[]
  onRefresh: () => void
}

export function LembreteDas({ dasPayments, onRefresh }: LembreteDasProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [estimatedAmount, setEstimatedAmount] = useState('')

  const daysUntil20 = getDaysUntilDay20()
  const isNearDeadline = isNearDasDeadline()

  // Get current month's DAS
  const now = new Date()
  const currentMonthRef = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const currentDas = dasPayments.find(d => d.reference_month === currentMonthRef)

  // Get next month's date for display
  const getNextDasDate = () => {
    const today = new Date()
    const day = today.getDate()
    if (day <= 20) {
      return new Date(today.getFullYear(), today.getMonth(), 20)
    } else {
      return new Date(today.getFullYear(), today.getMonth() + 1, 20)
    }
  }

  const nextDasDate = getNextDasDate()

  const handleMarkAsPaid = async () => {
    if (!user || !supabase) return
    setLoading(true)

    try {
      const amount = estimatedAmount || '66.00' // Default MEI value

      if (currentDas) {
        // Update existing
        const { error } = await supabase
          .from('das_payments')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            amount: parseFloat(amount),
          })
          .eq('id', currentDas.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('das_payments')
          .insert({
            user_id: user.id,
            reference_month: currentMonthRef,
            amount: parseFloat(amount),
            status: 'paid',
            paid_at: new Date().toISOString(),
          })

        if (error) throw error
      }

      toast({
        title: 'DAS marcado como pago!',
        description: 'O pagamento foi registrado no histórico.',
      })
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

  const handleCreatePending = async () => {
    if (!user || !supabase || currentDas) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('das_payments')
        .insert({
          user_id: user.id,
          reference_month: currentMonthRef,
          amount: parseFloat(estimatedAmount || '66.00'),
          status: 'pending',
        })

      if (error) throw error

      toast({
        title: 'DAS criado!',
        description: 'O DAS pendente foi registrado.',
      })
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">Pago</span>
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-warning/10 text-warning">Pendente</span>
      case 'overdue':
        return <span className="px-2 py-1 rounded-full text-xs bg-destructive/10 text-destructive">Atrasado</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Lembrete DAS MEI</h2>
        <p className="text-muted-foreground">Controle do pagamento mensal do Simples Nacional</p>
      </div>

      {/* Alert Card */}
      <Card className={`border-2 ${isNearDeadline ? 'border-destructive bg-destructive/5' : 'border-primary'}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {isNearDeadline ? (
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            ) : (
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl">
                {isNearDeadline ? '⚠️ Atenção!' : 'Próximo DAS MEI'}
              </CardTitle>
              <CardDescription>
                {formatDate(nextDasDate)} - {daysUntil20} dias restantes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="amount">Valor Estimado (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="66,00"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Valor padrão MEI: R$ 66,00 (consulte o valor exato no PGMEI)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              variant="destructive"
              className="flex-1"
              onClick={() => window.open('https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao', '_blank')}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Gerar DAS Agora
            </Button>
            
            {currentDas?.status !== 'paid' && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleMarkAsPaid}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CheckCircle className="h-5 w-5 mr-2" />
                Já Paguei
              </Button>
            )}
          </div>

          {currentDas && (
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="paid"
                checked={currentDas.status === 'paid'}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    handleMarkAsPaid()
                  }
                }}
              />
              <label htmlFor="paid" className="text-sm cursor-pointer">
                {currentDas.status === 'paid' ? 'DAS deste mês já foi pago' : 'Marcar como pago'}
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle className="text-lg">Histórico de DAS</CardTitle>
          </div>
          <CardDescription>Últimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dasPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum registro de DAS ainda
              </p>
            ) : (
              dasPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {payment.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : payment.status === 'overdue' ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Clock className="h-5 w-5 text-warning" />
                    )}
                    <div>
                      <p className="font-medium">
                        {new Date(payment.reference_month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                      {payment.paid_at && (
                        <p className="text-sm text-muted-foreground">
                          Pago em {formatDate(payment.paid_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {payment.amount && (
                      <p className="font-bold">{formatCurrency(Number(payment.amount))}</p>
                    )}
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>O que é o DAS MEI?</strong></p>
            <p>
              O DAS (Documento de Arrecadação do Simples Nacional) é o boleto mensal que todo MEI deve pagar.
              O vencimento é sempre no dia 20 de cada mês.
            </p>
            <p>
              O valor varia conforme a atividade exercida e pode ter acréscimos se pago em atraso.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
