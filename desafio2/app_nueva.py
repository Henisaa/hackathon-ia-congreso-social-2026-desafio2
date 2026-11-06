"""Desafío 2 · Hub Unificado · Puente Contigo (Fundación Puente).
Permite alternar en vivo entre la vista del Becado y el Panel del Equipo para la demo del pitch."""
import sys
from pathlib import Path
AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent / "comun")); sys.path.insert(0, str(AQUI))
import streamlit as st
import nucleo_st as N
import servicios as S

N.iniciar("Puente-Hub", "Puente Contigo · Hub Demostrador", "✨")
N.acceso()

cfg, extra = N.configuracion(str(AQUI / "planillas" / "Plantilla_config_D2_Variante_B.xlsx"), "servicios_extra", S.validar_servicio)
catalogo = S.catalogo(AQUI, extra)

# Barra lateral para alternar vista durante el pitch
with st.sidebar:
    st.markdown("### 🎛️ Vista del Prototipo")
    vista = st.radio("Elige la perspectiva a demostrar:", [
        "🧑‍🎓 Vista Becado (Puente Contigo)",
        "👩‍⚕️ Vista Equipo Fundación Puente",
        "📐 Arquitectura y Salvaguardas Éticas"
    ])
    st.divider()

if vista.startswith("🧑‍🎓"):
    import app_b_checkin  # Muestra la app completa del becado
elif vista.startswith("👩‍⚕️"):
    st.info("Para ver el panel del equipo con priorización algorítmica y cohorte completa de 3.000 estudiantes, abre `desafio2/app_a_panel_tutor.py` o revisa la bandeja a continuación.")
    
    # Bandeja rápida del equipo
    bandeja = N.estado_equipo("bandeja").get("casos", [])
    st.markdown("#### 🚨 Bandeja Rápida de Alertas Activas")
    if not bandeja:
        N.tarjeta("Bandeja al día", "No hay alertas pendientes en este momento. Interactúa en el Canal Confidencial como becado para activar el semáforo 🔴/🟠/🟡.", "ok")
    else:
        for b in bandeja:
            tono = "bad" if "ROJA" in b.get("alerta", "") else ("warn" if "NARANJA" in b.get("alerta", "") else "info")
            N.tarjeta(f"{b['caso']} · {b['estudiante']} ({b['alerta']})",
                      f"<b>Cita Textual:</b> <i>\"{b['frase_gatillante']}\"</i><br><b>Resumen:</b> {b['resumen_ia']}<br><b>Estado:</b> {b['decision']}", tono)
else:
    N.encabezado("Arquitectura Ética · Puente Contigo", "Innovación tecnológica al servicio de la dignidad humana y los desafíos sociales.")
    st.markdown("""
    ### 🏛️ Ecosistema Fundación Puente (Sin Entrevistas)
    
    1. **Ficha Única del Becado**:
       - 6 dimensiones auditables: Económica, Académica, Familiar, Bienestar, Red y Beneficios.
       - Trazabilidad total: origen de cada dato (declarado, verificado o profesional) y fecha. Cero diagnósticos.
    
    2. **Eje 1 · Canal Confidencial con Semáforo de Alertas**:
       - 🔴 **Alerta Roja:** Riesgo vital o violencia → Protocolo `*4141` y llamado inmediato.
       - 🟠 **Alerta Naranja:** Abandono por falta de pasajes, comida o techo → Contacto en 48 horas.
       - 🟡 **Alerta Amarilla:** Dificultad con ramos o trámites → Derivación a CAI o asistente social.
       - **Cero Sesgo:** La alerta se activa exclusivamente por la cita textual de lo que dice el becado, nunca por su perfil.

    3. **Eje 2 · Asistente Personalizado de Beneficios**:
       - Cruza la base verificada (Fundación Puente + Estado + IES).
       - Clasifica en: *«Podrías postular»*, *«Ya lo tienes»* y *«Revisa este requisito»*, con lenguaje responsable (*«podrías optar»*) y botón directo *«Ayúdame a postular»*.
    
    4. **Decisión Humana Obligatoria**:
       - La IA nunca decide ni asigna sanciones. La decisión de contacto y derivación siempre es de una profesional.
    """)

N.pie(N.IA())
