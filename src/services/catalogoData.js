export const CATALOGO_SERVICIOS = [
  {
    id: "S01",
    categoria: "economico",
    nombre: "Beca Mensual Fundación Puente",
    para_que_sirve: "Aporte económico mensual por 9 meses para cubrir locomoción, colación y materiales de estudio.",
    cuando_sugerirlo: "Gastos diarios de transporte, colación universitaria o insumos de carrera.",
    como_acceder: "Postulación anual en www.fundacionpuente.cl; abono mensual tras validar permanencia.",
    tipo_origen: "Fundación Puente",
    plazo_recordatorio: "Mensual (marzo a noviembre)"
  },
  {
    id: "S02",
    categoria: "academico",
    nombre: "CAI · Tutorías Académicas y Cursos eClass",
    para_que_sirve: "Reforzamiento académico personalizado con voluntarios del Centro de Atención Integral (CAI) y cursos de inglés eClass.",
    cuando_sugerirlo: "Ramos difíciles, notas parciales bajas, necesidad de nivelar o aprender inglés.",
    como_acceder: "Inscripción interna a través del equipo psicosocial de Fundación Puente o portal becado.",
    tipo_origen: "Fundación Puente",
    plazo_recordatorio: "Inscripción continua al inicio de semestre"
  },
  {
    id: "S03",
    categoria: "bienestar",
    nombre: "CAI · Servicios Psicosociales (Salud Mental, Nutrición y Legal)",
    para_que_sirve: "Acceso gratuito a atenciones de salud mental, nutrición y asesoría jurídica con profesionales del CAI.",
    cuando_sugerirlo: "Estrés, angustia, dudas nutricionales o trámites legales que afecten el estudio.",
    como_acceder: "Solicitud directa en la fundación o derivación por profesional de acompañamiento.",
    tipo_origen: "Fundación Puente",
    plazo_recordatorio: "Atención continua previa coordinación"
  },
  {
    id: "S04",
    categoria: "economico",
    nombre: "Becas de Emergencia y Materiales Complementarios",
    para_que_sirve: "Apoyo económico ante contingencias graves, entrega de equipamiento (notebooks, escritorios) y Cajas de Navidad (Pastoral Social Caritas).",
    cuando_sugerirlo: "Pérdida de ingresos familiares, falta de computador/materiales o urgencia económica imprevista.",
    como_acceder: "Evaluación socioeconómica con la trabajadora social de la fundación.",
    tipo_origen: "Fundación Puente",
    plazo_recordatorio: "Solicitud ante emergencia activa"
  },
  {
    id: "S05",
    categoria: "traslado",
    nombre: "Beca de Residencia Universitaria (Alianza Fundación La Llave)",
    para_que_sirve: "Cupos de hogar universitario en Santiago para estudiantes de regiones o con crisis habitacional grave.",
    cuando_sugerirlo: "Estudiante de región sin redes en Santiago o pérdida de vivienda habitual.",
    como_acceder: "Postulación a cupos residenciales en alianza con Fundación La Llave vía Fundación Puente.",
    tipo_origen: "Fundación Puente",
    plazo_recordatorio: "Convocatoria anual y casos críticos"
  },
  {
    id: "S06",
    categoria: "economico",
    nombre: "Beneficios Estatales (FUAS: Gratuidad, BAES y TNE)",
    para_que_sirve: "Cobertura de arancel del 100% (Gratuidad), subsidio alimentario Junaeb (BAES) y rebaja de transporte público (TNE).",
    cuando_sugerirlo: "Consultas sobre asignación FUAS, renovación de gratuidad o apelación por cambio de ingresos.",
    como_acceder: "Orientación paso a paso con asistente social de la fundación y trámites en beneficiosestudiantiles.cl.",
    tipo_origen: "Mineduc / Junaeb",
    plazo_recordatorio: "Plazos oficiales Mineduc (marzo, junio, octubre)"
  },
  {
    id: "S07",
    categoria: "laboral",
    nombre: "Flexibilidad Académica y Apoyo a Cuidadores en tu IES",
    para_que_sirve: "Ajustes de horarios, justificación de inasistencias por turnos laborales y prioridad de salas cuna (JUNJI/Integra/IES).",
    cuando_sugerirlo: "Trabajo por turnos rotativos, cambio de jornada laboral o cuidado de hijos/familiares dependientes.",
    como_acceder: "Orientación de Fundación Puente para presentar solicitud formal en Dirección de Asuntos Estudiantiles (DAE).",
    tipo_origen: "Institución de Educación Superior",
    plazo_recordatorio: "Primeras 3 semanas de cada semestre"
  },
  {
    id: "S08",
    categoria: "organizacion",
    nombre: "Actividades Formativas y Talleres de Adaptación Universitaria",
    para_que_sirve: "Jornadas teórico-prácticas y experienciales de habilidades blandas, gestión del tiempo y estrategias de estudio.",
    cuando_sugerirlo: "Dificultad para compatibilizar estudio y vida personal, choque con el ritmo universitario.",
    como_acceder: "Talleres grupales obligatorios y electivos organizados por el área formativa de la fundación.",
    tipo_origen: "Fundación Puente",
    plazo_recordatorio: "Convocatorias semestrales en calendario formativo"
  },
  {
    id: "S09",
    categoria: "vocacional",
    nombre: "Orientación Vocacional y Acompañamiento Curricular",
    para_que_sirve: "Espacio de discernimiento para reevaluar la carrera, analizar opciones de cambio interno y resguardar beneficios.",
    cuando_sugerirlo: "Dudas sobre la vocación, insatisfacción con la carrera elegida o presión familiar.",
    como_acceder: "Sesión personalizada con psicóloga/trabajadora social de Fundación Puente para planificar transición.",
    tipo_origen: "Fundación Puente",
    plazo_recordatorio: "Agendamiento directo durante todo el año"
  }
];

