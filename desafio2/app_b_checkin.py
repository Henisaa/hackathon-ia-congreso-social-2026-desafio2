"""Desafío 2 · App del Becado · Puente Contigo (Fundación Puente).
Canal Confidencial + Semáforo de Alertas + Asistente de Beneficios + Ficha Única Transparente."""
import json, re, sys, datetime
from pathlib import Path
AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent / "comun")); sys.path.insert(0, str(AQUI))
import pandas as pd, streamlit as st
import nucleo_st as N
import servicios as S

N.iniciar("Puente-Becado", "Puente Contigo · Estudiante", "🤝")
N.acceso()
cfg, extra = N.configuracion(str(AQUI / "planillas" / "Plantilla_config_D2_Variante_B.xlsx"), "servicios_extra", S.validar_servicio)
catalogo = S.catalogo(AQUI, extra)
SERV = dict(zip(catalogo.id_servicio, catalogo.nombre))
ACCESO = dict(zip(catalogo.id_servicio, catalogo.como_acceder))
personas = pd.read_csv(AQUI / "datos" / "personas_checkin.csv", dtype=str)
try: MAX_TURNOS = max(3, min(15, int(cfg.get("max_turnos", "8"))))
except ValueError: MAX_TURNOS = 8
CATEGORIAS = sorted(S.CATEGORIAS) + ["ninguna"]

# 🔒 Reglas fijas del prompt (IA de orientación en español chileno respetuoso, sin diagnósticos)
REGLAS = """Eres "Puente Contigo", el asistente virtual de apoyo y orientación para becados de primer año de Fundación Puente en Chile.
Tu objetivo: acompañar al estudiante en su inserción universitaria, escuchar con empatía sus dudas y orientarlo hacia los apoyos y beneficios reales de Fundación Puente, su casa de estudios o el Estado.
REGLAS FIJAS ÉTICAS Y DE SEGURIDAD:
1. NO eres psicólogo: no diagnosticas, no usas etiquetas clínicas ni pronósticos de salud mental.
2. Una sola pregunta o sugerencia por mensaje. Valida lo que la persona siente de manera cercana y cálida en español chileno ("tú", nunca voseo).
3. Menciona SOLO programas y servicios del catálogo verificado, usando siempre su nombre oficial y código entre corchetes, por ejemplo [S01] o [S06].
4. En beneficios, di siempre "podrías optar" o "podrías postular", NUNCA asegures que "tienes derecho ganado", pues la validación final es de cada institución.
5. No pides datos sensibles como RUT, contraseñas ni datos bancarios.
6. Si la persona no desea continuar, agradécele y respeta su tiempo.
Catálogo verificado:
{catalogo}"""

CLASIFICAR = """Analiza la conversación del becado y responde ÚNICAMENTE con un JSON con estas claves:
"necesidades": lista con una o más de: {categorias};
"urgencia": "baja", "media" o "alta";
"alerta_semaforo": "ROJA" si hay riesgo vital/violencia; "NARANJA" si menciona pensar en dejar la carrera, no tener para comida/pasajes o perder vivienda; "AMARILLA" si reprobó ramos o tiene dudas de trámites/beneficios; o "VERDE" si es consulta normal;
"frase_gatillante": cita textual exacta del mensaje del estudiante que motivó la alerta (o "(ninguna)" si no hay alerta);
"resumen": 2 frases empáticas y neutrales sobre la situación;
"servicio_sugerido": código del catálogo (ej. "S02") o "ninguno";
"mensaje_al_estudiante": 2 frases cálidas de cierre en español chileno.
Conversación:
{conv}"""

DIAGNOSTICO = re.compile(r"\b(tienes|sufres|padeces|parece que tienes)\s+(depresi[oó]n|ansiedad|un trastorno|tdah|estr[eé]s postraum)|\bdiagn[oó]stic", re.I)

# Patrones para semáforo de alertas según documento
PATRON_NARANJA = re.compile(r"(dejar la carrera|retirar(me)?|salirme|no puedo pagar|no tengo plata|no tengo para (comer|almorzar|la micro|el pasaje)|sin comida|sin micro|desaloj|perder la pieza|perder el techo|no tengo donde vivir)", re.I)
PATRON_AMARILLA = re.compile(r"(reprob|me fue mal|rojo|echarme el ramo|duda.*fuas|apelar.*gratuidad|perder.*beca|tramite|no entiendo nada)", re.I)

