import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, RefreshCw, Download, Wifi, WifiOff, Share2, X, CheckCircle } from 'lucide-react';

export default function Header({ vistaActual, setVistaActual, modoSimulacion, setModoSimulacion }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Detectar conectividad de red
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Detectar si ya corre en modo standalone (instalada)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    // 3. Capturar evento nativo de instalación PWA (Chrome/Android/Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Capturar evento de instalación completada
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 5000);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <header style={{ marginBottom: '16px' }}>
      {/* Barra superior de logos institucionales en co-branding */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E5E0DB',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Logo PUC */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logos/logo_uc.png" alt="Pontificia Universidad Católica de Chile" style={{ height: '48px', width: 'auto' }} />
        </div>

        {/* Logo Fundación Puente al Centro */}
        <div style={{ textAlign: 'center' }}>
          <img src="/logos/logo_puente.png" alt="Fundación Puente" style={{ height: '46px', maxWidth: '170px', objectFit: 'contain' }} />
          <div style={{ fontSize: '0.74rem', color: '#9F1127', fontStyle: 'italic', fontWeight: '600' }}>
            «El principal puente que supera la pobreza»
          </div>
        </div>

        {/* Logo Duoc UC + Badges PWA de Conexión e Instalación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <img src="/logos/logo_duoc.png" alt="Duoc UC" style={{ height: '30px', width: 'auto' }} />

          {/* Badge de Red */}
          {isOnline ? (
            <span
              title="Conexión activa a internet"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                color: '#15803D',
                background: '#DCFCE7',
                padding: '4px 9px',
                borderRadius: '20px',
                fontWeight: '600',
                border: '1px solid #BBF7D0'
              }}
            >
              <Wifi size={12} /> Online
            </span>
          ) : (
            <span
              title="Modo sin conexión: la PWA funciona con datos locales en caché"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                color: '#9A3412',
                background: '#FFEDD5',
                padding: '4px 9px',
                borderRadius: '20px',
                fontWeight: '700',
                border: '1px solid #FDBA74'
              }}
            >
              <WifiOff size={12} /> Sin conexión · PWA
            </span>
          )}

          {/* Botón de Instalación PWA */}
          {isStandalone ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: '#9F1127',
                background: '#FDF2F4',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: '600',
                border: '1px solid #F1D4DB'
              }}
            >
              <CheckCircle size={13} color="#22C55E" /> App instalada
            </span>
          ) : (
            <button
              onClick={handleInstallClick}
              title="Instalar como Progressive Web App en tu teléfono o computador"
              style={{
                background: 'linear-gradient(135deg, #9F1127 0%, #BB0923 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(159, 17, 39, 0.25)',
                transition: 'transform 0.15s ease'
              }}
            >
              <Download size={13} /> Instalar App
            </button>
          )}
        </div>
      </div>

      {/* Barra de control para el Pitch: Alternador de Vista y Simulador Responsive */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FAF1F3',
        border: '1px solid #F1D4DB',
        borderRadius: '12px',
        padding: '10px 16px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Selector de Perspectiva */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#9F1127' }}>Perspectiva:</span>
          <button
            onClick={() => setVistaActual('becado')}
            className={`btn-secondary ${vistaActual === 'becado' ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '0.84rem',
              backgroundColor: vistaActual === 'becado' ? '#9F1127' : '#FFFFFF',
              color: vistaActual === 'becado' ? '#FFFFFF' : '#32373C',
              borderColor: '#9F1127'
            }}
          >
            🧑‍🎓 Becado (Puente Contigo)
          </button>
          <button
            onClick={() => setVistaActual('equipo')}
            className={`btn-secondary ${vistaActual === 'equipo' ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '0.84rem',
              backgroundColor: vistaActual === 'equipo' ? '#9F1127' : '#FFFFFF',
              color: vistaActual === 'equipo' ? '#FFFFFF' : '#32373C',
              borderColor: '#9F1127'
            }}
          >
            👩‍⚕️ Panel del Equipo Puente
          </button>
        </div>

        {/* Selector de Simulación Responsive para la Demo en Vivo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: '600' }}>Simular pantalla:</span>
          <button
            onClick={() => setModoSimulacion('auto')}
            title="Adaptativo Automático"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              background: modoSimulacion === 'auto' ? '#9F1127' : '#FFFFFF',
              color: modoSimulacion === 'auto' ? '#FFFFFF' : '#4B5563',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem'
            }}
          >
            <RefreshCw size={14} /> Auto
          </button>
          <button
            onClick={() => setModoSimulacion('mobile')}
            title="Móvil (390px)"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              background: modoSimulacion === 'mobile' ? '#9F1127' : '#FFFFFF',
              color: modoSimulacion === 'mobile' ? '#FFFFFF' : '#4B5563',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem'
            }}
          >
            <Smartphone size={14} /> Móvil
          </button>
          <button
            onClick={() => setModoSimulacion('tablet')}
            title="Tablet (820px)"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              background: modoSimulacion === 'tablet' ? '#9F1127' : '#FFFFFF',
              color: modoSimulacion === 'tablet' ? '#FFFFFF' : '#4B5563',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem'
            }}
          >
            <Tablet size={14} /> Tablet
          </button>
        </div>
      </div>

      {/* Modal Guía de Instalación PWA (Multi-plataforma: iOS Safari, Android, Desktop) */}
      {showInstallModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowInstallModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img src="/icon-192.png" alt="Puente Contigo" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
              <div>
                <h3 style={{ margin: 0, color: '#9F1127', fontSize: '1.2rem' }}>Instalar Puente Contigo (PWA)</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B7280' }}>Accede al canal de apoyo directo desde tu inicio, incluso sin saldo ni internet.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {/* iPhone / iPad */}
              <div style={{ background: '#FAF8F6', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5E0DB' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#32373C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🍎 En iPhone / iPad (Safari):
                </div>
                <ol style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.5 }}>
                  <li>Toca el botón <strong>Compartir</strong> <Share2 size={13} style={{ verticalAlign: 'middle', color: '#007AFF' }} /> en la barra inferior de Safari.</li>
                  <li>Desliza hacia abajo y presiona <strong>"Agregar a pantalla de inicio"</strong>.</li>
                  <li>Confirma con <strong>"Agregar"</strong> en la esquina superior derecha.</li>
                </ol>
              </div>

              {/* Android / Chrome */}
              <div style={{ background: '#FAF8F6', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5E0DB' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#32373C' }}>
                  🤖 En Android (Chrome / Edge / Samsung):
                </div>
                <ol style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.5 }}>
                  <li>Toca el menú de tres puntos (<strong>⋮</strong>) en la esquina superior derecha.</li>
                  <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</li>
                  <li>Confirma la instalación. ¡Listo! Tendrás el ícono de Fundación Puente en tus aplicaciones.</li>
                </ol>
              </div>

              {/* Computador Desktop */}
              <div style={{ background: '#FAF8F6', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5E0DB' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#32373C' }}>
                  💻 En Computador (Chrome / Edge / Brave):
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.5 }}>
                  Haz clic en el ícono de <strong>Instalar</strong> que aparece al final de la barra de direcciones URL (arriba a la derecha).
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowInstallModal(false)}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.88rem' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
