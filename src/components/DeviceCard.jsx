import { useState } from 'react';

export default function DeviceCard({ device, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOnline = device.status === 'ACTIVE';
  const isLocked = device.status === 'LOCKED';
  const isWiped = device.status === 'WIPED';

  const statusColor = isOnline ? '#00e676' : isLocked ? '#ff9100' : '#ff1744';
  const statusLabel = isOnline ? 'Ativo' : isLocked ? 'Bloqueado' : isWiped ? 'Formatado' : 'Offline';

  const handleAction = async (action) => {
    setMenuOpen(false);
    setLoading(true);
    try {
      await onAction(device, action);
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { key: 'lock', label: '🔒 Bloquear', color: '#ff9100' },
    { key: 'message', label: '💬 Enviar Mensagem', color: '#00d4ff' },
    { key: 'locate', label: '📍 Localizar', color: '#7c4dff' },
    { key: 'restart', label: '🔄 Reiniciar', color: '#00e676' },
    { key: 'wipe', label: '🗑️ Apagar', color: '#ff1744' },
  ];

  return (
    <div style={styles.card}>
      {/* Indicador de status (bolinha no canto) */}
      <div style={{ ...styles.statusDot, background: statusColor }} />

      {/* Imagem do dispositivo */}
      <div style={styles.imageWrapper}>
        <img
          src="/iphone-placeholder.png"
          alt={device.model}
          style={styles.image}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div style="font-size:64px;text-align:center;">📱</div>';
          }}
        />
      </div>

      {/* Nome */}
      <h3 style={styles.name}>{device.name}</h3>

      {/* Modelo */}
      <p style={styles.model}>{device.model}</p>

      {/* Usuário */}
      <div style={styles.infoRow}>
        <span style={styles.infoIcon}>👤</span>
        <span style={styles.infoText}>Cleber Alexandre</span>
      </div>

      {/* Grupo */}
      <div style={styles.infoRow}>
        <span style={styles.infoIcon}>📦</span>
        <span style={styles.infoText}>Default</span>
      </div>

      {/* Rodapé: status + menu */}
      <div style={styles.footer}>
        <div style={styles.statusBox}>
          <span style={{ ...styles.statusIndicator, background: statusColor }} />
          <span style={{ ...styles.statusText, color: statusColor }}>{statusLabel}</span>
        </div>

        <button
          style={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
          disabled={loading}
        >
          {loading ? '⏳' : '⋯'}
        </button>

        {menuOpen && (
          <div style={styles.menu}>
            {actions.map((action) => (
              <button
                key={action.key}
                style={styles.menuItem}
                onClick={() => handleAction(action.key)}
                onMouseEnter={(e) => e.target.style.background = 'rgba(0, 212, 255, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <span style={{ color: action.color }}>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: 'relative',
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #eaeaea',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  statusDot: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  imageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
    height: '100px',
  },
  image: {
    height: '100%',
    objectFit: 'contain',
  },
  name: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  model: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '16px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#333',
  },
  infoIcon: {
    fontSize: '14px',
    opacity: 0.7,
  },
  infoText: {
    color: '#333',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
    position: 'relative',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '12px',
    fontWeight: 600,
  },
  menuButton: {
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    transition: 'all 0.2s',
  },
  menu: {
    position: 'absolute',
    bottom: '50px',
    right: '0',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    border: '1px solid #eaeaea',
    padding: '8px',
    minWidth: '200px',
    zIndex: 100,
  },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
};