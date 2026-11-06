import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CanalConfidencial from './components/CanalConfidencial';
import AsistenteBeneficios from './components/AsistenteBeneficios';
import FichaUnica from './components/FichaUnica';
import PanelEquipo from './components/PanelEquipo';
import AuditoriaEstadisticas from './components/AuditoriaEstadisticas';
import { MessageSquare, Award, FileText, LayoutDashboard, BarChart2, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  const [vistaActual, setVistaActual] = useState('becado'); // 'becado' | 'equipo'
  const [tabBecado, setTabBecado] = useState('chat'); // 'chat' | 'beneficios' | 'ficha'
  const [tabEquipo, setTabEquipo] = useState('panel'); // 'panel' | 'auditoria'
  const [modoSimulacion, setModoSimulacion] = useState('auto'); // 'auto' | 'mobile' | 'tablet'

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

  // Perfil del becado en sesión
  const [becadoPerfil, setBecadoPerfil] = useState({
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
  });

  // Bandeja de casos compartida
  const [bandejaCasos, setBandejaCasos] = useState([
    {
      caso: 'PTE-001',
      persona_id: 'P1',
      estudiante: 'Camila',
      origen: 'Canal Confidencial',
      alerta: 'NARANJA',
      frase_gatillante: 'no tengo para la micro ni para almorzar',
      servicio_sugerido: 'S04',
      resumen_ia: 'Riesgo económico inminente para costear transporte y alimentación.',
      fecha: '06/11/2026 10:15',
      conversacion: 'Camila: Me cambiaron el turno y no tengo para la micro esta semana...\nPuente Contigo: Gracias por compartirlo Camila, avisaré al equipo de inmediato.',
      decision: 'Pendiente'
    },
    {
      caso: 'PTE-002',
      persona_id: 'P2',
      estudiante: 'Diego',
      origen: 'Asistente de Beneficios',
      alerta: 'AMARILLA',
      frase_gatillante: 'Solicitud de postulación asistida a CAI · Tutorías Académicas',
      servicio_sugerido: 'S02',
      resumen_ia: 'Solicitud de reforzamiento en programación.',
      fecha: '06/11/2026 11:20',
      conversacion: 'Diego solicitó tutoría del CAI tras reprobar primera evaluación.',
      decision: 'Pendiente'
    }
  ]);

  const agregarCasoBandeja = (nuevoCaso) => {
    const idCaso = `PTE-${String(bandejaCasos.length + 1).padStart(3, '0')}`;
    const fechaActual = new Date().toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
    setBandejaCasos(prev => [{ ...nuevoCaso, caso: idCaso, fecha: fechaActual, decision: 'Pendiente' }, ...prev]);
  };

  const actualizarDecisionCaso = (idCaso, decision, nota) => {
    setBandejaCasos(prev =>
      prev.map(c => c.caso === idCaso ? { ...c, decision, nota } : c)
    );
  };

  const containerClass = `app-container ${
    modoSimulacion === 'mobile' ? 'sim-mobile' : (modoSimulacion === 'tablet' ? 'sim-tablet' : '')
  }`;

  return (
    <div className={containerClass}>
      {/* Header Institucional y Barra de Control */}
      <Header
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        modoSimulacion={modoSimulacion}
        setModoSimulacion={setModoSimulacion}
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
                : 'Gestión ética de alertas, acompañamiento psicosocial, Ficha Única y auditoría antisesgos.'}
            </p>
          </div>
          <div>
            <span className="chip">👥 Desafío 2 · Educación</span>
            <span className="chip">🛡️ Dignidad y 0% Sesgo</span>
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
              <MessageSquare size={17} /> 💬 1 · Canal Confidencial IA
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
          La inteligencia artificial asiste, pero nunca sustituye el criterio ni el vínculo humano.
        </p>
      </footer>
    </div>
  );
}
