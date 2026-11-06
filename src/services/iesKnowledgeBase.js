// Base de Conocimiento Oficial de Beneficios y Apoyos de Educación Superior (Región Metropolitana)
// Fuente auditable: desafio2/datos/beneficios_ies_rm.md (19 Instituciones de Educación Superior)

export const IES_KNOWLEDGE_BASE = [
  {
    id: "puc",
    nombre: "Pontificia Universidad Católica de Chile",
    alias: ["PUC", "Universidad Católica", "UC", "Católica"],
    categoria: "Universidad",
    tipo: "Privada (CRUCH)",
    becas_economicas: [
      {
        nombre: "Beca Cardenal Raúl Silva Henríquez",
        descripcion: "Beca de arancel de primer año basada en situación socioeconómica.",
        cobertura: "Decil 1 de ingresos hasta 75% del arancel; deciles 1 a 7 con porcentajes menores según decil.",
        requisitos: "FUAS del año en curso. Estar dentro de los primeros 7 deciles. Para decil 7: haber obtenido Beca Bicentenario en 12º año.",
        proceso: "Invitación por correo electrónico para completar formulario en línea durante el año de admisión."
      },
      {
        nombre: "Beca Cristóbal Conde",
        descripcion: "Beca de arancel para estudiantes de primer año provenientes de familias de menores ingresos.",
        cobertura: "70% del arancel.",
        requisitos: "Menores ingresos que rinden prueba de acceso. Buen promedio y ranking en enseñanza media pública.",
        proceso: "Postulación desde junio en línea a través del sitio de admisión."
      },
      {
        nombre: "Beca Funcionario UC",
        descripcion: "Beca para hijos o cónyuges de funcionarios de la Universidad.",
        cobertura: "40%, 45%, 50%, 75% o 100% del arancel según cantidad de beneficiarios simultáneos.",
        requisitos: "Hijo o cónyuge de funcionario UC. No sujeta a medición socioeconómica.",
        proceso: "No disponible en fuente oficial."
      },
      {
        nombre: "Beca Familia UC",
        descripcion: "Beca para familias con tres o más hijos universitarios simultáneamente en la UC.",
        cobertura: "Quintiles I a IV: tercer hijo 20%, cuarto hijo 60%, quinto hijo 100%; quintil V: tercer hijo 10%, cuarto hijo 30%, quinto hijo 50%.",
        requisitos: "Tres o más hijos estudiando en la UC al mismo tiempo.",
        proceso: "No disponible en fuente oficial."
      },
      {
        nombre: "Beneficio de Arancel Parcial",
        descripcion: "Beneficio para alumnos que no pueden completar carga académica semestral por situaciones justificadas.",
        cobertura: "75% del arancel hasta 15 créditos; 50% entre 16 y 25 créditos.",
        requisitos: "Aprobar créditos que no permitan completar beca total. Postular en plazo.",
        proceso: "Dos postulaciones anuales: 8 al 31 de marzo y 8 al 31 de agosto, en línea."
      },
      {
        nombre: "Premio a la Excelencia Académica (Matrícula de Honor)",
        descripcion: "Beneficio por rendimiento académico destacado.",
        cobertura: "Matrícula de Honor.",
        requisitos: "Promedio ≥ 6,7 en semestre anterior o 10 matrículas de honor.",
        proceso: "No disponible en fuente oficial."
      },
      {
        nombre: "Beneficio por fallecimiento o invalidez del sustentador",
        descripcion: "Cubre arancel si sustentador económico fallece o queda inválido.",
        cobertura: "Porcentaje del arancel según corresponda.",
        requisitos: "Certificado de defunción o médico de invalidez. Límite de edad sustentador: 75 años fallecimiento, 70 años invalidez.",
        proceso: "Formulario respectivo ante la DAE."
      },
      {
        nombre: "Beca Deportista de Élite",
        descripcion: "Beneficio para deportistas de alto rendimiento.",
        cobertura: "No disponible en fuente oficial.",
        requisitos: "Destacamiento en disciplinas de alto rendimiento.",
        proceso: "Dirección de Asuntos Estudiantiles (DAE) – Deportes."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Experiencia en Primer Año (DAE)",
        tipo: "Inserción universitaria",
        descripcion: "Cursos de verano, tutorías de pares, chatbot de preguntas frecuentes y ruta novata.",
        canal: "Dirección de Asuntos Estudiantiles (DAE) UC."
      },
      {
        nombre: "Tutorías entre Pares y Taller de Estudio",
        tipo: "Apoyo académico",
        descripcion: "Estudiantes ayudan a otros en asignaturas específicas y talleres de estudio.",
        canal: "Dirección de Asuntos Estudiantiles (DAE) UC."
      },
      {
        nombre: "PIANE – Unidad de Ajustes Razonables y Discapacidad",
        tipo: "Inclusión y discapacidad",
        descripcion: "Coordina ajustes razonables, inserción laboral y prácticas.",
        canal: "aprendizaje.uc.cl/piane-uc/ · Teléfono +56 9 5504 7655."
      },
      {
        nombre: "PACE UC",
        tipo: "Acompañamiento integral",
        descripcion: "Líneas de apoyo al estudio y nivelación.",
        canal: "aprendizaje.uc.cl/pace-uc/"
      },
      {
        nombre: "Programa de Nivelación",
        tipo: "Nivelación básica",
        descripcion: "Nivelación en Lenguaje, Matemática e Inglés, más talleres de habilidades.",
        canal: "Dirección de Aprendizaje y Acompañamiento Académico."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Apoyo en Salud Mental UC",
        descripcion: "Servicios de psicólogos y psiquiatras para estudiantes.",
        procedimiento: "Acceso directo a través de DAE – Salud y Bienestar."
      },
      {
        nombre: "Bienestar Físico y Programa de Alimentación",
        descripcion: "Talleres de yoga, meditación, nutrición, autocuidado y alimentación.",
        procedimiento: "DAE – Salud y Bienestar."
      },
      {
        nombre: "Línea de Emergencias UC",
        descripcion: "Línea de atención de emergencias universitarias 24/7.",
        procedimiento: "Teléfono de emergencias: 9 5504 5000."
      },
      {
        nombre: "Atención por Violencia Sexual",
        descripcion: "Canal de atención para casos de violencia sexual.",
        procedimiento: "Teléfono directo: 9 5504 5614."
      }
    ],
    contactos_dae: {
      sede_principal: "Casa Central, Patio de la Virgen, piso 1, Santiago",
      telefono_dae: "+56 2 2550 42774",
      bienestar: "Salud y Bienestar, Campus San Joaquín, Hall Universitario, piso 3 · Tel: +56 2 2550 45700",
      emergencias: "9 5504 5000 / Violencia sexual: 9 5504 5614"
    }
  },
  {
    id: "uchile",
    nombre: "Universidad de Chile",
    alias: ["U. de Chile", "UChile", "Universidad de Chile"],
    categoria: "Universidad",
    tipo: "Estatal (CRUCH)",
    becas_economicas: [
      {
        nombre: "Beca Universitaria (BUCH)",
        descripcion: "Beca de arancel para primer año con mérito académico y situación socioeconómica.",
        cobertura: "100 becas disponibles.",
        requisitos: "RSH ≤ 90%, NEM ≥ 6,0, Ranking ≥ 6,0, PAES Lectora ≥ 700, PFIE máx (650 pts).",
        proceso: "Postulación del 21 de septiembre al 30 de octubre vía web. Renovación 70% ramos aprobados (50% en primer año) y promedio ≥ 6,0."
      },
      {
        nombre: "Beca Avanzada (BAB)",
        descripcion: "Beca para estudiantes con altas capacidades demostradas en enseñanza media.",
        cobertura: "10 becas (5 mujeres, 5 hombres).",
        requisitos: "Prueba DTE ≥ 130 pts, promedio ≥ 6,0 en 4° medio y evaluación socioeconómica.",
        proceso: "Postulación del 4 al 28 de enero vía web."
      },
      {
        nombre: "Beca de Alimentación (BAE)",
        descripcion: "Cubre gastos de alimentación de estudiantes vulnerables.",
        cobertura: "Montos mensuales de $30.000, $57.000, $70.000 o $82.000 en 8 cuotas de marzo a octubre.",
        requisitos: "Scoring ≥ 40 puntos en Ficha Socioeconómica. Renovación 70% ramos con prom ≥ 6,0.",
        proceso: "Nuevos del 13 oct al 15 dic; renovación 19 al 28 de enero."
      },
      {
        nombre: "Beca de Emergencia",
        descripcion: "Para situaciones de emergencia imprevistas (fallecimiento, enfermedad, catástrofe, violencia).",
        cobertura: "No disponible en fuente oficial.",
        requisitos: "Fallecimiento apoderado, enfermedad grave, catástrofe, violencia intrafamiliar o de género.",
        proceso: "Durante el año hasta el 1 de diciembre (una vez al año)."
      },
      {
        nombre: "Programa Residencia Universitaria (Beca de Residencia y BRI)",
        descripcion: "Vivienda estudiantil y becas de responsabilidad residencial.",
        cobertura: "1ª etapa 33 vacantes (ampliable a 50). BRI: 100 becas de $160.000 o $120.000 mensuales.",
        requisitos: "Estudiante regular de la U. de Chile y evaluación socioeconómica.",
        proceso: "1ª etapa 20 al 22 de enero en línea."
      },
      {
        nombre: "Programa Corresponsabilidad Parental",
        descripcion: "Apoyo de arancel para padres y madres estudiantes.",
        cobertura: "Hasta 30% del arancel.",
        requisitos: "RSH ≤ 70%, ser padre o madre estudiante.",
        proceso: "Convocatoria anual."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Programa de Inducción a la Vida Universitaria",
        tipo: "Inducción y diagnóstico",
        descripcion: "Curso online, diagnósticos en Lenguaje, Matemática e Inglés y acompañamiento en 1er semestre.",
        canal: "uchile.cl/induccion · Mesa de Ayuda DIRBDE (ayudadirbde.uchile.cl)."
      },
      {
        nombre: "PACE Universidad de Chile",
        tipo: "Acompañamiento y nivelación",
        descripcion: "Nivelación, fortalecimiento y acompañamiento académico presencial y virtual.",
        canal: "uchile.cl/u113833"
      },
      {
        nombre: "Mesa de Ayuda DIRBDE",
        tipo: "Soporte administrativo y académico",
        descripcion: "Resolución de consultas académicas y de bienestar.",
        canal: "ayudadirbde.uchile.cl"
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Unidades de Bienestar y Asistentes Sociales por Facultad",
        descripcion: "Red en cada sede y facultad para atención socioeconómica, emocional y de crisis.",
        procedimiento: "Agendar hora previa en la facultad respectiva; uchile.cl/u5075."
      },
      {
        nombre: "FOCES – Fondo de Becas y Ayudas Sociales",
        descripcion: "Fondo institucional para becas y contingencias.",
        procedimiento: "foces.uchile.cl"
      }
    ],
    contactos_dae: {
      sede_principal: "DIRBDE — ayudadirbde.uchile.cl",
      portal_beneficios: "consultabeneficios.uchile.cl",
      portal_becas: "uchile.cl/u5076",
      bienestar: "uchile.cl/u5075"
    }
  },
  {
    id: "usach",
    nombre: "Universidad de Santiago de Chile",
    alias: ["USACH", "U. de Santiago"],
    categoria: "Universidad",
    tipo: "Estatal (CRUCH), adscrita a Gratuidad",
    becas_economicas: [
      {
        nombre: "Gratuidad y Becas Estatales USACH",
        descripcion: "Acepta 100% de becas estatales y gratuidad universitaria.",
        cobertura: "100% o parcial según beneficio ministerial.",
        requisitos: "FUAS oficial del Mineduc.",
        proceso: "Gestión ante Asistente Social de la facultad."
      },
      {
        nombre: "Beca de Alimentación USACH",
        descripcion: "Beneficio alimentario para quienes no accedieron a la BAES.",
        cobertura: "Almuerzo diario en casino central de la Escuela de Artes y Oficios (EAO).",
        requisitos: "Primer semestre aprobado, situación socioeconómica desfavorable y rendimiento.",
        proceso: "Al comienzo de cada semestre vía Instagram @dbeusach."
      },
      {
        nombre: "Becas en Dinero USACH",
        descripcion: "Aporte económico mensual de libre disposición.",
        cobertura: "$35.000 mensuales.",
        requisitos: "Primer semestre aprobado, acreditar situación socioeconómica y notas.",
        proceso: "Postulación al inicio de semestre."
      },
      {
        nombre: "Beca de Residencia USACH",
        descripcion: "Aporte mensual de arriendo para estudiantes de regiones.",
        cobertura: "$150.000 mensuales más almuerzo en el casino EAO.",
        requisitos: "Provenir de región (informe social municipal), primer semestre aprobado.",
        proceso: "Al inicio de cada semestre."
      },
      {
        nombre: "Beca de Trabajo USACH",
        descripcion: "Trabajo en unidades internas compatible con estudios.",
        cobertura: "Hasta 60 hrs/mes por 4 meses; máximo $150.000 mensuales.",
        requisitos: "Primer semestre aprobado y situación socioeconómica.",
        proceso: "Al inicio de cada semestre."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "PAIEP (Programa de Acceso e Inclusión)",
        tipo: "Tutorías y nivelación",
        descripcion: "Tutorías entre pares y con estudiante sénior, nivelación en ciencias y lenguaje.",
        canal: "admision.usach.cl/paiep · paiep.usach.cl"
      },
      {
        nombre: "Programa de Nivelación VRAE",
        tipo: "Nivelación matemática y lenguaje",
        descripcion: "Clases de Lenguaje, Matemática e Inglés para novatos.",
        canal: "admision.usach.cl"
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Unidad de Promoción del Bienestar Psicológico Estudiantil (BPE)",
        descripcion: "Talleres y contención de bienestar psicológico.",
        procedimiento: "Instagram @vidasaludableusach."
      },
      {
        nombre: "Asistentes Sociales por Facultad USACH",
        descripcion: "Acompañamiento socioeconómico y de crisis.",
        procedimiento: "vrae.usach.cl/asistentes-sociales/"
      }
    ],
    contactos_dae: {
      sede_principal: "VRAE (Vicerrectoría de Apoyo Estudiantil) — vrae.usach.cl",
      correo: "vrae@usach.cl",
      beneficios: "Instagram @dbeusach",
      creditos: "inger.vega@usach.cl (FSCU) · andrea.arenas@usach.cl (CAE) · nelson.lillo@usach.cl (TNE)"
    }
  },
  {
    id: "usm",
    nombre: "Universidad Técnica Federico Santa María",
    alias: ["USM", "Santa María", "UTFSM"],
    categoria: "Universidad",
    tipo: "Privada (CRUCH)",
    becas_economicas: [
      {
        nombre: "Beca de Alimentación USM",
        descripcion: "Beca de alimentación interna para quienes no tienen BAES.",
        cobertura: "Servicio de alimentación.",
        requisitos: "Primeros deciles (vulnerabilidad ≥ 60%) sin subsidio BAES.",
        proceso: "Declaración DAS en sireb.usm.cl (apertura en dic-marzo)."
      },
      {
        nombre: "Beca de Residencia USM",
        descripcion: "Alojamiento y traslado para estudiantes vulnerables.",
        cobertura: "Gastos de hospedaje y traslado.",
        requisitos: "Postulación anual vía sireb.usm.cl con acreditación socioeconómica.",
        proceso: "Proceso anual vía plataforma SIREB."
      },
      {
        nombre: "Beca de Mantención Federico Santa María",
        descripcion: "Beca de mantención institucional.",
        cobertura: "Aporte de mantención mensual entregado entre abril y diciembre.",
        requisitos: "Pregrado diurno con gratuidad vigente.",
        proceso: "Entrega automática tras validación de matrícula."
      },
      {
        nombre: "Beca para Estudiantes Padres y Madres USM",
        descripcion: "Beneficio para estudiantes con hijos a su cuidado.",
        cobertura: "Apoyo financiero.",
        requisitos: "Padre o madre de menores o hijos con necesidades educativas especiales.",
        proceso: "Proceso anual vía sireb.usm.cl."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Programa Punto de Encuentro",
        tipo: "Convivencia y autocuidado",
        descripcion: "Cinco ámbitos: Alimentación Saludable, Integración, Reducción de riesgos, Sexualidad e Inteligencia Emocional.",
        canal: "Dirección de Relaciones Estudiantiles (rree.usm.cl)."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Atención Clínica y Red de Apoyo en Salud Mental USM",
        descripcion: "Atención psicológica y prevención en crisis.",
        procedimiento: "Contacto con RREE en cada sede."
      }
    ],
    contactos_dae: {
      sede_san_joaquin: "Av. Vicuña Mackenna 3939, Santiago · Tel: +56 2 2303 7070 · rree.cssj@usm.cl",
      sede_vitacura: "Av. Santa María 6400 · Tel: +56 2 3202 8070 · rree.csv@usm.cl",
      portal: "sireb.usm.cl"
    }
  },
  {
    id: "uah",
    nombre: "Universidad Alberto Hurtado",
    alias: ["UAH", "Alberto Hurtado"],
    categoria: "Universidad",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Cobertura de Escolaridad (Fallecimiento/Invalidez)",
        descripcion: "Cobertura de arancel por fallecimiento o invalidez total del sostenedor.",
        cobertura: "100% del arancel hasta concluir la carrera.",
        requisitos: "Fallecimiento o invalidez total del sostenedor económico.",
        proceso: "Informar a la DAE con certificados médicos o de defunción."
      },
      {
        nombre: "Beca de Alimentación UAH",
        descripcion: "Apoyo para costos de alimentación.",
        cobertura: "Según convenio con el establecimiento.",
        requisitos: "Estudiantes regulares vulnerables.",
        proceso: "Sin fecha específica en fuente oficial; información en DAE."
      },
      {
        nombre: "Beca de Transporte UAH",
        descripcion: "Apoyo para gastos de traslado.",
        cobertura: "Costos de transporte.",
        requisitos: "Pertenencia a quintiles de menores ingresos.",
        proceso: "Información ante la DAE."
      },
      {
        nombre: "Fondos y Descuentos de Emergencia DAE",
        descripcion: "Canal de fondos y beneficios económicos de emergencia ante crisis.",
        cobertura: "Evaluación según caso.",
        requisitos: "Contingencia grave socioeconómica.",
        proceso: "beneficiosdae@uahurtado.cl · Teléfono (56-2) 2889 7165."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Trayectorias y Consejerías Psicoeducativas",
        tipo: "Acompañamiento y psicoeducación",
        descripcion: "Mentorías y orientación en estrategias de estudio y adaptación universitaria.",
        canal: "trayectorias@uahurtado.cl"
      },
      {
        nombre: "Tutores y Tutoras Pares UAH",
        tipo: "Tutorías entre estudiantes",
        descripcion: "Red de estudiantes de cursos superiores para apoyo académico y social.",
        canal: "Coordinación vía DAE."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Salud Mental y Convivencia UAH (Primeros Auxilios Psicológicos)",
        descripcion: "Atención psicológica de urgencia y primeros auxilios psicológicos.",
        procedimiento: "Cienfuegos #27, 2° piso (lunes a viernes 9:00 a 18:00) · Teléfono de atención inmediata: 9 7899 0212 · saludmentaldae@uahurtado.cl."
      },
      {
        nombre: "Espacio de Acogida y Convivencia",
        descripcion: "Atención y acompañamiento en situaciones de convivencia.",
        procedimiento: "acogidaconvivencia@uahurtado.cl · Teléfono: +56 9 2383 4365."
      }
    ],
    contactos_dae: {
      sede_principal: "Casa de Estudiantes, oficina 105 (Av. Bernardo O'Higgins 1825)",
      correo: "beneficiosdae@uahurtado.cl · tnecredencialuah@uahurtado.cl",
      telefono: "+56 2 2889 7165",
      urgencia_salud_mental: "9 7899 0212 (Cienfuegos #27)"
    }
  },
  {
    id: "udp",
    nombre: "Universidad Diego Portales",
    alias: ["UDP", "Diego Portales"],
    categoria: "Universidad",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beca de Mantención Diego Portales",
        descripcion: "Aporte mensual en dinero para gastos derivados del estudio.",
        cobertura: "Monto mensual definido anualmente por resolución.",
        requisitos: "Acreditar situación económica insuficiente durante el período académico. Se postula anualmente.",
        proceso: "Postulación anual ante Bienestar Estudiantil (DAE UDP)."
      },
      {
        nombre: "Beca de Cesantía para Estudiantes Vespertinos/as",
        descripcion: "Apoyo a trabajadores dependientes en cesantía involuntaria.",
        cobertura: "Hasta 6 mensualidades consecutivas de arancel (no incluye matrícula).",
        requisitos: "Alumno regular de carrera vespertina con cesantía involuntaria acreditada.",
        proceso: "Departamento de Bienestar Estudiantil (DAE UDP)."
      },
      {
        nombre: "Arancel Regulado UDP",
        descripcion: "Arancel diferenciado para estudiantes que no califican a Gratuidad.",
        cobertura: "Arancel diferenciado según RSH.",
        requisitos: "Certificado RSH a nombre del estudiante emitido desde septiembre previo.",
        proceso: "Formulario de solicitud con cierre en diciembre."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Consejería Social (Bienestar Estudiantil)",
        tipo: "Acompañamiento socioeconómico",
        descripcion: "Espacio dialógico para contingencias socioeconómicas o familiares que afectan el estudio.",
        canal: "agendaelectronica.udp.cl/bienestar-estudiantil/"
      },
      {
        nombre: "Programa de Acompañamiento para Estudiantes con Hijos/as (PAEH)",
        tipo: "Apoyo a madres y padres",
        descripcion: "Compatibilidad de ramos, reasignación de vacantes y justificación de inasistencias por enfermedad de hijos.",
        canal: "Formulario en estudiantes.udp.cl · correo Bienestar Estudiantil."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Atención en Salud Mental y Contención en Crisis UDP",
        descripcion: "Consejerías individuales breves, talleres, protocolo de urgencias y contención en crisis.",
        procedimiento: "dae.udp.cl/salud-mental-estudiantil/protocolo-de-accion-en-salud-mental/"
      },
      {
        nombre: "Salas de Lactancia y Mudadores UDP",
        descripcion: "4 salas equipadas (República 105, Manuel Rodríguez Sur 253, Vergara 275, Ciudad Empresarial Santa Clara 797).",
        procedimiento: "Solicitar llave en recepción de cada edificio."
      }
    ],
    contactos_dae: {
      sede_principal: "Manuel Rodríguez Sur 343, Santiago",
      telefono: "+56 2 2676 8314",
      portal: "dae.udp.cl · agendaelectronica.udp.cl/bienestar-estudiantil/"
    }
  },
  {
    id: "unab",
    nombre: "Universidad Andrés Bello",
    alias: ["UNAB", "Andrés Bello"],
    categoria: "Universidad",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beca Apoyo Familiar (fallecimiento del sostenedor)",
        descripcion: "Cubre arancel ante fallecimiento del sostenedor económico declarado en contrato.",
        cobertura: "Hasta 100% del copago (tope: 2 aranceles de referencia) y 100% matrícula por duración formal.",
        requisitos: "Certificado de defunción del sostenedor. Aprobación ≥ 60% en 1º año y ≥ 70% desde 2º año.",
        proceso: "Solicitud dentro de 30 días corridos desde el fallecimiento vía plataforma Gestiona tu Caso."
      },
      {
        nombre: "Beca Endowment Apoyo Estudiantil UNAB",
        descripcion: "Aporte del fondo patrimonial para mantención ante vulnerabilidad económica.",
        cobertura: "Aporte económico de mantención.",
        requisitos: "Vulnerabilidad socioeconómica y falta de otras fuentes de financiamiento.",
        proceso: "Convocatoria anual en endowment.unab.cl/becas/"
      },
      {
        nombre: "Apoyo por Motivos Excepcionales (Comité de Crédito)",
        descripcion: "Ayuda económica de emergencia ante catástrofe, enfermedad familiar o cesantía.",
        cobertura: "Rebaja o renegociación de copago.",
        requisitos: "Carta explicativa y respaldos en plataforma Gestiona tu Caso.",
        proceso: "Plataforma Gestiona tu Caso."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Centro Integral de Acompañamiento (CIADE)",
        tipo: "Mentoría y apoyo académico",
        descripcion: "Mentoría, ciencias básicas, tutoría de pares, apoyo psicoeducativo y vocacional.",
        canal: "unab.cl/servicioestudiante · WhatsApp +56 9 4706 9917 · Mesa de Ayuda 600 220 3333."
      },
      {
        nombre: "Dirección General de Desarrollo Estudiantil (DGDE)",
        tipo: "Apoyo extracurricular e inclusión",
        descripcion: "Apoyo a estudiantes con hijos, estudiantes de regiones y admisión especial por discapacidad.",
        canal: "unab.cl/servicioestudiante"
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Orientación Psicológica Virtual UNAB",
        descripcion: "Apoyo en bienestar emocional y salud mental virtual.",
        procedimiento: "Solicitud vía Servicio al Estudiante / DGDE."
      },
      {
        nombre: "Unidades de Primeros Auxilios (UPA) y Clínicas Dentales",
        descripcion: "Atención de primeros auxilios en campus y clínicas odontológicas accesibles.",
        procedimiento: "Atención directa en cada campus."
      }
    ],
    contactos_dae: {
      servicio_estudiante: "WhatsApp +56 9 4706 9917 · Mesa Central 600 220 3333",
      admision: "600 228 6262 · admision@unab.cl",
      portal: "unab.cl/servicioestudiante · financiamiento.unab.cl"
    }
  },
  {
    id: "umayor",
    nombre: "Universidad Mayor",
    alias: ["U. Mayor", "Mayor", "Umayor"],
    categoria: "Universidad",
    tipo: "Privada, adscrita a Gratuidad",
    becas_economicas: [
      {
        nombre: "Beca de Matrícula NEM U. Mayor",
        descripcion: "Cubre matrícula de primer año para egresados destacados.",
        cobertura: "100% de la matrícula de 1er año (excluye Medicina y Animación Digital).",
        requisitos: "NEM ≥ 6,0, postulación a FUAS, sin gratuidad.",
        proceso: "Asignación al ingreso."
      },
      {
        nombre: "Beca Cobertura por Fallecimiento o Invalidez del Sostenedor",
        descripcion: "Protección financiera interna ante pérdida del sostenedor económico.",
        cobertura: "Rebaja o exención de arancel.",
        requisitos: "Documentación médica o de defunción ante el Dpto. de Becas.",
        proceso: "becasycreditos@umayor.cl"
      },
      {
        nombre: "Orientación Previo Abandono por Motivos Económicos",
        descripcion: "Procedimiento de renegociación y apoyo financiero para evitar la deserción.",
        cobertura: "Reestructuración y becas de mantención.",
        requisitos: "Estudiantes con riesgo de abandonar por razones económicas.",
        proceso: "Servicios Estudiantiles / Dpto. de Becas y Cobranzas."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Dirección de Acompañamiento y Convivencia Estudiantil",
        tipo: "Orientación y psicopedagogía",
        descripcion: "Atención por coordinadores de campus (Manuel Montt, Huechuraba, El Claustro, Online).",
        canal: "Acompanamiento.psp@umayor.cl (psicopedagogía) · Acompanamiento.to@umayor.cl (terapia ocupacional)."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Dirección de Salud Mental Estudiantil (Hora de Atención Inicial - HAI)",
        descripcion: "Psicoterapia breve presencial o videollamada, intervención en crisis y orientación.",
        procedimiento: "Sede Santiago: apoyopsicologico@umayor.cl · WhatsApp +56 9 6207 5317 (09:30 a 18:00, Campus Manuel Montt)."
      }
    ],
    contactos_dae: {
      sede_principal: "Av. Manuel Montt 367, Providencia, Santiago",
      telefonos: "600 328 1000 / 22 328 1000 / +56 2 2371 3300",
      correo_becas: "becasycreditos@umayor.cl",
      salud_mental: "WhatsApp +56 9 6207 5317 · apoyopsicologico@umayor.cl"
    }
  },
  {
    id: "uss",
    nombre: "Universidad San Sebastián",
    alias: ["USS", "San Sebastián"],
    categoria: "Universidad",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beneficio de Escolaridad por Fallecimiento del Sostenedor",
        descripcion: "Financia matrícula y arancel si fallece el sostenedor firmante del contrato.",
        cobertura: "100% del copago de matrícula y arancel hasta el término de la carrera.",
        requisitos: "Sostenedor < 65 años al firmar y < 72 años al fallecer. Solicitud dentro de 30 días con declaración médica.",
        proceso: "Formulario de siniestro con DAE USS; obligaciones financieras al día."
      },
      {
        nombre: "Beca Talento Líder USS",
        descripcion: "Descuento por participación en voluntariados, liderazgo o acción social.",
        cobertura: "Hasta 20% del arancel tras becas estatales.",
        requisitos: "Certificados de liderazgo y compromiso con voluntariados DGDE.",
        proceso: "Formulario en línea vía Becas DGDE."
      },
      {
        nombre: "Beca Familiar USS",
        descripcion: "Descuento para integrantes de un grupo familiar matriculados en el mismo año.",
        cobertura: "10% de descuento en arancel anual para cada integrante.",
        requisitos: "Acreditar parentesco con certificado de nacimiento/matrimonio.",
        proceso: "Al momento de la matrícula."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "CREAR 2.0 USS",
        tipo: "Acompañamiento y nivelación",
        descripcion: "Identifica características académicas y activa estrategias de nivelación y tutorías.",
        canal: "Portal del Estudiante — uss.cl/portal-del-estudiante/crear-20"
      },
      {
        nombre: "Programas de Bienestar e Inclusión (Padres y Cuidadores)",
        tipo: "Conciliación y salud mental",
        descripcion: "Flexibilidad en asistencia y evaluaciones para estudiantes padres, madres y cuidadores.",
        canal: "desarrolloestudiantil.uss.cl/bienestar-estudiantil/"
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Promotores de Salud Mental y Talleres Preventivos",
        descripcion: "Evaluaciones nutricionales, talleres de autocuidado y atención preventiva.",
        procedimiento: "desarrolloestudiantil.uss.cl/bienestar-estudiantil/"
      },
      {
        nombre: "Guía de Residencias Universitarias USS",
        descripcion: "Orientación de residencias con conectividad de transporte para estudiantes de regiones.",
        procedimiento: "Disponible en portal de Desarrollo Estudiantil."
      }
    ],
    contactos_dae: {
      call_center: "600 771 3000 · WhatsApp +56 9 4270 1148",
      correo: "callcenter@uss.cl",
      portal: "desarrolloestudiantil.uss.cl/bienestar-estudiantil/"
    }
  },
  {
    id: "udla",
    nombre: "Universidad de Las Américas",
    alias: ["UDLA", "Las Américas"],
    categoria: "Universidad",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beca Extraordinaria por Fallecimiento del Tutor Económico",
        descripcion: "Condonación del copago del año por deceso del tutor financiero.",
        cobertura: "Condonación del 100% del copago del año.",
        requisitos: "Postular dentro de 60 días desde el fallecimiento. PAA ≥ 80% para renovación.",
        proceso: "Aprobación de Rectoría mediante SIAE en MiUDLA."
      },
      {
        nombre: "Beca Apoyo Progresión y Beca Familiares UDLA",
        descripcion: "Descuentos de arancel internos por continuidad o familiares.",
        cobertura: "Descuento en arancel según condiciones generales (PAA ≥ 70%).",
        requisitos: "Progreso académico y compromisos al día.",
        proceso: "Plataforma MiUDLA / SIAE."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Plan de Acompañamiento Académico y Tutorías",
        tipo: "Tutoría y nivelación",
        descripcion: "Nivelación, tutorías de pares, mentorías y apoyo en asignaturas críticas desde diagnóstico inicial.",
        canal: "SIAE (Servicio de Información y Apoyo al Estudiante) en MiUDLA."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Bienestar Estudiantil SIAE (Orientación Psicológica y Social)",
        descripcion: "Orientación psicológica gratuita, trabajador social y orientación de asuntos estudiantiles en todos los campus.",
        procedimiento: "Formularios en plataforma MiUDLA."
      }
    ],
    contactos_dae: {
      telefono_nacional: "800 240 100 · Internacional: +56 2 22 531 999",
      admision: "800 242 800 · +56 2 22 531 888",
      portal: "MiUDLA / SIAE en todos los campus de la RM"
    }
  },
  {
    id: "ust",
    nombre: "Universidad Santo Tomás",
    alias: ["UST", "Santo Tomás", "Santo Tomás Santiago", "Universidad Santo Tomás"],
    categoria: "Universidad",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beca Matrícula UST",
        descripcion: "Cubre matrícula de primer año para alumnos nuevos con FUAS.",
        cobertura: "100% de la matrícula de primer año.",
        requisitos: "Alumnos nuevos con postulación FUAS (excluye modalidad online).",
        proceso: "Entrega hasta el 31 de marzo con postulación FUAS."
      },
      {
        nombre: "Beca Mujeres en Carreras STEM UST",
        descripcion: "Beca para mujeres ingresantes a carreras STEM.",
        cobertura: "Entre 20% y 50% del arancel más matrícula.",
        requisitos: "Mejores promedios NEM en carreras STEM (cupos limitados).",
        proceso: "Dirección Nacional de Admisión."
      },
      {
        nombre: "Regla de Compatibilidad Interna Santo Tomás",
        descripcion: "Las becas internas no son acumulables; se opta por la de mayor beneficio final.",
        cobertura: "Mayor porcentaje aplicable.",
        requisitos: "Cumplimiento de requisitos del beneficio elegido.",
        proceso: "Elección al momento de la postulación."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Programa de Bienestar y Salud Mental Dra. Graciela Rozas",
        tipo: "Acompañamiento psicosocial y autocuidado",
        descripcion: "Coordinado entre DAE, Facultad de Ciencias Sociales y Dirección de Formación e Identidad.",
        canal: "DAE por sede."
      },
      {
        nombre: "Talleres DAE Santo Tomás",
        tipo: "Talleres de vida estudiantil",
        descripcion: "Agenda de habilidades de estudio y vida universitaria.",
        canal: "DAE por sede."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Mindfulness y Apoyo Espiritual UST",
        descripcion: "Espacios de autocuidado y mindfulness.",
        procedimiento: "Agenda en la DAE de la sede respectiva."
      },
      {
        nombre: "Seguro de Salud Estudiantil UST",
        descripcion: "Protección por accidentes que causen incapacidad o muerte.",
        procedimiento: "Información y activación en DAE."
      }
    ],
    contactos_dae: {
      atencion_presencial: "Atención presencial en DAE por sede",
      whatsapp: "+56 2 2840 2243",
      mesa_central: "+56 2 2988 0561",
      financiamiento: "DAFA (Dirección de Administración de Financiamiento Académico)"
    }
  },
  {
    id: "uautonoma",
    nombre: "Universidad Autónoma de Chile",
    alias: ["U. Autónoma", "Autónoma"],
    categoria: "Universidad",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beca Matrícula Gratis U. Autónoma",
        descripcion: "100% matrícula de primer año por puntaje PAES.",
        cobertura: "100% matrícula primer año.",
        requisitos: "Puntaje PAES mínimo por carrera (ej. Medicina 935; Comercial/Derecho 650) y 10% superior del colegio.",
        proceso: "Asignación automática en admisión."
      },
      {
        nombre: "Beca Tecnológica U. Autónoma",
        descripcion: "Entrega de computador portátil al estudiante ingresante.",
        cobertura: "Computador portátil.",
        requisitos: "Puntaje PAES mínimo según sede (Providencia 750, Pedagogías 650).",
        proceso: "Proceso de admisión."
      },
      {
        nombre: "Beca Hermanos U. Autónoma",
        descripcion: "Descuento por tener hermanos matriculados.",
        cobertura: "10% del arancel por cada hermano.",
        requisitos: "Hermano matriculado activo y calidad de estudiante regular.",
        proceso: "Postulación anual en línea."
      },
      {
        nombre: "Beca Pedagógica U. Autónoma",
        descripcion: "Aporte mensual de alimentación o transporte durante primer año.",
        cobertura: "Aporte mensual de mantención.",
        requisitos: "Aprobar toda la carga académica del 1er año.",
        proceso: "Proceso de admisión."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "SAI (Servicio de Apoyo e Inclusión) y LideraUA",
        tipo: "Inclusión y liderazgo",
        descripcion: "Apoyo a la diversidad e inclusión estudiantil y talleres de liderazgo.",
        canal: "Dirección de Desarrollo Estudiantil (uautonoma.cl/direccion-desarrollo-estudiantil/)."
      },
      {
        nombre: "Asistente Social por Sede Autónoma",
        tipo: "Atención individual",
        descripcion: "Acompañamiento socioeconómico presencial por sede.",
        canal: "Solicitar hora en módulo de atención de la sede."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Beneficio para Estudiantes Cuidadores",
        descripcion: "Medidas de apoyo y adaptación para estudiantes con tareas de cuidado familiar.",
        procedimiento: "Información en Desarrollo Estudiantil."
      },
      {
        nombre: "Programa Entorno Seguro",
        descripcion: "Seguridad y convivencia en los campus universitarios.",
        procedimiento: "Desarrollo Estudiantil."
      }
    ],
    contactos_dae: {
      portal: "uautonoma.cl/direccion-desarrollo-estudiantil/",
      sede_providencia: "Av. Pedro de Valdivia 425 / 641, Providencia",
      sede_el_llano: "Ricardo Morales 3369, San Miguel",
      nota: "Atención presencial en oficinas DAE de cada sede (la web no expone correos directos)."
    }
  },
  {
    id: "ucentral",
    nombre: "Universidad Central de Chile",
    alias: ["Universidad Central", "U. Central", "UCEN"],
    categoria: "Universidad",
    tipo: "Privada, adscrita a Gratuidad",
    becas_economicas: [
      {
        nombre: "Beca de Emergencia Social UCEN",
        descripcion: "Ayuda para estudiantes afectados por cesantía, catástrofe, deudas de salud o quiebra familiar.",
        cobertura: "Postulación anual ante DAVE; exenta de requisito de tener cursado primer año.",
        requisitos: "Causal grave acreditada (cesantía, catástrofe, enfermedad grave).",
        proceso: "Evaluación ante Dirección de Apoyo y Vida Estudiantil (DAVE) en www.ucentral.cl/postulacion-becas/"
      },
      {
        nombre: "Beca de Fallecimiento Sostenedor/a UCEN",
        descripcion: "Exención de arancel por muerte del sostenedor económico.",
        cobertura: "Hasta 100% del arancel anual.",
        requisitos: "Fallecimiento con menoscabo económico acreditado; sin requisito de 1er año cursado.",
        proceso: "www.ucentral.cl/postulacion-becas/"
      },
      {
        nombre: "Beca de Fotocopias y Alimentos UCEN",
        descripcion: "Apoyos de material y alimentación para estudiantes sin BAES.",
        cobertura: "Fotocopias y alimentación mensual.",
        requisitos: "Problemas socioeconómicos acreditados; tener cursado 1er año.",
        proceso: "Postulación anual ante DAVE."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Plan Salud Mental y Convivencia Estudiantil DAVE",
        tipo: "Salud mental y talleres",
        descripcion: "Talleres de mindfulness, manejo de ansiedad y primeros auxilios psicológicos.",
        canal: "ucentral.cl/estudiantes/dave/"
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Convenio de Accidentes Traumáticos U. Central – Clínica Dávila",
        descripcion: "Protección 24/7 con tope de $14.000.000 para lesiones sin preexistencia; urgencia y hospitalización sin costo en Recoleta 464, más 4 consultas de especialidad sin costo y 65% dcto dental en Vida Integra.",
        procedimiento: "Acudir dentro de 48 hrs a Urgencia Clínica Dávila (Recoleta 464) con cédula. Teléfonos Clínica: 22 730 8367 / 22 730 8721. Reembolsos en 30 días."
      },
      {
        nombre: "Unidad de Apoyo Psicológico y Emocional (UAPE)",
        descripcion: "Atención psicológica y contención emocional para estudiantes.",
        procedimiento: "ucentral.cl/estudiantes/atencion-psicologica/"
      }
    ],
    contactos_dae: {
      sede_santiago: "Edificio Gonzalo Hernández Uribe (GHU), Torre A, piso 1 (Lord Cochrane / Toesca)",
      mesa_central: "+56 2 2582 6000 (Toesca 1783)",
      clinica_davila: "Convenio urgencias: 22 730 8367 / 22 730 8721",
      portal: "ucentral.cl/estudiantes/dave/ · www.ucentral.cl/postulacion-becas/"
    }
  },
  {
    id: "ugm",
    nombre: "Universidad Gabriela Mistral",
    alias: ["UGM", "Gabriela Mistral"],
    categoria: "Universidad",
    tipo: "Privada, adscrita a Gratuidad",
    becas_economicas: [
      {
        nombre: "Beca Socioeconómica UGM",
        descripcion: "Beca interna para estudiantes con problemas socioeconómicos (UFE).",
        cobertura: "Hasta 50% de descuento en arancel anual.",
        requisitos: "Primeros 8 deciles internos UFE, NEM ≥ 5,0 (1er año) o avance 70% con prom ≥ 4,5.",
        proceso: "Formulario online y documentos en estudiante.ugm.cl."
      },
      {
        nombre: "Beca de Alimentación UGM",
        descripcion: "Aporte semestral para estudiantes desde 2º año sin beneficios de mantención Junaeb.",
        cobertura: "$30.000 mensuales (marzo-julio y agosto-diciembre).",
        requisitos: "RSH ≤ 60%, avance > 70%, nota final ≥ 4,5, asistencia ≥ 85%, entrevista social online.",
        proceso: "Postulación en marzo y agosto en estudiante.ugm.cl."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Sistema de Acompañamiento Integral (SAI)",
        tipo: "Acompañamiento integral",
        descripcion: "Dimensiones académica, psicológica, socioafectiva y vocacional con tutores pares y derivación individual.",
        canal: "ugm.cl/direccion-de-desarrollo-estudiantil/sistema-de-acompanamiento-integral-sai"
      },
      {
        nombre: "Tutorías Pares UGM",
        tipo: "Apoyo de inserción",
        descripcion: "Estudiantes de cursos superiores apoyan en inserción y organización del tiempo.",
        canal: "Invitación automática por correo institucional y actividades de bienvenida."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Atención de Asistentes Sociales por Escuela (UFE)",
        descripcion: "Orientación, evaluación socioeconómica y seguimiento de contingencias.",
        procedimiento: "ufe@ugm.cl · Fono/WhatsApp: +56 9 7621 6063 / +56 9 9277 9677 / +56 9 8586 1705."
      }
    ],
    contactos_dae: {
      sede_principal: "Av. Andrés Bello 1337, Providencia, Santiago",
      correo: "ufe@ugm.cl",
      whatsapp_asistentes: "+56 9 7621 6063 / +56 9 9277 9677 / +56 9 8586 1705",
      asistentes_sociales: "Elizabeth Correa (Salud/Derecho) · Yessenia Leyton (Ingeniería/Negocios) · Ximena Blasco (Psicología/Social)",
      horario: "Lunes a jueves 8:15–18:15, viernes 8:15–16:00"
    }
  },
  {
    id: "duoc",
    nombre: "Duoc UC",
    alias: ["Duoc", "Duoc UC San Joaquín", "Duoc UC Maipú", "Duoc UC Plaza Vespucio", "Duoc UC Alameda", "Duoc UC Antonio Varas"],
    categoria: "Instituto Profesional",
    tipo: "Privada, adscrita a Gratuidad",
    becas_economicas: [
      {
        nombre: "Beca Padre o Madre Sostenedor Duoc UC",
        descripcion: "Exención total de aranceles ante fallecimiento o invalidez total y permanente del sustentador firmante del contrato.",
        cobertura: "100% de aranceles del semestre restante conforme a malla (máx 2 semestres, renovable por comisión).",
        requisitos: "Alumno regular en duración formal. Sustentador asumió calidad en contrato. Presentar certificado defunción o resolución COMPIN.",
        proceso: "Presentar antecedentes ante Subdirector Económico y de Gestión de sede o Encargado de Financiamiento."
      },
      {
        nombre: "Beca Hermano Duoc UC",
        descripcion: "Descuento para hermanos matriculados simultáneamente.",
        cobertura: "20% arancel para 2° hermano; 50% para 3° hermano o superior.",
        requisitos: "Alumno regular en duración formal con certificado de nacimiento de ambos hermanos.",
        proceso: "Postulación semestral ante Subdirector Económico de sede."
      },
      {
        nombre: "Beca Deportiva Duoc UC",
        descripcion: "Descuento por representar a selecciones deportivas institucionales o federadas.",
        cobertura: "20% del arancel para representantes Duoc; 40% si participa en federación deportiva nacional.",
        requisitos: "Representar a Duoc UC en ramas de selección o federación, notas y asistencia mínima.",
        proceso: "1er sem: 01 al 31 de mayo; 2º sem: 01 al 31 de octubre con Coordinador de Deportes de sede."
      },
      {
        nombre: "Beca Liceo Politécnico Andes",
        descripcion: "Rebaja para egresados del Liceo Politécnico Andes Fundación Duoc UC.",
        cobertura: "30% del arancel semestral durante duración formal.",
        requisitos: "Egresado del Liceo Politécnico Andes y alumno regular en duración formal.",
        proceso: "Ante Subdirector Económico de sede."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Estrategia de Apoyo a los Estudiantes y Consejería de Carrera",
        tipo: "Consejería y acompañamiento",
        descripcion: "Consejeros de carrera en cada sede para orientar progresión académica y dificultades.",
        canal: "duoc.cl/vida-estudiantil/estrategia-de-apoyo-a-los-estudiantes/"
      },
      {
        nombre: "Unidad de Apoyo y Bienestar Estudiantil",
        tipo: "Apoyo integral",
        descripcion: "Orientación para equilibrio entre vida académica, personal y emocional.",
        canal: "duoc.cl/vida-estudiantil/unidad-de-apoyo-y-bienestar-estudiantil/ · vidaestudiantil@duoc.cl"
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Línea de Apoyo Emocional 24/7 Duoc UC (OPS)",
        descripcion: "Línea telefónica de emergencia y contención psicológica gratuita disponible 24 horas, 7 días a la semana.",
        procedimiento: "Teléfono de emergencia 24/7: +56 2 2515 7007."
      },
      {
        nombre: "Programa de Apoyo a la Salud Mental y Promotores del Bienestar",
        descripcion: "Charlas, talleres y atención psicológica gratuita en convenio.",
        procedimiento: "Reserva de cita en agenda.achs.cl o vía App Vivo Duoc (sección Bienestar y Salud Mental)."
      },
      {
        nombre: "Programa de Consumo Problemático 'Tomo el Control'",
        descripcion: "Asesoría especializada y preventiva en sede para consumo de sustancias.",
        procedimiento: "Acceso a través de Unidad de Apoyo y Bienestar Estudiantil."
      }
    ],
    contactos_dae: {
      sede_principal: "Oficinas de Vida Estudiantil en cada campus (San Joaquín, Maipú, Alameda, Plaza Vespucio, etc.)",
      correo: "vidaestudiantil@duoc.cl",
      linea_emergencia_24_7: "+56 2 2515 7007 (Apoyo emocional OPS)",
      mesa_servicios: "WhatsApp +56 9 3663 9565 · Tel: +56 442 201 098 / +56 2 271 20245",
      admision: "+56 2 2999 3862 · WhatsApp +56 9 5814 2089"
    }
  },
  {
    id: "inacap",
    nombre: "Instituto Profesional y Centro de Formación Técnica de Chile (INACAP)",
    alias: ["INACAP", "INACAP Santiago Centro", "INACAP Apoquindo", "INACAP Maipú", "INACAP Renca", "INACAP Puente Alto"],
    categoria: "Instituto Profesional / CFT",
    tipo: "Privada, adscrita a Gratuidad",
    becas_economicas: [
      {
        nombre: "Beca Apoyo INACAP",
        descripcion: "Aporte monetario mensual durante el año académico.",
        cobertura: "$42.000 mensuales por 5 meses (hasta 4.500 becas).",
        requisitos: "Tener gratuidad, deciles 1 a 4, promedio ≥ 6,0 sin ramos reprobados, curso superior.",
        proceso: "Postulación desde la Intranet de estudiantes."
      },
      {
        nombre: "Beca STEM INACAP",
        descripcion: "Beca para mujeres ingresantes a carreras técnicas STEM.",
        cobertura: "50% de las colegiaturas (no incluye matrícula).",
        requisitos: "Mujeres matriculadas en una de las 20 carreras técnicas STEM elegibles.",
        proceso: "Asignación automática al matricularse."
      },
      {
        nombre: "Beca Plateada y Dorada INACAP",
        descripcion: "Becas para adultos de 50 años o más.",
        cobertura: "Plateada (50 a 59 años): 50% descuento. Dorada (≥ 60 años): 80% a 100% colegiatura.",
        requisitos: "Carreras técnicas (excepto Gastronomía y Técnico en Enfermería).",
        proceso: "Asignación automática al matricularse."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Tutorías Académicas y Clínicas de Reforzamiento INACAP",
        tipo: "Tutoría y nivelación",
        descripcion: "Acompañamiento con tutor de carrera, ayudantías y clínicas transversales en asignaturas críticas.",
        canal: "Coordinación académica de cada sede."
      },
      {
        nombre: "Apoyo en Asignaturas Críticas (Intersemestre estival)",
        tipo: "Nivelación intensiva",
        descripcion: "Ramos de alta reprobación ofrecidos en período estival para nivelar avance curricular.",
        canal: "Coordinación académica de sede."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Programa de Bienestar Estudiantil y Convenios de Salud Mental",
        descripcion: "Atención psicológica con valores preferenciales y talleres de autocuidado.",
        procedimiento: "Información en Portal del Estudiante / DAE de cada sede."
      },
      {
        nombre: "Política 'Yo cuido, yo estudio'",
        descripcion: "Medidas de flexibilización horaria y académica para estudiantes cuidadores.",
        procedimiento: "Acreditación y gestión ante la DAE de la sede."
      }
    ],
    contactos_dae: {
      sede_central: "Av. Vitacura 10.151, Santiago · Tel: 800 20 25 20 / +56 2 2579 7204 · informaciones@inacap.cl",
      encargados_financiamiento_sedes: [
        { sede: "Santiago Centro", correo: "chidalgo@inacap.cl", fono: "+56 22 472 3004" },
        { sede: "Apoquindo", correo: "kpadilla@inacap.cl", fono: "+56 22 472 2545" },
        { sede: "Maipú", correo: "nbustos@inacap.cl", fono: "+56 22 472 2254" },
        { sede: "Ñuñoa", correo: "dabarza@inacap.cl", fono: "+56 22 476 6108" },
        { sede: "Renca", correo: "dvillagrar@inacap.cl", fono: "+56 22 820 7289" },
        { sede: "Puente Alto", correo: "cpizarros@inacap.cl", fono: "+56 22 281 2302" },
        { sede: "Santiago Sur", correo: "dlorcam@inacap.cl", fono: "+56 22 652 6921" },
        { sede: "La Granja", correo: "dmunozd@inacap.cl", fono: "+56 23 339 3324" }
      ]
    }
  },
  {
    id: "aiep",
    nombre: "AIEP Instituto de Educación Superior",
    alias: ["AIEP"],
    categoria: "Instituto Profesional",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beca Reconocimiento Escolar AIEP",
        descripcion: "Beca por mérito en enseñanza media.",
        cobertura: "20% del arancel semestral.",
        requisitos: "NEM ≥ 6,5 y ≥ 85% asistencia en 4° medio. Renovación con nota ≥ 5,5 y avance ≥ 70%.",
        proceso: "Otorgada automáticamente al postular."
      },
      {
        nombre: "Beca Mujeres en Tecnología AIEP",
        descripcion: "Para mujeres en carreras tecnológicas (programación, TI, mecánica, electricidad).",
        cobertura: "20% del arancel.",
        requisitos: "Mujeres matriculadas en carreras tecnológicas habilitadas. Renovación nota ≥ 5,5 y avance 70%.",
        proceso: "Asignación automática al matricularse."
      },
      {
        nombre: "Beca Adulto Joven AIEP",
        descripcion: "Para estudiantes de 30 años o más.",
        cobertura: "30% del arancel.",
        requisitos: "Tener 30 años o más; evaluación individual de antecedentes.",
        proceso: "Postulación en línea en www.aiep.cl."
      },
      {
        nombre: "Beca Movilidad Estudiantil AIEP",
        descripcion: "Para estudiantes que deben trasladarse desde otra comuna/residencia a la sede.",
        cobertura: "20% del arancel.",
        requisitos: "Estudiar en sede distinta a su residencia habitual. Avance ≥ 70% y asistencia ≥ 85%.",
        proceso: "Asignación al matricularse en la sede."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Programa de Acompañamiento y Nivelación AIEP",
        tipo: "Tutorías y nivelación",
        descripcion: "Tutorías de pares y docentes, nivelación y talleres para situaciones académicas difíciles.",
        canal: "Coordinación académica en cada sede."
      },
      {
        nombre: "Acompañamiento a Estudiantes que Cuidan",
        tipo: "Flexibilidad para cuidadores",
        descripcion: "Reconocimiento de labores de cuidado no remuneradas con adaptación de exigencias académicas.",
        canal: "Solicitud ante autoridades académicas de la sede respectiva."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Programa de Apoyo Psicológico y Dental AIEP",
        descripcion: "Servicio de orientación psicológica y convenios dentales.",
        procedimiento: "Información en DAE de la sede."
      }
    ],
    contactos_dae: {
      contacto_admision: "600 367 2700 · +56 2 2487 8287 · WhatsApp +56 9 9259 0889",
      sedes_rm: [
        { sede: "Santiago Centro", direccion: "Moneda 1165" },
        { sede: "Providencia", direccion: "Manuel Montt 947" },
        { sede: "Ñuñoa", direccion: "Manuel Montt 934, Villa Italia" },
        { sede: "La Florida", direccion: "Av. Los Leones 8950" },
        { sede: "Maipú", direccion: "Av. Pajaritos 3801" }
      ],
      portal: "aiep.cl (sección Vida Estudiantil)"
    }
  },
  {
    id: "ip_santo_tomas",
    nombre: "Instituto Profesional Santo Tomás",
    alias: ["IP Santo Tomás", "IPST"],
    categoria: "Instituto Profesional",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beca Reconocimiento Escolar IP Santo Tomás",
        descripcion: "Beca por mérito en enseñanza media.",
        cobertura: "20% del arancel.",
        requisitos: "NEM ≥ 6,5. Renovable con promedio ≥ 5,5 y máximo una asignatura reprobada.",
        proceso: "Admisión; postulación con FUAS."
      },
      {
        nombre: "Beca Mujeres en Carreras STEM IPST",
        descripcion: "Para mujeres ingresantes a carreras STEM técnicas/profesionales.",
        cobertura: "Entre 20% y 50% del arancel más matrícula.",
        requisitos: "Mejores NEM en carreras STEM elegibles (cupos limitados).",
        proceso: "Dirección Nacional de Admisión."
      },
      {
        nombre: "Regla de No Acumulabilidad",
        descripcion: "Las becas internas no son acumulables entre sí; rige el beneficio con mayor porcentaje.",
        cobertura: "Mayor porcentaje final.",
        requisitos: "Cumplimiento de requisitos de la beca seleccionada.",
        proceso: "Al matricularse."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Programa de Bienestar y Salud Mental Dra. Graciela Rozas",
        tipo: "Bienestar y salud mental",
        descripcion: "Acompañamiento institucional y talleres coordinados por DAE y Formación e Identidad.",
        canal: "DAE por sede."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Mindfulness y Apoyo Espiritual",
        descripcion: "Espacios de autocuidado y mindfulness.",
        procedimiento: "Agenda en la DAE de la sede correspondiente."
      },
      {
        nombre: "Seguro de Salud Estudiantil IPST",
        descripcion: "Protección por accidentes que causen incapacidad o muerte.",
        procedimiento: "Activación ante DAE."
      }
    ],
    contactos_dae: {
      whatsapp: "+56 2 2840 2243",
      mesa_central: "+56 2 2988 0561",
      financiamiento: "DAFA (Dirección de Administración de Financiamiento Académico)"
    }
  },
  {
    id: "cft_santo_tomas",
    nombre: "Centro de Formación Técnica Santo Tomás",
    alias: ["CFT Santo Tomás", "CFTST"],
    categoria: "Centro de Formación Técnica",
    tipo: "Privada",
    becas_economicas: [
      {
        nombre: "Beca Reconocimiento Escolar CFT Santo Tomás",
        descripcion: "Beca por mérito escolar para carreras técnicas de 2 años.",
        cobertura: "20% del arancel en carreras técnicas del CFT.",
        requisitos: "NEM ≥ 6,5. Renovable con promedio ≥ 5,5 y máximo una asignatura reprobada.",
        proceso: "Admisión con FUAS."
      },
      {
        nombre: "Beca Mujeres en Carreras STEM CFTST",
        descripcion: "Para mujeres que ingresan a carreras técnicas de ciencia y tecnología.",
        cobertura: "Entre 20% y 50% del arancel más matrícula.",
        requisitos: "Mejores promedios NEM en carreras técnicas STEM.",
        proceso: "Dirección Nacional de Admisión."
      }
    ],
    programas_acompanamiento: [
      {
        nombre: "Programa Dra. Graciela Rozas (Bienestar y Salud Mental)",
        tipo: "Salud mental y apoyo integral",
        descripcion: "Coordinado con DAE de la sede.",
        canal: "DAE por sede."
      }
    ],
    bienestar_salud_emergencia: [
      {
        nombre: "Seguro Escolar y Salud Estudiantil CFT",
        descripcion: "Protección ante accidentes y campañas 'Tomasino estudiamos y nos cuidamos'.",
        procedimiento: "DAE por sede."
      }
    ],
    contactos_dae: {
      whatsapp: "+56 2 2840 2243",
      mesa_central: "+56 2 2988 0561",
      portal: "DAE por sede y DAFA para financiamiento"
    }
  }
];

