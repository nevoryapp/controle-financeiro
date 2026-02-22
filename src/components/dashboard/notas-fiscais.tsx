'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Search, Download, ExternalLink, FileIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Transaction } from '@/types/database'

interface NotasFiscaisProps {
  transactions: Transaction[]
}

export function NotasFiscais({ transactions }: NotasFiscaisProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMonth, setFilterMonth] = useState('all')

  // Filter transactions with files
  const transactionsWithFiles = transactions.filter(t => t.file_url)

  // Apply filters
  const filteredFiles = transactionsWithFiles.filter(t => {
    const matchesSearch = 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesMonth = true
    if (filterMonth !== 'all') {
      const tDate = new Date(t.transaction_date)
      const [year, month] = filterMonth.split('-')
      matchesMonth = tDate.getFullYear() === parseInt(year) && tDate.getMonth() === parseInt(month) - 1
    }

    return matchesSearch && matchesMonth
  })

  // Get unique months for filter
  const getMonths = () => {
    const months = new Set<string>()
    transactionsWithFiles.forEach(t => {
      const date = new Date(t.transaction_date)
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    })
    return Array.from(months).sort().reverse()
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    link.click()
  }

  const getFileExtension = (url: string) => {
    const parts = url.split('.')
    return parts[parts.length - 1].toUpperCase()
  }

  const getFileName = (url: string) => {
    const parts = url.split('/')
    return parts[parts.length - 1]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Notas Fiscais</h2>
        <p className="text-muted-foreground">Todos os documentos anexados aos lançamentos</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {getMonths().map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {transactionsWithFiles.length === 0
                ? 'Nenhuma nota fiscal anexada ainda. Anexe documentos ao criar lançamentos.'
                : 'Nenhum documento encontrado com os filtros aplicados.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {getFileExtension(transaction.file_url!)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.type === 'income' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium line-clamp-2">
                    {transaction.description || transaction.category || 'Sem descrição'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.transaction_date)}
                  </p>
                  {transaction.category && (
                    <p className="text-xs text-muted-foreground">
                      Categoria: {transaction.category}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => window.open(transaction.file_url!, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visualizar
                    </button>
                    <button
                      onClick={() => handleDownload(transaction.file_url!, getFileName(transaction.file_url!))}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Baixar
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {transactionsWithFiles.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {transactionsWithFiles.length} documento(s) anexado(s)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
