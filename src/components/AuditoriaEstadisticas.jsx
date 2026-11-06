import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle, PieChart } from 'lucide-react';

export default function AuditoriaEstadisticas() {
  const [grupoSel, setGrupoSel] = useState('Jornada');

  const datosEquidad = {
    Jornada: [
      { valor: 'Diurna', estudiantes: 1680, cobertura: 14.8, desercionAtendida: 42.1 },
      { valor: 'Vespertina', estudiantes: 1320, cobertura: 22.4, desercionAtendida: 51.3 }
    ],
    Edad: [
      { valor: '17 a 19 años', estudiantes: 1420, cobertura: 13.2, desercionAtendida: 39.5 },
      { valor: '20 a 24 años', estudiantes: 980, cobertura: 18.5, desercionAtendida: 48.0 },
      { valor: '25 a 34 años', estudiantes: 410, cobertura: 24.1, desercionAtendida: 54.2 },
      { valor: '35 o más años', estudiantes: 190, cobertura: 26.8, desercionAtendida: 58.7 }
    ],
    Sexo: [
      { valor: 'Femenino', estudiantes: 1540, cobertura: 16.2, desercionAtendida: 45.4 },
      { valor: 'Masculino', estudiantes: 1445, cobertura: 18.1, desercionAtendida: 47.9 },
      { valor: 'No binario', estudiantes: 15, cobertura: 20.0, desercionAtendida: 50.0 }
    ]
  };

  const filas = datosEquidad[grupoSel] || datosEquidad['Jornada'];

  return (
    <div>
      <div className="card" style={{ marginBottom: '18px' }}>
        <h2 className="card-title">⚖️ Auditoría Antisesgo y Estadísticas Anónimas Anuales</h2>
        <p style={{ fontSize: '0.88rem', color: '#4B5563', margin: '4px 0 0 0' }}>
          Monitoreo activo para garantizar que la IA no introduzca sesgos contra ningún grupo y reporte transparente de impacto social para donantes y el directorio de Fundación Puente.
        </p>
      </div>

      <div className="grid-cols-2" style={{ gap: '20px', marginBottom: '20px' }}>
        {/* Columna Izquierda: Auditoría Antisesgo */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', color: '#9F1127', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={18} /> ¿A quién apoya la priorización?
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Jornada', 'Edad', 'Sexo'].map(g => (
                <button
                  key={g}
                  onClick={() => setGrupoSel(g)}
                  className="btn-secondary"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    background: grupoSel === g ? '#9F1127' : '#FFFFFF',
                    color: grupoSel === g ? '#FFFFFF' : '#374151'
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '14px' }}>
            Comparación de cobertura del grupo vs desertores alcanzados (Garantía: variables sexo y sede excluidas de los cálculos):
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filas.map((f, i) => (
              <div key={i} style={{ background: '#F8F6F4', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: '700', marginBottom: '6px' }}>
                  <span>{f.valor} <small style={{ color: '#6B7280', fontWeight: '400' }}>({f.estudiantes} becados)</small></span>
                  <span style={{ color: '#9F1127' }}>{f.cobertura}% en apoyo</span>
                </div>
                {/* Barra de progreso doble */}
                <div style={{ width: '100%', height: '10px', background: '#E5E0DB', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${f.cobertura}%`, background: '#9F1127', height: '100%' }} title={`En apoyo: ${f.cobertura}%`} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>
                  <span>Cobertura semanal: {f.cobertura}%</span>
                  <span>Desertores alcanzados: {f.desercionAtendida}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="quote-box" style={{ marginTop: '14px', fontSize: '0.82rem' }}>
            💡 <b>Conclusión ética:</b> Los estudiantes vespertinos o con mayor carga laboral presentan mayores solicitudes de apoyo debido a turnos y cuidados familiares, no por un sesgo algorítmico demográfico.
          </div>
        </div>

        {/* Columna Derecha: Reporte a Donantes */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', color: '#166534', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={18} /> Estadísticas Anónimas (Reporte a Donantes)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '14px' }}>
            Resultados consolidados anuales presentados a empresas y benefactores de Fundación Puente:
          </p>

          <div className="grid-cols-2" style={{ gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '8px', border: '1px solid #86EFAC', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>Tasa de Retención 1° Año</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#166534' }}>88.5%</div>
              <div style={{ fontSize: '0.7rem', color: '#047857' }}>Meta superada (&gt;85%)</div>
            </div>

            <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '8px', border: '1px solid #FDBA74', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: '600' }}>Alertas Atendidas en &lt;48h</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#EA580C' }}>100%</div>
              <div style={{ fontSize: '0.7rem', color: '#C2410C' }}>Contacto profesional</div>
            </div>
          </div>

          <h4 style={{ fontSize: '0.88rem', color: '#374151', marginBottom: '8px', fontWeight: '700' }}>
            Top Dudas Universitarias Canalizadas (Anónimas):
          </h4>
          <div style={{ fontSize: '0.84rem', color: '#4B5563', lineHeight: '1.6' }}>
            • <b>1. Apelación FUAS y Renovación de Gratuidad:</b> 34% de las consultas.<br />
            • <b>2. Flexibilidad Horaria por Turnos Laborales:</b> 28% de los becados.<br />
            • <b>3. Nivelación Académica CAI (Matemática y Programación):</b> 22% de solicitudes.<br />
            • <b>4. Apoyo Psicosocial en Salud Mental y Bienestar:</b> 16% canalizadas.
          </div>
        </div>
      </div>
    </div>
  );
}