export function clasificarBeneficios(perfil) {
  const yaTienes = new Set(perfil.beneficios_activos || ["S01"]);
  const trabaja = perfil.trabaja || (perfil.horas_trabajo_semana || 0) > 0;
  const cuida = perfil.cuida_dependientes || false;
  const gratuidad = perfil.gratuidad || false;
  const promedio = perfil.nota_promedio || 5.0;
  const region = perfil.de_region || false;

  const resultado = {
    podrias_postular: [],
    ya_lo_tienes: [],
    revisa_requisito: []
  };

  CATALOGO_SERVICIOS.forEach(s => {
    const item = { ...s, motivo: "" };

    // 1. Ya lo tienes
    if (yaTienes.has(s.id)) {
      item.motivo = "Activo en tu registro de becado. Recuerda mantener tus compromisos formativos.";
      resultado.ya_lo_tienes.push(item);
      return;
    }

    if (s.id === "S06" && gratuidad) {
      item.motivo = "Cuentas con Gratuidad estatal activa para el presente periodo.";
      resultado.ya_lo_tienes.push(item);
      return;
    }

    // 2. Revisa este requisito
    if (s.id === "S06" && !gratuidad) {
      item.motivo = "Revisa tu estado FUAS: podrías optar a apelación de arancel o gratuidad.";
      resultado.revisa_requisito.push(item);
      return;
    }

    if (s.id === "S08") {
      item.motivo = "Talleres obligatorios: revisa las fechas para cumplir tu porcentaje de participación.";
      resultado.revisa_requisito.push(item);
      return;
    }

    // 3. Podrías postular
    let aplica = false;
    if (s.id === "S02" && promedio < 5.0) {
      item.motivo = `Tus notas parciales (${promedio.toFixed(1)}) sugieren reforzamiento en asignaturas clave.`;
      aplica = true;
    } else if (s.id === "S07" && (trabaja || cuida)) {
      item.motivo = "Compatibiliza tus horarios con tus turnos laborales o responsabilidades de cuidado.";
      aplica = true;
    } else if (s.id === "S05" && region) {
      item.motivo = "Hogar universitario en convenio con Fundación La Llave para estudiantes de regiones.";
      aplica = true;
    } else if (["S03", "S04", "S09"].includes(s.id)) {
      item.motivo = "Disponible para becados de Fundación Puente ante necesidades específicas.";
      aplica = true;
    }

    if (aplica) {
      resultado.podrias_postular.push(item);
    } else {
      resultado.revisa_requisito.push(item);
    }
  });

  return resultado;
}
