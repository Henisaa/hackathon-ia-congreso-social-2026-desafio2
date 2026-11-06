// Motor RAG (Retrieval-Augmented Generation) con Supuesto de Mundo Cerrado
// Fuente oficial verificada: desafio2/datos/beneficios_ies_rm.md (19 IES) y catalogoData.js (Fundación Puente)
// Objetivo: Cero alucinaciones, cero información falsa y trazabilidad con fuentes oficiales.

import { IES_KNOWLEDGE_BASE, resolverInstitucion, obtenerUrgenciaIES } from './iesKnowledgeBase.js';
import { CATALOGO_SERVICIOS } from './catalogoData.js';

// Palabras vacías en español para tokenización
const STOP_WORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no',
  'una', 'su', 'al', 'lo', 'como', 'mas', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'si', 'sí',
  'porque', 'esta', 'son', 'entre', 'esta', 'cuando', 'muy', 'sin', 'sobre', 'ser', 'tiene', 'también',
  'tambien', 'me', 'mi', 'mis', 'te', 'ti', 'tu', 'tus', 'yo', 'nos', 'nosotros', 'hola', 'buenas',
  'tardes', 'días', 'dias', 'noches', 'favor', 'ayuda', 'ayúdame', 'puedes', 'quiero', 'saber', 'tengo'
]);

