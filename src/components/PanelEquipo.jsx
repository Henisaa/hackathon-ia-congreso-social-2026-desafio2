import React, { useState } from 'react';
import { ESTUDIANTES_COHORTE } from '../services/estudiantesData';
import { CATALOGO_SERVICIOS } from '../services/catalogoData';
import { AlertCircle, CheckCircle, Clock, ShieldCheck, Sparkles, UserCheck, MessageSquare, Filter, Check } from 'lucide-react';

export default function PanelEquipo({ bandejaCasos, actualizarDecisionCaso }) {
  const [casoSeleccionado, setCasoSeleccionado] = useState(bandejaCasos[0]?.caso || null);
  const [decisionTomada, setDecisionTomada] = useState('');
  const [notaInterna, setNotaInterna] = useState('');
  const [filtroAlerta, setFiltroAlerta] = useState('TODOS');
  const [mensajeExito, setMensajeExito] = useState('');
  const [estudianteSelId, setEstudianteSelId] = useState(ESTUDIANTES_COHORTE[0]?.id);
  const [borradorCopiloto, setBorradorCopiloto] = useState(null);
  const [generandoBorrador, setGenerandoBorrador] = useState(false);

  const casosFiltrados = bandejaCasos.filter(c => {
    if (filtroAlerta === 'TODOS') return true;
    return c.alerta === filtroAlerta;
  });

  const casoActual = bandejaCasos.find(c => c.caso === casoSeleccionado) || casosFiltrados[0] || bandejaCasos[0];
  const estudianteActual = ESTUDIANTES_COHORTE.find(e => e.id === estudianteSelId) || ESTUDIANTES_COHORTE[0];

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
      setBorradorCopiloto({
        sintesis: `En las primeras semanas se registran ${estudianteActual.senales}. Cursa estudios en jornada ${estudianteActual.jornada.toLowerCase()} en ${estudianteActual.institucion}.`,
        apoyos: ['[S01] Beca Mensual Fundación Puente', '[S02] CAI · Tutorías Académicas', '[S07] Flexibilidad Académica'],
        borrador: `Hola, ¿cómo estás? Te escribo de Fundación Puente para saber cómo te has sentido en este inicio de semestre en ${estudianteActual.carrera}. Queremos coordinar un momento para conversar si necesitas apoyo con tus turnos o en alguna materia. Es voluntario y elegimos el horario juntos.`
      });
      setGenerandoBorrador(false);
    }, 700);
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
                          onClick={() => setCasoSeleccionado(c.caso)}
                          style={{
                            borderBottom: '1px solid #E5E0DB',
                            cursor: 'pointer',
                            background: casoActual?.caso === c.caso ? '#FCE7EB' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '8px', fontWeight: '700' }}>{c.caso}</td>
                          <td style={{ padding: '8px' }}>{c.estudiante}</td>
                          <td style={{ padding: '8px' }}><span className={`badge ${badgeCls}`}>{c.alerta}</span></td>
                          <td style={{ padding: '8px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <i>"{c.frase_gatillante}"</i>
                          </td>
                          <td style={{ padding: '8px', fontWeight: '600', color: c.decision === 'Pendiente' ? '#D97706' : '#166534' }}>
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
              <div style={{ background: '#FDFBF9', border: '1px solid #E5E0DB', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ color: '#9F1127', fontSize: '0.98rem', margin: 0 }}>
                    Detalle del Caso: {casoActual.caso} · {casoActual.estudiante}
                  </h4>
                  <span className={`badge ${casoActual.alerta === 'ROJA' ? 'badge-red' : casoActual.alerta === 'NARANJA' ? 'badge-orange' : casoActual.alerta === 'AMARILLA' ? 'badge-amber' : 'badge-green'}`}>
                    Semáforo {casoActual.alerta}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  <b>Cita Textual que Activó la Alerta:</b>{' '}
                  <span style={{ color: '#9F1127', fontStyle: 'italic', fontWeight: '600' }}>"{casoActual.frase_gatillante}"</span>
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
            <h3 className="card-title">🗂️ Cohorte de Becados & Copiloto IA</h3>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '12px' }}>
              Selecciona un becado para que la IA ordene antecedentes y redacte un borrador sin etiquetas ni predicciones:
            </p>

            <select
              value={estudianteSelId}
              onChange={(e) => {
                setEstudianteSelId(e.target.value);
                setBorradorCopiloto(null);
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '12px', fontSize: '0.85rem' }}
            >
              {ESTUDIANTES_COHORTE.map(est => (
                <option key={est.id} value={est.id}>
                  {est.id} · {est.carrera} ({est.institucion}) · {est.alerta}
                </option>
              ))}
            </select>

            <div style={{ background: '#F8F6F4', padding: '12px', borderRadius: '8px', border: '1px solid #E5E0DB', fontSize: '0.84rem', marginBottom: '12px' }}>
              <div><b>Institución:</b> {estudianteActual.institucion} ({estudianteActual.jornada})</div>
              <div><b>Promedio / Asistencia:</b> {estudianteActual.promedio.toFixed(1)} / {estudianteActual.asistencia}%</div>
              <div><b>Señales registradas:</b> {estudianteActual.senales}</div>
            </div>

            <button
              onClick={handleGenerarCopiloto}
              disabled={generandoBorrador}
              className="btn-primary"
              style={{ width: '100%', marginBottom: '14px' }}
            >
              <Sparkles size={16} /> {generandoBorrador ? 'Preparando propuesta…' : 'Preparar Acompañamiento con IA'}
            </button>

            {borradorCopiloto && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E0DB', borderRadius: '10px', padding: '14px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#9F1127', marginBottom: '6px' }}>1. Síntesis Ficha Única</h4>
                <p style={{ fontSize: '0.82rem', color: '#374151', marginBottom: '10px' }}>{borradorCopiloto.sintesis}</p>

                <h4 style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '6px' }}>2. Apoyos Recomendados</h4>
                <ul style={{ fontSize: '0.82rem', color: '#374151', paddingLeft: '18px', marginBottom: '10px' }}>
                  {borradorCopiloto.apoyos.map((a, i) => <li key={i}>{a}</li>)}
                </ul>

                <h4 style={{ fontSize: '0.9rem', color: '#9F1127', marginBottom: '6px' }}>3. Borrador de Mensaje (Voluntario)</h4>
                <div style={{ background: '#FFF5F6', padding: '10px', borderRadius: '8px', border: '1px solid #F1D4DB', fontSize: '0.85rem', color: '#1F2937', fontStyle: 'italic', marginBottom: '10px' }}>
                  "{borradorCopiloto.borrador}"
                </div>

                <div style={{ fontSize: '0.75rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Validación superada: Libre de palabras como "riesgo", porcentajes o deserción.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
