import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Lock, CheckCircle, XCircle, 
  AlertTriangle, Download, ChevronRight, ChevronDown, 
  Server, Fingerprint, Check, Menu, X
} from 'lucide-react';

// ============================================================
// DADOS DO PROTOCOLO NEXUS CRYPT V3
// ============================================================

const SECOES = [
  { id: 'nucleo',     num: '00', label: 'NÚCLEO',          count: null },
  { id: 'camadas-01', num: '01', label: 'CAMADAS 01—05',   count: 5 },
  { id: 'camadas-06', num: '02', label: 'CAMADAS 06—09',   count: 4 },
  { id: 'camadas-10', num: '03', label: 'CAMADAS 10—14',   count: 5 },
  { id: 'camadas-15', num: '04', label: 'CAMADAS 15—18',   count: 4 },
  { id: 'validacao',  num: '05', label: 'VALIDAÇÃO',       count: 4 },
  { id: 'checklist',  num: '06', label: 'CHECKLIST FINAL', count: 22 },
  { id: 'perfis',     num: '07', label: 'PERFIS',          count: 3 },
];

const CAMADAS_01_05 = [
  {
    id: 1, status: 'HARDENED',
    titulo: 'Código de acesso',
    descricao: 'A primeira barreira é um código forte, único e fora do próprio aparelho. Combine autenticação resistente com biometria para manter o acesso sob controle.',
    caminho: 'Ajustes → Face ID e Código → Alterar Código',
    tags: ['12+ caracteres', 'alfanumérico', 'Face ID'],
    acoes: [
      'Selecionar Código Alfanumérico Personalizado.',
      'Mínimo de 12 caracteres; recomendado 14–16+.',
      'Usar letras, números e símbolos; evitar nomes, datas e sequências previsíveis.',
      'Ativar Face ID para o usuário autorizado.',
    ],
    regra: 'O código não deve ser armazenado no próprio aparelho.',
  },
  {
    id: 2, status: 'RESTRIÇÃO MÁXIMA',
    titulo: 'Restrição da tela bloqueada',
    descricao: 'Com o aparelho bloqueado, reduzir ao mínimo as funções acessíveis sem autenticação.',
    caminho: 'Ajustes → Face ID e Código → Permitir Acesso Quando Bloqueado',
    acoes: [
      'Desativar Central de Controle.',
      'Desativar Central de Notificações.',
      'Desativar Visualização Hoje / Widgets.',
      'Desativar Siri.',
      'Desativar Carteira.',
      'Desativar Responder com Mensagem.',
      'Desativar Retornar Ligações Perdidas.',
      'Desativar Acessórios USB, quando disponível.',
    ],
  },
  {
    id: 3, status: 'RECOMENDADO',
    titulo: 'Apagar dados',
    descricao: 'O recurso apaga os dados do aparelho depois de 10 tentativas consecutivas incorretas de código.',
    caminho: 'Ajustes → Face ID e Código → Apagar Dados',
    passos: [
      'Confirmar que o usuário conhece o código.',
      'Confirmar que o aparelho não contém dados irrecuperáveis.',
      'Explicar que 10 tentativas incorretas podem causar perda definitiva dos dados locais.',
      'Testar a configuração sem efetivamente provocar o apagamento.',
    ],
    alerta: 'ATENÇÃO: ativar somente depois de alinhar o risco de perda definitiva.',
  },
  {
    id: 4, status: 'OBRIGATÓRIO',
    titulo: 'USB / acessórios',
    descricao: 'Impedir que um computador ou acessório obtenha comunicação de dados enquanto o iPhone está bloqueado.',
    estados: [
      { label: 'bloqueado', value: 'restrito' },
      { label: 'desbloqueado', value: 'autorizável' },
    ],
    acoes: [
      'Não desativar o USB Restricted Mode.',
      'iPhone bloqueado + USB conectado = comunicação de dados restrita.',
      'iPhone desbloqueado = comunicação autorizável.',
      'A Apple normalmente exige desbloqueio antes de permitir comunicação com computadores ou acessórios USB / Thunderbolt.',
    ],
    regra: 'REGRA DA V3: bloqueio físico primeiro; autorização somente após autenticação.',
  },
  {
    id: 5, status: 'OPCIONAL',
    titulo: 'Modo de Isolamento',
    descricao: 'Proteção extrema destinada principalmente a pessoas que possam ser alvo de ataques cibernéticos altamente sofisticados. Reduz funcionalidades para diminuir a superfície de ataque.',
    caminho: 'Ajustes → Privacidade e Segurança → Modo de Isolamento',
    ordem: ['Supervisão', 'MDM', 'Perfil', 'Validação', 'Modo de Isolamento'],
    alerta: 'Não ativar antes de terminar o gerenciamento que você pretende instalar.',
  },
];

