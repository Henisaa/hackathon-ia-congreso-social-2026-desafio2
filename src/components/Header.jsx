import React from 'react';
import { Smartphone, Tablet, Monitor, RefreshCw, UserCheck, Shield } from 'lucide-react';

export default function Header({ vistaActual, setVistaActual, modoSimulacion, setModoSimulacion }) {
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

        {/* Logo Duoc UC */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logos/logo_duoc.png" alt="Duoc UC" style={{ height: '30px', width: 'auto' }} />
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
    </header>
  );
}
