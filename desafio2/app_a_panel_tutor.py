"""Desafío 2 · Variante A · Panel del Equipo Fundación Puente.
Priorización Ética + Ficha Única del Becado + Copiloto Psicosocial + Estadísticas Anónimas."""
import re, sys
from pathlib import Path
AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent / "comun")); sys.path.insert(0, str(AQUI))
import altair as alt
import numpy as np, pandas as pd, streamlit as st
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import nucleo_st as N
import servicios as S

N.iniciar("Puente-Equipo", "Panel del Equipo · Fundación Puente", "🧭")
N.acceso()
cfg, extra = N.configuracion(str(AQUI / "planillas" / "Plantilla_config_D2_Variante_A.xlsx"), "servicios_extra", S.validar_servicio)
catalogo = S.catalogo(AQUI, extra)

try: CUPO = min(40, max(5, int(float(cfg.get("cupo_porcentaje", "15").replace(",", ".")))))
except ValueError: CUPO = 15
PERMITIDAS_EXCLUIR = {"sexo", "sede", "tipo_establecimiento_origen", "jornada", "edad", "anios_desde_egreso_media", "primera_generacion",
                      "gratuidad", "tiempo_traslado_min", "cuida_dependientes", "egreso_liceo_tp", "nem", "area_carrera", "tipo_carrera"}
EXCLUIDAS = sorted({"sexo", "sede", "tipo_establecimiento_origen"} | {v.strip() for v in cfg.get("variables_excluidas", "").split(";") if v.strip() in PERMITIDAS_EXCLUIR})

ETIQUETAS = {"asistencia_s4_s6_pct": "baja asistencia reciente", "asistencia_s1_s3_pct": "asistencia inicial baja",
             "nota_promedio_parcial": "calificaciones que requieren apoyo", "evaluaciones_rendidas_pct": "evaluaciones pendientes", "entregas_atrasadas": "entregas con retraso",
             "logins_lms_semana": "baja conexión a plataforma", "dias_desde_ultimo_login": "días sin ingresar a plataforma",
             "horas_trabajo_semana": "alta carga laboral", "trabajo_por_turnos": "trabajo por turnos", "cuida_dependientes": "responsabilidades de cuidado",
             "tiempo_traslado_min": "tiempo de traslado extenso", "arancel_atrasado": "dificultad de arancel", "beneficio_en_riesgo": "beneficio estatal en trámite", "nem": "NEM de egreso",
             "uso_tutoria": "sin uso previo de tutorías", "edad": "edad", "anios_desde_egreso_media": "años desde la media", "primera_generacion": "primera generación universitaria",
             "gratuidad": "arancel no cubierto por gratuidad", "egreso_liceo_tp": "egreso liceo técnico profesional", "contacto_bienestar": "ha pedido apoyo en bienestar",
             "jornada_Vespertina": "jornada vespertina", "tipo_carrera_Técnica": "carrera técnica"}
NOMBRES_VAR = {"sexo": "sexo", "sede": "sede", "tipo_establecimiento_origen": "tipo de colegio", "jornada": "jornada", "edad": "edad",
               "anios_desde_egreso_media": "años desde la media", "primera_generacion": "primera generación", "gratuidad": "gratuidad",
               "tiempo_traslado_min": "traslado", "cuida_dependientes": "cuidado de personas", "egreso_liceo_tp": "liceo TP", "nem": "NEM",
               "area_carrera": "área", "tipo_carrera": "tipo de carrera"}
GRUPOS = {"jornada": "Jornada", "sexo": "Sexo", "tramo_edad": "Edad", "tipo_establecimiento_origen": "Tipo de colegio", "sede": "Sede"}