const CAMADAS_06_09 = [
  {
    id: 6, status: 'GERENCIADO',
    titulo: 'Supervisão do dispositivo',
    descricao: 'A principal evolução da V3: transformar o aparelho em supervisionado, gerenciado e com políticas aplicadas.',
    acoes: [
      'Restrições mais fortes exigem aparelho supervisionado e registrado em um serviço de gerenciamento.',
      'A supervisão normalmente indica que o aparelho pertence a uma organização e fornece controles adicionais.',
      'Usar somente quando houver autorização legítima para administrar o aparelho.',
    ],
    objetivo: 'iPhone → supervisionado → gerenciado → políticas aplicadas.',
  },
  {
    id: 7, status: 'POLÍTICAS PRIORITÁRIAS',
    titulo: 'Perfil .mobileconfig',
    descricao: 'O perfil deve conter somente políticas que façam sentido para o modelo de utilização. Não adicionar dezenas de restrições apenas porque existem.',
    tags: ['contas', 'apps', 'comunicação', 'emparelhamento'],
    acoes: [
      'Impedir alteração de configurações de conta, instalação manual de perfis e alterações administrativas não autorizadas.',
      'Quando necessário, impedir instalação e remoção de aplicativos e restringir a App Store.',
      'Avaliar AirDrop, AirPlay, acessórios, espelhamento, compartilhamento e recursos de comunicação.',
      'Para aparelhos supervisionados, restringir emparelhamento a hosts autorizados / relacionados à supervisão.',
    ],
    nome: 'NexusCryptV3_Fortress.mobileconfig',
  },
  {
    id: 8, status: 'IMPORTANTE',
    titulo: 'Proteção do próprio perfil',
    descricao: 'Em aparelhos supervisionados, determinadas configurações podem ser protegidas contra remoção ou exigir autorização para remoção.',
    tags: ['anti-remoção', 'supervisão', 'persistência'],
    objetivo: 'Evitar: Usuário → Ajustes → remove perfil → desfaz blindagem.',
  },
  {
    id: 9, status: 'RECOMENDADO',
    titulo: 'AirDrop',
    descricao: 'Reduzir uma via de comunicação não necessária e manter o recebimento desativado no perfil mais restritivo.',
    caminho: 'Ajustes → Geral → AirDrop',
    acoes: [
      'Selecionar Recebimento Desativado.',
      'Quando administrado por MDM, aplicar a restrição específica para impedir o uso do AirDrop em dispositivos compatíveis.',
    ],
  },
];

const CAMADAS_10_14 = [
  {
    id: 10, status: 'CONFORME NECESSIDADE',
    titulo: 'Bluetooth',
    descricao: 'Não tratar Bluetooth como uma ameaça absoluta.',
    perfis: [
      { nome: 'ISOLAMENTO TOTAL', valor: 'Bluetooth desativado quando não necessário' },
      { nome: 'NORMAL', valor: 'Bluetooth ativo para fones, veículo, acessórios autorizados' },
    ],
    regra: 'Desativar o que não é necessário.',
  },
  {
    id: 11, status: 'CONFORME NECESSIDADE',
    titulo: 'Wi-Fi',
    descricao: 'Não deixar Wi-Fi permanentemente desativado simplesmente por segurança.',
    perfis: [
      { nome: 'NORMAL', valor: 'Wi-Fi permitido' },
      { nome: 'ISOLAMENTO', valor: 'Wi-Fi somente quando necessário' },
    ],
    regra: 'O objetivo é controlar a superfície de comunicação, não inutilizar o aparelho.',
  },
  {
    id: 12, status: 'QUANDO ADOTADA',
    titulo: 'VPN',
    descricao: 'Instalar uma VPN confiável, caso ela faça parte do modelo de segurança adotado.',
    exemplo: 'Proton VPN',
    acoes: [
      'Conectar à VPN.',
      'Ativar Kill Switch conforme disponibilidade.',
      'Testar comportamento quando a VPN cai.',
      'Verificar se o tráfego retorna corretamente após reconexão.',
    ],
    alerta: 'VPN não significa anonimato absoluto.',
  },
  {
    id: 13, status: 'INDIVIDUAL',
    titulo: 'Privacidade',
    descricao: 'Revisar individualmente cada permissão de privacidade.',
    caminho: 'Ajustes → Privacidade e Segurança',
    acoes: [
      'Rastreamento: desativar Permitir que Apps Solicitem Rastreamento.',
      'Localização: não desativar globalmente sem motivo — revisar app por app.',
      'Câmera: revisar aplicativos autorizados.',
      'Microfone: revisar aplicativos autorizados.',
      'Fotos: revisar acesso de cada aplicativo.',
      'Bluetooth: revisar quais aplicativos realmente precisam.',
    ],
  },
  {
    id: 14, status: 'PROTEGIDO',
    titulo: 'Safari',
    descricao: 'Manter proteções de segurança do Safari.',
    acoes: [
      'Aviso de Site Fraudulento ativo.',
      'Proteções antirastreamento ativas.',
      'Atualizações do sistema em dia.',
      'Revisão de permissões.',
    ],
    alerta: 'NÃO RECOMENDAR COMO REGRA UNIVERSAL: bloquear todos os cookies. Isso pode quebrar autenticação e funcionamento de determinados sites.',
  },
];