DEMO = {
    "chat": {
        "P1_1": "Hola Camila, gracias por confiar y contarlo. Compatibilizar turnos pesados de trabajo con las clases y el cuidado familiar es muy exigente. ¿Qué es lo que más te preocupa esta semana con el dinero o los horarios?",
        "P1_2": "Te entiendo completamente. En Fundación Puente contamos con la **Beca Mensual [S01]** y apoyo de emergencia **[S04]**, además de poder pedir **Flexibilidad Académica [S07]** en Duoc UC. ¿Te gustaría que avisemos a la trabajadora social para que te contacte dentro de 48 horas?",
        "P2_1": "Hola Diego, que la primera prueba no salga como esperabas pasa mucho en primer año, ¡no te desanimes! En la fundación tenemos el **CAI · Tutorías Académicas [S02]** con voluntarios que te apoyan paso a paso. ¿En qué materia o tema te gustaría reforzar?",
        "P3_1": N.MENSAJE_CRISIS,
        "_por_defecto": "Hola, gracias por escribirme. Cuéntame un poco más sobre cómo te estás sintiendo en la universidad y en qué te puedo orientar hoy."
    },
    "clasificar": {}
}

ia = N.IA(DEMO)

# Estado de la sesión del estudiante y bandeja compartida
bandeja = N.estado_equipo("bandeja").setdefault("casos", [])
ss = st.session_state
ss.setdefault("hist", [])
ss.setdefault("turno", 0)
ss.setdefault("clasif", None)
ss.setdefault("ultimo_info", {})
ss.setdefault("becado_perfil", {
    "nombre": "Estudiante Becado",
    "institucion": "Duoc UC San Joaquín",
    "carrera": "Técnico en Enfermería",
    "jornada": "Vespertina",
    "beneficios_activos": ["S01"],
    "trabaja": True,
    "horas_trabajo_semana": 25,
    "cuida_dependientes": True,
    "gratuidad": False,
    "nota_promedio": 4.5,
    "de_region": False
})

conv_txt = lambda h: "\n".join(f"{'Estudiante' if m['role'] == 'user' else 'Puente Contigo'}: {m['content']}" for m in h)
URG = {
    "CRISIS": ("🔴 ALERTA ROJA (Inmediata)", "red"),
    "ROJA": ("🔴 ALERTA ROJA (Inmediata)", "red"),
    "NARANJA": ("🟠 ALERTA NARANJA (48 Horas)", "orange"),
    "AMARILLA": ("🟡 ALERTA AMARILLA (Seguimiento)", "amber"),
    "VERDE": ("🟢 Sin Alerta (Normal)", "green"),
    "alta": ("🟠 ALERTA NARANJA (48 Horas)", "orange"),
    "media": ("🟡 ALERTA AMARILLA (Seguimiento)", "amber"),
    "baja": ("🟢 Sin Alerta (Normal)", "green")
}
AVATAR = {"assistant": "🤝", "user": "🧑‍🎓"}

def reiniciar_chat():
    ss.hist = []
    ss.turno = 0
    ss.clasif = None
    ss.ultimo_info = {}
    ss["_n_checkin"] = ss.get("_n_checkin", 0) + 1

def registrar_caso(pid, nombre, nivel_alerta, gatillante, servicio, resumen, origen):
    cid = f"PTE-{len(bandeja) + 1:03d}"
    nuevo = {
        "caso": cid,
        "persona_id": pid,
        "estudiante": nombre,
        "origen": origen,
        "alerta": nivel_alerta,
        "frase_gatillante": gatillante,
        "servicio_sugerido": servicio,
        "resumen_ia": resumen,
        "fecha": datetime.datetime.now().strftime("%d/%m/%Y %H:%M"),
        "conversacion": conv_txt(ss.hist),
        "decision": "Pendiente"
    }
    bandeja.append(nuevo)
    N.registrar({
        "tipo": "caso_alerta_fundacion",
        "caso": cid,
        "alerta": nivel_alerta,
        "origen": origen,
        "frase_gatillante": gatillante
    })
    return cid

# ------------------------------------------------------------------ Pantalla Principal
N.encabezado("Puente Contigo · Acompañamiento Becados",
             "Fundación Puente · Apoyo, orientación y beneficios para becados de primer año.",
             [f"👥 Equipo: {st.session_state.get('_equipo')}", "🎓 Foco: Primer Año Universitario", "🔒 Confidencial y Seguro"])