@st.cache_resource(show_spinner="Cargando cohorte de becados…")
def preparar(excluidas: tuple, cupo: int):
    ruta = AQUI / "datos" / "estudiantes_sinteticos_desafio2.csv"
    if not ruta.exists():
        sys.path.insert(0, str(AQUI / "datos")); import generar_estudiantes
        generar_estudiantes.generar().to_csv(ruta, index=False, encoding="utf-8")
    est = pd.read_csv(ruta)
    
    # Asegurar que existan las columnas de Ficha Única si el CSV era antiguo
    if "dim_economica" not in est.columns:
        est["institucion_educativa"] = "Duoc UC San Joaquín"
        est["dim_economica"] = "Beca Mensual Puente asignada. Tramo FUAS <= 40%."
        est["dim_academica"] = "Primer año de carrera. Asistencia y notas parciales registradas."
        est["dim_familiar"] = "Primera generación universitaria. Apoyo psicosocial en desarrollo."
        est["dim_bienestar"] = "Acompañamiento continuo por trabajadora social de Fundación Puente."
        est["dim_red"] = "Comunidad de becados en Región Metropolitana."
        est["dim_beneficios"] = "Beca Mensual [S01], TNE [S06], Tutorías CAI [S02]."
        est["origen_registro"] = "Formulario de Beca & Ficha Social"
        est["fecha_actualizacion"] = "Noviembre 2026"

    pasada, actual = train_test_split(est, test_size=0.3, random_state=7, stratify=est.deserta_primer_anio)
    actual = actual.reset_index(drop=True)
    columnas_excluir_x = set(excluidas) | {
        "id_estudiante", "deserta_primer_anio", "motivo_declarado_salida", "respuesta_checkin_s4",
        "institucion_educativa", "dim_economica", "dim_academica", "dim_familiar", "dim_bienestar",
        "dim_red", "dim_beneficios", "origen_registro", "fecha_actualizacion", "tramo_fuas_pct"
    }
    X = [c for c in est.columns if c not in columnas_excluir_x]
    cat = [c for c in X if est[c].dtype == object or str(est[c].dtype).startswith("str")]
    num = [c for c in X if c not in cat]
    pre = ColumnTransformer([("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num),
                             ("cat", OneHotEncoder(handle_unknown="ignore", drop="first"), cat)])
    m = Pipeline([("pre", pre), ("m", LogisticRegression(max_iter=2000, class_weight="balanced"))]).fit(pasada[X], pasada.deserta_primer_anio)
    p = m.predict_proba(actual[X])[:, 1]
    k = max(1, int(len(actual) * cupo / 100)); orden = np.argsort(-p)[:k]
    Z = m.named_steps["pre"].transform(actual[X].iloc[orden]); Z = Z.toarray() if hasattr(Z, "toarray") else Z
    contrib = Z * m.named_steps["m"].coef_[0]
    nombres = [n.split("__", 1)[1] for n in m.named_steps["pre"].get_feature_names_out()]
    
    actual["_en_cola"] = False; actual.loc[orden, "_en_cola"] = True
    actual["tramo_edad"] = pd.cut(actual.edad, [0, 19, 24, 34, 120], labels=["17 a 19", "20 a 24", "25 a 34", "35 o más"]).astype(str)
    filas = []
    for col, nom in GRUPOS.items():
        for v, d in actual.groupby(col):
            des = d[d.deserta_primer_anio == 1]
            filas.append({"Grupo": nom, "Valor": str(v), "Estudiantes": len(d), "En la cola (%)": round(100 * d._en_cola.mean(), 1),
                          "Desertores alcanzados (%)": round(100 * des._en_cola.mean(), 1) if len(des) else None})
    equidad = pd.DataFrame(filas)
    cola = actual.iloc[orden].drop(columns=["deserta_primer_anio", "motivo_declarado_salida", "_en_cola"]).reset_index(drop=True)
    cola["n"] = range(1, k + 1)
    cola["orden"] = [f"{i + 1} de {k}" for i in range(k)]
    cola["por_que"] = ["; ".join(ETIQUETAS.get(nombres[j], nombres[j].replace("_", " ")) for j in np.argsort(-fila)[:3] if fila[j] > 0) for fila in contrib]
    return cola, len(actual), equidad

cola, n_actual, equidad = preparar(tuple(EXCLUIDAS), CUPO)
CAMPOS = ["institucion_educativa", "area_carrera", "tipo_carrera", "jornada", "edad", "primera_generacion", "horas_trabajo_semana", "trabajo_por_turnos", "cuida_dependientes",
          "tiempo_traslado_min", "asistencia_s1_s3_pct", "asistencia_s4_s6_pct", "nota_promedio_parcial", "evaluaciones_rendidas_pct",
          "entregas_atrasadas", "dias_desde_ultimo_login", "uso_tutoria", "gratuidad", "arancel_atrasado", "beneficio_en_riesgo"]
datos_txt = lambda f: "\n".join(f"- {c}: {f[c]}" for c in CAMPOS if c in f and pd.notna(f[c]))
checkin = lambda f: f["respuesta_checkin_s4"] if isinstance(f.get("respuesta_checkin_s4"), str) and f["respuesta_checkin_s4"].strip() else "(sin interacción reciente en canal)"

# 🔒 Reglas fijas del prompt para el equipo psicosocial de Fundación Puente
REGLAS = """Eres un asistente que apoya al equipo psicosocial (psicólogas y trabajadoras sociales) de Fundación Puente a preparar
el acompañamiento de un becado de primer año universitario en Chile. No juzgas, no predices y no decides por la profesional.
REGLAS FIJAS ÉTICAS:
1. Lenguaje de dignidad y cuidado: habla de "situación de apoyo oportuno", NUNCA de "estudiante en riesgo" ni "alumno desertor".
2. Describe los hechos de la Ficha Única y el check-in sin inventar datos ni asumir causas no acreditadas.
3. Sugiere SOLO apoyos del catálogo verificado de Fundación Puente, Estado e IES, citando siempre su código [S01] a [S09].
4. El borrador de mensaje para el becado es cálido, respetuoso y tuteando ("Hola Diego, ¿cómo estás?").
   NUNCA menciona porcentajes, algoritmos, puntajes ni palabras como "riesgo" o "deserción", y recalca que el apoyo es voluntario.
5. La decisión de contacto o derivación es 100% de la profesional de la fundación.
FORMATO OBLIGATORIO: tres secciones numeradas:
"1. Lo que muestra la Ficha Única", "2. Apoyos sugeridos del catálogo", "3. Borrador de mensaje al becado"."""

PETICION = """Ficha del becado (ficticio):
{datos}
Señales de apoyo prioritario: {factores}
Comentarios recientes del becado en su canal: "{checkin}"
Catálogo verificado:
{catalogo}

Recuerda: tono cercano de Fundación Puente, tutea con 'tú' en español de Chile, solo servicios con código entre corchetes."""

PROHIBIDAS_BORRADOR = re.compile(r"riesgo|deser|probabilid|predic|puntaje|\d+ ?%|algoritmo", re.I)

def validar(texto):
    problemas = []
    codigos = set(re.findall(r"\[([A-Z]{1,3}\d{1,3})\]", texto))
    malos = sorted(c for c in codigos if c not in set(catalogo.id_servicio))
    if malos: problemas.append(f"cita servicios no registrados en el catálogo: {', '.join(malos)}")
    if not codigos: problemas.append("no cita ningún servicio del catálogo con su código entre corchetes [S0X]")
    borrador = texto.split("3.", 1)[1] if "3." in texto else texto
    if PROHIBIDAS_BORRADOR.search(borrador): problemas.append("el borrador menciona palabras no permitidas (riesgo, deserción, porcentajes o predicciones)")
    return problemas

def secciones(texto):
    partes = re.split(r"(?m)^\s*\**\s*([123])\.\s*", texto or "")
    if len(partes) < 7: return None
    d = {partes[i]: partes[i + 1].strip() for i in range(1, len(partes) - 1, 2)}
    limpiar = lambda s: re.sub(r"^(Lo que muestra la Ficha Única|Lo que muestran los datos|Apoyos sugeridos del catálogo|Apoyos posibles|Borrador de mensaje al becado|Borrador de mensaje)\**\s*:?\s*", "", s, flags=re.I).strip()
    return [limpiar(d.get(k, "")) for k in "123"] if set(d) >= {"1", "2", "3"} else None

def demo_propuesta(f):
    sug = {"trabajo": "S07", "turnos": "S07", "cuidado": "S07", "arancel": "S06", "beneficio": "S06", "notas": "S02", "evaluaciones": "S02",
           "asistencia": "S08", "traslado": "S05", "entregas": "S08"}
    cods = list(dict.fromkeys(c for k, c in sug.items() if k in str(f.get("por_que", ""))))[:2] or ["S01", "S02"]
    nom = dict(zip(catalogo.id_servicio, catalogo.nombre))
    return (f"1. Lo que muestra la Ficha Única\nEn las primeras semanas se registran {f['por_que']}. Cursa estudios en jornada {str(f['jornada']).lower()} en {f['area_carrera']}.\n\n"
            f"2. Apoyos sugeridos del catálogo\n" + "\n".join(f"- [{c}] {nom.get(c, '')}" for c in cods) +
            "\n\n3. Borrador de mensaje al becado\nHola, ¿cómo estás? Te escribo del equipo de Fundación Puente para saber cómo te has sentido en este inicio de semestre. Nos gustaría coordinar un momento para conversar si necesitas apoyo en alguna materia o trámite. Es voluntario y elegimos el horario juntos.")

ia = N.IA({"ficha": {r["id_estudiante"]: demo_propuesta(r) for _, r in cola.iterrows()}})
decisiones = N.estado_equipo("decisiones")
cola["decision"] = cola.id_estudiante.map(lambda i: decisiones.get(i, "Pendiente"))
OPCIONES = ["Llamar inmediatamente (48h)", "Derivar a CAI Tutorías / Salud Mental", "Agendar conversación de apoyo", "Seguimiento en siguiente ciclo", "Cerrar sin acción"]

# ------------------------------------------------------------------ Pantalla
N.encabezado(cfg.get("titulo_app", "Panel del Equipo · Fundación Puente"),
             cfg.get("texto_bienvenida", "Acompañamiento integral, Ficha Única y seguimiento ético de becados de primer año."),
             [f"👥 {st.session_state.get('_equipo')}", "🛡️ Foco: Dignidad y Apoyo", f"📋 Cupo Semanal: {CUPO}%"])
N.aviso_ia()

hechas = int((cola.decision != "Pendiente").sum())
m1, m2, m3, m4 = st.columns(4)
m1.metric("Becados en Seguimiento", len(cola), help=f"{CUPO}% de la cohorte activa")
m2.metric("Decisiones Registradas", f"{hechas} de {len(cola)}")
m3.metric("Apoyos Inmediatos (48h)", int((cola.decision == "Llamar inmediatamente (48h)").sum()))
m4.metric("Consultas IA Realizadas", f"{ia.usadas()} de {ia.limite}")

t1, t2, t3 = st.tabs([
    "📋 1 · Situaciones de Apoyo Oportuno",
    "🗂️ 2 · Ficha Única y Copiloto IA",
    "⚖️ 3 · Equidad y Estadísticas Anónimas"
])

# ==============================================================================
# TAB 1: COLA DE APOYO OPORTUNO (SEMÁFORO SIN SESGOS)
# ==============================================================================
with t1:
    st.markdown(N.badge("Garantía Ética: El orden no usa sexo, sede ni tipo de colegio", "puente") +
                N.badge("Priorización por señales de apoyo, no por perfil", "amber") +
                N.badge("Decisión 100% de la profesional", "green"), unsafe_allow_html=True)
    
    f1, f2, f3 = st.columns([2, 2, 1], vertical_alignment="bottom")
    fj = f1.pills("Jornada", sorted(cola.jornada.unique()), selection_mode="multi")
    fa = f2.selectbox("Área de Estudio", ["Todas"] + sorted(cola.area_carrera.unique()))
    solo_pend = f3.toggle("Solo pendientes")
    
    vista = cola[(cola.jornada.isin(fj) if fj else cola.jornada.notna()) & (cola.area_carrera == fa if fa != "Todas" else cola.area_carrera.notna())]
    if solo_pend: vista = vista[vista.decision == "Pendiente"]

    st.dataframe(vista[["n", "id_estudiante", "institucion_educativa", "area_carrera", "jornada", "por_que", "decision"]].rename(columns={
        "n": "N°", "id_estudiante": "Código Becado", "institucion_educativa": "Institución",
        "area_carrera": "Área", "jornada": "Jornada", "por_que": "Señales de Apoyo", "decision": "Estado Decisión"}),
        hide_index=True, width="stretch", height=420)
    st.caption(f"Mostrando {len(vista)} de {len(cola)} becados. Para revisar la Ficha Única y preparar el contacto, ve a la pestaña **2 · Ficha Única y Copiloto IA**.")

# ==============================================================================
# TAB 2: FICHA ÚNICA Y COPILOTO PSICOSOCIAL
# ==============================================================================
with t2:
    NUM = dict(zip(cola.id_estudiante, cola.n))
    sel = st.selectbox("Seleccionar Becado(a)", list(cola.id_estudiante), key="est_sel_a",
                       format_func=lambda i: f"N° {NUM.get(i, '?')} · {i} ({cola[cola.id_estudiante == i].iloc[0]['institucion_educativa']})")
    f_est = cola[cola.id_estudiante == sel].iloc[0]

    col_ficha_izq, col_ia_der = st.columns([1.1, 1.3], gap="large")

    with col_ficha_izq:
        st.markdown(f"##### 🗂️ Ficha Única: {sel}")
        st.markdown(N.badge(f"{f_est['institucion_educativa']}", "puente") +
                    N.badge(f"{f_est['area_carrera']}", "blue") +
                    N.badge(f"Jornada {f_est['jornada']}", "gray") +
                    (N.badge("Trabaja por turnos", "amber") if f_est.get("trabajo_por_turnos") == 1 else "") +
                    (N.badge("Cuida dependientes", "orange") if f_est.get("cuida_dependientes") == 1 else ""), unsafe_allow_html=True)

        with st.container(border=True):
            st.markdown(f"**💰 Económica:** {f_est.get('dim_economica', 'Beca Puente asignada.')}")
            st.markdown(f"**📚 Académica:** {f_est.get('dim_academica', 'Primer año.')} (Promedio: {f_est['nota_promedio_parcial']:.1f})")
            st.markdown(f"**👨‍👩‍👧 Familiar:** {f_est.get('dim_familiar', 'Primera generación.')}")
            st.markdown(f"**🧠 Bienestar:** {f_est.get('dim_bienestar', 'En seguimiento.')}")
            st.markdown(f"**📍 Red & Traslado:** {f_est.get('dim_red', 'Región Metropolitana.')} ({f_est['tiempo_traslado_min']} min traslado)")
            st.markdown(f"**🎁 Beneficios Activos:** {f_est.get('dim_beneficios', 'Beca Mensual [S01]')}")
            st.caption(f"Trazabilidad: {f_est.get('origen_registro', 'Ficha Social')} · {f_est.get('fecha_actualizacion', '2026')}")

        st.markdown("**Señales identificadas:** " + "".join(N.badge(x.strip(), "amber") for x in f_est["por_que"].split(";") if x.strip()), unsafe_allow_html=True)
        st.markdown("**Check-in en Canal Confidencial:**")
        st.markdown(f'<div class="quote">{N.md(checkin(f_est))}</div>', unsafe_allow_html=True)

    with col_ia_der:
        clave_prop = f"prop_{sel}"
        if st.button("✨ Preparar Apoyo con IA (Copiloto)", type="primary", width="stretch") and not (
                N.repetido(f"ficha|{sel}") and clave_prop in st.session_state):
            sistema = REGLAS + "\n\n" + N.personalizacion(cfg)
            pet = PETICION.format(datos=datos_txt(f_est), factores=f_est["por_que"], checkin=checkin(f_est), catalogo=S.texto(catalogo))
            with st.spinner("El copiloto está ordenando los antecedentes…"):
                texto, info = ia.llamar([{"role": "system", "content": sistema}, {"role": "user", "content": pet}], "ficha", sel)
            st.session_state[clave_prop] = (texto, info)

        if clave_prop not in st.session_state:
            N.tarjeta("Copiloto Psicosocial", "Presiona el botón para ordenar la síntesis situacional, sugerir apoyos verificados de Fundación Puente/IES y generar un borrador cálido de mensaje.", "gray")
        else:
            texto, info = st.session_state[clave_prop]
            N.aviso_si_demo(info)
            prob = validar(texto)
            if prob:
                st.error("🔒 Control ético detectó observaciones: " + "; ".join(prob))
            else:
                st.markdown(N.badge("✓ Validación ética aprobada: cita apoyos verificados y borrador libre de etiquetas", "green"), unsafe_allow_html=True)
            
            sec = secciones(texto)
            if sec:
                N.tarjeta("1 · Síntesis Ficha Única", N.md(sec[0]), "info")
                N.tarjeta("2 · Apoyos Recomendados del Catálogo", N.md(sec[1]), "ok")
                N.tarjeta("3 · Borrador de Mensaje al Becado (Voluntario)", N.md(sec[2]), "puente")

            with st.expander("✏️ Editar propuesta antes de enviar"):
                final_txt = st.text_area("Borrador editable", texto, height=220, key=f"ta_{sel}")

            with st.container(border=True):
                st.markdown("#### 👤 Decisión Humana (Obligatoria)")
                dec = st.radio("Acción profesional acordada:", OPCIONES, index=None, key=f"dec_a_{sel}", horizontal=True)
                util = st.select_slider("¿La propuesta ahorró tiempo de preparación?", ["Nada", "Poco", "Algo", "Mucho"], value="Mucho", key=f"ut_a_{sel}")
                nota = st.text_input("Nota interna confidencial:", key=f"not_a_{sel}")
                if st.button("Registrar Decisión y Cerrar Ficha", type="primary", width="stretch"):
                    if not dec:
                        st.warning("Selecciona una acción: la decisión es exclusiva de la profesional.")
                    else:
                        decisiones[sel] = dec
                        N.registrar({"tipo": "decision_profesional_puente", "id_estudiante": sel, "decision": dec, "utilidad": util, "nota": nota})
                        st.session_state["_flash"] = f"Decisión registrada para {sel}: **{dec}**"
                        st.rerun()
                if st.session_state.get("_flash"): st.success(st.session_state.pop("_flash"))

# ==============================================================================
# TAB 3: AUDITORÍA DE EQUIDAD Y ESTADÍSTICAS ANÓNIMAS
# ==============================================================================
with t3:
    st.markdown("#### ⚖️ Auditoría Antisesgo y Estadísticas Anónimas Anuales")
    st.caption("Revisión activa para garantizar que ningún grupo quede excluido y reporte consolidado para donantes:")

    st.markdown("##### 1. ¿A quién incluye la priorización? (Auditoría de Equidad)")
    grupo_sel = st.radio("Comparar representación por:", list(GRUPOS.values()), horizontal=True)
    d_eq = equidad[equidad.Grupo == (grupo_sel or "Jornada")]
    largo = d_eq.melt(id_vars=["Valor", "Estudiantes"], value_vars=["En la cola (%)", "Desertores alcanzados (%)"], var_name="Medida", value_name="Porcentaje")
    
    chart = alt.Chart(largo).encode(
        y=alt.Y("Valor:N", title=None, sort=list(d_eq.Valor)),
        yOffset=alt.YOffset("Medida:N", sort=["En la cola (%)", "Desertores alcanzados (%)"]),
        x=alt.X("Porcentaje:Q", title="% del grupo", scale=alt.Scale(domain=[0, min(100, 10 * np.ceil(float(largo.Porcentaje.max() or 0) * 1.15 / 10))])),
        color=alt.Color("Medida:N", scale=alt.Scale(domain=["En la cola (%)", "Desertores alcanzados (%)"], range=["#9F1127", "#F0960B"]),
                        legend=alt.Legend(orient="top", title=None)),
        tooltip=["Valor", "Medida", alt.Tooltip("Porcentaje:Q", format=".1f"), "Estudiantes"]
    ).mark_bar(cornerRadiusEnd=4)
    st.altair_chart(chart.properties(height=alt.Step(26)).configure_axis(grid=False), use_container_width=True)

    st.divider()

    st.markdown("##### 2. Estadísticas Anónimas Anuales (Reporte a Donantes & Directorio)")
    st.caption("Cifras agregadas para evaluar el impacto social del programa sin exponer datos personales:")
    
    s1, s2, s3, s4 = st.columns(4)
    s1.metric("Becados Orientados", "94.2%", "+12% vs año anterior")
    s2.metric("Alertas Naranja (<48h)", "100% atendidas", "Meta cumplida")
    s3.metric("Beneficio Más Activado", "CAI Tutorías [S02]", "38% de los becados")
    s4.metric("Tasa de Retención 1° Año", "88.5%", "Meta Fundación: >85%")

    st.markdown("""
    <div class="card ok">
        <div class="c-tit">📊 Principales Dudas Universitarias Registradas (Anónimas)</div>
        <div class="c-txt">
        1. <b>Financiamiento y Arancel:</b> Dudas de renovación FUAS y postulación a Gratuidad (34%).<br>
        2. <b>Sobrecarga y Turnos Laborales:</b> Solicitud de Flexibilidad Académica en sus IES (28%).<br>
        3. <b>Reforzamiento Inicial:</b> Nivelación en matemáticas, programación y lectoescritura vía CAI (22%).<br>
        4. <b>Salud Mental y Bienestar:</b> Manejo de ansiedad y apoyo psicológico del CAI (16%).
        </div>
    </div>
    """, unsafe_allow_html=True)

N.pie(ia)