// Normalizar texto para búsqueda léxica
export function normalizarTexto(texto = '') {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

// Tokenizar texto filtrando stop words
export function tokenizar(texto = '') {
  const norm = normalizarTexto(texto);
  return norm
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

// Generar índice de fragmentos (Chunks) auditables
let indiceDocumentos = null;

export function obtenerIndiceDocumentos() {
  if (indiceDocumentos) return indiceDocumentos;

  const docs = [];

  // 1. Chunks de las 19 Instituciones de Educación Superior
  for (const ies of IES_KNOWLEDGE_BASE) {
    const iesId = ies.id;
    const iesNombre = ies.nombre;

    // Contactos DAE
    const c = ies.contactos_dae || {};
    const urgenciaFono = obtenerUrgenciaIES(ies);
    const canalesTxt = [
      c.email || c.correo ? `Email: ${c.email || c.correo}` : null,
      c.telefono ? `Teléfono: ${c.telefono}` : null,
      c.whatsapp ? `WhatsApp: ${c.whatsapp}` : null,
      c.mesa_central || c.mesa_servicios ? `Mesa: ${c.mesa_central || c.mesa_servicios}` : null,
      urgenciaFono ? `Línea Urgencia: ${urgenciaFono}` : null,
      c.portal || c.sede_principal ? `Atención: ${c.portal || c.sede_principal}` : null,
      c.financiamiento ? `Financiamiento: ${c.financiamiento}` : null,
      c.bienestar ? `Bienestar: ${c.bienestar}` : null
    ].filter(Boolean).join(' · ');

    docs.push({
      id: `dae_${iesId}`,
      tipo: 'contacto_dae',
      institucion_id: iesId,
      institucion_nombre: iesNombre,
      alias: ies.alias || [],
      titulo: `Canales DAE y Bienestar Estudiantil · ${iesNombre}`,
      contenido: `Atención a estudiantes en ${iesNombre}. ${canalesTxt || 'Consultar presencialmente en Dirección de Asuntos Estudiantiles.'}`,
      fuente: `Directorio Oficial DAE ${iesNombre}`,
      contacto_directo: canalesTxt,
      urgencia: urgenciaFono || null,
      tokens: tokenizar(`${iesNombre} dae bienestar asuntos estudiantiles contacto ayuda ${canalesTxt} ${ies.alias?.join(' ')}`)
    });

    // Becas económicas internas
    for (const beca of ies.becas_economicas || []) {
      const contenido = `${beca.descripcion} Cobertura: ${beca.cobertura}. Requisitos: ${beca.requisitos}. Proceso de postulación: ${beca.proceso}.`;
      docs.push({
        id: `beca_${iesId}_${normalizarTexto(beca.nombre).slice(0, 25).replace(/\s+/g, '_')}`,
        tipo: 'beca_institucional',
        institucion_id: iesId,
        institucion_nombre: iesNombre,
        alias: ies.alias || [],
        titulo: `${beca.nombre} (${iesNombre})`,
        contenido,
        cobertura: beca.cobertura,
        requisitos: beca.requisitos,
        proceso: beca.proceso,
        fuente: `Catálogo Oficial de Beneficios ${iesNombre}`,
        contacto_directo: canalesTxt,
        tokens: tokenizar(`${iesNombre} ${beca.nombre} beca arancel matricula dinero financiamiento ${contenido} ${ies.alias?.join(' ')}`)
      });
    }

    // Programas de acompañamiento académico y vocacional
    for (const prog of ies.programas_acompanamiento || []) {
      const contenido = `Tipo: ${prog.tipo}. Descripción: ${prog.descripcion}. Canal de acceso: ${prog.canal}.`;
      docs.push({
        id: `prog_${iesId}_${normalizarTexto(prog.nombre).slice(0, 25).replace(/\s+/g, '_')}`,
        tipo: 'acompanamiento_institucional',
        institucion_id: iesId,
        institucion_nombre: iesNombre,
        alias: ies.alias || [],
        titulo: `${prog.nombre} · ${prog.tipo} (${iesNombre})`,
        contenido,
        canal: prog.canal,
        fuente: `Programas de Apoyo Académico ${iesNombre}`,
        contacto_directo: canalesTxt,
        tokens: tokenizar(`${iesNombre} ${prog.nombre} ${prog.tipo} tutoria tutorias apoyo nivelacion ramos reprobar notas ${contenido} ${ies.alias?.join(' ')}`)
      });
    }

    // Bienestar, salud y urgencias
    for (const b of ies.bienestar_salud_emergencia || []) {
      const contenido = `${b.descripcion}. Procedimiento de atención: ${b.procedimiento}.`;
      docs.push({
        id: `salud_${iesId}_${normalizarTexto(b.nombre).slice(0, 25).replace(/\s+/g, '_')}`,
        tipo: 'salud_bienestar_institucional',
        institucion_id: iesId,
        institucion_nombre: iesNombre,
        alias: ies.alias || [],
        titulo: `${b.nombre} (${iesNombre})`,
        contenido,
        procedimiento: b.procedimiento,
        fuente: `Protocolos de Bienestar y Salud ${iesNombre}`,
        contacto_directo: canalesTxt,
        tokens: tokenizar(`${iesNombre} ${b.nombre} salud psicologica mental bienestar emergencia seguro ${contenido} ${ies.alias?.join(' ')}`)
      });
    }
  }

  // 2. Chunks del Catálogo Oficial de Fundación Puente [S01] - [S09]
  for (const s of CATALOGO_SERVICIOS) {
    const contenido = `${s.para_que_sirve}. Cómo acceder: ${s.como_acceder}. Plazo / Frecuencia: ${s.plazo_recordatorio || 'Permanente'}.`;
    docs.push({
      id: `puente_${s.id.toLowerCase()}`,
      tipo: 'servicio_fundacion_puente',
      institucion_id: 'fundacion_puente',
      institucion_nombre: 'Fundación Puente',
      alias: ['Puente Contigo', 'Fundación Puente', 'CAI'],
      titulo: `[${s.id}] ${s.nombre} (${s.tipo_origen})`,
      codigo_servicio: s.id,
      contenido,
      fuente: 'Catálogo Oficial de Servicios Fundación Puente (2026)',
      contacto_directo: 'Acompañamiento directo a través de tu profesional asignada en Fundación Puente.',
      tokens: tokenizar(`fundacion puente ${s.id} ${s.nombre} ${s.tipo_origen} ${s.para_que_sirve} ${s.como_acceder}`)
    });
  }

  // 3. Líneas Oficiales de Urgencia y Red de Salud de Chile
  docs.push(
    {
      id: 'nacional_linea_4141',
      tipo: 'linea_urgencia_nacional',
      institucion_id: 'minsal',
      institucion_nombre: 'Ministerio de Salud de Chile',
      alias: ['4141', 'minsal', 'prevencion suicidio'],
      titulo: 'Línea de Prevención del Suicidio *4141 "No estás solo, no estás sola"',
      contenido: 'Atención telefónica gratuita, confidencial y atendida por psicólogos especializados, 24 horas al día, los 7 días de la semana, desde cualquier teléfono celular en Chile.',
      fuente: 'Ministerio de Salud de Chile (MINSAL)',
      contacto_directo: 'Marcar directamente *4141 desde celular (gratuito)',
      tokens: tokenizar('linea 4141 suicidio matarme morir angustia extrema crisis vital psicologo minsal 24/7 urgencia')
    },
    {
      id: 'nacional_salud_responde',
      tipo: 'linea_urgencia_nacional',
      institucion_id: 'minsal',
      institucion_nombre: 'Ministerio de Salud de Chile',
      alias: ['salud responde'],
      titulo: 'Salud Responde 600 360 7777',
      contenido: 'Orientación médica y psicosocial continua las 24 horas para emergencias de salud física y mental en Chile.',
      fuente: 'Ministerio de Salud de Chile (MINSAL)',
      contacto_directo: '600 360 7777',
      tokens: tokenizar('salud responde orientacion medica salud mental emergencia apoyo psicologico 24/7')
    },
    {
      id: 'nacional_samu_131',
      tipo: 'linea_urgencia_nacional',
      institucion_id: 'samu',
      institucion_nombre: 'SAMU Chile',
      alias: ['samu', '131'],
      titulo: 'SAMU 131 · Urgencias Médicas Vitales',
      contenido: 'Servicio de Atención Médica de Urgencia para riesgo vital inmediato, envío de ambulancias e intervención hospitalaria de urgencia.',
      fuente: 'Red de Urgencia SAMU Chile',
      contacto_directo: '131',
      tokens: tokenizar('samu 131 urgencia vital ambulancia hospital emergencia extrema')
    }
  );

  indiceDocumentos = docs;
  return indiceDocumentos;
}

// Recuperador de contexto con Supuesto de Mundo Cerrado (RAG)
export function recuperarContextoRAG(consultaUsuario = '', becadoPerfil = {}, topK = 6) {
  const queryTokens = tokenizar(consultaUsuario);
  const docs = obtenerIndiceDocumentos();

  // 1. Detección de institución mencionada en la consulta o del perfil del becado
  let iesMencionada = null;
  const textoNorm = normalizarTexto(consultaUsuario);

  for (const ies of IES_KNOWLEDGE_BASE) {
    if (textoNorm.includes(normalizarTexto(ies.nombre))) {
      iesMencionada = ies;
      break;
    }
    for (const al of ies.alias) {
      const alNorm = normalizarTexto(al);
      if (alNorm.length >= 3 && new RegExp(`\\b${alNorm}\\b`, 'i').test(textoNorm)) {
        iesMencionada = ies;
        break;
      }
    }
    if (iesMencionada) break;
  }

  // Si no se menciona una institución específica en el texto, usar la del becado
  const iesPerfil = resolverInstitucion(becadoPerfil?.institucion || '');
  const iesObjetivo = iesMencionada || iesPerfil;

  // 2. Detección de intenciones críticas
  const esCrisis = /(suicid|matar|quitarme la vida|morir|autolesi|violencia|pega|golpea|abus|angustia extrema|desesperad|no doy m[aá]s|colaps)/i.test(consultaUsuario);
  const esEconomica = /(plata|dinero|arancel|beca|financiamiento|almuerzo|comida|pasaje|micro|bip|arriendo|desalojo|fuas|gratuidad)/i.test(consultaUsuario);
  const esAcademica = /(reprob|ramo|nota|certamen|prueba|estudiar|tutor|nivelaci|programaci|cálculo|matem[aá]tica)/i.test(consultaUsuario);

  // 3. Algoritmo de puntuación léxico-semántico contextual
  const puntuados = docs.map(doc => {
    let score = 0;
    const docTokensSet = new Set(doc.tokens);

    // Coincidencia de tokens
    for (const qTok of queryTokens) {
      if (docTokensSet.has(qTok)) {
        score += 3.0;
      } else {
        // Coincidencia parcial de prefijo (stemming ligero)
        for (const dTok of docTokensSet) {
          if (dTok.startsWith(qTok) || qTok.startsWith(dTok)) {
            score += 1.2;
            break;
          }
        }
      }
    }

    // Boost fuerte para la institución del estudiante o consultada
    if (iesObjetivo && doc.institucion_id === iesObjetivo.id) {
      score += 6.0;
      // Si la consulta pregunta por contacto DAE, mayor relevancia
      if (/dae|contacto|correo|telefono|bienestar|donde/i.test(consultaUsuario) && doc.tipo === 'contacto_dae') {
        score += 8.0;
      }
    } else if (doc.institucion_id && iesObjetivo && doc.institucion_id !== 'fundacion_puente' && doc.institucion_id !== 'minsal' && doc.institucion_id !== 'samu') {
      // Penalizar instituciones distintas a la del estudiante para no mezclar datos falsos
      score -= 8.0;
    }

    // Boost temático
    if (esCrisis) {
      if (doc.tipo === 'linea_urgencia_nacional') score += 18.0;
      if (doc.id === 'puente_s03') score += 12.0;
      if (doc.urgencia) score += 10.0;
    }

    if (esEconomica) {
      if (doc.tipo === 'beca_institucional') score += 5.0;
      if (doc.id === 'puente_s01' || doc.id === 'puente_s04') score += 6.0;
    }

    if (esAcademica) {
      if (doc.tipo === 'acompanamiento_institucional') score += 5.0;
      if (doc.id === 'puente_s02') score += 6.0;
    }

    // Boost Fundación Puente para preguntas generales
    if (doc.institucion_id === 'fundacion_puente') {
      score += 2.0;
    }

    return { ...doc, score };
  });

  // Filtrar con score positivo y ordenar
  const fragmentos = puntuados
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // Extraer fuentes oficiales únicas para auditoría y visualización del usuario
  const fuentesMap = new Map();
  for (const f of fragmentos) {
    const key = `${f.institucion_nombre} · ${f.titulo}`;
    if (!fuentesMap.has(key)) {
      fuentesMap.set(key, {
        id: f.id,
        institucion: f.institucion_nombre,
        titulo: f.titulo,
        tipo: f.tipo,
        fuenteOficial: f.fuente,
        contacto: f.contacto_directo || null,
        cobertura: f.cobertura || null,
        requisitos: f.requisitos || null,
        proceso: f.proceso || null
      });
    }
  }

  return {
    fragmentos,
    institucionDetectada: iesObjetivo,
    fuentesCitas: Array.from(fuentesMap.values())
  };
}

// Constructor del System Prompt con Supuesto de Mundo Cerrado (Closed-World Assumption)
export function construirSystemPromptRAG(becadoPerfil = {}, resultadoRAG = { fragmentos: [] }) {
  const { fragmentos = [], institucionDetectada } = resultadoRAG;

  const contextoTexto = fragmentos.map((f, i) => {
    return `[FUENTE ${i + 1}] (${f.institucion_nombre}) ${f.titulo}\nTipo: ${f.tipo}\nContenido oficial: ${f.contenido}\nCanal oficial/Contacto: ${f.contacto_directo || 'Consultar DAE'}`;
  }).join('\n\n');

  const instNombre = institucionDetectada?.nombre || becadoPerfil?.institucion || 'tu institución de educación superior';
  const cDae = institucionDetectada?.contactos_dae || {};
  const urgenciaInst = obtenerUrgenciaIES(institucionDetectada);
  const contactoDaeResumen = [
    cDae.telefono ? `Teléfono DAE: ${cDae.telefono}` : null,
    cDae.email || cDae.correo ? `Email DAE: ${cDae.email || cDae.correo}` : null,
    cDae.mesa_central || cDae.mesa_servicios ? `Mesa: ${cDae.mesa_central || cDae.mesa_servicios}` : null,
    urgenciaInst ? `Urgencia institucional: ${urgenciaInst}` : null
  ].filter(Boolean).join(', ');

  return `Eres "Puente Contigo", asistente virtual de apoyo y orientación para becados de primer año de Fundación Puente en Chile.
Estudiante activo: ${becadoPerfil.nombre || 'Estudiante'} (Carrera: ${becadoPerfil.carrera || 'No informada'}, Institución: ${instNombre}).

======================================================================
REGLAS OBLIGATORIAS DE "MUNDO CERRADO" (CLOSED-WORLD ASSUMPTION - ANTI-ALUCINACIÓN):
1. RESPONDE ÚNICA Y EXCLUSIVAMENTE EN BASE AL BLOQUE <CONTEXTO_VERIFICADO_RAG> ABAJO.
2. PROHIBIDO INVENTAR: No inventes montos de becas, requisitos, plazos de postulación, correos electrónicos ni teléfonos que no figuren textualmente en las fuentes entregadas.
3. VACÍO DE INFORMACIÓN: Si el estudiante te consulta por un dato que NO está en el contexto o que dice textualmente "No disponible en fuente oficial", DEBES responder explícitamente:
   "Ese dato específico no figura en los registros oficiales verificados de ${instNombre}. Para confirmar requisitos o fechas actualizadas, te recomiendo contactar directamente a la DAE de tu institución${contactoDaeResumen ? ` (${contactoDaeResumen})` : ''}."
4. TUTEA EN ESPAÑOL CHILENO RESPETUOSO: Usa "tú", nunca uses voseo argentino/rioplatense (di "tienes", "puedes", "sabes"; nunca "tenés", "podés", "sabés").
5. EXTENSIÓN Y TONO: Máximo 3 a 4 oraciones por respuesta. Cálido, empático, sin sermones y con foco en soluciones prácticas.
6. CITA DE SERVICIOS:
   - Servicios de Fundación Puente siempre con su código: [S01] a [S09].
   - Beneficios estatales o de la IES con su nombre exacto citado.
7. ÉTICA EN SALUD MENTAL: No emitas diagnósticos clínicos ni etiquetes psicológicamente al estudiante. Si hay crisis vital, indica inmediatamente la Línea *4141 y SAMU 131.
======================================================================

<CONTEXTO_VERIFICADO_RAG>
${contextoTexto || 'No se encontraron fragmentos específicos. Utiliza solo el catálogo de Fundación Puente [S01]-[S09] o deriva cordialmente a la DAE.'}
</CONTEXTO_VERIFICADO_RAG>`;
}

// Generador extractivo determinista de respaldo (Garantía de Cero Alucinaciones sin API o en Demo)
export function generarRespuestaExtractivaRAG(consultaUsuario = '', becadoPerfil = {}, resultadoRAG = { fragmentos: [] }) {
  const { fragmentos = [], institucionDetectada } = resultadoRAG;
  const nombre = becadoPerfil?.nombre || 'Hola';
  const iesNombre = institucionDetectada?.nombre || becadoPerfil?.institucion || 'tu casa de estudios';
  const cDae = institucionDetectada?.contactos_dae || {};
  const contactoStr = cDae.telefono || cDae.mesa_central || cDae.email || 'la Dirección de Asuntos Estudiantiles';

  // 1. Caso de crisis extrema / salud mental
  const fragCrisis = fragmentos.find(f => f.tipo === 'linea_urgencia_nacional' || f.id === 'puente_s03');
  const urgenciaFono = obtenerUrgenciaIES(institucionDetectada);
  if (fragCrisis && /(suicid|matar|quitarme la vida|morir|autolesi|violencia|angustia extrema|no doy mas|no doy más)/i.test(consultaUsuario)) {
    let msg = `Gracias por tu valentía al contarlo, ${nombre}. Mereces apoyo humano inmediato: puedes llamar de forma gratuita y 24/7 a la **Línea de Prevención del Suicidio *4141** o a **Salud Responde 600 360 7777**.`;
    if (urgenciaFono) {
      msg += ` En ${iesNombre} cuentas además con la línea de urgencia y orientación: **${urgenciaFono}**.`;
    }
    msg += ` He notificado de forma urgente a tu profesional en Fundación Puente para activar los **Servicios Psicosociales del CAI [S03]**.`;
    return msg;
  }

  // 2. Consulta de becas o beneficios económicos
  const becasIES = fragmentos.filter(f => f.tipo === 'beca_institucional');
  if (becasIES.length > 0 && /(beca|arancel|plata|dinero|financiamiento|pagar|gratuidad)/i.test(consultaUsuario)) {
    const primera = becasIES[0];
    const cobertura = primera.cobertura && !primera.cobertura.includes('No disponible')
      ? primera.cobertura
      : 'información sujeta a confirmación en DAE';
    const proceso = primera.proceso && !primera.proceso.includes('No disponible')
      ? primera.proceso
      : `consultar directamente en DAE (${contactoStr})`;

    let resp = `En ${iesNombre} cuentas con la **${primera.titulo}**, cuya cobertura es: ${cobertura}. El proceso oficial indica: ${proceso}.`;
    resp += ` Recuerda que en Fundación Puente también cuentas con la **Beca Mensual [S01]** y podemos orientarte si necesitas apoyo para postular.`;
    return resp;
  }

  // 3. Consulta académica o de reprobación
  const progAcomp = fragmentos.filter(f => f.tipo === 'acompanamiento_institucional');
  if (progAcomp.length > 0 && /(reprob|ramo|nota|certamen|prueba|estudiar|tutor)/i.test(consultaUsuario)) {
    const prog = progAcomp[0];
    return `Es comprensible sentir inquietud por las primeras notas, ${nombre}. En ${iesNombre} puedes acudir al programa verificado **${prog.titulo}** (${prog.canal || 'vía DAE'}). Además, en Fundación Puente dispones de las **Tutorías Académicas del CAI [S02]** con voluntarios para acompañarte sin juicios. ¿Te gustaría coordinar una sesión?`;
  }

  // 4. Consulta de contacto o bienestar institucional
  const fragDAE = fragmentos.find(f => f.tipo === 'contacto_dae');
  if (fragDAE && /(contacto|dae|correo|telefono|bienestar|donde|oficina)/i.test(consultaUsuario)) {
    return `Para trámites o consultas en ${iesNombre}, los canales oficiales verificados de la DAE son: ${fragDAE.contenido}. También cuentas con el respaldo de tu asistente social de Fundación Puente para orientarte en cada paso.`;
  }

  // 5. Respuesta por defecto fundamentada en fuentes
  if (fragmentos.length > 0) {
    const fTop = fragmentos[0];
    return `Hola ${nombre}, revisando los registros oficiales verificados de ${fTop.institucion_nombre}: cuentas con **${fTop.titulo}** (${fTop.contenido.slice(0, 160)}...). Para cualquier trámite específico, puedes apoyarte en la DAE (${contactoStr}) y en tu profesional de Fundación Puente a través de los apoyos [S01] y [S02].`;
  }

  return `Hola ${nombre}, en los registros oficiales verificados contamos con el respaldo permanente del catálogo de Fundación Puente ([S01] Beca Mensual y [S02] CAI) y la DAE de ${iesNombre}. Si necesitas un dato puntual de fechas o montos no listado, te orientaremos con gusto junto a tu profesional.`;
}