const CAMADAS_15_18 = [
  {
    id: 15, status: 'REGRA',
    titulo: 'Atualizações',
    descricao: 'Não manter um aparelho em versão antiga simplesmente para preservar uma configuração.',
    acoes: [
      'Testar no aparelho de laboratório.',
      'Testar o perfil.',
      'Testar o MDM.',
      'Testar aplicativos.',
      'Verificar USB.',
      'Verificar VPN.',
      'Somente então atualizar a frota.',
    ],
    regra: 'iOS atualizado.',
  },
  {
    id: 16, status: 'CONFORME',
    titulo: 'Atalhos de emergência',
    descricao: 'Permitir ao proprietário realizar rapidamente ações de emergência.',
    atalhos: [
      { nome: 'DESLIGAR', desc: 'Atalho: Desligar' },
      { nome: 'REINICIAR', desc: 'Atalho: Reiniciar' },
    ],
    objetivo: 'situação suspeita → desligar/reiniciar → aparelho volta a exigir autenticação',
  },
  {
    id: 17, status: 'FERRAMENTA DE APOIO',
    titulo: '3uTools',
    descricao: 'O 3uTools será tratado como ferramenta de suporte e validação. Não como mecanismo principal de blindagem.',
    pode: [
      'identificar o aparelho', 'verificar informações do dispositivo', 'diagnóstico',
      'testes de hardware', 'Recovery Mode / DFU', 'gerenciamento de firmware',
      'logs', 'análise de determinados problemas', 'backup local',
      'gerenciamento de aplicativos/IPA quando necessário',
    ],
    naoPode: [
      'substituto de MDM', 'substituto da supervisão Apple',
      'mecanismo criptográfico', 'ferramenta que transforma qualquer iPhone em "impossível de extrair"',
    ],
  },
  {
    id: 18, status: 'TESTE',
    titulo: 'Teste de validação USB',
    descricao: 'Testar o comportamento do USB em aparelho bloqueado e desbloqueado.',
    testes: [
      {
        nome: 'TESTE A — APARELHO BLOQUEADO',
        passos: ['Bloquear iPhone.', 'Conectar USB.', 'Verificar se existe comunicação de dados.', 'Registrar resultado.', 'Não confiar somente em um programa.'],
      },
      {
        nome: 'TESTE B — APARELHO DESBLOQUEADO',
        passos: ['Desbloquear iPhone.', 'Conectar USB.', 'Autorizar computador quando solicitado.', 'Verificar comunicação.'],
      },
    ],
    resultado: 'comunicação disponível após autenticação/autorização conforme a configuração.',
  },
];

const VALIDACAO = [
  {
    id: 19, status: 'TESTE',
    titulo: 'Teste do Perfil',
    caminho: 'Ajustes → Geral → VPN e Gestão de Dispositivos',
    acoes: [
      'perfil instalado', 'nome correto', 'organização correta', 'políticas aplicadas',
      'perfil não removível quando essa política for necessária',
      'aparelho supervisionado, quando aplicável',
    ],
  },
  {
    id: 20, status: 'TESTE',
    titulo: 'Teste de Restrições',
    acoes: [
      'AirDrop bloqueado',
      'Instalação de aplicativo bloqueada quando essa política estiver configurada',
      'Remoção de aplicativo bloqueada quando configurada',
      'Alteração de conta/configurações bloqueada quando configurada',
      'Instalação de perfil bloqueada quando configurada',
      'Emparelhamento USB limitado conforme política',
    ],
    nota: 'As restrições disponíveis dependem da versão do iOS, do serviço MDM e de o aparelho estar supervisionado.',
  },
  {
    id: 21, status: 'TESTE',
    titulo: 'Teste de Reinicialização',
    passos: [
      'Desligar o aparelho.', 'Ligar novamente.', 'Confirmar solicitação de código.',
      'Confirmar perfil.', 'Confirmar restrições.', 'Confirmar VPN.',
      'Confirmar configurações de privacidade.',
    ],
    objetivo: 'Garantir que a blindagem não dependa apenas de uma sessão ativa.',
  },
  {
    id: 22, status: 'TESTE',
    titulo: 'Teste de Tentativa de Alteração',
    acoes: [
      'tentar remover perfil', 'tentar instalar perfil não autorizado',
      'tentar instalar aplicativo', 'tentar remover aplicativo protegido',
      'tentar modificar configurações protegidas', 'tentar emparelhar computador não autorizado',
    ],
    resultado: 'Registrar: BLOQUEADO / PERMITIDO / NÃO APLICÁVEL',
    regra: 'Não considerar uma política "funcionando" apenas porque aparece no perfil. Ela deve ser efetivamente testada no aparelho.',
  },
];

