import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Lock, Wifi, Globe, Key, 
  Eye, EyeOff, Camera, Mic, Smartphone, CheckCircle, 
  XCircle, AlertTriangle, Download, ChevronDown, ChevronUp,
  Server, Fingerprint, Ban, Check
} from 'lucide-react';

// ============================================================
// DADOS DO PROTOCOLO (baseado no APOCALIPSE V4)
// ============================================================

const PAYLOADS = [
  {
    id: 'dns',
    num: '01',
    icon: Globe,
    title: 'DNS Criptografado',
    subtitle: 'Payload_01 — DNS',
    color: 'blue',
    description: 'Implementa DoH (DNS over HTTPS) usando Quad9 para evitar rastreamento e interceptação de consultas.',
    config: [
      { label: 'DNS Protocol', value: 'HTTPS (DoH)' },
      { label: 'Server URL', value: 'dns.quad9.net' },
      { label: 'Objetivo', value: 'Criptografia de ponta a ponta nas consultas' },
    ],
  },
  {
    id: 'wifi',
    num: '02',
    icon: Wifi,
    title: 'Wi-Fi Gerenciado',
    subtitle: 'Payload_02 — Wi-Fi',
    color: 'cyan',
    description: 'Configura automaticamente a rede segura com WPA2 e conexão automática ativada.',
    config: [
      { label: 'Wi-Fi SSID', value: 'NEXUS_CRYPT_SECURE' },
      { label: 'Encryption', value: 'WPA2 Personal' },
      { label: 'Auto Join', value: 'Enabled (True)' },
      { label: 'Force Wi-Fi Power On', value: 'False (usuário controla)' },
    ],
  },
  {
    id: 'access',
    num: '03',
    icon: Ban,
    title: 'Restrições de App',
    subtitle: 'Payload_03 — Access',
    color: 'purple',
    description: 'O núcleo do perfil. Controla permissões de iCloud, AirDrop, App Store e diagnósticos do sistema.',
    config: [
      { label: 'AirDrop', value: 'BLOQUEADO' },
      { label: 'iCloud Backup', value: 'BLOQUEADO' },
      { label: 'Cloud Keychain', value: 'BLOQUEADO' },
      { label: 'Diagnostic Submission', value: 'BLOQUEADO' },
      { label: 'USB Restricted Mode', value: 'ATIVO' },
      { label: 'App Removal', value: 'BLOQUEADO' },
      { label: 'In-App Purchases', value: 'BLOQUEADO' },
      { label: 'Safari & FaceTime', value: 'PERMITIDO' },
      { label: 'Camera & Screenshots', value: 'ATIVO' },
    ],
  },
  {
    id: 'password',
    num: '04',
    icon: Key,
    title: 'Política de Senha',
    subtitle: 'Payload_04 — Pass',
    color: 'orange',
    description: 'Exige senhas alfanuméricas complexas, define tempo de inatividade e limite de tentativas falhas.',
    config: [
      { label: 'Complexidade', value: 'Mínimo 8 caracteres + 2 complexos' },
      { label: 'Proteção Brute Force', value: 'Máx 10 tentativas falhas' },
      { label: 'Histórico', value: '5 senhas (evita reuso)' },
      { label: 'Expiração', value: '365 dias' },
      { label: 'Inatividade', value: 'Bloqueio após 5 min' },
    ],
  },
  {
    id: 'webfilter',
    num: '05',
    icon: Eye,
    title: 'Filtro de Conteúdo Web',
    subtitle: 'Payload_05 — WebFilter',
    color: 'green',
    description: 'Ativa o filtro automático nativo da Apple para bloquear conteúdo explícito e sites maliciosos.',
    config: [
      { label: 'Filter Type', value: 'Auto' },
      { label: 'Auto Filter Enabled', value: 'True' },
      { label: 'Modo', value: 'Transparente (sem proxy externo)' },
      { label: 'Performance', value: 'Safari mantido' },
    ],
  },
];

