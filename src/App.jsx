import React, { useState, useContext, createContext, useEffect } from 'react';
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

import {
  login as apiLogin,
  logout as apiLogout,
  isAuthenticated as apiIsAuthenticated,
  getCurrentUser as apiGetCurrentUser,
  listDevices as apiListDevices,
  createDevice as apiCreateDevice,
  deleteDevice as apiDeleteDevice,
  listLogs as apiListLogs,
  lockDevice as apiLockDevice,
  wipeDevice as apiWipeDevice,
  locateDevice as apiLocateDevice,
  restartDevice as apiRestartDevice,
  getAppleConfig as apiGetAppleConfig,
  updateAppleConfig as apiUpdateAppleConfig,
  testAPNS as apiTestAPNS,
} from './services/api.js';

import ProtocoloScreen from './components/ProtocoloScreen.jsx';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(apiIsAuthenticated());
  const [currentUser, setCurrentUser] = useState(apiGetCurrentUser());
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  const loadDevices = async () => {
    try {
      const data = await apiListDevices();
      setDevices(data);
      setBackendOnline(true);
    } catch (error) {
      console.error('[DEVICES] Erro:', error);
      setBackendOnline(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await apiListLogs(100);
      setLogs(data);
    } catch (error) {
      console.error('[LOGS] Erro:', error);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const user = await apiLogin(username, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadDevices();
      await loadLogs();
      setLoading(false);
      return true;
    } catch (error) {
      console.error('[LOGIN] Erro:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    apiLogout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setDevices([]);
    setLogs([]);
  };

  const addDevice = async (deviceData) => {
    try {
      await apiCreateDevice(deviceData);
      await loadDevices();
      await loadLogs();
    } catch (error) {
      console.error('[DEVICE] Erro:', error);
      throw error;
    }
  };

  const removeDevice = async (id) => {
    try {
      await apiDeleteDevice(id);
      await loadDevices();
      await loadLogs();
    } catch (error) {
      console.error('[DEVICE] Erro:', error);
    }
  };

  const executeRemoteAction = async (id, action) => {
    try {
      if (action === 'LOCK') await apiLockDevice(id);
      else if (action === 'WIPE') await apiWipeDevice(id);
      else if (action === 'LOCALIZAR') await apiLocateDevice(id);
      else if (action === 'REINICIAR') await apiRestartDevice(id);

      await loadDevices();
      await loadLogs();
    } catch (error) {
      console.error('[ACTION] Erro:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDevices();
      loadLogs();
    }
  }, [isAuthenticated]);

  return (
    <AppContext.Provider value={{
      devices, logs, isAuthenticated, currentUser, loading, backendOnline,
      login, logout, addDevice, removeDevice, executeRemoteAction,
      loadDevices, loadLogs,
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => useContext(AppContext);

const API_URL = 'https://nexus-crypt-backend.onrender.com';
const getToken = () => localStorage.getItem('nexus_token') || sessionStorage.getItem('nexus_token');

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
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-full w-7 h-7 flex items-center justify-center text-xl leading-none">&times;</button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const LoginScreen = () => {
  const { login, loading, backendOnline } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ok = await login(username, password);
    if (!ok) setError('Credenciais inválidas. Verifique usuário e senha.');
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
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10 p-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#1E90FF]/50 shadow-2xl shadow-[#1E90FF]/40 bg-[#1E1E1E]">
              <img src="/escudo.jpg" alt="Nexus Crypt Escudo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NEXUS CRYPT <span className="text-[#1E90FF]">MDM</span></h1>
          <p className="text-[#B0B0B0] mt-2 text-sm uppercase tracking-widest font-medium">Controle Criptografado</p>
        </div>

        <Card className="bg-[#2A2A2A]/80 backdrop-blur-md border-gray-700/60 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input label="Credencial Administrativa" placeholder="Digite seu usuário" value={username} onChange={e => setUsername(e.target.value)} required />
            <Input label="Senha de Acesso" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#E63946] text-sm text-center bg-[#E63946]/10 py-2 rounded-lg border border-[#E63946]/20">{error}</motion.p>}
            
            {!backendOnline && (
              <div className="text-xs text-orange-400 text-center bg-orange-500/10 py-2 rounded-lg border border-orange-500/20">
                ⚠️ Backend acordando (pode levar 30s)...
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-4 py-3 text-lg shadow-[0_0_20px_rgba(30,144,255,0.4)]">
              {loading ? 'Autenticando...' : 'Autenticar Sessão'}
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
    active: devices.filter(d => d.status === 'ACTIVE').length,
    locked: devices.filter(d => d.status === 'LOCKED').length,
    offline: devices.filter(d => d.status === 'OFFLINE' || d.status === 'WIPED').length,
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
  const batteryData = devices.filter(d => d.status !== 'WIPED').map(d => ({ name: d.name.split(' -')[0], bateria: d.battery }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1E90FF]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#B0B0B0] text-sm font-medium">Total Matrículas</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-[#1E90FF]/10 rounded-lg"><Smartphone className="text-[#1E90FF]" size={24} /></div>
          </div>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#B0B0B0] text-sm font-medium">Ativos (Sync)</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.active}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg"><Activity className="text-green-500" size={24} /></div>
          </div>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#B0B0B0] text-sm font-medium">Bloqueados</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.locked}</h3>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg"><Lock className="text-orange-500" size={24} /></div>
          </div>
        </Card>
        <Card className="border-t-4 border-t-gray-500">
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
            <Battery size={18} className="text-[#1E90FF]"/> Saúde de Bateria
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
  const { devices, addDevice, removeDevice, loadDevices } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDev, setNewDev] = useState({ name: '', model: '', imei: '', iosVersion: '' });
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [messageModal, setMessageModal] = useState({ open: false, device: null, message: '' });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/devices/sync-simplemdm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar');
      await loadDevices();
      alert(`✅ Sincronizado! ${data.created} criados, ${data.updated} atualizados`);
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleAction = async (device, action, extra = {}) => {
    if (!device.simplemdmId) {
      alert('⚠️ Este dispositivo não está vinculado ao SimpleMDM.');
      return;
    }

    const confirmMsg = {
      lock: `Bloquear "${device.name}"?`,
      wipe: `⚠️ APAGAR TUDO de "${device.name}"? Essa ação é IRREVERSÍVEL!`,
      restart: `Reiniciar "${device.name}"?`,
      locate: `Localizar "${device.name}"?`,
    }[action];

    if (confirmMsg && !window.confirm(confirmMsg)) return;

    try {
      const token = getToken();
      const body = action === 'message' ? { message: extra.message } : {};
      const res = await fetch(`${API_URL}/api/devices/${device.id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');
      alert(`✅ ${data.message || 'Comando enviado!'}`);
      setOpenMenuId(null);
      setMessageModal({ open: false, device: null, message: '' });
      await loadDevices();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!consent) return;
    setSaving(true);
    setError('');
    try {
      await addDevice(newDev);
      setIsAddModalOpen(false);
      setNewDev({ name: '', model: '', imei: '', iosVersion: '' });
      setConsent(false);
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar dispositivo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deletar "${name}" do painel? (Não apaga o device, só remove do Nexus)`)) return;
    await removeDevice(id);
    setOpenMenuId(null);
  };

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const STATUS = {
    ACTIVE: { color: '#00e676', label: 'Ativo' },
    LOCKED: { color: '#ff9100', label: 'Bloqueado' },
    WIPED: { color: '#ff1744', label: 'Formatado' },
    OFFLINE: { color: '#6b7280', label: 'Offline' },
    PENDING: { color: '#1E90FF', label: 'Pendente' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dispositivos Gerenciados</h2>
          <p className="text-[#B0B0B0] text-sm mt-1">Lista completa de aparelhos sob política MDM.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button variant="secondary" onClick={handleSync} disabled={syncing}>
            <RotateCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar SimpleMDM'}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="shadow-[0_0_15px_rgba(30,144,255,0.3)]">
            <Plus size={18} /> Cadastrar Aparelho
          </Button>
        </div>
      </div>

      {devices.length === 0 ? (
        <Card className="p-12 text-center">
          <Smartphone size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500 text-lg mb-2">Nenhum dispositivo cadastrado.</p>
          <p className="text-gray-600 text-sm">Clique em "Sincronizar SimpleMDM" pra puxar do servidor.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {devices.map((dev) => {
            const st = STATUS[dev.status] || STATUS.OFFLINE;
            const linked = !!dev.simplemdmId;
            const menuOpen = openMenuId === dev.id;

            return (
              <motion.div
                key={dev.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#2A2A2A] border border-gray-700/50 rounded-2xl p-5 hover:border-[#1E90FF]/40 transition-all"
              >
                <div className="absolute top-4 right-4 w-3 h-3 rounded-full" style={{ background: st.color }} />

                <div className="flex justify-center mb-5">
                  <div className="w-24 h-36 bg-gradient-to-b from-gray-700 to-gray-900 rounded-3xl border-2 border-gray-600 flex items-center justify-center relative shadow-lg shadow-black/40">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-black rounded-full"></div>
                    <Smartphone size={36} className="text-gray-500" />
                  </div>
                </div>

                <h3 className="text-white font-semibold text-base mb-1 truncate">{dev.name}</h3>
                <p className="text-gray-400 text-xs mb-4 truncate">{dev.model}</p>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                  <span>👤</span>
                  <span className="truncate">Cleber Alexandre</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>📦</span>
                  <span>Default</span>
                </div>

                <p className="text-gray-600 text-[10px] font-mono mb-4 truncate">IMEI: {dev.imei}</p>

                {!linked && (
                  <p className="text-orange-400 text-[10px] mb-3 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/30">
                    ⚠️ Não vinculado ao SimpleMDM
                  </p>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-700/50 mt-auto relative">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: st.color }} />
                    <span className="text-xs font-semibold" style={{ color: st.color }}>{st.label}</span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : dev.id); }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all bg-gray-700 text-white hover:bg-[#1E90FF] cursor-pointer"
                      title="Ações"
                    >
                      ⋯
                    </button>

                    {menuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-12 right-0 bg-[#1E1E1E] border border-gray-700 rounded-xl shadow-2xl p-2 min-w-[220px] z-50"
                      >
                        {linked ? (
                          <>
                            <button onClick={() => handleAction(dev, 'lock')} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-orange-500/10 text-orange-400 flex items-center gap-2">
                              <Lock size={14} /> Bloquear
                            </button>
                            <button onClick={() => { setMessageModal({ open: true, device: dev, message: '' }); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-500/10 text-blue-400 flex items-center gap-2">
                              <MessageSquare size={14} /> Enviar Mensagem
                            </button>
                            <button onClick={() => handleAction(dev, 'locate')} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-purple-500/10 text-purple-400 flex items-center gap-2">
                              <MapPin size={14} /> Localizar
                            </button>
                            <button onClick={() => handleAction(dev, 'restart')} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-green-500/10 text-green-400 flex items-center gap-2">
                              <RotateCw size={14} /> Reiniciar
                            </button>
                            <button onClick={() => handleAction(dev, 'wipe')} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-400 flex items-center gap-2 border-t border-gray-700 mt-1 pt-3">
                              <Trash2 size={14} /> Apagar (Wipe)
                            </button>
                          </>
                        ) : (
                          <p className="text-[10px] text-orange-400 px-3 py-2 bg-orange-500/10 rounded-lg mb-1">
                            ⚠️ Sem comandos MDM (não vinculado)
                          </p>
                        )}
                        <button onClick={() => handleDelete(dev.id, dev.name)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-400 flex items-center gap-2 border-t border-gray-700 mt-1 pt-3">
                          <Trash2 size={14} /> Remover do Painel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={messageModal.open}
        onClose={() => setMessageModal({ open: false, device: null, message: '' })}
        title="Enviar Mensagem"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Mensagem para: <strong className="text-white">{messageModal.device?.name}</strong></p>
          <Input
            label="Mensagem"
            placeholder="Digite a mensagem..."
            value={messageModal.message}
            onChange={(e) => setMessageModal({ ...messageModal, message: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button variant="secondary" onClick={() => setMessageModal({ open: false, device: null, message: '' })}>Cancelar</Button>
            <Button
              onClick={() => handleAction(messageModal.device, 'message', { message: messageModal.message })}
              disabled={!messageModal.message}
            >
              Enviar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Cadastro de Dispositivo">
        <form onSubmit={handleAdd} className="space-y-5">
          <Input label="Nome de Identificação" placeholder="Ex: iPhone 14 - Vendas" value={newDev.name} onChange={e => setNewDev({...newDev, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Modelo Apple" placeholder="Ex: iPhone 15 Pro" value={newDev.model} onChange={e => setNewDev({...newDev, model: e.target.value})} required />
            <Input label="Versão iOS" placeholder="Ex: 17.4" value={newDev.iosVersion} onChange={e => setNewDev({...newDev, iosVersion: e.target.value})} required />
          </div>
          <Input label="IMEI" placeholder="15 dígitos" value={newDev.imei} onChange={e => setNewDev({...newDev, imei: e.target.value})} required />

          <div className="p-4 bg-[#E63946]/5 border border-[#E63946]/30 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#E63946] mt-0.5" checked={consent} onChange={e => setConsent(e.target.checked)} required />
              <span className="text-sm text-gray-300">
                <strong className="text-white block mb-1 flex items-center gap-2"><AlertTriangle size={16} className="text-[#E63946]"/> AVISO LEGAL</strong>
                Declaro ter consentimento formal por escrito do proprietário do dispositivo.
              </span>
            </label>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</div>}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={!consent || saving}>{saving ? 'Salvando...' : 'Cadastrar'}</Button>
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
        <p className="text-[#B0B0B0] text-sm mt-1">Sensores e status dos dispositivos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map(dev => (
          <Card key={dev.id} className="relative overflow-hidden border-gray-700/60">
            {(dev.status === 'OFFLINE' || dev.status === 'WIPED') && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-gray-300 rounded-xl">
                <WifiOff size={40} className="mb-3 opacity-50"/>
                <span className="font-medium">{dev.status === 'WIPED' ? 'FORMATADO' : 'SEM CONEXÃO'}</span>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-800 rounded-lg"><Smartphone size={20} /></div>
                <div>
                  <h4 className="text-base font-semibold text-white">{dev.name}</h4>
                  <p className="text-xs text-gray-400 font-mono">{dev.imei}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dev.battery > 20 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {dev.battery > 20 ? <Battery size={18} /> : <BatteryCharging size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 uppercase">Energia</span>
                    <span className="text-white font-medium">{dev.battery}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${dev.battery > 20 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${dev.battery}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><HardDrive size={18} /></div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 uppercase">Armazenamento</span>
                    <span className="text-white font-medium">{dev.storageUsed}GB / {dev.storageTotal}GB</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(dev.storageUsed / dev.storageTotal) * 100}%` }}></div>
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
                  Sync: {new Date(dev.lastSeen).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {devices.length === 0 && <div className="p-12 text-center text-gray-500">Nenhum dispositivo cadastrado.</div>}
    </motion.div>
  );
};

const ActionsScreen = () => {
  const { devices, executeRemoteAction, currentUser } = useApp();
  const [selectedDevice, setSelectedDevice] = useState('');
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, step: 1 });
  const [confirmText, setConfirmText] = useState('');
  const [executing, setExecuting] = useState(false);

  const activeDevices = devices.filter(d => d.status !== 'WIPED');

  const handleActionClick = (type) => {
    if (!selectedDevice) return;
    setActionModal({ isOpen: true, type, step: 1 });
    setConfirmText('');
  };

  const executeAction = async () => {
    if (!selectedDevice) return;
    setExecuting(true);
    try {
      await executeRemoteAction(selectedDevice, actionModal.type);
      setActionModal({ isOpen: false, type: null, step: 1 });
    } catch (error) {
      alert('Erro ao executar ação: ' + error.message);
    } finally {
      setExecuting(false);
    }
  };

  const renderModalContent = () => {
    const dev = devices.find(d => d.id === selectedDevice);
    if (!dev) return null;

    const isDestructive = actionModal.type === 'WIPE' || actionModal.type === 'LOCK';

    if (actionModal.step === 1) {
      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl flex items-start gap-4 border ${isDestructive ? 'bg-[#E63946]/10 border-[#E63946]/30' : 'bg-[#1E90FF]/10 border-[#1E90FF]/30'}`}>
            {isDestructive ? <AlertTriangle size={24} className="text-[#E63946]" /> : <ShieldAlert size={24} className="text-[#1E90FF]" />}
            <div>
              <h4 className={`font-semibold mb-1 ${isDestructive ? 'text-[#E63946]' : 'text-[#1E90FF]'}`}>Confirmar Payload MDM</h4>
              <p className="text-gray-300 text-sm">
                Comando <strong>{actionModal.type}</strong> será enviado para <strong>{dev.name}</strong>.
                {actionModal.type === 'WIPE' && " TODOS os dados serão apagados de forma irreversível."}
                {actionModal.type === 'LOCK' && " O aparelho entrará em Lost Mode."}
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-700/50">
            <Button variant="secondary" onClick={() => setActionModal({ isOpen: false, type: null, step: 1 })}>Cancelar</Button>
            {isDestructive ? (
              <Button variant="danger" onClick={() => setActionModal({ ...actionModal, step: 2 })}>Estou ciente</Button>
            ) : (
              <Button onClick={executeAction} disabled={executing}>{executing ? 'Enviando...' : 'Enviar via APNS'}</Button>
            )}
          </div>
        </div>
      );
    }

    if (actionModal.step === 2 && isDestructive) {
      return (
        <div className="space-y-5">
          <div className="bg-[#1E1E1E] p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-3">
              <strong>Auditoria:</strong> Esta ação vincula seu usuário ({currentUser?.username}) e IP.
            </p>
            <Input 
              label={`Digite o IMEI do aparelho (${dev.imei})`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setActionModal({ isOpen: false, type: null, step: 1 })}>Abortar</Button>
            <Button 
              variant="danger" 
              disabled={confirmText !== dev.imei || executing}
              onClick={executeAction}
            >
              {executing ? 'Enviando...' : (actionModal.type === 'WIPE' ? 'CONFIRMAR WIPE' : 'CONFIRMAR BLOQUEIO')}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-2">Ações Remotas</h2>
        <p className="text-[#B0B0B0] mb-8 text-sm">Selecione um dispositivo para disparar comandos MDM.</p>
        
        <Card className="mb-8 border-[#1E90FF]/20">
          <label className="text-sm text-[#B0B0B0] font-medium block mb-3">Dispositivo Alvo</label>
          <select 
            className="w-full bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-4 py-3.5 focus:outline-none focus:border-[#1E90FF]"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="" disabled>-- Selecione --</option>
            {activeDevices.map(dev => (
              <option key={dev.id} value={dev.id}>{dev.name} ({dev.imei})</option>
            ))}
          </select>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Button variant="secondary" disabled={!selectedDevice} onClick={() => handleActionClick('LOCALIZAR')} className="h-28 flex-col gap-3">
            <MapPin size={28} className={selectedDevice ? 'text-[#1E90FF]' : 'text-gray-500'} />
            <span className="font-semibold">Localizar</span>
          </Button>
          <Button variant="secondary" disabled={!selectedDevice} onClick={() => handleActionClick('REINICIAR')} className="h-28 flex-col gap-3">
            <RotateCw size={28} className={selectedDevice ? 'text-[#1E90FF]' : 'text-gray-500'} />
            <span className="font-semibold">Reiniciar</span>
          </Button>
          <Button variant="secondary" disabled={!selectedDevice} onClick={() => handleActionClick('LOCK')} className="h-28 flex-col gap-3">
            <Lock size={28} className={selectedDevice ? 'text-orange-500' : 'text-gray-500'} />
            <span className="font-semibold text-orange-400">Bloquear</span>
          </Button>
          <Button variant="secondary" disabled={!selectedDevice} onClick={() => handleActionClick('WIPE')} className="h-28 flex-col gap-3 sm:col-span-2 lg:col-span-3">
            <Trash2 size={28} className={selectedDevice ? 'text-[#E63946]' : 'text-gray-500'} />
            <span className="font-semibold text-[#E63946]">Formatar (Wipe)</span>
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={actionModal.isOpen} 
        onClose={() => setActionModal({ isOpen: false, type: null, step: 1 })}
        title={actionModal.type === 'WIPE' || actionModal.type === 'LOCK' ? 'Ação Crítica' : 'Confirmar Comando'}
      >
        {renderModalContent()}
      </Modal>
    </motion.div>
  );
};

const LogsScreen = () => {
  const { logs, loadLogs } = useApp();

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Auditoria e Logs</h2>
          <p className="text-[#B0B0B0] text-sm mt-1">Registro imutável de ações no sistema.</p>
        </div>
        <Button variant="secondary" onClick={loadLogs}><FileText size={16}/> Atualizar</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1E1E1E] border-b border-gray-700 text-[#B0B0B0] text-xs uppercase">
                <th className="px-6 py-4">Data / Hora</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">IP</th>
                <th className="px-6 py-4">Ação</th>
                <th className="px-6 py-4">Alvo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 text-sm">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 text-gray-300 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-white font-medium">{log.user?.username || 'sistema'}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.ip || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold px-2 py-1 rounded text-xs ${
                      log.action.includes('WIPE') || log.action.includes('FORMATAR') ? 'bg-red-500/10 text-red-400' : 
                      log.action.includes('LOCK') || log.action.includes('BLOQUEAR') ? 'bg-orange-500/10 text-orange-400' : 
                      'bg-blue-500/10 text-[#1E90FF]'
                    }`}>{log.action}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <div className="p-8 text-center text-gray-500">Nenhum log registrado.</div>}
        </div>
      </Card>
    </motion.div>
  );
};

const ConfigScreen = () => {
  const [config, setConfig] = useState({
    apnsCert: '', apnsKey: '', mdmCert: '', mdmKey: '',
    teamId: '', keyId: '', bundleId: '', mdmTopic: '',
    appleId: '', orgName: 'Nexus Crypt Soluções de Segurança',
    department: 'Gerenciamento de Risco e TI', supportEmail: '',
    isConfigured: false,
  });
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    apiGetAppleConfig()
      .then((data) => setConfig((prev) => ({ ...prev, ...data })))
      .catch((err) => setStatusMsg('❌ Erro ao carregar: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateField(key, ev.target.result);
      setStatusMsg(`Arquivo "${file.name}" carregado (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg('Salvando configurações...');
    try {
      const updated = await apiUpdateAppleConfig(config);
      setConfig((prev) => ({ ...prev, ...updated }));
      setStatusMsg(updated.isConfigured
        ? '✅ Configurações salvas. Sistema PRONTO para MDM real.'
        : '⚠️ Configurações salvas. Ainda faltam certificados para ativar o MDM real.');
    } catch (err) {
      setStatusMsg('❌ Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestAPNS = async () => {
    setTesting(true);
    setStatusMsg('Testando conexão com APNS...');
    try {
      const result = await apiTestAPNS();
      setStatusMsg(result.success ? '✅ ' + result.message : '❌ ' + result.error);
    } catch (err) {
      setStatusMsg('❌ ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="text-white p-8">Carregando configurações...</div>;

  const isConfigured = config.isConfigured || (
    config.apnsCert && config.apnsKey && config.mdmCert && config.mdmKey &&
    config.teamId && config.keyId && config.bundleId && config.mdmTopic
  );

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
        <div className={`p-4 rounded-lg border text-sm font-medium ${
          statusMsg.includes('✅') ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          statusMsg.includes('❌') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          statusMsg.includes('⚠️') ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
          'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          {statusMsg}
        </div>
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
              <input
                type="file"
                accept=".pem,.p12,.cer"
                onChange={(e) => handleFileUpload('apnsCert', e)}
                className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1E90FF] file:text-white file:text-xs file:font-medium cursor-pointer"
              />
              {config.apnsCert && <span className="text-xs text-green-400">✓ Carregado ({config.apnsCert.length} bytes)</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#B0B0B0] font-medium">Chave Privada APNS (.pem)</label>
              <input
                type="file"
                accept=".pem,.key"
                onChange={(e) => handleFileUpload('apnsKey', e)}
                className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1E90FF] file:text-white file:text-xs file:font-medium cursor-pointer"
              />
              {config.apnsKey && <span className="text-xs text-green-400">✓ Carregado ({config.apnsKey.length} bytes)</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Team ID (Apple Developer)" placeholder="Ex: A1B2C3D4E5" value={config.teamId || ''} onChange={(e) => updateField('teamId', e.target.value)} />
            <Input label="Key ID (APNS Auth Key)" placeholder="Ex: F6G7H8I9J0" value={config.keyId || ''} onChange={(e) => updateField('keyId', e.target.value)} />
            <Input label="Bundle ID do App MDM" placeholder="Ex: com.suaempresa.mdm" value={config.bundleId || ''} onChange={(e) => updateField('bundleId', e.target.value)} />
          </div>

          <Button variant="secondary" onClick={handleTestAPNS} disabled={testing}>
            <Server size={16} /> {testing ? 'Testando...' : 'Testar Conexão APNS'}
          </Button>
        </div>
      </Card>

      <Card className="border-t-4 border-t-[#1E90FF]">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <ShieldAlert className="text-[#1E90FF]" size={20} /> Certificado MDM
        </h3>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#B0B0B0] font-medium">Certificado MDM (.pem)</label>
              <input
                type="file"
                accept=".pem,.p12,.cer"
                onChange={(e) => handleFileUpload('mdmCert', e)}
                className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1E90FF] file:text-white file:text-xs file:font-medium cursor-pointer"
              />
              {config.mdmCert && <span className="text-xs text-green-400">✓ Carregado</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#B0B0B0] font-medium">Chave Privada MDM (.pem)</label>
              <input
                type="file"
                accept=".pem,.key"
                onChange={(e) => handleFileUpload('mdmKey', e)}
                className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1E90FF] file:text-white file:text-xs file:font-medium cursor-pointer"
              />
              {config.mdmKey && <span className="text-xs text-green-400">✓ Carregado</span>}
            </div>
          </div>

          <Input label="Tópico MDM (Topic)" placeholder="Ex: com.apple.mgmt.External.xxxxx" value={config.mdmTopic || ''} onChange={(e) => updateField('mdmTopic', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Settings className="text-[#1E90FF]" size={20} /> Perfil Corporativo
        </h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome da Organização" value={config.orgName || ''} onChange={(e) => updateField('orgName', e.target.value)} />
            <Input label="Departamento" value={config.department || ''} onChange={(e) => updateField('department', e.target.value)} />
          </div>
          <Input label="E-mail de Suporte TI" placeholder="suporte@suaempresa.com" value={config.supportEmail || ''} onChange={(e) => updateField('supportEmail', e.target.value)} />
          <Input label="Apple ID associado ao MDM" placeholder="admin@suaempresa.com" value={config.appleId || ''} onChange={(e) => updateField('appleId', e.target.value)} />

          <div className="pt-6 border-t border-gray-700/50 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {isConfigured ? '✅ Sistema pronto.' : '⚠️ Carregue os certificados para ativar o modo real.'}
            </span>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Parâmetros'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const MainLayout = ({ activeTab, setActiveTab }) => {
  const { logout, currentUser, backendOnline } = useApp();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
    { id: 'devices', icon: Smartphone, label: 'Dispositivos' },
    { id: 'monitoring', icon: Activity, label: 'Telemetria' },
    { id: 'actions', icon: Fingerprint, label: 'Comandos' },
    { id: 'protocol', icon: ShieldCheck, label: 'Protocolo Nexus' },
    { id: 'logs', icon: FileText, label: 'Logs' },
    { id: 'config', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex h-screen bg-[#1E1E1E] overflow-hidden font-sans relative">
      <div 
        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>

      <aside className="w-72 bg-[#2A2A2A]/95 backdrop-blur-md border-r border-gray-700/50 flex flex-col z-20 relative">
        <div className="p-5 flex items-center gap-3 border-b border-gray-700/50">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#1E90FF]/50 bg-[#1E1E1E]">
            <img src="/escudo.jpg" alt="Escudo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-white font-bold leading-tight text-lg">NEXUS<br/><span className="text-[#1E90FF]">CRYPT</span></h1>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#1E90FF]/10 text-[#1E90FF]' 
                    : 'text-gray-400 hover:bg-[#1E1E1E] hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E90FF] to-blue-800 flex items-center justify-center text-white font-bold">
              {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm text-white font-medium truncate">{currentUser?.username || 'admin'}</p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="w-full text-[#E63946] hover:bg-[#E63946]/10 justify-center">
            <LogOut size={18} /> Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-16 bg-[#1E1E1E]/80 backdrop-blur-md border-b border-gray-700/50 flex items-center justify-between px-6">
          <h2 className="text-xl font-bold text-white capitalize">{menuItems.find(m => m.id === activeTab)?.label}</h2>
          
          <div className="flex items-center gap-2 bg-[#2A2A2A] border border-gray-600 px-4 py-1.5 rounded-full">
            <span className={`relative flex h-2.5 w-2.5`}>
              <span className={`animate-ping absolute h-full w-full rounded-full ${backendOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative rounded-full h-2.5 w-2.5 ${backendOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs text-gray-300 font-semibold">
              API: <span className={backendOnline ? 'text-green-400' : 'text-red-400'}>
                {backendOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <DashboardScreen />}
          {activeTab === 'devices' && <DevicesScreen />}
          {activeTab === 'monitoring' && <MonitoringScreen />}
          {activeTab === 'actions' && <ActionsScreen />}
          {activeTab === 'protocol' && <ProtocoloScreen />}
          {activeTab === 'logs' && <LogsScreen />}
          {activeTab === 'config' && <ConfigScreen />}
        </div>
      </main>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) return <LoginScreen />;
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