const CHECKLIST = [
  { num: 1,  item: 'Código alfanumérico forte',       status: 'APROVADO' },
  { num: 2,  item: 'Face ID',                         status: 'APROVADO' },
  { num: 3,  item: 'Tela bloqueada restrita',         status: 'APROVADO' },
  { num: 4,  item: 'Apagar após 10 tentativas',       status: 'APROVADO' },
  { num: 5,  item: 'USB protegido',                   status: 'APROVADO' },
  { num: 6,  item: 'Supervisão',                      status: 'QUANDO APLICÁVEL' },
  { num: 7,  item: 'MDM',                             status: 'QUANDO APLICÁVEL' },
  { num: 8,  item: 'Perfil .mobileconfig',            status: 'APROVADO' },
  { num: 9,  item: 'Perfil protegido',                status: 'QUANDO APLICÁVEL' },
  { num: 10, item: 'AirDrop',                         status: 'BLOQUEADO' },
  { num: 11, item: 'Bluetooth',                       status: 'CONFORME' },
  { num: 12, item: 'Wi-Fi',                           status: 'CONFORME' },
  { num: 13, item: 'VPN',                             status: 'QUANDO ADOTADA' },
  { num: 14, item: 'Rastreamento de apps',            status: 'BLOQUEADO' },
  { num: 15, item: 'Localização',                     status: 'INDIVIDUAL' },
  { num: 16, item: 'Safari protegido',                status: 'APROVADO' },
  { num: 17, item: 'iOS atualizado',                  status: 'APROVADO' },
  { num: 18, item: 'Atalho desligar',                 status: 'CONFORME' },
  { num: 19, item: '3uTools diagnóstico',             status: 'APROVADO' },
  { num: 20, item: 'Teste USB bloqueado',             status: 'APROVADO' },
  { num: 21, item: 'Teste de perfil',                 status: 'APROVADO' },
  { num: 22, item: 'Teste pós-reinicialização',       status: 'APROVADO' },
];

const PERFIS = [
  {
    id: 'standard', num: '01', cor: 'green',
    titulo: 'STANDARD', subtitulo: 'Base operacional',
    descricao: 'Base operacional com proteção essencial, sem sacrificar o uso cotidiano.',
    itens: ['Código forte', 'Face ID', 'Tela bloqueada restrita', 'Apagar dados', 'USB protegido', 'Privacidade', 'iOS atualizado'],
  },
  {
    id: 'hardened', num: '02', cor: 'red',
    titulo: 'HARDENED', subtitulo: 'Recomendado',
    descricao: 'Controle administrativo completo para aparelhos gerenciados.',
    itens: ['Tudo do STANDARD', 'Supervisão', 'MDM', 'Perfil de restrições', 'AirDrop bloqueado', 'Instalação / remoção de apps controlada', 'Emparelhamento controlado', 'Perfil protegido', 'VPN', 'Validação completa'],
  },
  {
    id: 'isolated', num: '03', cor: 'gray',
    titulo: 'ISOLATED', subtitulo: 'Máxima segurança',
    descricao: 'Máxima redução de superfície — somente quando sacrificar funcionalidades for aceitável.',
    itens: ['Tudo do HARDENED', 'Modo de Isolamento', 'Comunicação mínima necessária', 'Bluetooth / Wi-Fi conforme necessidade', 'Testes adicionais de conectividade', 'Validação pós-reinicialização'],
  },
];

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