const EM_ESCOPO = [
  'DNS Criptografado (HTTPS/Quad9)',
  'Wi-Fi Seguro (WPA2)',
  'Privacidade (AirDrop, Cloud, Rastreamento)',
  'Segurança de Dados (Backup criptografado)',
  'Política de Senha (Complexidade + Expiração)',
];

const FORA_ESCOPO = [
  'Hardware: Câmera e Microfone permanecem ativos',
  'Comunicação: FaceTime e Safari não são bloqueados',
  'Conectividade: Bluetooth e 5G operam normalmente',
  'Captura: Prints e Gravação de tela permitidos',
  'Supervisão: Perfil não exige modo supervisionado',
];

const VALIDACAO = [
  { label: 'XML PList Syntax', status: 'valid' },
  { label: 'Payload UUID Uniqueness', status: 'valid', extra: '6/6' },
  { label: 'Critical Hardware (Camera/Mic/Print)', status: 'unblocked' },
  { label: 'Network Stack (DoH / WPA2)', status: 'active' },
  { label: 'Supervision Required', status: 'note', extra: 'Não necessário' },
  { label: 'Deployment Ready', status: 'done', extra: 'iMazing / Configurator' },
];

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

const colorMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', icon: 'text-blue-400' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', icon: 'text-cyan-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', icon: 'text-purple-400' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', icon: 'text-orange-400' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', icon: 'text-green-400' },
};

