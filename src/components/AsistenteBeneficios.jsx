import React, { useState } from 'react';
import { clasificarBeneficios } from '../services/catalogoData';
import { CheckCircle, Clock, AlertCircle, Sparkles, Send } from 'lucide-react';

export default function AsistenteBeneficios({ becadoPerfil, setBecadoPerfil, agregarCasoBandeja }) {
  const [mensajeExito, setMensajeExito] = useState('');
  const [formAbierto, setFormAbierto] = useState(false);

  const beneficiosClasificados = clasificarBeneficios(becadoPerfil);

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
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Institución:</label>
                <select
                  value={becadoPerfil.institucion}
                  onChange={(e) => setBecadoPerfil({ ...becadoPerfil, institucion: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', marginTop: '4px' }}
                >
                  <option value="Duoc UC San Joaquín">Duoc UC San Joaquín</option>
                  <option value="INACAP Santiago Centro">INACAP Santiago Centro</option>
                  <option value="Universidad Central">Universidad Central</option>
                  <option value="Santo Tomás Santiago">Santo Tomás Santiago</option>
                  <option value="Duoc UC Maipú">Duoc UC Maipú</option>
                  <option value="IP Chile">IP Chile</option>
                  <option value="Universidad de Chile">Universidad de Chile</option>
                  <option value="Pontificia Universidad Católica">Pontificia Universidad Católica</option>
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
    </div>
  );
}
