import React, { useState } from 'react';
import { DollarSign, BookOpen, Users, Heart, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { evaluarSemaforo } from '../services/aiService';

export default function FichaUnica({ becadoPerfil, agregarCasoBandeja }) {
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [dimensionCorregir, setDimensionCorregir] = useState('Económica');
  const [detalleCorreccion, setDetalleCorreccion] = useState('');

  const handleSolicitarCorreccion = (e) => {
    e.preventDefault();
    if (!detalleCorreccion.trim()) return;

    // Evaluar éticamente si el estudiante declara una situación urgente en su ficha
    const semaforo = evaluarSemaforo(detalleCorreccion, 'VERDE');

    agregarCasoBandeja({
      persona_id: becadoPerfil.id_persona || 'P1',
      estudiante: becadoPerfil.nombre,
      origen: 'Solicitud Becado Ficha',
      alerta: semaforo.alerta,
      frase_gatillante: semaforo.alerta !== 'VERDE' ? detalleCorreccion : `Actualización en dimensión ${dimensionCorregir}`,
      servicio_sugerido: semaforo.servicioSugerido || 'Ficha Única',
      resumen_ia: semaforo.alerta === 'ROJA'
        ? `Declaración de crisis en ficha (${dimensionCorregir}): "${detalleCorreccion}".`
        : `El becado solicita actualizar datos en la dimensión ${dimensionCorregir}: "${detalleCorreccion}".`,
      conversacion: `Solicitud de corrección de ficha enviada por el estudiante: Dimensión ${dimensionCorregir} -> ${detalleCorreccion}`
    });

    setSolicitudEnviada(true);
    setDetalleCorreccion('');
    setTimeout(() => setSolicitudEnviada(false), 5000);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '18px' }}>
        <h2 className="card-title">🗂️ Mi Ficha Única del Becado (Transparencia Total)</h2>
        <p style={{ fontSize: '0.88rem', color: '#4B5563', margin: '4px 0 0 0' }}>
          De acuerdo con los principios éticos de la Hackathon y la política de Fundación Puente, tienes derecho a conocer qué datos se registran, su procedencia y fecha. <b>La IA nunca guarda diagnósticos de salud mental ni juicios de personalidad.</b>
        </p>
      </div>

      {/* Grid de las 6 Dimensiones */}
      <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '20px' }}>
        {/* 1. Dimensión Económica */}
        <div className="card" style={{ borderLeft: '5px solid #23A455' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DollarSign size={20} color="#23A455" />
            <h3 style={{ fontSize: '1rem', color: '#166534', margin: 0 }}>1. Dimensión Económica</h3>
          </div>
          <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.5' }}>
            • <b>Beca Mensual Fundación Puente:</b> Asignada para transporte y colación.<br />
            • <b>Situación de Arancel:</b> {becadoPerfil.gratuidad ? 'Gratuidad Mineduc activa al 100%' : 'En evaluación socioeconómica / Copago'}.<br />
            • <b>Tramo FUAS:</b> Tramo socioeconómico menor al 40% verificado.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '10px', borderTop: '1px solid #E5E0DB', paddingTop: '6px' }}>
            <i>Origen: Formulario FUAS & Validación Social · Fecha: Noviembre 2026</i>
          </div>
        </div>

        {/* 2. Dimensión Académica */}
        <div className="card" style={{ borderLeft: '5px solid #4054B2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <BookOpen size={20} color="#4054B2" />
            <h3 style={{ fontSize: '1rem', color: '#3730A3', margin: 0 }}>2. Dimensión Académica</h3>
          </div>
          <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.5' }}>
            • <b>Institución:</b> {becadoPerfil.institucion}<br />
            • <b>Carrera y Jornada:</b> {becadoPerfil.carrera} ({becadoPerfil.jornada})<br />
            • <b>Promedio Parcial Reportado:</b> {becadoPerfil.nota_promedio.toFixed(1)}<br />
            • <b>Tutorías CAI:</b> Opción de reforzamiento con voluntarios disponible.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '10px', borderTop: '1px solid #E5E0DB', paddingTop: '6px' }}>
            <i>Origen: Declarado por el estudiante & Certificado de Alumno Regular · Fecha: Noviembre 2026</i>
          </div>
        </div>

        {/* 3. Dimensión Familiar */}
        <div className="card" style={{ borderLeft: '5px solid #F0960B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Users size={20} color="#F0960B" />
            <h3 style={{ fontSize: '1rem', color: '#B45309', margin: 0 }}>3. Dimensión Familiar</h3>
          </div>
          <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.5' }}>
            • <b>Primera Generación:</b> Sí, primer profesional en su núcleo familiar.<br />
            • <b>Responsabilidades de Cuidado:</b> {becadoPerfil.cuida_dependientes ? 'Declara cuidado de hijos o familiares dependientes' : 'Sin personas a su cuidado'}.<br />
            • <b>Actividad Laboral:</b> {becadoPerfil.trabaja ? `Trabaja compatibilizando estudios (${becadoPerfil.horas_trabajo_semana || 25} hrs)` : 'Dedicación exclusiva al estudio'}.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '10px', borderTop: '1px solid #E5E0DB', paddingTop: '6px' }}>
            <i>Origen: Ficha de Postulación Becado · Fecha: Noviembre 2026</i>
          </div>
        </div>

        {/* 4. Dimensión Bienestar */}
        <div className="card" style={{ borderLeft: '5px solid #9F1127' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Heart size={20} color="#9F1127" />
            <h3 style={{ fontSize: '1rem', color: '#9F1127', margin: 0 }}>4. Dimensión Bienestar</h3>
          </div>
          <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.5' }}>
            • <b>Acompañamiento Psicosocial:</b> En proceso de inserción al primer año.<br />
            • <b>Servicios CAI:</b> Acceso gratuito a atención psicológica y nutricional.<br />
            • <b>Sin Etiquetas:</b> No se registran diagnósticos clínicos ni predicciones automáticas.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '10px', borderTop: '1px solid #E5E0DB', paddingTop: '6px' }}>
            <i>Origen: Autoreporte de Bienestar del Becado · Protegido confidencialmente</i>
          </div>
        </div>

        {/* 5. Dimensión Red y Territorial */}
        <div className="card" style={{ borderLeft: '5px solid #0284C7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin size={20} color="#0284C7" />
            <h3 style={{ fontSize: '1rem', color: '#0369A1', margin: 0 }}>5. Dimensión Red y Territorial</h3>
          </div>
          <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.5' }}>
            • <b>Procedencia:</b> {becadoPerfil.de_region ? 'Estudiante proveniente de región (apoyo en residencia)' : 'Residencia habitual en Región Metropolitana'}.<br />
            • <b>Red Comunitaria:</b> Red de becados activos de Fundación Puente y Pastoral.<br />
            • <b>Traslado:</b> Monitoreo de tiempos de viaje para sugerir material grabado.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '10px', borderTop: '1px solid #E5E0DB', paddingTop: '6px' }}>
            <i>Origen: Registro Territorial Fundación Puente · Fecha: Noviembre 2026</i>
          </div>
        </div>

        {/* 6. Dimensión Beneficios Activos */}
        <div className="card" style={{ borderLeft: '5px solid #6366F1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Award size={20} color="#6366F1" />
            <h3 style={{ fontSize: '1rem', color: '#4338CA', margin: 0 }}>6. Dimensión Beneficios</h3>
          </div>
          <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.5' }}>
            • <b>Beca Mensual Puente [S01]:</b> Asignada y activa.<br />
            • <b>TNE Tarjeta Nacional Estudiantil [S06]:</b> Revalidada para el periodo.<br />
            • <b>Talleres Formativos [S08]:</b> Convocatoria semestral abierta.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '10px', borderTop: '1px solid #E5E0DB', paddingTop: '6px' }}>
            <i>Origen: Base Verificada Fundación Puente & Mineduc · Fecha: Noviembre 2026</i>
          </div>
        </div>
      </div>

      {/* Formulario para Solicitar Corrección */}
      <div className="card" style={{ background: '#F8F6F4', border: '1px solid #E5E0DB', padding: '18px' }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#9F1127', marginBottom: '8px' }}>
          ✏️ Solicitar Corrección o Actualización de Datos
        </h3>
        <p style={{ fontSize: '0.84rem', color: '#4B5563', marginBottom: '12px' }}>
          Si hay algún dato desactualizado o incorrecto en tu ficha, indícalo aquí para que tu profesional de acompañamiento lo revise y actualice:
        </p>

        <form onSubmit={handleSolicitarCorreccion}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151' }}>Dimensión a corregir:</label>
              <select
                value={dimensionCorregir}
                onChange={(e) => setDimensionCorregir(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', marginTop: '4px' }}
              >
                <option value="Económica">1. Económica</option>
                <option value="Académica">2. Académica</option>
                <option value="Familiar">3. Familiar / Laboral</option>
                <option value="Bienestar">4. Bienestar</option>
                <option value="Red">5. Red / Traslado</option>
                <option value="Beneficios">6. Beneficios</option>
              </select>
            </div>

            <div style={{ flex: '3 1 300px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151' }}>Detalle de la actualización:</label>
              <input
                type="text"
                value={detalleCorreccion}
                onChange={(e) => setDetalleCorreccion(e.target.value)}
                placeholder="Ejemplo: Ya no trabajo los sábados / Me asignaron la gratuidad en segunda asignación"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', marginTop: '4px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={!detalleCorreccion.trim()} className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            Enviar Solicitud a mi Trabajadora Social
          </button>

          {solicitudEnviada && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '12px', color: '#166534', fontWeight: '600', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> ¡Solicitud enviada exitosamente para revisión humana!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
