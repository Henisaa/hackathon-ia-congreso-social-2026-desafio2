import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CanalConfidencial from './components/CanalConfidencial';
import AsistenteBeneficios from './components/AsistenteBeneficios';
import FichaUnica from './components/FichaUnica';
import PanelEquipo from './components/PanelEquipo';
import AuditoriaEstadisticas from './components/AuditoriaEstadisticas';
import { MessageSquare, Award, FileText, LayoutDashboard, BarChart2, ShieldCheck, HeartHandshake } from 'lucide-react';
import {
  obtenerBandejaCasos,
  guardarBandejaCasos,
  ordenarCasosPorSeveridad,
  obtenerPerfilActivo,
  guardarPerfilActivo,
  suscribirCambios,
  resetearCacheDemo
} from './services/storageService';

const PERFIL_DEFECTO = {
  id_persona: 'P1',
  nombre: 'Camila',
  institucion: 'Duoc UC San Joaquín',
  carrera: 'Técnico en Enfermería',
  jornada: 'Vespertina',
  trabaja: true,
  horas_trabajo_semana: 28,
  cuida_dependientes: true,
  gratuidad: false,
  nota_promedio: 4.6,
  de_region: false,
  beneficios_activos: ['S01']
};

export default function App() {
  const [vistaActual, setVistaActual] = useState('becado'); // 'becado' | 'equipo'
  const [tabBecado, setTabBecado] = useState('chat'); // 'chat' | 'beneficios' | 'ficha'
  const [tabEquipo, setTabEquipo] = useState('panel'); // 'panel' | 'auditoria'
  const [modoSimulacion, setModoSimulacion] = useState('auto'); // 'auto' | 'mobile' | 'tablet'

  // Perfil del becado en sesión con persistencia
  const [becadoPerfil, setBecadoPerfil] = useState(() => obtenerPerfilActivo(PERFIL_DEFECTO));

  // Bandeja de casos compartida con persistencia
  const [bandejaCasos, setBandejaCasos] = useState(() => obtenerBandejaCasos());

  // Leer atajos PWA y parámetros URL al cargar
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      const vista = params.get('vista');
      if (vista === 'equipo' || vista === 'becado') {
        setVistaActual(vista);
      }
      if (tab === 'canal' || tab === 'chat') {
        setVistaActual('becado');
        setTabBecado('chat');
      } else if (tab === 'beneficios') {
        setVistaActual('becado');
        setTabBecado('beneficios');
      } else if (tab === 'ficha') {
        setVistaActual('becado');
        setTabBecado('ficha');
      }
    } catch (e) {
      // Ignorar errores en entornos sin window
    }
  }, []);

  // Sincronización reactiva en tiempo real (BroadcastChannel y storage events)
  useEffect(() => {
    const desuscribir = suscribirCambios((data) => {
      if (data?.tipo === 'BANDEJA_UPDATED' || data?.tipo === 'STORAGE_UPDATED' || data?.tipo === 'CACHE_RESET') {
        setBandejaCasos(obtenerBandejaCasos());
      }
    });
    return desuscribir;
  }, []);

  // Guardar perfil al cambiar
  useEffect(() => {
    guardarPerfilActivo(becadoPerfil);
  }, [becadoPerfil]);

  const agregarCasoBandeja = (nuevoCaso) => {
    const fechaActual = new Date().toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
    setBandejaCasos(prev => {
      // Si ya existe un caso pendiente para este estudiante o persona_id, actualizamos en vivo su conversación y severidad
      const indiceExistente = prev.findIndex(c =>
        c.decision === 'Pendiente' &&
        ((nuevoCaso.persona_id && c.persona_id === nuevoCaso.persona_id) || c.estudiante === nuevoCaso.estudiante)
      );

      let actualizados;
      if (indiceExistente >= 0) {
        const actual = prev[indiceExistente];
        const peso = { ROJA: 3, NARANJA: 2, AMARILLA: 1, VERDE: 0 };
        const esMasGraveOIgual = (peso[nuevoCaso.alerta] || 0) >= (peso[actual.alerta] || 0);
        const mejorAlerta = esMasGraveOIgual ? nuevoCaso.alerta : actual.alerta;

        const casoActualizado = {
          ...actual,
          alerta: mejorAlerta,
          frase_gatillante: esMasGraveOIgual && nuevoCaso.frase_gatillante ? nuevoCaso.frase_gatillante : (actual.frase_gatillante || nuevoCaso.frase_gatillante),
          servicio_sugerido: esMasGraveOIgual && nuevoCaso.servicio_sugerido ? nuevoCaso.servicio_sugerido : (actual.servicio_sugerido || nuevoCaso.servicio_sugerido),
          resumen_ia: esMasGraveOIgual && nuevoCaso.resumen_ia ? nuevoCaso.resumen_ia : (actual.resumen_ia || nuevoCaso.resumen_ia),
          conversacion: nuevoCaso.conversacion || actual.conversacion,
          fecha: fechaActual
        };

        actualizados = [...prev];
        actualizados[indiceExistente] = casoActualizado;
      } else {
        const idCaso = `PTE-${String(prev.length + 1).padStart(3, '0')}`;
        actualizados = [{ ...nuevoCaso, caso: idCaso, fecha: fechaActual, decision: 'Pendiente' }, ...prev];
      }

      const listaOrdenada = ordenarCasosPorSeveridad(actualizados);
      guardarBandejaCasos(listaOrdenada);
      return listaOrdenada;
    });
  };

  const actualizarDecisionCaso = (idCaso, decision, nota) => {
    setBandejaCasos(prev => {
      const actualizados = prev.map(c => (c.caso === idCaso ? { ...c, decision, nota } : c));
      guardarBandejaCasos(actualizados);
      return actualizados;
    });
  };

  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restaurar la base de demostración y vaciar las alertas registradas en caché?')) {
      resetearCacheDemo();
      setBandejaCasos(obtenerBandejaCasos());
      setBecadoPerfil(PERFIL_DEFECTO);
      window.location.reload();
    }
  };

  const containerClass = `app-container ${
    modoSimulacion === 'mobile' ? 'sim-mobile' : (modoSimulacion === 'tablet' ? 'sim-tablet' : '')
  }`;

  const urgentesCount = bandejaCasos.filter(c => c.decision === 'Pendiente' && ['ROJA', 'NARANJA'].includes(c.alerta)).length;
  const pendientesCount = bandejaCasos.filter(c => c.decision === 'Pendiente').length;

  return (
    <div className={containerClass}>
      {/* Header Institucional y Barra de Control */}
      <Header
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        modoSimulacion={modoSimulacion}
        setModoSimulacion={setModoSimulacion}
        urgentesCount={urgentesCount}
        pendientesCount={pendientesCount}
        onResetDemo={handleResetDemo}
      />

      {/* Hero Institucional */}
      <div className="hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1>
              {vistaActual === 'becado' ? 'Puente Contigo · Acompañamiento Becados' : 'Panel del Equipo · Fundación Puente'}
            </h1>
            <p>
              {vistaActual === 'becado'
                ? 'Apoyo continuo, orientación universitaria y beneficios para becados de primer año en Santiago.'
                : 'Gestión ética de alertas en tiempo real, acompañamiento psicosocial, Ficha Única y auditoría antisesgos.'}
            </p>
          </div>
          <div>
            <span className="chip">👥 Desafío 2 · Educación</span>
            <span className="chip">🛡️ Dignidad y 0% Sesgo</span>
            <span className="chip">🚦 Semáforo Real-time</span>
            <span className="chip">📲 PWA Multi-dispositivo</span>
          </div>
        </div>
      </div>

      {/* Aviso Ético Obligatorio de Hackathon */}
      <div style={{
        background: '#FFF9E6',
        border: '1px solid #FFE082',
        borderRadius: '12px',
        padding: '12px 18px',
        fontSize: '0.86rem',
        color: '#7A5200',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ShieldCheck size={20} color="#D97706" style={{ flexShrink: 0 }} />
        <span>
          ⚠️ <b>Esta herramienta utiliza inteligencia artificial al servicio de la dignidad humana.</b> No reemplaza el criterio ni el vínculo humano: la decisión final siempre es tomada por una persona del equipo de Fundación Puente. Prototipo con datos ficticios para el Congreso Social UC 2026.
        </span>
      </div>

      {/* Navegación por Pestañas según Perspectiva */}
      {vistaActual === 'becado' ? (
        <>
          <div className="tab-nav">
            <button
              onClick={() => setTabBecado('chat')}
              className={`tab-btn ${tabBecado === 'chat' ? 'active' : ''}`}
            >
              <MessageSquare size={17} /> 💬 1 · Canal Confidencial IA & Semáforo
            </button>
            <button
              onClick={() => setTabBecado('beneficios')}
              className={`tab-btn ${tabBecado === 'beneficios' ? 'active' : ''}`}
            >
              <Award size={17} /> 🎓 2 · Asistente de Beneficios
            </button>
            <button
              onClick={() => setTabBecado('ficha')}
              className={`tab-btn ${tabBecado === 'ficha' ? 'active' : ''}`}
            >
              <FileText size={17} /> 🗂️ 3 · Mi Ficha Única
            </button>
          </div>

          {tabBecado === 'chat' && (
            <CanalConfidencial
              becadoPerfil={becadoPerfil}
              setBecadoPerfil={setBecadoPerfil}
              agregarCasoBandeja={agregarCasoBandeja}
              setVistaActual={setVistaActual}
            />
          )}

          {tabBecado === 'beneficios' && (
            <AsistenteBeneficios
              becadoPerfil={becadoPerfil}
              setBecadoPerfil={setBecadoPerfil}
              agregarCasoBandeja={agregarCasoBandeja}
            />
          )}

          {tabBecado === 'ficha' && (
            <FichaUnica
              becadoPerfil={becadoPerfil}
              agregarCasoBandeja={agregarCasoBandeja}
            />
          )}
        </>
      ) : (
        <>
          <div className="tab-nav">
            <button
              onClick={() => setTabEquipo('panel')}
              className={`tab-btn ${tabEquipo === 'panel' ? 'active' : ''}`}
            >
              <LayoutDashboard size={17} /> 🚨 1 · Situaciones de Apoyo & Copiloto
              {urgentesCount > 0 && (
                <span className="badge badge-red" style={{ marginLeft: '6px', fontSize: '0.72rem' }}>
                  {urgentesCount} urgentes
                </span>
              )}
            </button>
            <button
              onClick={() => setTabEquipo('auditoria')}
              className={`tab-btn ${tabEquipo === 'auditoria' ? 'active' : ''}`}
            >
              <BarChart2 size={17} /> ⚖️ 2 · Auditoría Antisesgo & Estadísticas
            </button>
          </div>

          {tabEquipo === 'panel' && (
            <PanelEquipo
              bandejaCasos={bandejaCasos}
              actualizarDecisionCaso={actualizarDecisionCaso}
            />
          )}

          {tabEquipo === 'auditoria' && (
            <AuditoriaEstadisticas />
          )}
        </>
      )}

      {/* Footer Institucional */}
      <footer style={{ marginTop: '36px', textAlign: 'center', borderTop: '1px solid #E5E0DB', paddingTop: '20px' }}>
        <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0 }}>
          Prototipo "Puente Contigo" · Fundación Puente & Hackathon IA Aplicada Congreso Social UC 2026.
        </p>
        <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '4px' }}>
          La inteligencia artificial asiste, pero nunca sustituye el criterio ni el vínculo humano. Datos sincronizados en tiempo real y persistidos en caché local.
        </p>
      </footer>
    </div>
  );
}