const PayloadCard = ({ payload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colors = colorMap[payload.color];
  const Icon = payload.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#2A2A2A]/90 backdrop-blur-sm border ${colors.border} rounded-xl overflow-hidden shadow-lg`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-[#2F2F2F] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon size={22} className={colors.icon} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${colors.text} tracking-wider`}>PAYLOAD_{payload.num}</span>
            </div>
            <h3 className="text-white font-semibold text-base">{payload.title}</h3>
            <p className="text-xs text-gray-500">{payload.subtitle}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm my-4 leading-relaxed">{payload.description}</p>
              <div className="space-y-2">
                {payload.config.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700/30 last:border-0">
                    <span className="text-sm text-[#B0B0B0]">{item.label}</span>
                    <span className={`text-sm font-medium ${colors.text}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================
// TELA PRINCIPAL
// ============================================================

const ProtocoloScreen = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(
        '⚠️ Certificados Apple ainda não configurados.\n\n' +
        'Para gerar o arquivo .mobileconfig assinado, é necessário:\n' +
        '1. Aprovação da Apple Developer Enterprise\n' +
        '2. Certificado MDM emitido pela Apple\n' +
        '3. Upload na aba "Configurações"\n\n' +
        'O protocolo está pronto. Assim que os certificados chegarem, o download será liberado.'
      );
    }, 800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#1E90FF] tracking-widest">[NEXUS_CRYPT_V4]</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Protocolo Nexus Crypt</h1>
          <p className="text-[#B0B0B0] text-sm mt-1">
            Estrutura e segurança do perfil <code className="text-[#1E90FF] bg-[#1E90FF]/10 px-1.5 py-0.5 rounded text-xs">mobileconfig</code> para blindagem de dispositivos iOS.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1E90FF] hover:bg-[#00BFFF] text-white font-medium transition-all disabled:opacity-50 shadow-lg shadow-[#1E90FF]/30"
        >
          <Download size={18} />
          {downloading ? 'Verificando...' : 'Baixar mobileconfig'}
        </button>
      </div>

      {/* STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#2A2A2A]/90 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-400" />
            <span className="text-xs font-bold text-green-400 tracking-wider">ESTRUTURA</span>
          </div>
          <p className="text-white font-semibold">5 Payloads</p>
          <p className="text-xs text-gray-500 mt-1">DNS · Wi-Fi · Access · Password · WebFilter</p>
        </div>

        <div className="bg-[#2A2A2A]/90 border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint size={18} className="text-blue-400" />
            <span className="text-xs font-bold text-blue-400 tracking-wider">UUIDs ÚNICOS</span>
          </div>
          <p className="text-white font-semibold">6/6 Verificados</p>
          <p className="text-xs text-gray-500 mt-1">Cada payload trata restrições granularmente</p>
        </div>

        <div className="bg-[#2A2A2A]/90 border border-orange-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-orange-400" />
            <span className="text-xs font-bold text-orange-400 tracking-wider">SUPERVISÃO</span>
          </div>
          <p className="text-white font-semibold">Não Requerida</p>
          <p className="text-xs text-gray-500 mt-1">Instalação via iMazing / Configurator</p>
        </div>
      </div>

      {/* ESCOPO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2A2A2A]/90 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            Em Escopo (Controlado)
          </h3>
          <ul className="space-y-3">
            {EM_ESCOPO.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#2A2A2A]/90 border border-gray-600/30 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <EyeOff size={20} className="text-gray-400" />
            Fora de Escopo (Deliberado)
          </h3>
          <ul className="space-y-3">
            {FORA_ESCOPO.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-400">
                <XCircle size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* PAYLOADS */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Server size={20} className="text-[#1E90FF]" />
          Cinco payloads, uma política
        </h2>
        <div className="space-y-3">
          {PAYLOADS.map(payload => (
            <PayloadCard key={payload.id} payload={payload} />
          ))}
        </div>
      </div>

      {/* VALIDAÇÃO */}
      <div className="bg-[#1E1E1E] border border-gray-700 rounded-xl p-6 font-mono text-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/70"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/70"></span>
          </div>
          <span className="text-gray-400 text-xs ml-2">
            $ ./validate_profile.sh --file NEXUS_CRYPT_V4.mobileconfig
          </span>
        </div>
        <div className="space-y-2">
          {VALIDACAO.map((item, idx) => {
            const isOk = item.status === 'valid' || item.status === 'unblocked' || item.status === 'active' || item.status === 'done';
            const isNote = item.status === 'note';
            const symbol = isOk ? '[OK]' : isNote ? '[!]' : '[??]';
            const symbolColor = isOk ? 'text-green-400' : isNote ? 'text-yellow-400' : 'text-gray-500';
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className={`${symbolColor} font-bold`}>{symbol}</span>
                <span className="text-gray-300">{item.label}:</span>
                <span className={isOk ? 'text-green-400' : isNote ? 'text-yellow-400' : 'text-gray-400'}>
                  {item.status === 'valid' ? 'Valid' :
                   item.status === 'unblocked' ? 'UNBLOCKED' :
                   item.status === 'active' ? 'ACTIVE' :
                   item.status === 'done' ? 'Deployment ready' :
                   item.status === 'note' ? 'Supervision not required' : ''}
                </span>
                {item.extra && <span className="text-gray-500">({item.extra})</span>}
              </div>
            );
          })}
          <div className="pt-3 mt-3 border-t border-gray-700 flex items-center gap-3">
            <span className="text-[#1E90FF] font-bold">[DONE]</span>
            <span className="text-gray-300">Deployment ready via iMazing / Configurator.</span>
          </div>
        </div>
      </div>

      {/* NOTA TÉCNICA */}
      <div className="bg-[#1E90FF]/5 border border-[#1E90FF]/30 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#1E90FF] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold mb-1">Nota Técnica</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              O perfil foi configurado para permitir que o Wi-Fi e o Bluetooth permaneçam operacionais 
              (<code className="text-[#1E90FF] bg-[#1E90FF]/10 px-1 rounded">forceWiFiPowerOn: false</code>), 
              garantindo que o usuário mantenha o controle sobre o hardware de rádio. 
              A câmera, o microfone e a captura de tela permanecem <strong className="text-white">ativos</strong> para 
              coleta de evidências.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProtocoloScreen;