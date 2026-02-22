'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  FileText, 
  Receipt, 
  Search, 
  GraduationCap, 
  FileSpreadsheet, 
  Shield, 
  Mail, 
  ClipboardList,
  ExternalLink
} from 'lucide-react'
import { usefulLinks } from '@/lib/data'

const iconMap: Record<string, any> = {
  Building2,
  FileText,
  Receipt,
  Search,
  GraduationCap,
  FileSpreadsheet,
  Shield,
  Mail,
  ClipboardList,
}

export function LinksUteis() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Links Úteis</h2>
        <p className="text-muted-foreground">Todos os links oficiais do governo e Sebrae em um só lugar</p>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {usefulLinks.map((link) => {
          const IconComponent = iconMap[link.icon] || ExternalLink
          
          return (
            <Card 
              key={link.id} 
              className="hover:shadow-md transition-all hover:border-primary cursor-pointer group"
              onClick={() => window.open(link.url, '_blank')}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {link.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {link.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {new URL(link.url).hostname}
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Por que esses links são importantes?</strong></p>
            <p>
              Como MEI, você precisa acessar regularmente portais do governo para emitir notas, 
              pagar impostos e fazer declarações. Mantemos esses links sempre atualizados para 
              facilitar seu dia a dia.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">DAS MEI - Pagamento Mensal</p>
                <p className="text-sm text-muted-foreground">Vencimento dia 20 de cada mês</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => window.open('https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Gerar DAS
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Declaração Anual DASN-SIMEI</p>
                <p className="text-sm text-muted-foreground">Entregar até 31 de maio</p>
              </div>
              <Button
                onClick={() => window.open('https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/declaracao-anual', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Declarar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