const statusCores = {
  HARDENED: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  'RESTRIÇÃO MÁXIMA': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  RECOMENDADO: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  OBRIGATÓRIO: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  OPCIONAL: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  GERENCIADO: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'POLÍTICAS PRIORITÁRIAS': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  IMPORTANTE: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'CONFORME NECESSIDADE': { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  'QUANDO ADOTADA': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  INDIVIDUAL: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  PROTEGIDO: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  REGRA: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  CONFORME: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  'FERRAMENTA DE APOIO': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  TESTE: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

const StatusBadge = ({ status }) => {
  const cores = statusCores[status] || statusCores.HARDENED;
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${cores.bg} ${cores.text} border ${cores.border}`}>
      {status}
    </span>
  );
};

const CamadaCard = ({ camada }) => {
  const [aberto, setAberto] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1A1A]/90 border border-[#00FF88]/10 rounded-xl overflow-hidden hover:border-[#00FF88]/30 transition-all"
    >
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full p-5 flex items-start justify-between gap-4 hover:bg-[#00FF88]/5 transition-colors text-left"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center">
            <span className="text-[#00FF88] font-bold text-lg font-mono">{String(camada.id).padStart(2, '0')}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <StatusBadge status={camada.status} />
            </div>
            <h3 className="text-white font-bold text-base">{camada.titulo}</h3>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{camada.descricao}</p>
          </div>
        </div>
        <ChevronDown size={20} className={`text-gray-500 flex-shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-[#00FF88]/10 space-y-4">
              {camada.caminho && (
                <div className="pt-4">
                  <span className="text-[10px] font-bold text-[#00FF88] tracking-wider">CAMINHO</span>
                  <p className="text-gray-300 text-sm font-mono mt-1 bg-black/40 p-2 rounded border border-[#00FF88]/10">
                    {camada.caminho}
                  </p>
                </div>
              )}

              {camada.tags && (
                <div className="flex flex-wrap gap-2">
                  {camada.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-[#00FF88]/10 text-[#00FF88] text-xs font-mono">{tag}</span>
                  ))}
                </div>
              )}

              {camada.estados && (
                <div className="grid grid-cols-2 gap-2">
                  {camada.estados.map((e, i) => (
                    <div key={i} className="bg-black/40 rounded p-2 border border-[#00FF88]/10">
                      <span className="text-gray-500 text-xs">{e.label}</span>
                      <p className="text-[#00FF88] font-mono text-sm">{e.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {camada.acoes && (
                <div>
                  <span className="text-[10px] font-bold text-[#00FF88] tracking-wider">AÇÕES</span>
                  <ul className="mt-2 space-y-2">
                    {camada.acoes.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check size={14} className="text-[#00FF88] mt-0.5 flex-shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {camada.passos && (
                <div>
                  <span className="text-[10px] font-bold text-[#00FF88] tracking-wider">PASSOS</span>
                  <ol className="mt-2 space-y-2">
                    {camada.passos.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00FF88]/20 text-[#00FF88] text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {camada.perfis && (
                <div className="space-y-2">
                  {camada.perfis.map((p, i) => (
                    <div key={i} className="bg-black/40 rounded p-3 border border-[#00FF88]/10">
                      <span className="text-[#00FF88] font-mono text-xs font-bold">{p.nome}</span>
                      <p className="text-gray-300 text-sm mt-1">{p.valor}</p>
                    </div>
                  ))}
                </div>
              )}

              {camada.ordem && (
                <div>
                  <span className="text-[10px] font-bold text-[#00FF88] tracking-wider">ORDEM CORRETA</span>
                  <div className="mt-2 flex flex-col gap-2">
                    {camada.ordem.map((o, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded bg-[#00FF88]/20 text-[#00FF88] text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-gray-300 text-sm">{o}</span>
                        {i < camada.ordem.length - 1 && <ChevronRight size={14} className="text-gray-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {camada.atalhos && (
                <div className="grid grid-cols-2 gap-2">
                  {camada.atalhos.map((a, i) => (
                    <div key={i} className="bg-black/40 rounded p-3 border border-[#00FF88]/10 text-center">
                      <span className="text-[#00FF88] font-mono text-xs font-bold">{a.nome}</span>
                      <p className="text-gray-400 text-xs mt-1">{a.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {camada.pode && (
                <div>
                  <span className="text-[10px] font-bold text-green-400 tracking-wider">PODE SER USADO PARA</span>
                  <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {camada.pode.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {camada.naoPode && (
                <div>
                  <span className="text-[10px] font-bold text-red-400 tracking-wider">NÃO CONSIDERAR COMO</span>
                  <ul className="mt-2 space-y-2">
                    {camada.naoPode.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {camada.testes && (
                <div className="space-y-3">
                  {camada.testes.map((t, i) => (
                    <div key={i} className="bg-black/40 rounded p-3 border border-[#00FF88]/10">
                      <span className="text-[#00FF88] font-mono text-xs font-bold">{t.nome}</span>
                      <ol className="mt-2 space-y-1.5">
                        {t.passos.map((p, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00FF88]/20 text-[#00FF88] text-xs font-bold flex items-center justify-center">
                              {j + 1}
                            </span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}

              {camada.regra && (
                <div className="bg-[#00FF88]/5 border border-[#00FF88]/20 rounded p-3">
                  <p className="text-[#00FF88] text-sm font-mono">{camada.regra}</p>
                </div>
              )}

              {camada.objetivo && (
                <div className="bg-[#00FF88]/5 border border-[#00FF88]/20 rounded p-3">
                  <span className="text-[10px] font-bold text-[#00FF88] tracking-wider">OBJETIVO</span>
                  <p className="text-gray-200 text-sm font-mono mt-1">{camada.objetivo}</p>
                </div>
              )}

              {camada.alerta && (
                <div className="bg-yellow-500/5 border border-yellow-500/30 rounded p-3 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200 text-sm">{camada.alerta}</p>
                </div>
              )}

              {camada.nome && (
                <div className="bg-black/40 rounded p-3 border border-[#00FF88]/10">
                  <span className="text-[10px] font-bold text-gray-500 tracking-wider">NOME RECOMENDADO</span>
                  <p className="text-[#00FF88] font-mono text-sm mt-1">{camada.nome}</p>
                </div>
              )}

              {camada.exemplo && (
                <div className="bg-black/40 rounded p-3 border border-[#00FF88]/10">
                  <span className="text-[10px] font-bold text-gray-500 tracking-wider">EXEMPLO</span>
                  <p className="text-gray-200 text-sm mt-1">{camada.exemplo}</p>
                </div>
              )}

              {camada.nota && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded p-3">
                  <p className="text-blue-200 text-sm">{camada.nota}</p>
                </div>
              )}

              {camada.resultado && (
                <div className="bg-[#00FF88]/5 border border-[#00FF88]/20 rounded p-3">
                  <span className="text-[10px] font-bold text-[#00FF88] tracking-wider">RESULTADO ESPERADO</span>
                  <p className="text-gray-200 text-sm mt-1">{camada.resultado}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PerfilCard = ({ perfil }) => {
  const cores = {
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
    gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', dot: 'bg-gray-400' },
  };
  const c = cores[perfil.cor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#1A1A1A]/90 border ${c.border} rounded-xl p-6 hover:border-opacity-60 transition-all`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className={`w-3 h-3 rounded-full ${c.dot} animate-pulse`}></span>
        <span className={`text-xs font-bold ${c.text} tracking-wider`}>PROFILE / {perfil.num}</span>
      </div>

      <h3 className="text-2xl font-bold text-white mb-1">{perfil.titulo}</h3>
      <p className={`text-xs font-bold ${c.text} tracking-wider mb-3`}>{perfil.subtitulo}</p>
      <p className="text-gray-400 text-sm mb-5 leading-relaxed">{perfil.descricao}</p>

      <ul className="space-y-2 mb-5">
        {perfil.itens.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <Check size={14} className={`${c.text} mt-0.5 flex-shrink-0`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => alert(
          '⚠️ Certificados Apple ainda não configurados.\n\n' +
          `Perfil ${perfil.titulo} pronto para exportação.\n\n` +
          'Para gerar o .mobileconfig assinado:\n' +
          '1. Aprovação da Apple Developer Enterprise\n' +
          '2. Certificado MDM emitido pela Apple\n' +
          '3. Upload na aba "Configurações"'
        )}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${c.bg} ${c.text} border ${c.border} font-medium text-sm transition-all hover:opacity-80`}
      >
        <Download size={16} />
        EXPORTAR PERFIL
      </button>
    </motion.div>
  );
};

// ============================================================
// TELA PRINCIPAL
// ============================================================

const ProtocoloScreen = () => {
  const [secaoAtiva, setSecaoAtiva] = useState('nucleo');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [checados, setChecados] = useState({});

  const toggleCheck = (num) => {
    setChecados(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const progresso = Object.values(checados).filter(Boolean).length;
  const totalChecklist = CHECKLIST.length;

  const handleDownload = () => {
    alert(
      '⚠️ Certificados Apple ainda não configurados.\n\n' +
      'Para gerar o arquivo .mobileconfig assinado, é necessário:\n' +
      '1. Aprovação da Apple Developer Enterprise\n' +
      '2. Certificado MDM emitido pela Apple\n' +
      '3. Upload na aba "Configurações"\n\n' +
      'O protocolo está pronto. Assim que os certificados chegarem, o download será liberado.'
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setSidebarAberta(!sidebarAberta)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#00FF88]/30 rounded-lg text-[#00FF88] text-sm font-medium"
      >
        {sidebarAberta ? <X size={16} /> : <Menu size={16} />}
        {sidebarAberta ? 'Fechar' : 'Seções'}
      </button>

      {/* SIDEBAR */}
      <aside className={`lg:w-72 flex-shrink-0 ${sidebarAberta ? 'block' : 'hidden lg:block'}`}>
        <div className="bg-[#1A1A1A]/90 border border-[#00FF88]/20 rounded-xl overflow-hidden lg:sticky lg:top-4">
          <div className="p-4 border-b border-[#00FF88]/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-[#00FF88]" />
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">NEXUS_CRYPT_V3</span>
            </div>
            <h2 className="text-white font-bold text-sm">OPERATIONAL MANUAL</h2>
            <p className="text-gray-500 text-xs mt-1 font-mono">FORTRESS CONSOLE</p>
          </div>

          <nav className="p-2">
            {SECOES.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSecaoAtiva(s.id); setSidebarAberta(false); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5 ${
                  secaoAtiva === s.id
                    ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30'
                    : 'text-gray-400 hover:bg-[#00FF88]/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold ${secaoAtiva === s.id ? 'text-[#00FF88]' : 'text-gray-600'}`}>
                    {s.num}
                  </span>
                  <span className="text-xs font-medium tracking-wider">{s.label}</span>
                </div>
                {s.count && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    secaoAtiva === s.id ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-gray-800 text-gray-500'
                  }`}>
                    {String(s.count).padStart(2, '0')}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#00FF88]/20">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="font-mono">ENCRYPTED LINK</span>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 font-mono">MANUAL NEXUS CRYPT V3</p>
            <p className="text-[10px] text-gray-600 font-mono">© LOCAL SECURITY UNIT</p>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 min-w-0 space-y-6">

        {/* NÚCLEO */}
        {secaoAtiva === 'nucleo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#00FF88]/20 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF88]/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#00FF88] tracking-widest">PROTOCOLO ATIVO / V3.0</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  MANUAL <span className="text-[#00FF88]">NEXUS CRYPT</span>
                </h1>
                <p className="text-gray-400 text-sm font-mono mb-6">PROTOCOLO DE BLINDAGEM DE iPHONE / SEM iCLOUD</p>
                <p className="text-gray-300 text-sm leading-relaxed max-w-2xl mb-8">
                  Um mapa operacional para aumentar a resistência do iPhone contra acesso físico não autorizado, extração de dados, alterações de configuração, instalação indevida de apps e comunicação USB não autorizada.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <button
                    onClick={() => setSecaoAtiva('camadas-01')}
                    className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00FF88] text-black font-bold text-sm hover:bg-[#00FF88]/90 transition-all"
                  >
                    INICIAR SEQUÊNCIA <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setSecaoAtiva('checklist')}
                    className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1A1A1A] border border-[#00FF88]/30 text-[#00FF88] font-bold text-sm hover:bg-[#00FF88]/10 transition-all"
                  >
                    <CheckCircle size={16} /> ABRIR CHECKLIST
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-mono">
                  <span>iPhone moderno / iOS 26.x</span>
                  <span>•</span>
                  <span>sem conta Apple / iCloud</span>
                  <span>•</span>
                  <span>nível HARDENED</span>
                </div>
              </div>
            </div>

            {/* TELEMETRIA */}
            <div className="bg-[#1A1A1A]/90 border border-[#00FF88]/20 rounded-xl p-6">
              <span className="text-xs font-bold text-gray-500 tracking-widest">TELEMETRIA DO PROTOCOLO</span>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#00FF88] font-mono">18</p>
                  <p className="text-xs text-gray-500 mt-1">CAMADAS</p>
                </div>
                <div className="text-center border-x border-[#00FF88]/10">
                  <p className="text-3xl font-bold text-[#00FF88] font-mono">22</p>
                  <p className="text-xs text-gray-500 mt-1">TESTES</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#00FF88] font-mono">03</p>
                  <p className="text-xs text-gray-500 mt-1">PERFIS</p>
                </div>
              </div>
            </div>

            {/* PRINCÍPIO */}
            <div className="bg-[#1A1A1A]/90 border border-[#00FF88]/20 rounded-xl p-6">
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">PRINCÍPIO DA V3</span>
              <p className="text-gray-300 text-sm leading-relaxed mt-3">
                O iCloud não é considerado uma camada de segurança. A blindagem se apoia numa <strong className="text-white">cadeia de controle local</strong>, com autenticação, restrições e validação em sequência.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-mono">
                {['01 CÓDIGO', '02 FACE ID', '03 LOCKSCREEN', '04 APAGAMENTO', '05 USB', '06 VALIDAÇÃO'].map((item, i, arr) => (
                  <React.Fragment key={i}>
                    <span className="px-2 py-1 rounded bg-[#00FF88]/10 text-[#00FF88]">{item}</span>
                    {i < arr.length - 1 && <ChevronRight size={12} className="text-gray-600" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* CARDS DE NAVEGAÇÃO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { num: '01', titulo: 'Configuração base', sub: 'Camadas 01-05', id: 'camadas-01' },
                { num: '02', titulo: 'Gestão e persistência', sub: 'Camadas 06-09', id: 'camadas-06' },
                { num: '03', titulo: 'Comunicação e privacidade', sub: 'Camadas 10-14', id: 'camadas-10' },
                { num: '04', titulo: 'Testes de campo', sub: 'Validação operacional', id: 'camadas-15' },
              ].map((card, i) => (
                <button
                  key={i}
                  onClick={() => setSecaoAtiva(card.id)}
                  className="bg-[#1A1A1A]/90 border border-[#00FF88]/20 rounded-xl p-5 text-left hover:border-[#00FF88]/50 hover:bg-[#00FF88]/5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 font-mono">{card.num}</span>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-[#00FF88] group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">{card.titulo}</h3>
                  <p className="text-gray-500 text-xs font-mono">{card.sub}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* CAMADAS 01-05 */}
        {secaoAtiva === 'camadas-01' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">01 / PROTOCOLO OPERACIONAL</span>
              <h1 className="text-3xl font-bold text-white mt-2">Camadas 01—05</h1>
              <p className="text-gray-400 text-sm mt-2">Execute em sequência. Registre decisões. Não adicione restrições sem um modelo de ameaça que as justifique.</p>
              <span className="inline-block mt-3 text-xs font-mono text-gray-600">5 NODES</span>
            </div>
            {CAMADAS_01_05.map(c => <CamadaCard key={c.id} camada={c} />)}
          </motion.div>
        )}

        {/* CAMADAS 06-09 */}
        {secaoAtiva === 'camadas-06' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">02 / PROTOCOLO OPERACIONAL</span>
              <h1 className="text-3xl font-bold text-white mt-2">Camadas 06—09</h1>
              <p className="text-gray-400 text-sm mt-2">Execute em sequência. Registre decisões. Não adicione restrições sem um modelo de ameaça que as justifique.</p>
              <span className="inline-block mt-3 text-xs font-mono text-gray-600">4 NODES</span>
            </div>
            {CAMADAS_06_09.map(c => <CamadaCard key={c.id} camada={c} />)}
          </motion.div>
        )}

        {/* CAMADAS 10-14 */}
        {secaoAtiva === 'camadas-10' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">03 / PROTOCOLO OPERACIONAL</span>
              <h1 className="text-3xl font-bold text-white mt-2">Camadas 10—14</h1>
              <p className="text-gray-400 text-sm mt-2">Execute em sequência. Registre decisões. Não adicione restrições sem um modelo de ameaça que as justifique.</p>
              <span className="inline-block mt-3 text-xs font-mono text-gray-600">5 NODES</span>
            </div>
            {CAMADAS_10_14.map(c => <CamadaCard key={c.id} camada={c} />)}
          </motion.div>
        )}

        {/* CAMADAS 15-18 */}
        {secaoAtiva === 'camadas-15' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">04 / PROTOCOLO OPERACIONAL</span>
              <h1 className="text-3xl font-bold text-white mt-2">Camadas 15—18</h1>
              <p className="text-gray-400 text-sm mt-2">Execute em sequência. Registre decisões. Não adicione restrições sem um modelo de ameaça que as justifique.</p>
              <span className="inline-block mt-3 text-xs font-mono text-gray-600">4 NODES</span>
            </div>
            {CAMADAS_15_18.map(c => <CamadaCard key={c.id} camada={c} />)}
          </motion.div>
        )}

        {/* VALIDAÇÃO */}
        {secaoAtiva === 'validacao' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">05 / VALIDAÇÃO OPERACIONAL</span>
              <h1 className="text-3xl font-bold text-white mt-2">Validação</h1>
              <p className="text-gray-400 text-sm mt-2">Testes finais para confirmar que a blindagem funciona na prática, não apenas no perfil.</p>
              <span className="inline-block mt-3 text-xs font-mono text-gray-600">4 NODES</span>
            </div>
            {VALIDACAO.map(c => <CamadaCard key={c.id} camada={c} />)}
          </motion.div>
        )}

        {/* CHECKLIST FINAL */}
        {secaoAtiva === 'checklist' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">06 / CAMADA DE CONTROLE</span>
              <h1 className="text-3xl font-bold text-white mt-2">Checklist Final</h1>
              <p className="text-gray-400 text-sm mt-2">Marque cada item somente depois de validar o comportamento real no aparelho.</p>
            </div>

            <div className="bg-[#1A1A1A]/90 border border-[#00FF88]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">PROGRESSO</span>
                <span className="text-sm font-mono text-[#00FF88]">{progresso}/{totalChecklist}</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#00FF88] rounded-full transition-all"
                  style={{ width: `${(progresso / totalChecklist) * 100}%` }}
                ></div>
              </div>
              {progresso === totalChecklist && (
                <div className="mt-3 flex items-center gap-2 text-[#00FF88] text-sm font-bold">
                  <CheckCircle size={16} /> PROTOCOLO APROVADO
                </div>
              )}
            </div>

            <div className="bg-[#1A1A1A]/90 border border-[#00FF88]/20 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 border-b border-[#00FF88]/20 text-xs font-bold text-gray-500 tracking-wider">
                <span className="col-span-1">#</span>
                <span className="col-span-7">ITEM</span>
                <span className="col-span-4">STATUS ESPERADO</span>
              </div>
              {CHECKLIST.map((item) => (
                <button
                  key={item.num}
                  onClick={() => toggleCheck(item.num)}
                  className={`w-full grid grid-cols-12 gap-2 p-3 border-b border-[#00FF88]/5 hover:bg-[#00FF88]/5 transition-colors text-left ${
                    checados[item.num] ? 'bg-[#00FF88]/5' : ''
                  }`}
                >
                  <span className="col-span-1 text-xs font-mono text-gray-500">{String(item.num).padStart(2, '0')}</span>
                  <span className="col-span-7 flex items-center gap-2 text-sm text-gray-300">
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      checados[item.num] ? 'bg-[#00FF88] border-[#00FF88]' : 'border-gray-600'
                    }`}>
                      {checados[item.num] && <Check size={10} className="text-black" />}
                    </span>
                    {item.item}
                  </span>
                  <span className={`col-span-4 text-xs font-mono ${
                    item.status === 'APROVADO' ? 'text-green-400' :
                    item.status === 'BLOQUEADO' ? 'text-red-400' :
                    item.status === 'QUANDO APLICÁVEL' ? 'text-yellow-400' :
                    item.status === 'QUANDO ADOTADA' ? 'text-purple-400' :
                    item.status === 'INDIVIDUAL' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>{item.status}</span>
                </button>
              ))}
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-200 text-sm">
                <strong>Regra de ouro:</strong> não considerar uma política funcionando apenas porque aparece no perfil. Ela deve ser efetivamente testada no aparelho.
              </p>
            </div>
          </motion.div>
        )}

        {/* PERFIS */}
        {secaoAtiva === 'perfis' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#00FF88] tracking-widest">07 / MATRIZ DE DEPLOY</span>
              <h1 className="text-3xl font-bold text-white mt-2">Classificação do aparelho</h1>
              <p className="text-gray-400 text-sm mt-2">Escolha a intensidade de controle conforme o modelo de ameaça e a tolerância à perda de funcionalidade.</p>
              <span className="inline-block mt-3 text-xs font-mono text-gray-600">THREAT MODEL / ESCALÁVEL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PERFIS.map(p => <PerfilCard key={p.id} perfil={p} />)}
            </div>

            <div className="bg-[#1A1A1A]/90 border border-[#00FF88]/20 rounded-xl p-5 flex items-start gap-3">
              <AlertTriangle size={18} className="text-[#00FF88] flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                O modo <strong className="text-white">ISOLATED</strong> sacrifica funcionalidades em favor de segurança. Só deve ser utilizado quando a redução de funcionalidade for aceitável.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00FF88] text-black font-bold text-sm hover:bg-[#00FF88]/90 transition-all"
              >
                <Download size={16} /> BAIXAR MOBILECONFIG
              </button>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default ProtocoloScreen;