N.aviso_ia()

pendientes = sum(b["decision"] == "Pendiente" for b in bandeja)
rojas_naranjas = sum(b["alerta"] in ("CRISIS", "ROJA", "NARANJA", "alta") and b["decision"] == "Pendiente" for b in bandeja)

k1, k2, k3, k4 = st.columns(4)
k1.metric("Becado Conectado", ss.becado_perfil["nombre"])
k2.metric("Beneficios Activos", len(ss.becado_perfil["beneficios_activos"]))
k3.metric("Alertas Pendientes Equipo", pendientes, f"{rojas_naranjas} urgentes" if rojas_naranjas else "Al día")
k4.metric("Consultas IA Disponibles", f"{ia.usadas()} de {ia.limite}")

tab_chat, tab_beneficios, tab_ficha, tab_bandeja = st.tabs([
    "💬 1 · Canal Confidencial IA",
    "🎓 2 · Asistente de Beneficios",
    "🗂️ 3 · Mi Ficha Única",
    "📥 4 · Bandeja del Equipo Puente"
])

# ==============================================================================
# TAB 1: CANAL CONFIDENCIAL IA (EJE 1 CON SEMÁFORO DE ALERTAS SIN SESGO)
# ==============================================================================
with tab_chat:
    col_chat, col_side = st.columns([1.8, 1], gap="medium")

    with col_side:
        with st.container(border=True):
            st.markdown("##### 🎭 Simular como Becado(a)")
            st.caption("Herramienta para probar perfiles representativos de Fundación Puente:")
            opciones = [f"{r.id_persona} · {r.nombre_ficticio} ({r.carrera}, {r.institucion})" for r in personas.itertuples()]
            sel_persona = st.selectbox("Perfil de simulación", opciones, key="sel_sim")
            pid = sel_persona.split(" · ")[0]
            perfil_sel = personas[personas.id_persona == pid].iloc[0]

            # Actualiza perfil en memoria
            ss.becado_perfil["nombre"] = perfil_sel["nombre_ficticio"]
            ss.becado_perfil["institucion"] = perfil_sel["institucion"]
            ss.becado_perfil["carrera"] = perfil_sel["carrera"]
            ss.becado_perfil["jornada"] = perfil_sel["jornada"]

            st.markdown(f'<div class="quote">{N.md(perfil_sel["contexto_para_simular"])}</div>', unsafe_allow_html=True)
            st.markdown(f"**Alerta esperada:** {N.badge(perfil_sel['tipo_alerta_esperada'], 'amber')}", unsafe_allow_html=True)

        st.markdown("""
        <div class="card info">
            <div class="c-tit">🛡️ Reglas de Alerta Ética</div>
            <div class="c-txt">
            • <b>🔴 Alerta Roja:</b> Riesgo vital o violencia → Protocolo <code>*4141</code> y aviso inmediato.<br>
            • <b>🟠 Alerta Naranja:</b> Riesgo de deserción por falta de comida, pasaje o techo → Contacto en <b>48 horas</b>.<br>
            • <b>🟡 Alerta Amarilla:</b> Reprobación de ramos o dudas de beneficios → Seguimiento en agenda.<br>
            • <b>Cero Sesgo:</b> Las alertas se activan <u>solo por lo que escribes</u>, nunca por tu perfil socioeconómico o género.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col_chat:
        if not ss.hist:
            with st.container(border=True):
                st.markdown("#### 👋 Bienvenido a tu Canal Confidencial")
                st.write("Este es un espacio voluntario donde puedes consultar dudas universitarias o conversar de cosas que a veces cuestan hablar. Una persona del equipo psicosocial de Fundación Puente está siempre detrás para apoyarte si lo necesitas.")
                check_consent = st.checkbox(cfg.get("texto_consentimiento", "Entiendo que converso con una IA de orientación, que puedo parar cuando quiera y que la decisión final de ayuda es humana."), key=f"c_{ss.get('_n_checkin', 0)}")
                if st.button("Iniciar conversación", type="primary", disabled=not check_consent):
                    N.registrar({"tipo": "consentimiento_canal", "becado": pid})
                    ss.hist = [{"role": "assistant", "content": f"¡Hola {ss.becado_perfil['nombre']}! Soy Puente Contigo. ¿Cómo va tu semana en {ss.becado_perfil['carrera']}? Cuéntame lo que necesites consultar o conversar."}]
                    st.rerun()

        # Render mensajes
        for m in ss.hist:
            avatar_icon = AVATAR.get(m["role"], "💬")
            st.chat_message(m["role"], avatar=avatar_icon).markdown(m["content"])

        if ss.ultimo_info:
            N.aviso_si_demo(ss.ultimo_info)

        if ss.hist and ss.clasif is None:
            user_msg = st.chat_input("Escribe tu consulta o cómo te sientes aquí…")
            if user_msg:
                ss.hist.append({"role": "user", "content": user_msg})
                ss.turno += 1
                ss.ultimo_info = {}

                # 1. Alerta Roja: Crisis o violencia (Protocolo directo sin pasar por IA)
                if N.crisis(user_msg):
                    ss.hist.append({"role": "assistant", "content": N.MENSAJE_CRISIS})
                    N.registrar({"tipo": "protocolo_crisis", "entrada": user_msg, "salida": N.MENSAJE_CRISIS})
                    registrar_caso(pid, ss.becado_perfil["nombre"], "ROJA", user_msg, "S03", "Señal de crisis vital/violencia detectada: llamada urgente de profesional.", "Canal Confidencial")
                
                elif ss.turno >= MAX_TURNOS:
                    ss.hist.append({"role": "assistant", "content": "Hemos conversado bastante por ahora. Puedes presionar **Terminar y ver resumen** para guardar tus orientaciones."})
                else:
                    # 2. Detectar si el mensaje activa Alerta Naranja (48h) o Amarilla para la bandeja del equipo
                    if PATRON_NARANJA.search(user_msg):
                        m_gat = PATRON_NARANJA.search(user_msg).group(0)
                        DEMO["chat"][f"{pid}_{ss.turno}"] = f"Gracias por compartirlo, {ss.becado_perfil['nombre']}. Lo que me cuentas sobre '{m_gat}' es muy importante. En Fundación Puente no estás solo(a): contamos con la **Beca Mensual [S01]**, **Becas de Emergencia [S04]** y **Residencia [S05]**. Dejaré un aviso prioritario para que una profesional de la fundación te contacte en **menos de 48 horas**. ¿Te gustaría agregar algo más?"
                        registrar_caso(pid, ss.becado_perfil["nombre"], "NARANJA", user_msg, "S04", f"Situación crítica económica/habitacional ({m_gat}): requiere contacto en 48 horas.", "Canal Confidencial")
                    elif PATRON_AMARILLA.search(user_msg):
                        m_gat = PATRON_AMARILLA.search(user_msg).group(0)
                        DEMO["chat"][f"{pid}_{ss.turno}"] = f"Te entiendo, {ss.becado_perfil['nombre']}. Problemas con '{m_gat}' son comunes en el inicio de la carrera. Tenemos las **Tutorías del CAI [S02]** y orientación sobre **Beneficios Estatales [S06]**. Agendaré esto para que tu profesional de acompañamiento lo revise contigo. ¿En qué ramo o beneficio necesitas más apoyo?"
                        registrar_caso(pid, ss.becado_perfil["nombre"], "AMARILLA", user_msg, "S02", f"Dificultad académica o de trámite ({m_gat}): derivar a apoyo CAI o asistente social.", "Canal Confidencial")

                    # 3. Llamada real a la IA (Claude Haiku 5.5 / Groq / Mistral / OpenAI, con respaldo a DEMO si no hay clave)
                    sistema = REGLAS.format(catalogo=S.texto(catalogo)) + "\n\n" + N.personalizacion(cfg)
                    with st.spinner("Puente Contigo está redactando…"):
                        texto, info = ia.llamar([{"role": "system", "content": sistema}] + ss.hist, "chat", f"{pid}_{ss.turno}", temperatura=0.4, max_tokens=320)
                    
                    if DIAGNOSTICO.search(texto):
                        N.registrar({"tipo": "validacion", "tarea": "chat", "salida": texto, "nota": "lenguaje diagnostico bloqueado"})
                        texto = "Gracias por contarlo. En la fundación no hacemos diagnósticos de salud, pero sí contamos con **Servicios Psicosociales del CAI [S03]**. ¿Quieres que te cuente cómo acceder?"
                    
                    ss.hist.append({"role": "assistant", "content": texto})
                    ss.ultimo_info = info
                st.rerun()

            c_term1, c_term2 = st.columns([1, 1])
            with c_term1:
                if len(ss.hist) > 1 and st.button("🏁 Terminar y ver resumen", width="stretch"):
                    solo_user = " ".join(m["content"] for m in ss.hist if m["role"] == "user")
                    alerta_det = "VERDE"
                    gatillante = "(ninguna)"
                    if any(N.crisis(m["content"]) for m in ss.hist if m["role"] == "user"):
                        alerta_det = "ROJA"
                        gatillante = "Señal de crisis vital detectada"
                    elif any(PATRON_NARANJA.search(m["content"]) for m in ss.hist if m["role"] == "user"):
                        alerta_det = "NARANJA"
                        gatillante = "Dificultad de transporte, alimentación o vivienda"
                    elif any(PATRON_AMARILLA.search(m["content"]) for m in ss.hist if m["role"] == "user"):
                        alerta_det = "AMARILLA"
                        gatillante = "Duda de ramo, evaluación o trámite"

                    ss.clasif = {
                        "alerta_semaforo": alerta_det,
                        "frase_gatillante": gatillante,
                        "resumen": f"El estudiante compartió inquietudes sobre su inserción en {ss.becado_perfil['carrera']}.",
                        "servicio_sugerido": "S02" if alerta_det == "AMARILLA" else ("S04" if alerta_det == "NARANJA" else "S01"),
                        "mensaje_al_estudiante": "Gracias por conversar con Puente Contigo. Tus dudas han quedado registradas para que tu profesional de la fundación te apoye oportunamente."
                    }
                    st.rerun()
            with c_term2:
                if st.button("🔄 Nueva conversación", width="stretch"):
                    reiniciar_chat()
                    st.rerun()

        if ss.clasif:
            c = ss.clasif
            sem_tag, sem_col = URG.get(c.get("alerta_semaforo", "VERDE"), ("Verde", "green"))
            st.markdown(f"""
            <div class="card ok">
                <div class="c-tit">✨ Resumen de tu Orientación</div>
                <div class="c-txt">
                {N.md(c.get("mensaje_al_estudiante"))}<br><br>
                <b>Estado de Alerta Ética:</b> {N.badge(sem_tag, sem_col)}<br>
                <b>Motivo registrado (Cita Textual):</b> <i>"{N.md(c.get('frase_gatillante'))}"</i><br>
                <b>Apoyo sugerido:</b> {N.badge(SERV.get(c.get('servicio_sugerido'), 'Orientación general'), 'puente')}
                </div>
            </div>
            """, unsafe_allow_html=True)
            if st.button("Reiniciar canal de chat"):
                reiniciar_chat()
                st.rerun()

# ==============================================================================
# TAB 2: ASISTENTE PERSONALIZADO DE BENEFICIOS (EJE 2: PUENTE + ESTADO + IES)
# ==============================================================================
with tab_beneficios:
    st.markdown("#### 🎓 Asistente Personalizado de Beneficios Universitarios")
    st.caption("Cruzamos tu situación real con la Base Verificada de Fundación Puente, Mineduc y tu Institución de Educación Superior:")

    # Formulario dinámico del becado
    with st.expander("📝 Mi situación actual (actualiza para recalcular tus beneficios)", expanded=False):
        c_b1, c_b2, c_b3 = st.columns(3)
        u_inst = c_b1.selectbox("Institución", ["Duoc UC San Joaquín", "INACAP Santiago Centro", "Santo Tomás", "Universidad Central", "Universidad de Chile", "Pontificia Universidad Católica", "IP Chile"], index=0)
        u_trabaja = c_b2.checkbox("¿Trabajas actualmente?", value=ss.becado_perfil["trabaja"])
        u_cuida = c_b3.checkbox("¿Tienes personas a tu cuidado?", value=ss.becado_perfil["cuida_dependientes"])
        
        c_b4, c_b5, c_b6 = st.columns(3)
        u_prom = c_b4.number_input("Promedio parcial actual", min_value=1.0, max_value=7.0, value=float(ss.becado_perfil["nota_promedio"]), step=0.1)
        u_grat = c_b5.checkbox("¿Tienes Gratuidad asignada?", value=ss.becado_perfil["gratuidad"])
        u_region = c_b6.checkbox("¿Provienes de región?", value=ss.becado_perfil["de_region"])

        if st.button("Guardar y actualizar beneficios"):
            ss.becado_perfil.update({
                "institucion": u_inst, "trabaja": u_trabaja, "cuida_dependientes": u_cuida,
                "nota_promedio": u_prom, "gratuidad": u_grat, "de_region": u_region
            })
            st.success("¡Datos actualizados con éxito!")
            st.rerun()

    # Clasificación en 3 columnas del documento
    clasificados = S.clasificar_beneficios(catalogo, ss.becado_perfil)
    
    col_podrias, col_tienes, col_requisito = st.columns(3)

    # 1. Podrías postular
    with col_podrias:
        st.markdown(f"### 🟢 Podrías Postular ({len(clasificados['podrias_postular'])})")
        st.caption("Beneficios a los que podrías optar según tu situación:")
        for b in clasificados["podrias_postular"]:
            st.markdown(f"""
            <div class="cat-box cat-podrias">
                <div style="font-weight:700;color:#166534;font-size:0.95rem">{b['nombre']}</div>
                <div style="font-size:0.8rem;color:#047857;margin:4px 0"><b>Plazo:</b> {b['plazo']}</div>
                <div style="font-size:0.85rem;color:#1F2937;margin-bottom:8px">{b['motivo']}</div>
                <div style="font-size:0.8rem;color:#4B5563"><b>Cómo acceder:</b> {b['como_acceder']}</div>
            </div>
            """, unsafe_allow_html=True)
            if st.button(f"🙋 Ayúdame a postular a {b['id']}", key=f"btn_post_{b['id']}", width="stretch"):
                cid = registrar_caso(pid, ss.becado_perfil["nombre"], "AMARILLA", f"Solicitud de postulación asistida a {b['nombre']}", b['id'], f"El estudiante solicitó ayuda para postular a {b['nombre']}.", "Asistente de Beneficios")
                st.success(f"¡Solicitud {cid} enviada al equipo de Fundación Puente!")

    # 2. Ya lo tienes
    with col_tienes:
        st.markdown(f"### 🔵 Ya lo Tienes ({len(clasificados['ya_lo_tienes'])})")
        st.caption("Apoyos actualmente vigentes en tu registro:")
        for b in clasificados["ya_lo_tienes"]:
            st.markdown(f"""
            <div class="cat-box cat-tienes">
                <div style="font-weight:700;color:#0369A1;font-size:0.95rem">{b['nombre']}</div>
                <div style="font-size:0.8rem;color:#0284C7;margin:4px 0"><b>Estado:</b> Vigente · {b['origen']}</div>
                <div style="font-size:0.85rem;color:#1F2937;margin-bottom:8px">{b['motivo']}</div>
                <div style="font-size:0.8rem;color:#4B5563"><b>Mantenimiento:</b> Cumplir actividades formativas y avance académico.</div>
            </div>
            """, unsafe_allow_html=True)

    # 3. Revisa este requisito
    with col_requisito:
        st.markdown(f"### 🟡 Revisa este Requisito ({len(clasificados['revisa_requisito'])})")
        st.caption("Trámites y condiciones preventivas:")
        for b in clasificados["revisa_requisito"]:
            st.markdown(f"""
            <div class="cat-box cat-requisito">
                <div style="font-weight:700;color:#B45309;font-size:0.95rem">{b['nombre']}</div>
                <div style="font-size:0.8rem;color:#D97706;margin:4px 0"><b>Fecha clave:</b> {b['plazo']}</div>
                <div style="font-size:0.85rem;color:#1F2937;margin-bottom:8px">{b['motivo']}</div>
                <div style="font-size:0.8rem;color:#4B5563"><b>Trámite:</b> {b['como_acceder']}</div>
            </div>
            """, unsafe_allow_html=True)

# ==============================================================================
# TAB 3: MI FICHA ÚNICA DEL BECADO (TRANSPARENCIA TOTAL EN 6 DIMENSIONES)
# ==============================================================================
with tab_ficha:
    st.markdown("#### 🗂️ Mi Ficha Única del Becado")
    st.caption("Cumpliendo el principio ético de transparencia y derecho a no ser perfilado a tus espaldas:")

    f1, f2 = st.columns(2)
    with f1:
        st.markdown(f"""
        <div class="card ok">
            <div class="c-tit">💰 1. Dimensión Económica</div>
            <div class="c-txt">
            • <b>Beca Mensual Fundación Puente:</b> Asignada (activa).<br>
            • <b>Cobertura Arancel:</b> {'Gratuidad Mineduc activa' if ss.becado_perfil['gratuidad'] else 'En evaluación socioeconómica / Copago'}.<br>
            • <b>Gastos de Transporte / Colación:</b> Apoyados por asignación mensual Puente.<br>
            <div style="font-size:0.78rem;color:#6B7280;margin-top:6px"><i>Origen: Formulario FUAS & Validación Social · Actualizado Nov 2026</i></div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown(f"""
        <div class="card info">
            <div class="c-tit">📚 2. Dimensión Académica</div>
            <div class="c-txt">
            • <b>Institución:</b> {ss.becado_perfil['institucion']}<br>
            • <b>Carrera:</b> {ss.becado_perfil['carrera']} ({ss.becado_perfil['jornada']})<br>
            • <b>Promedio Parcial Declarado:</b> {ss.becado_perfil['nota_promedio']:.1f}<br>
            • <b>Tutorías CAI:</b> Disponible para inscripción según necesidad.<br>
            <div style="font-size:0.78rem;color:#6B7280;margin-top:6px"><i>Origen: Declarado por el estudiante · Actualizado Nov 2026</i></div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown(f"""
        <div class="card gray">
            <div class="c-tit">👨‍👩‍👧 3. Dimensión Familiar</div>
            <div class="c-txt">
            • <b>Primera Generación:</b> Sí, primer profesional en su familia.<br>
            • <b>Personas al cuidado:</b> {'Declara dependientes a su cuidado' if ss.becado_perfil['cuida_dependientes'] else 'Sin personas a su cuidado'}.<br>
            • <b>Jornada laboral:</b> {'Trabaja compatibilizando estudios (' + str(ss.becado_perfil['horas_trabajo_semana']) + ' hrs)' if ss.becado_perfil['trabaja'] else 'Dedicación exclusiva al estudio'}.<br>
            <div style="font-size:0.78rem;color:#6B7280;margin-top:6px"><i>Origen: Entrevista Social de Ingreso · Verificado con certificado</i></div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with f2:
        st.markdown(f"""
        <div class="card warn">
            <div class="c-tit">🧠 4. Dimensión Bienestar</div>
            <div class="c-txt">
            • <b>Adaptación Universitaria:</b> En proceso de inserción al primer año.<br>
            • <b>Acceso CAI Psicosocial [S03]:</b> Disponible sin costo para atención psicológica o nutricional.<br>
            • <b>Cero Etiquetas:</b> La IA no almacena diagnósticos clínicos ni rasgos de personalidad.<br>
            <div style="font-size:0.78rem;color:#6B7280;margin-top:6px"><i>Origen: Autoreporte de Bienestar · Protegido por secreto ético</i></div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown(f"""
        <div class="card puente">
            <div class="c-tit">📍 5. Dimensión Red y Territorial</div>
            <div class="c-txt">
            • <b>Región de Origen:</b> {'Viene de región (optante a Residencia La Llave)' if ss.becado_perfil['de_region'] else 'Residencia en Región Metropolitana'}.<br>
            • <b>Red de Apoyo:</b> Comunidad de becados Fundación Puente y equipo de Pastoral.<br>
            <div style="font-size:0.78rem;color:#6B7280;margin-top:6px"><i>Origen: Formulario de Registro de Beca</i></div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown(f"""
        <div class="card ok">
            <div class="c-tit">🎁 6. Dimensión Beneficios Activos</div>
            <div class="c-txt">
            • <b>Beca Mensual Puente [S01]</b> · Activa.<br>
            • <b>TNE Tarjeta Nacional Estudiantil [S06]</b> · En uso.<br>
            • <b>Talleres Formativos [S08]</b> · Inscripción semestral requerida.<br>
            <div style="font-size:0.78rem;color:#6B7280;margin-top:6px"><i>Origen: Base Verificada Fundación Puente & Mineduc</i></div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with st.expander("✏️ Solicitar corrección o actualización en mi Ficha Única"):
        campo_corr = st.selectbox("Dimensión a corregir", ["Económica", "Académica", "Familiar", "Bienestar", "Red", "Beneficios"])
        detalle_corr = st.text_area("Detalla la actualización o corrección:")
        if st.button("Enviar solicitud de cambio"):
            if detalle_corr.strip():
                registrar_caso(pid, ss.becado_perfil["nombre"], "VERDE", f"Solicitud de cambio en dimensión {campo_corr}", "Ficha Única", detalle_corr, "Solicitud Becado Ficha")
                st.success("Tu solicitud fue enviada a tu trabajadora social para revisión y aprobación.")

# ==============================================================================
# TAB 4: BANDEJA DEL EQUIPO PSICOSOCIAL (DECISIÓN HUMANA OBLIGATORIA)
# ==============================================================================
with tab_bandeja:
    st.markdown("#### 📥 Bandeja de Casos y Situaciones de Apoyo Urgente")
    st.caption("Las alertas llegan aquí ordenadas por urgencia. **La IA no contacta sola a nadie**: una profesional revisa el motivo exacto y decide.")

    if not bandeja:
        N.tarjeta("La bandeja está al día", "No hay situaciones pendientes. Cuando un becado interactúe en el canal o pida apoyo con beneficios, aparecerá aquí.", "gray")
    else:
        PRIO = {"ROJA": 0, "CRISIS": 0, "alta": 1, "NARANJA": 1, "AMARILLA": 2, "media": 2, "VERDE": 3, "baja": 3}
        ordenados = sorted(bandeja, key=lambda x: (x["decision"] != "Pendiente", PRIO.get(x["alerta"], 4), x["caso"]))
        
        df_b = pd.DataFrame(ordenados)
        df_b["Nivel"] = df_b.alerta.map(lambda a: URG.get(a, (a, "gray"))[0])
        df_b["Apoyo"] = df_b.servicio_sugerido.map(lambda s: SERV.get(s, s))

        st.dataframe(df_b[["caso", "fecha", "estudiante", "Nivel", "frase_gatillante", "Apoyo", "decision"]].rename(columns={
            "caso": "Caso", "fecha": "Fecha", "estudiante": "Becado(a)", "Nivel": "Semáforo",
            "frase_gatillante": "Cita Textual que Activó", "Apoyo": "Servicio Sugerido", "decision": "Decisión"
        }), hide_index=True, width="stretch")

        sel_cid = st.selectbox("Selecciona caso para resolver", [x["caso"] for x in ordenados], format_func=lambda c: next(f"{x['caso']} · {URG.get(x['alerta'], (x['alerta'],))[0]} · {x['estudiante']}" for x in bandeja if x["caso"] == c))
        caso_obj = next(x for x in bandeja if x["caso"] == sel_cid)

        tag_u, col_u = URG.get(caso_obj["alerta"], (caso_obj["alerta"], "gray"))
        st.markdown(f"""
        <div class="card {'bad' if 'ROJA' in caso_obj['alerta'] or 'CRISIS' in caso_obj['alerta'] else ('warn' if 'NARANJA' in caso_obj['alerta'] else 'info')}">
            <div class="c-tit">{caso_obj['caso']} · {caso_obj['estudiante']} ({caso_obj['origen']})</div>
            <div class="c-txt">
            <b>Nivel Ético:</b> {N.badge(tag_u, col_u)}<br>
            <b>Cita Textual que Activó la Señal:</b> <i>"{N.md(caso_obj['frase_gatillante'])}"</i><br>
            <b>Resumen Situacional:</b> {N.md(caso_obj['resumen_ia'])}<br>
            <b>Servicio Sugerido del Catálogo:</b> {N.badge(SERV.get(caso_obj['servicio_sugerido'], caso_obj['servicio_sugerido']), 'puente')}
            </div>
        </div>
        """, unsafe_allow_html=True)

        with st.expander("Ver conversación completa o registro de solicitud"):
            st.text(caso_obj["conversacion"])

        with st.container(border=True):
            st.markdown("##### 👤 Decisión de la Profesional (Obligatoria)")
            dec_opciones = ["Llamar inmediatamente hoy", "Contactar en plazo de 48 horas", "Derivar a CAI Psicosocial/Tutoría", "Agendar seguimiento", "Cerrar sin acción requerida"]
            dec_elegida = st.radio("Acción a tomar:", dec_opciones, index=None, key=f"d_rad_{sel_cid}", horizontal=True)
            nota_prof = st.text_input("Nota profesional (opcional):", key=f"not_{sel_cid}")
            if st.button("Registrar Decisión y Cerrar Caso", type="primary"):
                if not dec_elegida:
                    st.warning("Debes seleccionar una acción concreta: la IA no toma decisiones por el equipo.")
                else:
                    caso_obj["decision"] = dec_elegida
                    N.registrar({"tipo": "decision_equipo_puente", "caso": sel_cid, "decision": dec_elegida, "nota": nota_prof})
                    st.success(f"Decisión registrada para {sel_cid}: {dec_elegida}")
                    st.rerun()

N.pie(ia)
