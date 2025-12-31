'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Edit, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Candidato, StatusCandidato } from '@/lib/mock/dep-pessoal';
import { useDemoData } from '@/src/lib/demo-context';

export function RecrutamentoTab() {
  const router = useRouter();
  const { candidatos, setCandidatos, usuarios } = useDemoData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [vagaFilter, setVagaFilter] = useState<string>('Todos');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estado para novo candidato
  const [newCandidato, setNewCandidato] = useState({
    nome: '',
    vaga: '',
    telefone: '',
    email: '',
    cidade: '',
    pretensaoSalarial: '',
    observacoes: '',
    curriculoUrl: '',
    status: 'Novo' as StatusCandidato,
    responsavelId: '',
  });

  // Filtros aplicados
  const filteredCandidatos = useMemo(() => {
    return candidatos.filter((candidato) => {
      const matchesSearch =
        candidato.nome.toLowerCase().includes(search.toLowerCase()) ||
        candidato.vaga.toLowerCase().includes(search.toLowerCase()) ||
        candidato.telefone.includes(search) ||
        candidato.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'Todos' || candidato.status === statusFilter;
      const matchesVaga = vagaFilter === 'Todos' || candidato.vaga === vagaFilter;

      const responsavel = usuarios.find(u => u.id === candidato.responsavelId);
      const matchesResponsavel = responsavelFilter === 'Todos' ||
        (responsavel && responsavel.nome.toLowerCase().includes(responsavelFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesVaga && matchesResponsavel;
    });
  }, [candidatos, search, statusFilter, vagaFilter, responsavelFilter, usuarios]);

  // Vagas únicas para o filtro
  const vagasUnicas = useMemo(() => {
    const vagas = [...new Set(candidatos.map(c => c.vaga))];
    return vagas.sort();
  }, [candidatos]);

  const handleAddCandidato = () => {
    if (!newCandidato.nome || !newCandidato.vaga) return;

    const candidato: Candidato = {
      id: Date.now().toString(),
      ...newCandidato,
      pretensaoSalarial: newCandidato.pretensaoSalarial ? parseFloat(newCandidato.pretensaoSalarial) : undefined,
      dataInscricao: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCandidatos(prev => [...prev, candidato]);
    setNewCandidato({
      nome: '',
      vaga: '',
      telefone: '',
      email: '',
      cidade: '',
      pretensaoSalarial: '',
      observacoes: '',
      curriculoUrl: '',
      status: 'Novo',
      responsavelId: '',
    });
    setIsDialogOpen(false);
  };

  const getStatusBadgeColor = (status: StatusCandidato) => {
    switch (status) {
      case 'Novo':
        return 'bg-blue-100 text-blue-800';
      case 'Triagem':
        return 'bg-yellow-100 text-yellow-800';
      case 'Entrevista':
        return 'bg-purple-100 text-purple-800';
      case 'Teste':
        return 'bg-orange-100 text-orange-800';
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Reprovado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Candidatos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, vaga, telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Triagem">Triagem</SelectItem>
                  <SelectItem value="Entrevista">Entrevista</SelectItem>
                  <SelectItem value="Teste">Teste</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Reprovado">Reprovado</SelectItem>
                </SelectContent>
              </Select>

              {/* Vaga Filter */}
              <Select value={vagaFilter} onValueChange={setVagaFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Vaga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {vagasUnicas.map((vaga) => (
                    <SelectItem key={vaga} value={vaga}>
                      {vaga}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Responsável Filter */}
              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.nome}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* New Candidate Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo candidato
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Novo Candidato</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Nome *</Label>
                      <Input
                        value={newCandidato.nome}
                        onChange={(e) => setNewCandidato({ ...newCandidato, nome: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Vaga *</Label>
                      <Input
                        value={newCandidato.vaga}
                        onChange={(e) => setNewCandidato({ ...newCandidato, vaga: e.target.value })}
                        placeholder="ex.: Desenvolvedor Frontend"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Telefone</Label>
                      <Input
                        value={newCandidato.telefone}
                        onChange={(e) => setNewCandidato({ ...newCandidato, telefone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={newCandidato.email}
                        onChange={(e) => setNewCandidato({ ...newCandidato, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Cidade</Label>
                      <Input
                        value={newCandidato.cidade}
                        onChange={(e) => setNewCandidato({ ...newCandidato, cidade: e.target.value })}
                        placeholder="São Paulo"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Pretensão Salarial</Label>
                      <Input
                        type="number"
                        value={newCandidato.pretensaoSalarial}
                        onChange={(e) => setNewCandidato({ ...newCandidato, pretensaoSalarial: e.target.value })}
                        placeholder="4500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Responsável (RH)</Label>
                    <Select
                      value={newCandidato.responsavelId}
                      onValueChange={(value) => setNewCandidato({ ...newCandidato, responsavelId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Observações</Label>
                    <Textarea
                      value={newCandidato.observacoes}
                      onChange={(e) => setNewCandidato({ ...newCandidato, observacoes: e.target.value })}
                      placeholder="Observações sobre o candidato..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Link do Currículo</Label>
                    <Input
                      value={newCandidato.curriculoUrl}
                      onChange={(e) => setNewCandidato({ ...newCandidato, curriculoUrl: e.target.value })}
                      placeholder="https://drive.google.com/... ou nome do arquivo"
                    />
                  </div>

                  <Button
                    onClick={handleAddCandidato}
                    className="w-full"
                    disabled={!newCandidato.nome || !newCandidato.vaga}
                  >
                    Cadastrar Candidato
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          {filteredCandidatos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum candidato encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Vaga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Inscrição</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidatos.map((candidato) => {
                  const responsavel = usuarios.find(u => u.id === candidato.responsavelId);
                  return (
                    <TableRow key={candidato.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{candidato.nome}</TableCell>
                      <TableCell>{candidato.vaga}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(candidato.status)}>
                          {candidato.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(candidato.dataInscricao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{candidato.telefone}</div>
                          <div className="text-muted-foreground">{candidato.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dep-pessoal/candidatos/${candidato.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {candidato.curriculoUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(candidato.curriculoUrl, '_blank')}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
