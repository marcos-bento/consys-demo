'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockLeads, Lead } from '../../../lib/mock/crm';
import { Search, Plus, Eye } from 'lucide-react';

export default function Negocios() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({ empresa: '', contato: '', status: 'Novo' as Lead['status'] });

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.empresa.toLowerCase().includes(search.toLowerCase()) ||
                           lead.contato.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const pipelineStages: { title: string; status: Lead['status'] }[] = [
    { title: 'Novos', status: 'Novo' },
    { title: 'Em contato', status: 'Em contato' },
    { title: 'Qualificados', status: 'Qualificado' },
    { title: 'Perdidos', status: 'Perdido' },
  ];

  const handleAddLead = () => {
    const id = (leads.length + 1).toString();
    const lead: Lead = {
      id,
      ...newLead,
      responsavel: 'Ana Costa', // Mock responsável
    };
    setLeads([...leads, lead]);
    setNewLead({ empresa: '', contato: '', status: 'Novo' });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'Novo': return 'bg-blue-100 text-blue-800';
      case 'Em contato': return 'bg-yellow-100 text-yellow-800';
      case 'Qualificado': return 'bg-green-100 text-green-800';
      case 'Perdido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Negócios</h1>
        <p className="text-gray-600">Visualize e mova leads no funil de vendas</p>
      </div>

      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por empresa ou contato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Novo">Novo</SelectItem>
              <SelectItem value="Em contato">Em contato</SelectItem>
              <SelectItem value="Qualificado">Qualificado</SelectItem>
              <SelectItem value="Perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={newLead.empresa}
                  onChange={(e) => setNewLead({ ...newLead, empresa: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contato">Contato</Label>
                <Input
                  id="contato"
                  value={newLead.contato}
                  onChange={(e) => setNewLead({ ...newLead, contato: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newLead.status} onValueChange={(value: Lead['status']) => setNewLead({ ...newLead, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Novo">Novo</SelectItem>
                    <SelectItem value="Em contato">Em contato</SelectItem>
                    <SelectItem value="Qualificado">Qualificado</SelectItem>
                    <SelectItem value="Perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddLead} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Negócios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {pipelineStages.map((stage) => {
          const stageLeads = filteredLeads.filter((lead) => lead.status === stage.status);
          return (
            <Card key={stage.status}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-semibold">{stage.title}</CardTitle>
                <Badge variant="outline">{stageLeads.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageLeads.length === 0 && (
                  <p className="text-sm text-gray-500">Sem leads neste estágio.</p>
                )}
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="rounded-md border p-3 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{lead.empresa}</span>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">{lead.contato}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{lead.responsavel}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/crm/${lead.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.empresa}</TableCell>
                  <TableCell>{lead.contato}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.responsavel}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/crm/${lead.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
