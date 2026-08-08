import React, { useState, useMemo } from 'react';
import { PageTemplate } from '@/components/page-template';
import { ArrowLeft, RefreshCw, Download, Search, Eye, Receipt, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/helpers';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';

export default function POSTransactions() {
  const { t } = useTranslation();
  const { transactions = [], stats = {} } = usePage().props as any;

  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = usePermissions();
  
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter((transaction: any) => 
      transaction.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const pageActions = [
    {
      label: t('Retour à la caisse'),
      icon: <ArrowLeft className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => router.visit(route('pos.index'))
    },
    {
      label: t('Actualiser'),
      icon: <RefreshCw className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => router.reload()
    }
  ];

  const getStatusLabel = (status: string) => {
    if (!status) return t('Terminé');
    const s = status.toLowerCase();
    if (s === 'completed') return t('Terminé');
    if (s === 'refunded') return t('Remboursé');
    if (s === 'partial refund' || s === 'partial_refund') return t('Remboursement partiel');
    if (s === 'pending') return t('En attente');
    return t(status);
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'refunded':
        return 'destructive';
      case 'partial refund':
      case 'partial_refund':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <PageTemplate 
      title={t('Transactions du Point de Vente (POS)')}
      description={t('Consultez et gérez le journal des ventes et des reçus de caisse')}
      url="/pos/transactions"
      actions={pageActions}
      breadcrumbs={[
        { title: t('Tableau de bord'), href: route('dashboard') },
        { title: t('Point de Vente (POS)'), href: route('pos.index') },
        { title: t('Transactions') }
      ]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Ventes aujourd\'hui')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.todaySales || 0)}</div>
              <p className="text-xs text-muted-foreground">{t('{{count}} transaction(s)', { count: stats?.todayCount || 0 })}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Cette semaine')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.weekSales || 0)}</div>
              <p className="text-xs text-muted-foreground">{t('{{count}} transaction(s)', { count: stats?.weekCount || 0 })}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Vente moyenne')}</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.averageSale || 0)}</div>
              <p className="text-xs text-muted-foreground">{t('Par transaction')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Remboursements')}</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.refundAmount || 0)}</div>
              <p className="text-xs text-muted-foreground">{t('{{count}} transaction(s)', { count: stats?.refundCount || 0 })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('Rechercher par N° de transaction ou nom de client...')}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Historique des transactions de caisse')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-2" />
                <p className="text-sm text-muted-foreground">{t('Aucune transaction trouvée')}</p>
              </div>
            ) : (
              <>
                {/* Mobile & Tablet Card Layout */}
                <div className="block md:hidden space-y-3">
                  {filteredTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="p-4 border border-gray-200 rounded-xl bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm">{transaction.transaction_number}</span>
                        <Badge variant={getStatusVariant(transaction.status)}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{t('Client :')} <strong className="text-gray-800">{transaction.customer}</strong></p>
                        <p>{t('Date :')} {transaction.date} à {transaction.time}</p>
                        <p>{t('Articles :')} {transaction.items}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="font-bold text-base text-gray-900">{formatCurrency(transaction.total)}</span>
                        <Permission permission="view-transactions-pos">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1"
                            onClick={() => router.visit(route('pos.receipt', transaction.id))}
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>{t('Reçu')}</span>
                          </Button>
                        </Permission>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-3 text-left font-semibold text-gray-700">{t('N° Transaction')}</th>
                        <th className="p-3 text-left font-semibold text-gray-700">{t('Date & Heure')}</th>
                        <th className="p-3 text-left font-semibold text-gray-700">{t('Client')}</th>
                        <th className="p-3 text-left font-semibold text-gray-700">{t('Articles')}</th>
                        <th className="p-3 text-right font-semibold text-gray-700">{t('Total')}</th>
                        <th className="p-3 text-center font-semibold text-gray-700">{t('Statut')}</th>
                        <th className="p-3 text-center font-semibold text-gray-700">{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredTransactions.map((transaction: any) => (
                        <tr key={transaction.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-gray-900">{transaction.transaction_number}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span>{transaction.date}</span>
                              <span className="text-xs text-muted-foreground">{transaction.time}</span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-700">{transaction.customer}</td>
                          <td className="p-3 text-gray-700">{transaction.items}</td>
                          <td className="p-3 text-right font-bold text-gray-900">{formatCurrency(transaction.total)}</td>
                          <td className="p-3 text-center">
                            <Badge variant={getStatusVariant(transaction.status)}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center space-x-1">
                              <Permission permission="view-transactions-pos">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                                  onClick={() => router.visit(route('pos.receipt', transaction.id))}
                                  title={t('Voir le reçu')}
                                >
                                  <Receipt className="h-4 w-4" />
                                </Button>
                              </Permission>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}