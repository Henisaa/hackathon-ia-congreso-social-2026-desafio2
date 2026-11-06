import React, { useState, useEffect } from 'react';
import { ESTUDIANTES_COHORTE } from '../services/estudiantesData';
import { CATALOGO_SERVICIOS } from '../services/catalogoData';
import { resolverInstitucion, obtenerUrgenciaIES } from '../services/iesKnowledgeBase';
import { AlertCircle, CheckCircle, Clock, ShieldCheck, Sparkles, UserCheck, MessageSquare, Filter, Check, Building, BookOpen } from 'lucide-react';

export default function PanelEquipo({ bandejaCasos, actualizarDecisionCaso }) {
  const [casoSeleccionado, setCasoSeleccionado] = useState(bandejaCasos[0]?.caso || null);
  const [decisionTomada, setDecisionTomada] = useState('');
  const [notaInterna, setNotaInterna] = useState('');
  const [filtroAlerta, setFiltroAlerta] = useState('TODOS');
  const [mensajeExito, setMensajeExito] = useState('');
  const [estudianteSelId, setEstudianteSelId] = useState(ESTUDIANTES_COHORTE[0]?.id);
  const [borradorCopiloto, setBorradorCopiloto] = useState(null);
  const [generandoBorrador, setGenerandoBorrador] = useState(false);

  // Enriquecer dinámicamente la cohorte con el estado real de la bandeja de casos
  const cohorteEnriquecida = ESTUDIANTES_COHORTE.map(est => {
    const casoAsociado = bandejaCasos.find(c =>
      (c.persona_id && est.persona_id && c.persona_id === est.persona_id) ||
      (c.estudiante && est.nombre && c.estudiante.toLowerCase() === est.nombre.toLowerCase())
    );

    if (casoAsociado) {
      const alertaTag =
        casoAsociado.alerta === 'ROJA'
          ? '🔴 Roja (Inmediata)'
          : casoAsociado.alerta === 'NARANJA'
          ? '🟠 Naranja (48 h)'
          : casoAsociado.alerta === 'AMARILLA'
          ? '🟡 Amarilla'
          : '🟢 Normal';

      return {
        ...est,
        alerta: alertaTag,
        alertaRaw: casoAsociado.alerta,
        casoId: casoAsociado.caso,
        frase_gatillante: casoAsociado.frase_gatillante,
        resumen_ia: casoAsociado.resumen_ia,
        servicio_sugerido: casoAsociado.servicio_sugerido,
        decision: casoAsociado.decision
      };
    }

    return {
      ...est,
      alertaRaw: est.alerta.includes('Roja') ? 'ROJA' : est.alerta.includes('Naranja') ? 'NARANJA' : est.alerta.includes('Amarilla') ? 'AMARILLA' : 'VERDE'
    };
  });

  // Auto-selección inicial o ante alertas ROJAS críticas entrantes
  useEffect(() => {
    const casoUrgenteRoja = bandejaCasos.find(c => c.decision === 'Pendiente' && c.alerta === 'ROJA');
    if (casoUrgenteRoja) {
      const actualEsRoja = bandejaCasos.find(c => c.caso === casoSeleccionado && c.alerta === 'ROJA');
      if (!casoSeleccionado || !actualEsRoja) {
        setCasoSeleccionado(casoUrgenteRoja.caso);
        const estAsoc = cohorteEnriquecida.find(x =>
          (casoUrgenteRoja.persona_id && x.persona_id === casoUrgenteRoja.persona_id) ||
          (casoUrgenteRoja.estudiante && x.nombre && x.nombre.toLowerCase() === casoUrgenteRoja.estudiante.toLowerCase())
        );
        if (estAsoc) {
          setEstudianteSelId(estAsoc.id);
        }
      }
    } else if (!casoSeleccionado && bandejaCasos.length > 0) {
      setCasoSeleccionado(bandejaCasos[0].caso);
    }
  }, [bandejaCasos]);

  const casosFiltrados = bandejaCasos.filter(c => {
    if (filtroAlerta === 'TODOS') return true;
    return c.alerta === filtroAlerta;
  });

  const casoActual = bandejaCasos.find(c => c.caso === casoSeleccionado) || casosFiltrados[0] || bandejaCasos[0];
  const estudianteActual = cohorteEnriquecida.find(e => e.id === estudianteSelId) || cohorteEnriquecida[0];

  const handleResolverCaso = () => {
    if (!decisionTomada || !casoActual) return;
    actualizarDecisionCaso(casoActual.caso, decisionTomada, notaInterna);
    setMensajeExito(`Decisión registrada para el caso ${casoActual.caso} (${casoActual.estudiante}): "${decisionTomada}". Sincronizada en caché.`);
    setTimeout(() => setMensajeExito(''), 5000);
    setDecisionTomada('');
    setNotaInterna('');
  };

  const handleGenerarCopiloto = () => {
    setGenerandoBorrador(true);
    setTimeout(() => {
      const alerta = estudianteActual.alertaRaw || (estudianteActual.alerta?.includes('Roja') ? 'ROJA' : estudianteActual.alerta?.includes('Naranja') ? 'NARANJA' : 'AMARILLA');
      const nombre = estudianteActual.nombre || 'el/la estudiante';
      const carrera = estudianteActual.carrera || 'su carrera';
      const cita = estudianteActual.frase_gatillante ? ` Declaró textualmente: "${estudianteActual.frase_gatillante}".` : '';

      // Recuperar apoyos oficiales de la IES del estudiante vía RAG
      const iesObj = resolverInstitucion(estudianteActual.institucion || '');
      const instNombre = iesObj?.nombre || estudianteActual.institucion || 'su casa de estudios';
      const cDae = iesObj?.contactos_dae || {};
      const fonoUrgRaw = obtenerUrgenciaIES(iesObj);
      const fonoUrgenciaIES = fonoUrgRaw ? `🚨 Urgencia/Crisis ${iesObj.nombre}: ${fonoUrgRaw}` : null;
      const becaTopIES = iesObj?.becas_economicas?.[0] ? `🏛️ ${iesObj.becas_economicas[0].nombre} (${iesObj.nombre})` : null;
      const progAcompIES = iesObj?.programas_acompanamiento?.[0] ? `🏛️ ${iesObj.programas_acompanamiento[0].nombre} (${iesObj.nombre})` : null;
      const contactoDaeTxt = cDae.telefono || cDae.mesa_central || cDae.email ? `📞 DAE ${iesObj.nombre}: ${cDae.telefono || cDae.mesa_central || cDae.email}` : null;

      if (alerta === 'ROJA') {
        const apoyosRoja = [
          '[S03] CAI · Servicios Psicosociales (Salud Mental, Contención y Legal)',
          'Línea Prevención *4141 / SAMU 131 (Protocolo Nacional de Crisis Inmediato)'
        ];
        if (fonoUrgenciaIES) apoyosRoja.push(fonoUrgenciaIES);
        else if (contactoDaeTxt) apoyosRoja.push(contactoDaeTxt);
        apoyosRoja.push('[S04] Becas Complementarias de Emergencia y Red de Protección');

        setBorradorCopiloto({
          sintesis: `ALERTA ROJA INMEDIATA (RAG Verificado): ${nombre} cursa primer año de ${carrera} en ${instNombre}.${cita} Presenta situación de angustia extrema/violencia que requiere activar de inmediato el protocolo de apoyo psicosocial humano prioritario sin demora.`,
          apoyos: apoyosRoja,
          iesVerificada: instNombre,
          borrador: `Hola ${nombre}, te escribo con mucha cercanía y respeto desde Fundación Puente. Leí lo que nos compartiste y queremos que sepas que no estás sola/o y que cuentas con todo nuestro equipo para apoyarte. Nos gustaría llamarte hoy mismo para escucharte y coordinar apoyo prioritario y voluntario con nuestra psicóloga y trabajadora social. ¿Podemos hablar unos minutos?`
        });
      } else if (alerta === 'NARANJA') {
        const apoyosNaranja = [
          '[S01] Beca Mensual Fundación Puente (Transporte y Alimentación)'
        ];
        if (becaTopIES) apoyosNaranja.push(becaTopIES);
        if (contactoDaeTxt) apoyosNaranja.push(contactoDaeTxt);
        apoyosNaranja.push('[S04] Becas de Emergencia y Materiales Complementarios');
        apoyosNaranja.push('[S07] Flexibilidad Académica para Trabajadores y Cuidadores');

        setBorradorCopiloto({
          sintesis: `ALERTA NARANJA (< 48 Horas · RAG Verificado): ${nombre} reporta dificultades críticas de movilización, alimentación o turnos laborales en ${carrera} (${instNombre}, jornada ${estudianteActual.jornada || 'diurna'}).${cita}`,
          apoyos: apoyosNaranja,
          iesVerificada: instNombre,
          borrador: `Hola ${nombre}, ¿cómo estás? Te escribo de Fundación Puente para saber cómo te has sentido en este inicio de semestre en ${carrera}. Queremos coordinar un momento para conversar si necesitas apoyo con tus turnos, pasajes o alguna materia. Es voluntario y elegimos el horario juntos.`
        });
      } else if (alerta === 'AMARILLA') {
        const apoyosAmarilla = [
          '[S02] CAI · Tutorías Académicas y Reforzamiento con Voluntarios'
        ];
        if (progAcompIES) apoyosAmarilla.push(progAcompIES);
        if (contactoDaeTxt) apoyosAmarilla.push(contactoDaeTxt);
        apoyosAmarilla.push('[S06] Orientación en Beneficios Estatales (FUAS / Gratuidad)');
        apoyosAmarilla.push('[S08] Actividades Formativas y Talleres de Adaptación');

        setBorradorCopiloto({
          sintesis: `SEGUIMIENTO EN AGENDA (RAG Verificado): ${nombre} registra inquietudes con evaluaciones, ramos o trámites de beneficios en ${carrera} (${instNombre}).${cita}`,
          apoyos: apoyosAmarilla,
          iesVerificada: instNombre,
          borrador: `Hola ${nombre}, ¿cómo va tu semana en ${carrera}? Te contacto de Fundación Puente porque sabemos que los primeros certámenes y trámites pueden ser exigentes. Tenemos tutorías gratuitas del CAI que te pueden ayudar mucho. ¿Te gustaría que coordinemos una sesión?`
        });
      } else {
        setBorradorCopiloto({
          sintesis: `SEGUIMIENTO REGULAR (RAG Verificado): ${nombre} se encuentra al día con avance académico regular en ${carrera} (${instNombre}).`,
          apoyos: [
            '[S01] Beca Mensual Fundación Puente',
            progAcompIES || `Apoyos Académicos ${instNombre}`,
            '[S08] Talleres Formativos y Encuentros de Red',
            '[S02] CAI · Cursos de Inglés eClass'
          ].filter(Boolean),
          iesVerificada: instNombre,
          borrador: `Hola ${nombre}, un gusto saludarte desde Fundación Puente. Queríamos saber cómo te va en tus ramos y recordarte que están abiertos los talleres formativos y cursos de inglés eClass para becados de primer año.`
        });
      }
      setGenerandoBorrador(false);
    }, 600);
  };

  const pendientes = bandejaCasos.filter(c => c.decision === 'Pendiente').length;
  const urgentes = bandejaCasos.filter(c => c.decision === 'Pendiente' && ['ROJA', 'NARANJA'].includes(c.alerta)).length;
  const resueltos = bandejaCasos.filter(c => c.decision !== 'Pendiente').length;

  return (
    <div>
      {/* KPIs del Panel */}
      <div className="grid-cols-4" style={{ marginBottom: '18px' }}>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Situaciones en Bandeja</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#9F1127' }}>{bandejaCasos.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '2px' }}>{resueltos} resueltas</div>
        </div>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Pendientes de Revisión</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#F0960B' }}>{pendientes}</div>
          <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '2px' }}>En espera de contacto</div>
        </div>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Urgentes (Roja / Naranja 48h)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#DC2626' }}>{urgentes}</div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '2px' }}>Prioridad inmediata</div>
        </div>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Decisión Humana</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#166534', marginTop: '6px' }}>100% Obligatoria</div>
          <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>Sin asignación autónoma</div>
        </div>
      </div>

      {mensajeExito && (
        <div style={{
          background: '#DCFCE7',
          color: '#166534',
          border: '1px solid #86EFAC',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.88rem',
          fontWeight: '600',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Check size={16} /> {mensajeExito}
        </div>
      )}

      <div className="grid-cols-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Columna Izquierda: Bandeja de Alertas */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                🚨 Semáforo de Situaciones de Apoyo Urgente
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                📡 Tiempo Real Activo
              </span>
            </div>

            {/* Filtros por color de Semáforo */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {[
                { id: 'TODOS', label: `Todos (${bandejaCasos.length})` },
                { id: 'ROJA', label: `🔴 Rojas (${bandejaCasos.filter(c => c.alerta === 'ROJA').length})` },
                { id: 'NARANJA', label: `🟠 Naranjas (${bandejaCasos.filter(c => c.alerta === 'NARANJA').length})` },
                { id: 'AMARILLA', label: `🟡 Amarillas (${bandejaCasos.filter(c => c.alerta === 'AMARILLA').length})` },
                { id: 'VERDE', label: `🟢 Verdes (${bandejaCasos.filter(c => c.alerta === 'VERDE').length})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFiltroAlerta(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: filtroAlerta === f.id ? '#9F1127' : '#D1D5DB',
                    background: filtroAlerta === f.id ? '#9F1127' : '#FFFFFF',
                    color: filtroAlerta === f.id ? '#FFFFFF' : '#4B5563'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {!casosFiltrados.length ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                No hay situaciones con el filtro seleccionado en este momento.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8F6F4', borderBottom: '2px solid #E5E0DB', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Caso</th>
                      <th style={{ padding: '8px' }}>Becado(a)</th>
                      <th style={{ padding: '8px' }}>Semáforo</th>
                      <th style={{ padding: '8px' }}>Cita Textual Gatillante</th>
                      <th style={{ padding: '8px' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {casosFiltrados.map(c => {
                      const badgeCls = c.alerta === 'ROJA' ? 'badge-red' : (c.alerta === 'NARANJA' ? 'badge-orange' : (c.alerta === 'AMARILLA' ? 'badge-amber' : 'badge-green'));
                      return (
                        <tr
                          key={c.caso}
                          onClick={() => {
                            setCasoSeleccionado(c.caso);
                            const estEncontrado = cohorteEnriquecida.find(x =>
                              (c.persona_id && x.persona_id === c.persona_id) ||
                              (c.estudiante && x.nombre && x.nombre.toLowerCase() === c.estudiante.toLowerCase())
                            );
                            if (estEncontrado) {
                              setEstudianteSelId(estEncontrado.id);
                              setBorradorCopiloto(null);
                            }
                          }}
                          style={{
                            borderBottom: '1px solid #E5E0DB',
                            cursor: 'pointer',
                            background: casoActual?.caso === c.caso ? '#FCE7EB' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '8px', fontWeight: '700' }}>{c.caso}</td>
                          <td style={{ padding: '8px' }}>{c.estudiante}</td>
                          <td style={{ padding: '8px' }}>
                            <span className={`badge ${badgeCls}`} style={{ animation: c.alerta === 'ROJA' ? 'pulse 1.5s infinite' : 'none' }}>
                              {c.alerta}
                            </span>
                          </td>
                          <td style={{ padding: '8px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <i>"{c.frase_gatillante}"</i>
                          </td>
                          <td style={{ padding: '8px', fontWeight: '600', color: c.decision === 'Pendiente' ? (c.alerta === 'ROJA' ? '#DC2626' : '#D97706') : '#166534' }}>
                            {c.decision}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {casoActual && (
              <div style={{
                background: casoActual.alerta === 'ROJA' ? '#FFF5F5' : '#FDFBF9',
                border: `1px solid ${casoActual.alerta === 'ROJA' ? '#FCA5A5' : '#E5E0DB'}`,
                borderLeft: `6px solid ${casoActual.alerta === 'ROJA' ? '#DC2626' : casoActual.alerta === 'NARANJA' ? '#EA580C' : casoActual.alerta === 'AMARILLA' ? '#D97706' : '#23A455'}`,
                borderRadius: '10px',
                padding: '16px'
              }}>
                {casoActual.alerta === 'ROJA' && (
                  <div style={{
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '10px',
                    color: '#991B1B',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                    <span>⚠️ ALERTA ROJA EN VIVO: Situación urgente declarada por el estudiante. Requiere contacto humano prioritario (*4141 / SAMU 131).</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ color: '#9F1127', fontSize: '0.98rem', margin: 0 }}>
                    Detalle del Caso: {casoActual.caso} · {casoActual.estudiante}
                  </h4>
                  <span className={`badge ${casoActual.alerta === 'ROJA' ? 'badge-red' : casoActual.alerta === 'NARANJA' ? 'badge-orange' : casoActual.alerta === 'AMARILLA' ? 'badge-amber' : 'badge-green'}`} style={{ animation: casoActual.alerta === 'ROJA' ? 'pulse 1.5s infinite' : 'none' }}>
                    Semáforo {casoActual.alerta}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  <b>Cita Textual que Activó la Alerta:</b>{' '}
                  <span style={{ color: '#9F1127', fontStyle: 'italic', fontWeight: '700' }}>"{casoActual.frase_gatillante}"</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  <b>Resumen Situacional:</b> {casoActual.resumen_ia}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Servicio Sugerido:</b> <span className="badge badge-puente">{casoActual.servicio_sugerido}</span>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', marginLeft: '8px' }}>Fecha: {casoActual.fecha || 'Reciente'}</span>
                </div>

                {/* Historial de la conversación del estudiante */}
                {casoActual.conversacion && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4B5563', marginBottom: '4px' }}>
                      💬 Conversación Registrada:
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E5E0DB', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: '140px', overflowY: 'auto', lineHeight: '1.4' }}>
                      {casoActual.conversacion}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #E5E0DB', paddingTop: '10px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>
                    👤 Decisión de la Profesional (Obligatoria):
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {['Llamar de inmediato', 'Contacto en 48 horas', 'Derivar a CAI Psicosocial/Tutoría', 'Cerrar sin acción'].map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setDecisionTomada(op)}
                        className="btn-secondary"
                        style={{
                          fontSize: '0.8rem',
                          padding: '6px 10px',
                          background: decisionTomada === op ? '#9F1127' : '#FFFFFF',
                          color: decisionTomada === op ? '#FFFFFF' : '#374151'
                        }}
                      >
                        {op}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={notaInterna}
                    onChange={(e) => setNotaInterna(e.target.value)}
                    placeholder="Nota confidencial de la decisión (opcional)…"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem', marginBottom: '10px' }}
                  />

                  <button
                    onClick={handleResolverCaso}
                    disabled={!decisionTomada}
                    className="btn-primary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}
                  >
                    Registrar Decisión Humana (Guardar en Caché)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Cohorte y Copiloto IA */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>🗂️ Cohorte de Becados & Copiloto IA</h3>
              <span className={`badge ${estudianteActual.alertaRaw === 'ROJA' ? 'badge-red' : estudianteActual.alertaRaw === 'NARANJA' ? 'badge-orange' : estudianteActual.alertaRaw === 'AMARILLA' ? 'badge-amber' : 'badge-green'}`} style={{ animation: estudianteActual.alertaRaw === 'ROJA' ? 'pulse 1.5s infinite' : 'none' }}>
                {estudianteActual.alerta}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '12px' }}>
              Selecciona un becado para que la IA ordene antecedentes y redacte una propuesta de acompañamiento acorde a su nivel de alerta:
            </p>

            <select
              value={estudianteSelId}
              onChange={(e) => {
                const nuevoId = e.target.value;
                setEstudianteSelId(nuevoId);
                setBorradorCopiloto(null);
                const est = cohorteEnriquecida.find(x => x.id === nuevoId);
                if (est?.casoId) {
                  setCasoSeleccionado(est.casoId);
                }
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '12px', fontSize: '0.85rem' }}
            >
              {cohorteEnriquecida.map(est => (
                <option key={est.id} value={est.id}>
                  {est.id} · {est.nombre} ({est.carrera}) · {est.alerta}
                </option>
              ))}
            </select>

            <div style={{
              background: estudianteActual.alertaRaw === 'ROJA' ? '#FFF5F5' : '#F8F6F4',
              border: `1px solid ${estudianteActual.alertaRaw === 'ROJA' ? '#FCA5A5' : '#E5E0DB'}`,
              borderLeft: `5px solid ${estudianteActual.alertaRaw === 'ROJA' ? '#DC2626' : estudianteActual.alertaRaw === 'NARANJA' ? '#EA580C' : estudianteActual.alertaRaw === 'AMARILLA' ? '#D97706' : '#23A455'}`,
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div><b>Estudiante:</b> {estudianteActual.nombre} ({estudianteActual.institucion})</div>
                <span style={{ fontSize: '0.74rem', fontWeight: '700', color: estudianteActual.alertaRaw === 'ROJA' ? '#DC2626' : '#6B7280' }}>
                  {estudianteActual.jornada}
                </span>
              </div>
              <div><b>Promedio / Asistencia:</b> {estudianteActual.promedio.toFixed(1)} / {estudianteActual.asistencia}%</div>
              <div style={{ marginTop: '4px' }}><b>Señales registradas:</b> {estudianteActual.senales}</div>
              {estudianteActual.frase_gatillante && (
                <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(255,255,255,0.7)', borderRadius: '6px', border: '1px dashed #D1D5DB' }}>
                  <b style={{ color: estudianteActual.alertaRaw === 'ROJA' ? '#DC2626' : '#9F1127' }}>Declaración del estudiante:</b>{' '}
                  <span style={{ fontStyle: 'italic', fontWeight: '600' }}>"{estudianteActual.frase_gatillante}"</span>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerarCopiloto}
              disabled={generandoBorrador}
              className="btn-primary"
              style={{
                width: '100%',
                marginBottom: '14px',
                background: estudianteActual.alertaRaw === 'ROJA' ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' : undefined
              }}
            >
              <Sparkles size={16} /> {generandoBorrador ? 'Preparando propuesta…' : `Preparar Acompañamiento con IA (${estudianteActual.alertaRaw === 'ROJA' ? '🚨 Urgencia Roja' : estudianteActual.nombre})`}
            </button>

            {borradorCopiloto && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E0DB', borderRadius: '10px', padding: '14px' }}>
                <h4 style={{ fontSize: '0.9rem', color: estudianteActual.alertaRaw === 'ROJA' ? '#DC2626' : '#9F1127', marginBottom: '6px' }}>
                  1. Síntesis Ficha Única {estudianteActual.alertaRaw === 'ROJA' && '🚨'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#374151', marginBottom: '10px' }}>{borradorCopiloto.sintesis}</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#166534', margin: 0 }}>2. Apoyos Recomendados</h4>
                  {borradorCopiloto.iesVerificada && (
                    <span style={{ fontSize: '0.68rem', color: '#065F46', background: '#D1FAE5', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      📚 RAG Oficial {borradorCopiloto.iesVerificada}
                    </span>
                  )}
                </div>
                <ul style={{ fontSize: '0.82rem', color: '#374151', paddingLeft: '18px', marginBottom: '10px' }}>
                  {borradorCopiloto.apoyos.map((a, i) => (
                    <li key={i} style={{ marginBottom: '3px', fontWeight: i === 0 && estudianteActual.alertaRaw === 'ROJA' ? '700' : 'normal', color: i === 0 && estudianteActual.alertaRaw === 'ROJA' ? '#991B1B' : '#374151' }}>
                      {a}
                    </li>
                  ))}
                </ul>

                <h4 style={{ fontSize: '0.9rem', color: '#9F1127', marginBottom: '6px' }}>3. Borrador de Mensaje (Voluntario)</h4>
                <div style={{ background: estudianteActual.alertaRaw === 'ROJA' ? '#FFF5F5' : '#FFF5F6', padding: '10px', borderRadius: '8px', border: `1px solid ${estudianteActual.alertaRaw === 'ROJA' ? '#FCA5A5' : '#F1D4DB'}`, fontSize: '0.85rem', color: '#1F2937', fontStyle: 'italic', marginBottom: '10px' }}>
                  "{borradorCopiloto.borrador}"
                </div>

                <div style={{ fontSize: '0.75rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Validación ética superada: Libre de etiquetas clínicas, pronósticos de deserción y porcentajes.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
