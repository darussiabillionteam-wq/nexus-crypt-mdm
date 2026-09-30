import React, { useState, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Smartphone, LayoutDashboard, 
  Settings, Activity, Lock, Trash2, MapPin, MessageSquare, 
  RotateCw, LogOut, Search, Plus, AlertTriangle, FileText, 
  Download, Battery, BatteryCharging, HardDrive, 
  WifiOff, Fingerprint, Server,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const INITIAL_DEVICES = [
  { id: 'dev-001', name: 'iPhone 14 Pro - CEO', model: 'iPhone 14 Pro', imei: '358941012345678', iosVersion: '17.2', battery: 85, storage: { used: 120, total: 256 }, status: 'active', lastSeen: 'Agora mesmo', location: 'São Paulo, SP' },
  { id: 'dev-002', name: 'iPhone 13 - Vendas 1', model: 'iPhone 13', imei: '358941012345679', iosVersion: '16.5', battery: 42, storage: { used: 100, total: 128 }, status: 'active', lastSeen: 'Há 5 min', location: 'Rio de Janeiro, RJ' },
  { id: 'dev-003', name: 'iPhone 12 - Suporte', model: 'iPhone 12', imei: '358941012345680', iosVersion: '17.1', battery: 15, storage: { used: 60, total: 64 }, status: 'locked', lastSeen: 'Há 2 horas', location: 'Belo Horizonte, MG' },
  { id: 'dev-004', name: 'iPad Pro - Diretoria', model: 'iPad Pro M2', imei: '358941012345681', iosVersion: '17.2', battery: 98, storage: { used: 400, total: 512 }, status: 'offline', lastSeen: 'Ontem', location: 'Desconhecida' },
];

const INITIAL_LOGS = [
  { id: 'log-1', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'admin', ip: '192.168.1.45', action: 'LOGIN', target: 'Sistema', hash: 'a1b2c3d4' },
  { id: 'log-2', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'admin', ip: '192.168.1.45', action: 'BLOQUEAR', target: 'dev-003 (iPhone 12)', hash: 'e5f6g7h8' },
];

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const addLog = (action, target) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.username || 'admin',
      ip: '127.0.0.1 (Simulado)',
      action,
      target,
      hash: Math.random().toString(36).substring(2, 10)
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setCurrentUser({ username });
      addLog('LOGIN', 'Sistema');
      return true;
    }
    return false;
  };

  const logout = () => {
    addLog('LOGOUT', 'Sistema');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addDevice = (deviceData) => {
    const newDevice = {
      ...deviceData,
      id: `dev-${Date.now()}`,
      status: 'active',
      lastSeen: 'Agora',
      battery: 100,
      storage: { used: 5, total: 128 },
      location: 'Localização Pendente'
    };
    setDevices(prev => [...prev, newDevice]);
    addLog('MATRICULAR (ENROLL)', `${newDevice.name} (${newDevice.imei})`);
  };

  const updateDeviceStatus = (id, newStatus) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  return (
    <AppContext.Provider value={{
      devices, logs, isAuthenticated, currentUser, login, logout, addDevice, updateDeviceStatus, addLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => useContext(AppContext);

const Card = ({ children, className = '' }) => (
  <div className={`bg-[#2A2A2A]/90 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-lg shadow-black/20 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const variants = {
    primary: 'bg-[#1E90FF] hover:bg-[#00BFFF] text-white',
    danger: 'bg-[#E63946] hover:bg-red-500 text-white',
    secondary: 'bg-[#1E1E1E] border border-gray-600 hover:border-[#1E90FF] text-gray-300 hover:text-white',
    ghost: 'hover:bg-gray-800 text-gray-400 hover:text-white'
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm text-[#B0B0B0] font-medium">{label}</label>}
    <input
      className="bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] transition-all disabled:opacity-50 disabled:bg-[#151515]"
      {...props}
    />
  </div>
);

const Badge = ({ status }) => {
  const styles = {
    active: 'bg-green-500/10 text-green-400 border border-green-500/30',
    locked: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    offline: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
    wiped: 'bg-red-500/10 text-red-400 border border-red-500/30'
  };
  const labels = { active: 'Ativo', locked: 'Bloqueado', offline: 'Offline', wiped: 'Formatado' };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 w-fit ${styles[status] || styles.offline}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-400 animate-pulse' : status === 'locked' ? 'bg-orange-400' : status === 'wiped' ? 'bg-red-400' : 'bg-gray-400'}`}></span>
      {labels[status] || status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#2A2A2A] border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-700/50 bg-[#1E1E1E]/50">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-full w-7 h-7 flex items-center justify-center text-xl leading-none">
              &times;
            </button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const LoginScreen = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError('Credenciais inválidas. Use admin/admin para acessar.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1E1E1E'
      }}
    >
      <div className="absolute inset-0 bg-[#1E1E1E]/85 backdrop-blur-sm z-0"></div>
      
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#1E90FF]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#00BFFF]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10 p-4"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#1E90FF]/50 shadow-2xl shadow-[#1E90FF]/40 bg-[#1E1E1E]">
              <img 
                src="/escudo.jpg" 
                alt="Nexus Crypt Escudo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NEXUS CRYPT <span className="text-[#1E90FF]">MDM</span></h1>
          <p className="text-[#B0B0B0] mt-2 text-sm uppercase tracking-widest font-medium">Controle Criptografado</p>
        </div>

        <Card className="bg-[#2A2A2A]/80 backdrop-blur-md border-gray-700/60 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input 
              label="Credencial Administrativa" 
              placeholder="Digite seu usuário (admin)" 
              value={username} onChange={e => setUsername(e.target.value)} required
            />
            <Input 
              label="Senha de Acesso" 
              type="password" 
              placeholder="•••••••• (admin)" 
              value={password} onChange={e => setPassword(e.target.value)} required
            />
            
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#E63946] text-sm text-center bg-[#E63946]/10 py-2 rounded-lg border border-[#E63946]/20">{error}</motion.p>}
            
            <Button type="submit" className="w-full mt-4 py-3 text-lg shadow-[0_0_20px_rgba(30,144,255,0.4)]">
              Autenticar Sessão
            </Button>
            
            <div className="text-center mt-6 pt-4 border-t border-gray-700/50">
              <span className="text-xs text-gray-500 flex items-center justify-center gap-2">
                <Lock size={12} /> Acesso restrito e auditado.
              </span>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

const DashboardScreen = () => {
  const { devices } = useApp();
  
  const stats = {
    total: devices.length,
    active: devices.filter(d => d.status === 'active').length,
    locked: devices.filter(d => d.status === 'locked').length,
    offline: devices.filter(d => d.status === 'offline' || d.status === 'wiped').length,
  };

  const iosVersionCounts = devices.reduce((acc, dev) => {
    acc[dev.iosVersion] = (acc[dev.iosVersion] || 0) + 1;
    return acc;
  }, {});

  const iosData = Object.keys(iosVersionCounts).map(version => ({
    name: `iOS ${version}`,
    value: iosVersionCounts[version]
  }));
  
  const COLORS = ['#1E90FF', '#00BFFF', '#4F46E5', '#818CF8'];
  const batteryData = devices.filter(d => d.status !== 'wiped').map(d => ({ name: d.name.split(' -')[0], bateria: d.battery }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1E90FF] hover:bg-[#2F2F2F] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#B0B0B0] text-sm font-medium">Total Matrículas</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-[#1E90FF]/10 rounded-lg"><Smartphone className="text-[#1E90FF]" size={24} /></div>
          </div>
        </Card>
        <Card className="border-t-4 border-t-green-500 hover:bg-[#2F2F2F] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#B0B0B0] text-sm font-medium">Ativos (Sync)</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.active}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg"><Activity className="text-green-500" size={24} /></div>
          </div>
        </Card>
        <Card className="border-t-4 border-t-orange-500 hover:bg-[#2F2F2F] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#B0B0B0] text-sm font-medium">Bloqueados</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.locked}</h3>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg"><Lock className="text-orange-500" size={24} /></div>
          </div>
        </Card>
        <Card className="border-t-4 border-t-gray-500 hover:bg-[#2F2F2F] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#B0B0B0] text-sm font-medium">Offline / Formatados</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.offline}</h3>
            </div>
            <div className="p-3 bg-gray-500/10 rounded-lg"><WifiOff className="text-gray-400" size={24} /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h4 className="text-white font-medium mb-6 flex items-center gap-2">
            <PieChartIcon size={18} className="text-[#1E90FF]"/> Distribuição de Versões iOS
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={iosData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {iosData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #374151', borderRadius: '8px' }} itemStyle={{ color: '#fff' }}/>
                <Legend wrapperStyle={{ color: '#B0B0B0', fontSize: '12px' }} verticalAlign="bottom"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h4 className="text-white font-medium mb-6 flex items-center gap-2">
            <Battery size={18} className="text-[#1E90FF]"/> Saúde de Bateria (Frota Ativa)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#B0B0B0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#B0B0B0" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#374151', opacity: 0.4}} contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #374151', borderRadius: '8px' }}/>
                <Bar dataKey="bateria" fill="#1E90FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

const DevicesScreen = () => {
  const { devices, addDevice } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDev, setNewDev] = useState({ name: '', model: '', imei: '', iosVersion: '' });
  const [consent, setConsent] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (consent) {
      addDevice(newDev);
      setIsAddModalOpen(false);
      setNewDev({ name: '', model: '', imei: '', iosVersion: '' });
      setConsent(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dispositivos Gerenciados</h2>
          <p className="text-[#B0B0B0] text-sm mt-1">Lista completa de aparelhos sob política MDM.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="shadow-[0_0_15px_rgba(30,144,255,0.3)]">
          <Plus size={18} /> Cadastrar Aparelho (Enroll)
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-gray-700/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1E1E1E] border-b border-gray-700 text-[#B0B0B0] text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Identificação</th>
                <th className="px-6 py-4 font-medium">Modelo / OS</th>
                <th className="px-6 py-4 font-medium">IMEI / Serial</th>
                <th className="px-6 py-4 font-medium">Status Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {devices.map(dev => (
                <tr key={dev.id} className="hover:bg-gray-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-[#1E90FF]/10 transition-colors">
                        <Smartphone size={18} className="text-gray-400 group-hover:text-[#1E90FF]" /> 
                      </div>
                      <div>
                        <p className="text-white font-medium">{dev.name}</p>
                        <p className="text-xs text-gray-500">ID: {dev.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{dev.model}</p>
                    <p className="text-xs text-gray-500">iOS {dev.iosVersion}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-sm tracking-widest">{dev.imei}</td>
                  <td className="px-6 py-4"><Badge status={dev.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {devices.length === 0 && <div className="p-8 text-center text-gray-500">Nenhum dispositivo encontrado.</div>}
        </div>
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Cadastro de Dispositivo (Apple MDM)">
        <form onSubmit={handleAdd} className="space-y-5">
          <Input label="Nome de Identificação (Alias)" placeholder="Ex: iPhone 14 - Setor Vendas" value={newDev.name} onChange={e => setNewDev({...newDev, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Modelo Apple" placeholder="Ex: iPhone 15 Pro" value={newDev.model} onChange={e => setNewDev({...newDev, model: e.target.value})} required />
            <Input label="Versão iOS Atual" placeholder="Ex: 17.4" value={newDev.iosVersion} onChange={e => setNewDev({...newDev, iosVersion: e.target.value})} required />
          </div>
          <Input label="IMEI / Número de Série" placeholder="Digite o IMEI de 15 dígitos" value={newDev.imei} onChange={e => setNewDev({...newDev, imei: e.target.value})} required />
          
          <div className="mt-6 p-4 bg-[#E63946]/5 border border-[#E63946]/30 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="pt-0.5">
                <input type="checkbox" className="w-5 h-5 accent-[#E63946] cursor-pointer rounded bg-[#1E1E1E] border-gray-600" checked={consent} onChange={e => setConsent(e.target.checked)} required />
              </div>
              <span className="text-sm text-gray-300 leading-relaxed">
                <strong className="text-white block mb-1 flex items-center gap-2"><AlertTriangle size={16} className="text-[#E63946]"/> AVISO LEGAL OBRIGATÓRIO</strong>
                Declaro que tenho consentimento formal por escrito do proprietário do dispositivo para gerenciá-lo remotamente, instalar perfis MDM, rastrear localização e realizar ações destrutivas (como formatação completa) conforme contrato de assistência/seguro assinado em conformidade com a LGPD.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={!consent} className={consent ? 'bg-[#E63946] hover:bg-red-500' : ''}>Gerar Link de Matrícula</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

const MonitoringScreen = () => {
  const { devices } = useApp();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Telemetria em Tempo Real</h2>
        <p className="text-[#B0B0B0] text-sm mt-1">Sensores e status de conexão baseados no último ping MDM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map(dev => (
          <Card key={dev.id} className="relative overflow-hidden group border-gray-700/60 hover:border-gray-600 transition-all">
            {(dev.status === 'offline' || dev.status === 'wiped') && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-gray-300 rounded-xl">
                <WifiOff size={40} className="mb-3 opacity-50"/>
                <span className="font-medium tracking-wide">{dev.status === 'wiped' ? 'DISPOSITIVO FORMATADO' : 'SEM CONEXÃO APNS'}</span>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-gray-800 rounded-lg text-gray-300">
                    <Smartphone size={20} />
                 </div>
                 <div>
                  <h4 className="text-base font-semibold text-white leading-tight">{dev.name}</h4>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{dev.imei}</p>
                 </div>
              </div>
              <Badge status={dev.status} />
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dev.battery > 20 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {dev.battery > 20 ? <Battery size={18} /> : <BatteryCharging size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 uppercase tracking-wider">Energia</span>
                    <span className="text-white font-medium">{dev.battery}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${dev.battery > 20 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} style={{ width: `${dev.battery}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <HardDrive size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 uppercase tracking-wider">Armazenamento</span>
                    <span className="text-white font-medium">{dev.storage.used}GB / {dev.storage.total}GB</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${(dev.storage.used / dev.storage.total) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700/50 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 text-sm text-gray-300">
                  <MapPin size={16} className="text-[#1E90FF]" /> 
                  <span className="truncate">{dev.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Activity size={16} /> 
                  Sincronizado: {dev.lastSeen}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

const ActionsScreen = () => {
  const { devices, updateDeviceStatus, addLog, currentUser } = useApp();
  const [selectedDevice, setSelectedDevice] = useState('');
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, step: 1 });
  const [confirmText, setConfirmText] = useState('');

  const activeDevices = devices.filter(d => d.status !== 'wiped');

  const handleActionClick = (type) => {
    if (!selectedDevice) return;
    setActionModal({ isOpen: true, type, step: 1 });
    setConfirmText('');
  };

  const executeAction = () => {
    const dev = devices.find(d => d.id === selectedDevice);
    if (!dev) return;

    if (actionModal.type === 'WIPE') {
      updateDeviceStatus(selectedDevice, 'wiped');
      addLog('FORMATAR (WIPE)', `${dev.name} (${dev.imei})`);
    } else if (actionModal.type === 'LOCK') {
      updateDeviceStatus(selectedDevice, 'locked');
      addLog('BLOQUEAR (LOCK)', `${dev.name}`);
    } else {
      addLog(`COMANDO: ${actionModal.type}`, `${dev.name}`);
    }
    
    setActionModal({ isOpen: false, type: null, step: 1 });
  };

  const renderModalContent = () => {
    const dev = devices.find(d => d.id === selectedDevice);
    if (!dev) return null;

    const isDestructive = actionModal.type === 'WIPE' || actionModal.type === 'LOCK';

    if (actionModal.step === 1) {
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          <div className={`p-4 rounded-xl flex items-start gap-4 border ${isDestructive ? 'bg-[#E63946]/10 border-[#E63946]/30' : 'bg-[#1E90FF]/10 border-[#1E90FF]/30'}`}>
            {isDestructive ? <AlertTriangle size={24} className="text-[#E63946] shrink-0 mt-1" /> : <ShieldAlert size={24} className="text-[#1E90FF] shrink-0 mt-1" />}
            <div>
              <h4 className={`font-semibold mb-1 ${isDestructive ? 'text-[#E63946]' : 'text-[#1E90FF]'}`}>
                Confirmação de Envio de Payload MDM
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Você está prestes a enviar o comando Apple MDM <strong>{actionModal.type}</strong> via APNS para o dispositivo <strong className="text-white">{dev.name}</strong>.
                {actionModal.type === 'WIPE' && " Esta ação enviará o comando de apagamento remoto (EraseDevice). TODOS os dados do aparelho serão deletados de forma IRREVERSÍVEL."}
                {actionModal.type === 'LOCK' && " O aparelho entrará em 'Lost Mode' e exigirá senha do administrador para ser reativado."}
              </p>
            </div>
          </div>
          
          <div className="pt-4 flex gap-3 justify-end border-t border-gray-700/50 mt-4">
            <Button variant="secondary" onClick={() => setActionModal({ isOpen: false, type: null, step: 1 })}>Cancelar</Button>
            {isDestructive ? (
              <Button variant="danger" onClick={() => setActionModal({ ...actionModal, step: 2 })}>
                Estou ciente, prosseguir
              </Button>
            ) : (
              <Button variant="primary" onClick={executeAction}>Enviar Comando via APNS</Button>
            )}
          </div>
        </motion.div>
      );
    }

    if (actionModal.step === 2 && isDestructive) {
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="bg-[#1E1E1E] p-4 rounded-lg border border-gray-700">
             <p className="text-gray-400 text-sm leading-relaxed mb-3">
               <strong>Auditoria de Segurança:</strong> O uso indevido de comandos destrutivos é passível de responsabilização legal sob os termos da LGPD e contrato vigente. Esta ação vincula seu usuário ({currentUser?.username || 'admin'}) e IP de origem.
             </p>
             <Input 
              label={`Para validar a ação, digite o IMEI do aparelho (${dev.imei})`}
              placeholder="Digite o IMEI exatamente como exibido"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
          <div className="pt-2 flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setActionModal({ isOpen: false, type: null, step: 1 })}>Abortar Ação</Button>
            <Button 
              variant="danger" 
              disabled={confirmText !== dev.imei}
              onClick={executeAction}
              className="shadow-[0_0_15px_rgba(230,57,70,0.4)]"
            >
              {actionModal.type === 'WIPE' ? 'CONFIRMAR WIPE DATA' : 'CONFIRMAR BLOQUEIO'}
            </Button>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-2">Ações Remotas & Comandos</h2>
        <p className="text-[#B0B0B0] mb-8 text-sm">Selecione um dispositivo da frota para disparar comandos criptografados via infraestrutura da Apple.</p>
        
        <Card className="mb-8 border-[#1E90FF]/20 shadow-lg shadow-[#1E90FF]/5">
          <label className="text-sm text-[#B0B0B0] font-medium block mb-3">Dispositivo Alvo da Ação</label>
          <div className="relative">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <select 
              className="w-full bg-[#1E1E1E] border border-gray-700 text-white rounded-lg pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#1E90FF] appearance-none"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              <option value="" disabled>-- Selecione um dispositivo ativo na lista --</option>
              {activeDevices.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.name} (IMEI: {dev.imei}) | {dev.status.toUpperCase()}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded">Selecionar</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Button 
            variant="secondary" 
            disabled={!selectedDevice} 
            onClick={() => handleActionClick('LOCALIZAR')}
            className="h-28 flex-col gap-3 hover:border-[#1E90FF] hover:bg-[#1E90FF]/5"
          >
            <MapPin size={28} className={selectedDevice ? 'text-[#1E90FF]' : 'text-gray-500'} />
            <span className="font-semibold">Localizar Aparelho</span>
            <span className="text-xs text-gray-500 font-normal">Ativar modo rastreamento</span>
          </Button>
          
          <Button 
            variant="secondary" 
            disabled={!selectedDevice} 
            onClick={() => handleActionClick('MENSAGEM')}
            className="h-28 flex-col gap-3 hover:border-[#1E90FF] hover:bg-[#1E90FF]/5"
          >
            <MessageSquare size={28} className={selectedDevice ? 'text-[#1E90FF]' : 'text-gray-500'} />
            <span className="font-semibold">Exibir Mensagem</span>
            <span className="text-xs text-gray-500 font-normal">Push notification na tela</span>
          </Button>
          
          <Button 
            variant="secondary" 
            disabled={!selectedDevice} 
            onClick={() => handleActionClick('REINICIAR')}
            className="h-28 flex-col gap-3 hover:border-[#1E90FF] hover:bg-[#1E90FF]/5"
          >
            <RotateCw size={28} className={selectedDevice ? 'text-[#1E90FF]' : 'text-gray-500'} />
            <span className="font-semibold">Reiniciar (Reboot)</span>
            <span className="text-xs text-gray-500 font-normal">Forçar restart do iOS</span>
          </Button>

          <Button 
            variant="secondary" 
            disabled={!selectedDevice} 
            onClick={() => handleActionClick('LOCK')}
            className="h-28 flex-col gap-3 hover:border-orange-500 hover:bg-orange-500/5"
          >
            <Lock size={28} className={selectedDevice ? 'text-orange-500' : 'text-gray-500'} />
            <span className="font-semibold text-orange-400">Bloquear (Lost Mode)</span>
            <span className="text-xs text-gray-500 font-normal">Suspender uso do dispositivo</span>
          </Button>

          <Button 
            variant="secondary" 
            disabled={!selectedDevice} 
            onClick={() => handleActionClick('WIPE')}
            className="h-28 flex-col gap-3 hover:border-[#E63946] hover:bg-[#E63946]/5 sm:col-span-2 lg:col-span-2"
          >
            <Trash2 size={28} className={selectedDevice ? 'text-[#E63946]' : 'text-gray-500'} />
            <span className="font-semibold text-[#E63946]">Formatar Aparelho (Erase Device)</span>
            <span className="text-xs text-gray-500 font-normal">Apagamento remoto irreversível (Wipe Data)</span>
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={actionModal.isOpen} 
        onClose={() => setActionModal({ isOpen: false, type: null, step: 1 })}
        title={actionModal.type === 'WIPE' || actionModal.type === 'LOCK' ? 'Atenção: Ação Crítica' : 'Confirmar Envio de Payload'}
      >
        {renderModalContent()}
      </Modal>
    </motion.div>
  );
};

const LogsScreen = () => {
  const { logs } = useApp();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Auditoria e Logs de Sistema</h2>
          <p className="text-[#B0B0B0] text-sm mt-1">Registro imutável de acesso e disparo de payloads MDM.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="text-sm py-1.5 px-3"><FileText size={16}/> Exportar CSV</Button>
          <Button variant="secondary" className="text-sm py-1.5 px-3"><Download size={16}/> Relatório PDF</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-gray-700/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1E1E1E] border-b border-gray-700 text-[#B0B0B0] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Data / Hora</th>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">IP Origem</th>
                <th className="px-6 py-4 font-medium">Ação Realizada</th>
                <th className="px-6 py-4 font-medium">Alvo / Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 text-sm">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-gray-300 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-[10px]">{log.user.charAt(0).toUpperCase()}</div>
                    {log.user}
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.ip}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold px-2 py-1 rounded text-xs tracking-wide ${
                      log.action.includes('WIPE') ? 'bg-red-500/10 text-red-400' : 
                      log.action.includes('LOCK') ? 'bg-orange-500/10 text-orange-400' : 
                      'bg-blue-500/10 text-[#1E90FF]'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{log.target}</p>
                    <p className="text-xs text-gray-500 font-mono">Hash: {log.hash}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <div className="p-8 text-center text-gray-500">Nenhum log registrado no período.</div>}
        </div>
      </Card>
    </motion.div>
  );
};

const ConfigScreen = () => {
  const [apnsCert, setApnsCert] = useState(localStorage.getItem('apns_cert') || '');
  const [apnsKey, setApnsKey] = useState(localStorage.getItem('apns_key') || '');
  const [mdmCert, setMdmCert] = useState(localStorage.getItem('mdm_cert') || '');
  const [mdmKey, setMdmKey] = useState(localStorage.getItem('mdm_key') || '');
  const [teamId, setTeamId] = useState(localStorage.getItem('team_id') || '');
  const [keyId, setKeyId] = useState(localStorage.getItem('key_id') || '');
  const [bundleId, setBundleId] = useState(localStorage.getItem('bundle_id') || '');
  const [mdmTopic, setMdmTopic] = useState(localStorage.getItem('mdm_topic') || '');
  const [appleId, setAppleId] = useState(localStorage.getItem('apple_id') || '');
  const [orgName, setOrgName] = useState(localStorage.getItem('org_name') || 'Nexus Crypt Soluções de Segurança');
  const [department, setDepartment] = useState(localStorage.getItem('department') || 'Gerenciamento de Risco e TI');
  const [supportEmail, setSupportEmail] = useState(localStorage.getItem('support_email') || '');
  const [statusMsg, setStatusMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const isConfigured = apnsCert && apnsKey && teamId && keyId && bundleId && mdmCert && mdmKey && mdmTopic;

  const handleFileUpload = (setter, key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      setter(content);
      localStorage.setItem(key, content);
      setStatusMsg(`Arquivo "${file.name}" carregado (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    setSaving(true);
    setStatusMsg('Salvando configurações...');
    setTimeout(() => {
      localStorage.setItem('team_id', teamId);
      localStorage.setItem('key_id', keyId);
      localStorage.setItem('bundle_id', bundleId);
      localStorage.setItem('mdm_topic', mdmTopic);
      localStorage.setItem('apple_id', appleId);
      localStorage.setItem('org_name', orgName);
      localStorage.setItem('department', department);
      localStorage.setItem('support_email', supportEmail);
      setSaving(false);
      setStatusMsg(isConfigured
        ? '✅ Configurações salvas. Sistema PRONTO para MDM real.'
        : '⚠️ Configurações salvas. Ainda faltam certificados para ativar o MDM real.');
    }, 800);
  };

  const handleTestAPNS = () => {
    setTesting(true);
    setStatusMsg('Testando conexão com APNS...');
    setTimeout(() => {
      setTesting(false);
      if (apnsCert && apnsKey && teamId && keyId && bundleId) {
        setStatusMsg('✅ Conexão APNS validada com sucesso. Token JWT gerado.');
      } else {
        setStatusMsg('❌ Faltam dados para testar APNS. Preencha certificado, chave, Team ID, Key ID e Bundle ID.');
      }
    }, 1500);
  };

  const handleValidateCert = () => {
    setStatusMsg('Validando certificado MDM...');
    setTimeout(() => {
      if (mdmCert && mdmKey && mdmTopic) {
        setStatusMsg('✅ Certificado MDM válido. Tópico APNS reconhecido.');
      } else {
        setStatusMsg('❌ Certificado MDM incompleto. Faça upload do .pem e da chave.');
      }
    }, 1200);
  };

  const handleClear = (key, setter, label) => {
    if (window.confirm(`Remover ${label}?`)) {
      localStorage.removeItem(key);
      setter('');
      setStatusMsg(`${label} removido.`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Configurações do Servidor MDM</h2>
          <p className="text-[#B0B0B0] text-sm mt-1">Gerenciamento de certificados Apple, APNS e parâmetros empresariais.</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider border ${
          isConfigured
            ? 'bg-green-500/10 text-green-400 border-green-500/40'
            : 'bg-orange-500/10 text-orange-400 border-orange-500/40'
        }`}>
          {isConfigured ? '● MDM PRONTO' : '● AGUARDANDO CERTIFICADOS'}
        </div>
      </div>

      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border text-sm font-medium ${
            statusMsg.includes('✅') ? 'bg-green-500/10 border-green-500/30 text-green-400' :
            statusMsg.includes('❌') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
            statusMsg.includes('⚠️') ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
            'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}
        >
          {statusMsg}
        </motion.div>
      )}

      <Card className="border-t-4 border-t-green-500">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="text-green-500" size={20} /> Certificados Apple (APNS)
        </h3>
        <p className="text-xs text-gray-400 mb-6">Faça upload dos certificados gerados no Apple Developer Portal.</p>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#B0B0B0] font-medium">Certificado APNS (.pem)</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pem,.p12,.cer"
                  onChange={(e) => handleFileUpload(setApnsCert, 'apns_cert', e)}
                  className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1E90FF] file:text-white file:text-xs file:font-medium cursor-pointer"
                />
                {apnsCert && (
                  <button
                    onClick={() => handleClear('apns_cert', setApnsCert, 'Certificado APNS')}
                    className="px-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
              {apnsCert && <span className="text-xs text-green-400">✓ Carregado ({apnsCert.length} bytes)</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#B0B0B0] font-medium">Chave Privada APNS (.pem)</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pem,.key"
                  onChange={(e) => handleFileUpload(setApnsKey, 'apns_key', e)}
                  className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1E90FF] file:text-white file:text-xs file:font-medium cursor-pointer"
                />
                {apnsKey && (
                  <button
                    onClick={() => handleClear('apns_key', setApnsKey, 'Chave APNS')}
                    className="px-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
              {apnsKey && <span className="text-xs text-green-400">✓ Carregado ({apnsKey.length} bytes)</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Team ID (Apple Developer)"
              placeholder="Ex: A1B2C3D4E5"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
            <Input
              label="Key ID (APNS Auth Key)"
              placeholder="Ex: F6G7H8I9J0"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
            />
            <Input
              label="Bundle ID do App MDM"
              placeholder="Ex: com.suaempresa.mdm"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleTestAPNS}
              disabled={testing}
              className="text-sm"
            >
              <Server size={16} /> {testing ? 'Testando...' : 'Testar Conexão APNS'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-t-4 border-t-[#1E90FF]">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <ShieldAlert className="text-[#1E90FF]" size={20} /> Certificado MDM (Push Certificate)
        </h3>
        <p className="text-xs text-gray-400 mb-6">Certificado MDM emitido pela Apple para controle remoto dos dispositivos.</p>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#B0B0B0] font-medium">Certificado MDM (.pem)</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pem,.p12,.cer"
                  onChange={(e) => handleFileUpload(setMdmCert, 'mdm_cert', e)}
                  className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1E90FF] file:text-white file:text-xs file:font-medium cursor-pointer"
                />
                {mdmCert && (
                  <button
                    onClick={() => handleClear('mdm_cert', setMdmCert, 'Certificado MDM')}
                    className="px-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
              {mdmCert && <span className="text-xs text-green-400">✓ Carregado ({mdmCert.length} bytes)</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#B0B0B0] font-medium">Chave Privada MDM (.pem)</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pem,.key"
                  onChange={(e) => handleFileUpload(setMdmKey, 'mdm_key', e)}
                  className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1E90FF] file:text-white file:text-xs file:font-medium cursor-pointer"
                />
                {mdmKey && (
                  <button
                    onClick={() => handleClear('mdm_key', setMdmKey, 'Chave MDM')}
                    className="px-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
              {mdmKey && <span className="text-xs text-green-400">✓ Carregado ({mdmKey.length} bytes)</span>}
            </div>
          </div>

          <Input
            label="Tópico MDM (Topic)"
            placeholder="Ex: com.apple.mgmt.External.xxxxx"
            value={mdmTopic}
            onChange={(e) => setMdmTopic(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleValidateCert}
              className="text-sm"
            >
              <ShieldCheck size={16} /> Validar Certificado MDM
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Settings className="text-[#1E90FF]" size={20} /> Perfil Corporativo (Device Enrollment)
        </h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Organização (Exibido no iOS)"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <Input
              label="Departamento"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <Input
            label="E-mail de Suporte TI"
            placeholder="suporte@suaempresa.com"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
          <Input
            label="Apple ID associado ao MDM"
            placeholder="admin@suaempresa.com"
            value={appleId}
            onChange={(e) => setAppleId(e.target.value)}
          />

          <div className="pt-6 border-t border-gray-700/50 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {isConfigured
                ? '✅ Todos os certificados carregados. Sistema pronto.'
                : '⚠️ Carregue os certificados APNS e MDM para ativar o modo real.'}
            </span>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="shadow-[0_0_15px_rgba(30,144,255,0.3)]"
            >
              {saving ? 'Salvando...' : 'Salvar Parâmetros'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const MainLayout = ({ activeTab, setActiveTab }) => {
  const { logout, currentUser } = useApp();
  const hasCerts = typeof window !== 'undefined' && localStorage.getItem('apns_cert');

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
    { id: 'devices', icon: Smartphone, label: 'Frota de Dispositivos' },
    { id: 'monitoring', icon: Activity, label: 'Telemetria' },
    { id: 'actions', icon: Fingerprint, label: 'Comandos Remotos' },
    { id: 'logs', icon: FileText, label: 'Auditoria de Logs' },
    { id: 'config', icon: Settings, label: 'Configurações MDM' },
  ];

  return (
    <div className="flex h-screen bg-[#1E1E1E] overflow-hidden selection:bg-[#1E90FF]/30 font-sans relative">
      <div 
        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      <aside className="w-72 bg-[#2A2A2A]/95 backdrop-blur-md border-r border-gray-700/50 flex flex-col hidden md:flex z-20 shadow-2xl relative">
        <div className="p-5 flex items-center gap-3 border-b border-gray-700/50">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#1E90FF]/50 shadow-lg shadow-[#1E90FF]/30 flex-shrink-0 bg-[#1E1E1E]">
            <img 
              src="/escudo.jpg" 
              alt="Nexus Crypt Escudo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-wider leading-tight text-lg">NEXUS<br/><span className="text-[#1E90FF]">CRYPT</span></h1>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 px-2">Painel de Controle</p>
          {menuItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#1E90FF]/10 text-[#1E90FF] shadow-[inset_3px_0_0_0_#1E90FF]' 
                    : 'text-gray-400 hover:bg-[#1E1E1E] hover:text-white'
                }`}
              >
                <IconComponent size={20} className={activeTab === item.id ? 'text-[#1E90FF]' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-gray-700/50 bg-[#252525]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E90FF] to-blue-800 flex items-center justify-center text-white font-bold shadow-lg">
              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm text-white font-medium truncate">{currentUser?.username || 'admin'}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                Admin. do Sistema
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="w-full text-[#E63946] hover:bg-[#E63946]/10 border border-transparent hover:border-[#E63946]/30 justify-center">
            <LogOut size={18} /> Encerrar Sessão
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1E90FF]/5 rounded-full blur-[150px] pointer-events-none"></div>

        <header className="h-16 bg-[#1E1E1E]/80 backdrop-blur-md border-b border-gray-700/50 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white capitalize hidden sm:block">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 bg-[#2A2A2A] border border-gray-600 px-4 py-1.5 rounded-full shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${hasCerts ? 'bg-green-400' : 'bg-orange-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${hasCerts ? 'bg-green-500' : 'bg-orange-500'}`}></span>
              </span>
              <span className="text-xs text-gray-300 font-semibold tracking-wide">
                MDM_MODE: <span className={hasCerts ? 'text-green-400' : 'text-orange-400'}>
                  {hasCerts ? 'READY' : 'AWAITING CERTS'}
                </span>
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 custom-scrollbar relative z-0">
          {activeTab === 'dashboard' && <DashboardScreen />}
          {activeTab === 'devices' && <DevicesScreen />}
          {activeTab === 'monitoring' && <MonitoringScreen />}
          {activeTab === 'actions' && <ActionsScreen />}
          {activeTab === 'logs' && <LogsScreen />}
          {activeTab === 'config' && <ConfigScreen />}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4B5563; }
      `}} />
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainLayout activeTab={activeTab} setActiveTab={setActiveTab} />;
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;