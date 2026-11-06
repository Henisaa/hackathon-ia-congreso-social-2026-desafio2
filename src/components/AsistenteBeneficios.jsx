import React, { useState } from 'react';
import { clasificarBeneficios } from '../services/catalogoData';
import { IES_KNOWLEDGE_BASE, resolverInstitucion, obtenerUrgenciaIES } from '../services/iesKnowledgeBase';
import { CheckCircle, Clock, AlertCircle, Sparkles, Send, Building, Phone, Mail, Globe, ShieldCheck, HeartPulse, GraduationCap, ChevronRight } from 'lucide-react';

export default function AsistenteBeneficios({ becadoPerfil, setBecadoPerfil, agregarCasoBandeja }) {
  const [mensajeExito, setMensajeExito] = useState('');
  const [formAbierto, setFormAbierto] = useState(false);
  const [pestañaIES, setPestañaIES] = useState('becas');

  const beneficiosClasificados = clasificarBeneficios(becadoPerfil);
  const iesActual = resolverInstitucion(becadoPerfil.institucion) || IES_KNOWLEDGE_BASE[0];

  const handlePostular = (beneficio) => {
    agregarCasoBandeja({
      persona_id: 'BECADO-ACTIVO',
      estudiante: becadoPerfil.nombre,
      origen: 'Asistente de Beneficios',
      alerta: 'AMARILLA',
      frase_gatillante: `Solicitud de postulación asistida a ${beneficio.nombre}`,
      servicio_sugerido: beneficio.id,
      resumen_ia: `El becado solicitó apoyo para postular a ${beneficio.nombre}. Cumple con el perfil de primer año.`,
      conversacion: `Solicitud generada desde el Asistente de Beneficios para: ${beneficio.nombre} (${beneficio.tipo_origen}).`
    });

    setMensajeExito(`¡Solicitud enviada para ${beneficio.nombre}! Tu asistente social en Fundación Puente se comunicará para orientarte.`);
    setTimeout(() => setMensajeExito(''), 6000);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>🎓 Asistente Personalizado de Beneficios Universitarios</h2>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: '4px 0 0 0' }}>
              Cruce verificado entre <b>Fundación Puente</b>, <b>Mineduc/Junaeb</b> y tu <b>Institución de Educación Superior</b>.
            </p>
          </div>
          <button onClick={() => setFormAbierto(!formAbierto)} className="btn-secondary">
            {formAbierto ? 'Ocultar mi situación' : '✏️ Actualizar mi situación'}
          </button>
        </div>

        {formAbierto && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#F8F6F4', borderRadius: '10px', border: '1px solid #E5E0DB' }}>
            <h4 style={{ fontSize: '0.92rem', marginBottom: '10px', color: '#9F1127' }}>Mi situación universitaria:</h4>
            <div className="grid-cols-3" style={{ marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Institución (19 IES RM Verificadas):</label>
                <select
                  value={becadoPerfil.institucion}
                  onChange={(e) => setBecadoPerfil({ ...becadoPerfil, institucion: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', marginTop: '4px' }}
                >
                  <optgroup label="Universidades">
                    {IES_KNOWLEDGE_BASE.filter(i => i.categoria === 'Universidad').map(i => (
                      <option key={i.id} value={i.nombre}>{i.nombre}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Institutos Profesionales (IP)">
                    {IES_KNOWLEDGE_BASE.filter(i => i.categoria === 'Instituto Profesional' || i.id === 'duoc').map(i => (
                      <option key={i.id} value={i.nombre}>{i.nombre}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Centros de Formación Técnica (CFT)">
                    {IES_KNOWLEDGE_BASE.filter(i => i.categoria === 'Centro de Formación Técnica' || i.id === 'cft_santo_tomas').map(i => (
                      <option key={i.id} value={i.nombre}>{i.nombre}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Promedio parcial actual:</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="7.0"
                  value={becadoPerfil.nota_promedio}
                  onChange={(e) => setBecadoPerfil({ ...becadoPerfil, nota_promedio: parseFloat(e.target.value) || 4.0 })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <label style={{ fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={becadoPerfil.trabaja}
                    onChange={(e) => setBecadoPerfil({ ...becadoPerfil, trabaja: e.target.checked })}
                  />
                  Trabajo actualmente (turnos/jornada)
                </label>
                <label style={{ fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={becadoPerfil.cuida_dependientes}
                    onChange={(e) => setBecadoPerfil({ ...becadoPerfil, cuida_dependientes: e.target.checked })}
                  />
                  Tengo personas a mi cuidado
                </label>
                <label style={{ fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={becadoPerfil.de_region}
                    onChange={(e) => setBecadoPerfil({ ...becadoPerfil, de_region: e.target.checked })}
                  />
                  Provengo de región (traslado a Santiago)
                </label>
              </div>
            </div>
          </div>
        )}

        {mensajeExito && (
          <div style={{ marginTop: '14px', background: '#DCFCE7', color: '#166534', padding: '12px', borderRadius: '8px', border: '1px solid #86EFAC', fontWeight: '600', fontSize: '0.9rem' }}>
            ✓ {mensajeExito}
          </div>
        )}
      </div>

      {/* 3 Columnas del Documento */}
      <div className="grid-cols-3">
        {/* 1. Podrías Postular */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🟢</span>
            <h3 style={{ fontSize: '1.05rem', color: '#166534', margin: 0 }}>
              Podrías Postular ({beneficiosClasificados.podrias_postular.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '12px' }}>
            Apoyos compatibles según la situación que decidiste compartir:
          </p>

          {beneficiosClasificados.podrias_postular.map(b => (
            <div key={b.id} className="cat-box cat-podrias">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '700', color: '#166534', fontSize: '0.95rem' }}>{b.nombre}</span>
                <span className="badge badge-green">{b.tipo_origen}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#047857', margin: '4px 0' }}>
                <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                <b>Plazo:</b> {b.plazo_recordatorio}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#1F2937', margin: '6px 0 10px 0' }}>{b.motivo}</p>
              
              <div style={{ fontSize: '0.8rem', color: '#4B5563', marginBottom: '10px', background: 'rgba(255,255,255,0.6)', padding: '6px 8px', borderRadius: '6px' }}>
                <b>Cómo acceder:</b> {b.como_acceder}
              </div>

              <button
                onClick={() => handlePostular(b)}
                className="btn-primary"
                style={{ width: '100%', fontSize: '0.84rem', padding: '8px' }}
              >
                🙋 Ayúdame a postular
              </button>
            </div>
          ))}
        </div>

        {/* 2. Ya lo Tienes */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔵</span>
            <h3 style={{ fontSize: '1.05rem', color: '#0284C7', margin: 0 }}>
              Ya lo Tienes ({beneficiosClasificados.ya_lo_tienes.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '12px' }}>
            Beneficios activos actualmente en tu registro:
          </p>

          {beneficiosClasificados.ya_lo_tienes.map(b => (
            <div key={b.id} className="cat-box cat-tienes">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '700', color: '#0369A1', fontSize: '0.95rem' }}>{b.nombre}</span>
                <span className="badge badge-blue">{b.tipo_origen}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#0284C7', margin: '4px 0' }}>
                <CheckCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                <b>Estado:</b> Activo · Vigente
              </div>
              <p style={{ fontSize: '0.85rem', color: '#1F2937', margin: '6px 0 8px 0' }}>{b.motivo}</p>
              <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                <b>Mantenimiento:</b> Asistir a actividades formativas y validar matrícula semestral.
              </div>
            </div>
          ))}
        </div>

        {/* 3. Revisa este Requisito */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🟡</span>
            <h3 style={{ fontSize: '1.05rem', color: '#D97706', margin: 0 }}>
              Revisa este Requisito ({beneficiosClasificados.revisa_requisito.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '12px' }}>
            Trámites preventivos y fechas clave a cuidar:
          </p>

          {beneficiosClasificados.revisa_requisito.map(b => (
            <div key={b.id} className="cat-box cat-requisito">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '700', color: '#B45309', fontSize: '0.95rem' }}>{b.nombre}</span>
                <span className="badge badge-amber">{b.tipo_origen}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#D97706', margin: '4px 0' }}>
                <AlertCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                <b>Calendario:</b> {b.plazo_recordatorio}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#1F2937', margin: '6px 0 8px 0' }}>{b.motivo}</p>
              <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                <b>Paso requerido:</b> {b.como_acceder}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Verificada: Beneficios y Apoyos Propios de la IES */}
      <div className="card" style={{ marginTop: '24px', borderTop: '4px solid #9F1127' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} color="#9F1127" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1F2937' }}>
                Apoyos y Beneficios Propios: <b>{iesActual.nombre}</b>
              </h3>
              <span className="badge badge-gray">{iesActual.categoria} · {iesActual.tipo}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#4B5563' }}>
              Base oficial extraída del documento auditado para 19 IES RM. Se descarta cualquier dato no verificado para prevenir información falsa.
            </p>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', color: '#065F46', fontWeight: '600' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>Datos Oficiales Auditados · Cero Alucinación</span>
          </div>
        </div>

        {/* Pestañas de la Institución */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPestañaIES('becas')}
            className={pestañaIES === 'becas' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            💰 Becas Internas ({iesActual.becas_economicas?.length || 0})
          </button>
          <button
            onClick={() => setPestañaIES('acomp')}
            className={pestañaIES === 'acomp' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            🧑‍🏫 Acompañamiento Académico ({iesActual.programas_acompanamiento?.length || 0})
          </button>
          <button
            onClick={() => setPestañaIES('salud')}
            className={pestañaIES === 'salud' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            🏥 Bienestar y Urgencias ({iesActual.bienestar_salud_emergencia?.length || 0})
          </button>
          <button
            onClick={() => setPestañaIES('contacto')}
            className={pestañaIES === 'contacto' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            📞 Canales DAE y Atención
          </button>
        </div>

        {/* Contenido Pestaña Becas */}
        {pestañaIES === 'becas' && (
          <div className="grid-cols-2" style={{ gap: '14px' }}>
            {iesActual.becas_economicas?.map((b, idx) => (
              <div key={idx} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, color: '#9F1127', fontSize: '0.98rem' }}>{b.nombre}</h4>
                  <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Beca Institucional</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#374151', margin: '4px 0 8px 0' }}>{b.descripcion}</p>
                
                <div style={{ fontSize: '0.8rem', color: '#1E40AF', background: '#EFF6FF', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px' }}>
                  <b>Cobertura:</b> {b.cobertura}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4B5563', marginBottom: '4px' }}>
                  <b>Requisitos:</b> {b.requisitos}
                </div>
                <div style={{ fontSize: '0.78rem', color: b.proceso.includes('No disponible') ? '#B45309' : '#047857', marginBottom: '10px' }}>
                  <b>Proceso de postulación:</b> {b.proceso}
                  {b.proceso.includes('No disponible') && ' (Consultar en DAE)'}
                </div>

                <button
                  onClick={() => handlePostular({ id: `IES-${idx}`, nombre: `${b.nombre} (${iesActual.nombre})`, tipo_origen: iesActual.nombre })}
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}
                >
                  🙋 Ayúdame a consultar esta beca con mi profesional
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Contenido Pestaña Acompañamiento */}
        {pestañaIES === 'acomp' && (
          <div className="grid-cols-2" style={{ gap: '14px' }}>
            {iesActual.programas_acompanamiento?.map((p, idx) => (
              <div key={idx} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, color: '#166534', fontSize: '0.98rem' }}>{p.nombre}</h4>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{p.tipo}</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#374151', margin: '4px 0 8px 0' }}>{p.descripcion}</p>
                <div style={{ fontSize: '0.8rem', color: '#065F46', background: '#F0FDF4', padding: '6px 8px', borderRadius: '6px' }}>
                  <b>Canal de acceso oficial:</b> {p.canal}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contenido Pestaña Salud y Urgencias */}
        {pestañaIES === 'salud' && (
          <div className="grid-cols-2" style={{ gap: '14px' }}>
            {iesActual.bienestar_salud_emergencia?.map((s, idx) => (
              <div key={idx} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#B45309', fontSize: '0.98rem' }}>{s.nombre}</h4>
                <p style={{ fontSize: '0.84rem', color: '#374151', margin: '0 0 8px 0' }}>{s.descripcion}</p>
                <div style={{ fontSize: '0.8rem', color: '#92400E', background: '#FEF3C7', padding: '6px 8px', borderRadius: '6px' }}>
                  <b>Procedimiento:</b> {s.procedimiento}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contenido Pestaña Contactos DAE */}
        {pestañaIES === 'contacto' && (
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '18px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '1rem' }}>
              📍 Canales Oficiales DAE · {iesActual.nombre}
            </h4>
            <div className="grid-cols-2" style={{ gap: '14px' }}>
              {(iesActual.contactos_dae?.telefono || iesActual.contactos_dae?.telefono_nacional) && (
                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Teléfono Directo:</div>
                  <div style={{ fontWeight: '700', color: '#1F2937' }}>{iesActual.contactos_dae.telefono || iesActual.contactos_dae.telefono_nacional}</div>
                </div>
              )}
              {(iesActual.contactos_dae?.email || iesActual.contactos_dae?.correo) && (
                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Correo Electrónico:</div>
                  <div style={{ fontWeight: '700', color: '#1F2937' }}>{iesActual.contactos_dae.email || iesActual.contactos_dae.correo}</div>
                </div>
              )}
              {(iesActual.contactos_dae?.mesa_central || iesActual.contactos_dae?.mesa_servicios) && (
                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Mesa Central / Servicios:</div>
                  <div style={{ fontWeight: '700', color: '#1F2937' }}>{iesActual.contactos_dae.mesa_central || iesActual.contactos_dae.mesa_servicios}</div>
                </div>
              )}
              {obtenerUrgenciaIES(iesActual) && (
                <div style={{ background: '#FEF2F2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                  <div style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: '700' }}>🚨 Línea de Urgencia / Emergencia:</div>
                  <div style={{ fontWeight: '800', color: '#DC2626', fontSize: '1rem' }}>{obtenerUrgenciaIES(iesActual)}</div>
                </div>
              )}
              {(iesActual.contactos_dae?.portal || iesActual.contactos_dae?.sede_principal) && (
                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Portal o Atención Presencial:</div>
                  <div style={{ fontWeight: '600', color: '#1F2937' }}>{iesActual.contactos_dae.portal || iesActual.contactos_dae.sede_principal}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
