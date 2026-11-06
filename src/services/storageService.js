// Servicio de Persistencia en Caché (localStorage) y Sincronización en Tiempo Real
// Para la Hackathon IA Congreso Social UC 2026 - Desafío 2

const KEY_BANDEJA = 'puente_bandeja_casos_v2';
const KEY_CHATS = 'puente_chats_por_perfil_v2';
const KEY_PERFIL = 'puente_perfil_activo_v2';

// Casos iniciales de demostración
export const CASOS_INICIALES = [
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
];

// Instancia única de BroadcastChannel para sincronizar entre pestañas/vistas
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('puente_contigo_realtime');
  } catch (e) {
    console.log('[Storage] BroadcastChannel no soportado:', e);
  }
}

export function notificarCambio(tipo, payload = {}) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ tipo, payload, timestamp: Date.now() });
    } catch (e) {
      console.log('[Storage] Error al emitir mensaje:', e);
    }
  }
}

export function suscribirCambios(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event) => {
    if (event?.data) {
      callback(event.data);
    }
  };

  const handleStorage = (event) => {
    if ([KEY_BANDEJA, KEY_CHATS, KEY_PERFIL].includes(event.key)) {
      callback({ tipo: 'STORAGE_UPDATED', key: event.key });
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

// -------------------------------------------------------------
// Bandeja de Casos (Semáforo del Equipo)
// -------------------------------------------------------------

export function ordenarCasosPorSeveridad(casos = []) {
  const pesoAlerta = { ROJA: 4, NARANJA: 3, AMARILLA: 2, VERDE: 1 };
  return [...casos].sort((a, b) => {
    // 1. Pendientes primero
    const aPendiente = a.decision === 'Pendiente' ? 1 : 0;
    const bPendiente = b.decision === 'Pendiente' ? 1 : 0;
    if (aPendiente !== bPendiente) {
      return bPendiente - aPendiente;
    }
    // 2. Severidad de alerta (ROJA > NARANJA > AMARILLA > VERDE)
    const pesoA = pesoAlerta[a.alerta] || 0;
    const pesoB = pesoAlerta[b.alerta] || 0;
    if (pesoA !== pesoB) {
      return pesoB - pesoA;
    }
    return 0;
  });
}

export function obtenerBandejaCasos() {
  if (typeof window === 'undefined') return ordenarCasosPorSeveridad(CASOS_INICIALES);
  try {
    const raw = localStorage.getItem(KEY_BANDEJA);
    if (!raw) {
      const iniciales = ordenarCasosPorSeveridad(CASOS_INICIALES);
      guardarBandejaCasos(iniciales, false);
      return iniciales;
    }
    const parsed = JSON.parse(raw);
    const lista = Array.isArray(parsed) && parsed.length > 0 ? parsed : CASOS_INICIALES;
    return ordenarCasosPorSeveridad(lista);
  } catch (e) {
    console.warn('[Storage] Error al leer bandeja de casos:', e);
    return ordenarCasosPorSeveridad(CASOS_INICIALES);
  }
}

export function guardarBandejaCasos(casos, emitir = true) {
  if (typeof window === 'undefined') return;
  try {
    const ordenados = ordenarCasosPorSeveridad(casos);
    localStorage.setItem(KEY_BANDEJA, JSON.stringify(ordenados));
    if (emitir) {
      notificarCambio('BANDEJA_UPDATED', { total: ordenados.length });
    }
  } catch (e) {
    console.error('[Storage] Error al guardar bandeja:', e);
  }
}

// -------------------------------------------------------------
// Chats y Estado del Semáforo por Perfil (P1 a P6)
// -------------------------------------------------------------

export function obtenerChatsPorPerfil() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY_CHATS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function obtenerChatDePerfil(idPersona) {
  const todos = obtenerChatsPorPerfil();
  return (
    todos[idPersona] || {
      consentimiento: false,
      historial: [],
      alertaActiva: 'VERDE',
      fraseGatillante: '',
      servicioSugerido: 'S01',
      resumenFinal: null
    }
  );
}

export function guardarChatDePerfil(idPersona, dataChat) {
  if (typeof window === 'undefined') return;
  try {
    const todos = obtenerChatsPorPerfil();
    todos[idPersona] = {
      ...(todos[idPersona] || {}),
      ...dataChat,
      ultimaActualizacion: Date.now()
    };
    localStorage.setItem(KEY_CHATS, JSON.stringify(todos));
    notificarCambio('CHAT_UPDATED', { idPersona, alertaActiva: dataChat.alertaActiva });
  } catch (e) {
    console.error('[Storage] Error al guardar chat:', e);
  }
}

// -------------------------------------------------------------
// Perfil Activo en Sesión
// -------------------------------------------------------------

export function obtenerPerfilActivo(defecto) {
  if (typeof window === 'undefined') return defecto;
  try {
    const raw = localStorage.getItem(KEY_PERFIL);
    return raw ? JSON.parse(raw) : defecto;
  } catch (e) {
    return defecto;
  }
}

export function guardarPerfilActivo(perfil) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_PERFIL, JSON.stringify(perfil));
  } catch (e) {
    console.error('[Storage] Error al guardar perfil:', e);
  }
}

// -------------------------------------------------------------
// Reset Completo para Reiniciar la Demostración
// -------------------------------------------------------------

export function resetearCacheDemo() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY_BANDEJA);
    localStorage.removeItem(KEY_CHATS);
    localStorage.removeItem(KEY_PERFIL);
    guardarBandejaCasos(CASOS_INICIALES, true);
    notificarCambio('CACHE_RESET');
  } catch (e) {
    console.error('[Storage] Error al resetear cache:', e);
  }
}