// Helper para obtener fono de urgencia institucional si existe
export function obtenerUrgenciaIES(ies) {
  if (!ies?.contactos_dae) return null;
  const c = ies.contactos_dae;
  return c.urgencia_24_7 || c.linea_emergencia_24_7 || c.emergencias || c.urgencia_salud_mental || null;
}

// Normalizador robusto de nombres de instituciones
export function resolverInstitucion(nombreConsulta = "") {
  if (!nombreConsulta) return null;
  const texto = String(nombreConsulta).toLowerCase().trim();

  // 1. Coincidencia exacta por ID
  for (const ies of IES_KNOWLEDGE_BASE) {
    if (ies.id === texto) return ies;
  }

  // 2. Coincidencia exacta por nombre
  for (const ies of IES_KNOWLEDGE_BASE) {
    if (ies.nombre.toLowerCase() === texto) return ies;
  }

  // 3. Coincidencia exacta por alias
  for (const ies of IES_KNOWLEDGE_BASE) {
    for (const al of ies.alias) {
      if (al.toLowerCase() === texto) return ies;
    }
  }

  // 4. Búsqueda por subcadena / límites de palabra con priorización por longitud
  let mejorIES = null;
  let maxPuntaje = 0;

  for (const ies of IES_KNOWLEDGE_BASE) {
    const nombreLow = ies.nombre.toLowerCase();
    if (texto.includes(nombreLow)) {
      const pts = nombreLow.length * 3;
      if (pts > maxPuntaje) {
        maxPuntaje = pts;
        mejorIES = ies;
      }
    }

    for (const al of ies.alias) {
      const alLow = al.toLowerCase();

      // Guardas especiales:
      // Si el texto contiene 'duoc', no debe asociarse a 'puc' por el alias 'uc'
      if (ies.id === 'puc' && alLow === 'uc' && texto.includes('duoc')) {
        continue;
      }
      // Si el texto contiene 'santo tomas' pero especifica 'instituto profesional' o 'ip', no asignar a UST
      if (ies.id === 'ust' && (texto.includes('instituto profesional') || texto.includes('ip '))) {
        continue;
      }

      // Comprobar límite de palabra
      const escaped = alLow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('(?:^|\\s|[.,;()/-])' + escaped + '(?:$|\\s|[.,;()/-])', 'i');

      if (regex.test(texto) || texto.includes(alLow)) {
        let pts = alLow.length * 2;
        // Priorizar Duoc frente a PUC en consultas compuestas
        if (ies.id === 'duoc' && texto.includes('duoc')) pts += 20;
        if (pts > maxPuntaje) {
          maxPuntaje = pts;
          mejorIES = ies;
        }
      }
    }
  }

  return mejorIES;
}
