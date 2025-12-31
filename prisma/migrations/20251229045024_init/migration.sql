-- CreateEnum
CREATE TYPE "StatusCandidato" AS ENUM ('Novo', 'Triagem', 'Entrevista', 'Teste', 'Aprovado', 'Reprovado');

-- CreateEnum
CREATE TYPE "StatusFerias" AS ENUM ('Planejada', 'Em_gozo', 'Finalizada', 'Cancelada');

-- CreateEnum
CREATE TYPE "StatusColaborador" AS ENUM ('Ativo', 'Inativo', 'Ferias', 'Licenca');

-- CreateEnum
CREATE TYPE "TipoArquivoPonto" AS ENUM ('CSV', 'XLSX');

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "dataAdmissao" TIMESTAMP(3) NOT NULL,
    "valorHora" DECIMAL(10,2) NOT NULL,
    "jornadaDiaria" INTEGER NOT NULL,
    "status" "StatusColaborador" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "vaga" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "pretensaoSalarial" DECIMAL(65,30),
    "observacoes" TEXT,
    "curriculoUrl" TEXT,
    "status" "StatusCandidato" NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "dataInscricao" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaCandidato" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "responsavelId" TEXT NOT NULL,

    CONSTRAINT "NotaCandidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ferias" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dias" INTEGER NOT NULL,
    "periodoAquisitivoInicio" TIMESTAMP(3) NOT NULL,
    "periodoAquisitivoFim" TIMESTAMP(3) NOT NULL,
    "periodoConcessivoInicio" TIMESTAMP(3) NOT NULL,
    "periodoConcessivoFim" TIMESTAMP(3) NOT NULL,
    "dataLimiteGozo" TIMESTAMP(3) NOT NULL,
    "dataRetorno" TIMESTAMP(3) NOT NULL,
    "abonoPecuniario" BOOLEAN NOT NULL,
    "decimoTerceiro" BOOLEAN NOT NULL,
    "status" "StatusFerias" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ferias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroPonto" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "importacaoId" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "entrada" TEXT,
    "saida" TEXT,
    "intervalo" INTEGER,
    "totalHoras" DECIMAL(5,2),
    "horasExtras" DECIMAL(5,2),
    "observacoes" TEXT,

    CONSTRAINT "RegistroPonto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportacaoPonto" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "arquivoNome" TEXT NOT NULL,
    "tipoArquivo" "TipoArquivoPonto" NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFim" TIMESTAMP(3) NOT NULL,
    "jornadaPadrao" INTEGER NOT NULL,
    "intervaloPadrao" INTEGER NOT NULL,
    "bancoHoras" BOOLEAN NOT NULL,
    "totalHorasTrabalhadas" DECIMAL(10,2) NOT NULL,
    "totalHorasExtras" DECIMAL(10,2) NOT NULL,
    "totalFaltas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportacaoPonto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Candidato" ADD CONSTRAINT "Candidato_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaCandidato" ADD CONSTRAINT "NotaCandidato_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaCandidato" ADD CONSTRAINT "NotaCandidato_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ferias" ADD CONSTRAINT "Ferias_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroPonto" ADD CONSTRAINT "RegistroPonto_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroPonto" ADD CONSTRAINT "RegistroPonto_importacaoId_fkey" FOREIGN KEY ("importacaoId") REFERENCES "ImportacaoPonto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoPonto" ADD CONSTRAINT "ImportacaoPonto_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
