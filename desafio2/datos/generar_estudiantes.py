"""Genera un dataset SINTÉTICO de estudiantes de primer año ESTP (IP/CFT) para el
Desafío 2 de la Hackathon IA Congreso Social UC 2026.

Ningún registro corresponde a una persona real. Las proporciones están calibradas
de forma aproximada con cifras públicas (SIES, FCU piloto 2024) para que el
dataset sea verosímil, no para replicar a ninguna institución.
"""
import numpy as np
import pandas as pd

def generar() -> pd.DataFrame:
    """Regenera el dataset sintético (semilla fija 2026: siempre el mismo resultado)."""
    rng = np.random.default_rng(2026)
    N = 3000
    
    sedes = {  # nombre: (peso, índice vulnerabilidad 0-1, traslado medio min)
        "Sede Centro": (0.20, 0.35, 45),
        "Sede Norte": (0.18, 0.60, 70),
        "Sede Sur": (0.18, 0.65, 75),
        "Sede Oriente": (0.14, 0.20, 40),
        "Sede Poniente": (0.17, 0.55, 65),
        "Sede Regional": (0.13, 0.50, 35),
    }
    areas = {  # área: (peso, % técnica, % mujeres, dificultad)
        "Informática": (0.20, 0.45, 0.18, 0.30),
        "Salud": (0.16, 0.70, 0.80, 0.10),
        "Administración": (0.18, 0.50, 0.62, 0.00),
        "Construcción": (0.12, 0.55, 0.20, 0.35),
        "Diseño": (0.10, 0.40, 0.60, 0.05),
        "Gastronomía y Turismo": (0.10, 0.65, 0.55, 0.15),
        "Mecánica y Electricidad": (0.14, 0.70, 0.08, 0.40),
    }
    
    def pick(d, n):
        keys = list(d)
        p = np.array([d[k][0] for k in keys]); p = p / p.sum()
        return rng.choice(keys, size=n, p=p)
    
    df = pd.DataFrame({"id_estudiante": [f"EST-{i:05d}" for i in range(1, N + 1)]})
    df["sede"] = pick(sedes, N)
    df["area_carrera"] = pick(areas, N)
    vuln = df["sede"].map(lambda s: sedes[s][1]).to_numpy()
    dific = df["area_carrera"].map(lambda a: areas[a][3]).to_numpy()
    
    df["tipo_carrera"] = np.where(rng.random(N) < df["area_carrera"].map(lambda a: areas[a][1]), "Técnica", "Profesional")
    p_fem = df["area_carrera"].map(lambda a: areas[a][2]).to_numpy()
    u = rng.random(N)
    df["sexo"] = np.where(u < 0.004, "No binario", np.where(u < p_fem, "Femenino", "Masculino"))
    
    # Edad: mezcla de egresados recientes y adultos que vuelven a estudiar
    adulto = rng.random(N) < 0.33
    edad = np.where(adulto, rng.normal(32, 7, N), rng.normal(19.5, 1.5, N))
    df["edad"] = np.clip(edad, 17, 58).round().astype(int)
    df["jornada"] = np.where(rng.random(N) < np.where(df["edad"] >= 24, 0.62, 0.12), "Vespertina", "Diurna")
    
    p_mun = 0.40 + 0.35 * vuln
    u = rng.random(N)
    df["tipo_establecimiento_origen"] = np.where(u < p_mun, "Municipal/SLEP",
                                           np.where(u < 0.975, "Particular subvencionado", "Particular pagado"))
    df["egreso_liceo_tp"] = (rng.random(N) < 0.41).astype(int)
    df["anios_desde_egreso_media"] = np.clip(df["edad"] - 18 + rng.integers(-1, 2, N), 0, 40)
    df["nem"] = np.clip(rng.normal(5.55 - 0.35 * vuln, 0.45, N), 4.0, 7.0).round(1)
    df["primera_generacion"] = (rng.random(N) < 0.62 + 0.25 * vuln).astype(int)
    df["gratuidad"] = (rng.random(N) < 0.55 + 0.30 * vuln).astype(int)
    
    # Trabajo y cuidado
    p_trab = np.clip(0.25 + 0.012 * (df["edad"] - 18) + 0.25 * (df["jornada"] == "Vespertina"), 0, 0.95)
    trabaja = rng.random(N) < p_trab
    horas = np.where(trabaja, np.clip(rng.normal(np.where(df["jornada"] == "Vespertina", 40, 22), 9), 6, 50), 0)
    df["horas_trabajo_semana"] = horas.round().astype(int)
    df["trabajo_por_turnos"] = ((trabaja) & (rng.random(N) < 0.35)).astype(int)
    p_cuida = np.clip(0.08 + 0.018 * (df["edad"] - 18) + 0.10 * (df["sexo"] == "Femenino"), 0, 0.85)
    df["cuida_dependientes"] = (rng.random(N) < p_cuida).astype(int)
    df["tiempo_traslado_min"] = np.clip(rng.normal(df["sede"].map(lambda s: sedes[s][2]), 20), 5, 150).round().astype(int)
    
    # Riesgo latente (solo para generar; NO se entrega)
    z = (
        -1.15
        + 0.022 * df["horas_trabajo_semana"]
        + 0.45 * df["trabajo_por_turnos"]
        + 0.40 * df["cuida_dependientes"]
        + 0.05 * (df["jornada"] == "Vespertina")
        + 0.25 * df["primera_generacion"]
        - 0.55 * (df["nem"] - 5.3)
        + 0.006 * (df["tiempo_traslado_min"] - 50)
        - 0.45 * df["gratuidad"]
        + 0.90 * dific
        + 0.25 * (df["tipo_carrera"] == "Técnica")
        + 0.30 * (df["sexo"] == "Masculino")
        + rng.normal(0, 0.85, N)
    )
    df["zlat"] = z
    
    # Señales tempranas (semanas 1–6) derivadas del riesgo latente
    df["asistencia_s1_s3_pct"] = np.clip(rng.normal(90 - 6 * z, 8), 20, 100).round()
    df["asistencia_s4_s6_pct"] = np.clip(df["asistencia_s1_s3_pct"] - np.clip(rng.normal(4 + 9 * z, 8), -10, 60), 0, 100).round()
    df["evaluaciones_rendidas_pct"] = np.clip(rng.normal(92 - 10 * z, 10), 0, 100).round()
    df["nota_promedio_parcial"] = np.clip(rng.normal(4.9 - 0.45 * z + 0.4 * (df["nem"] - 5.3), 0.6), 1.0, 7.0).round(1)
    df["entregas_atrasadas"] = rng.poisson(np.clip(0.8 + 1.1 * z, 0.1, 8))
    df["logins_lms_semana"] = np.clip(rng.normal(9 - 2.2 * z, 2.5), 0, 30).round(1)
    df["dias_desde_ultimo_login"] = rng.poisson(np.clip(2 + 3 * z, 0.3, 25))
    df["uso_tutoria"] = (rng.random(N) < np.clip(0.22 - 0.03 * z, 0.03, 0.6)).astype(int)
    df["contacto_bienestar"] = (rng.random(N) < 0.10).astype(int)
    df["arancel_atrasado"] = np.where(df["gratuidad"] == 1, 0, (rng.random(N) < np.clip(0.18 + 0.12 * z, 0, 0.9)).astype(int))
    df["beneficio_en_riesgo"] = np.where(df["gratuidad"] == 1, (rng.random(N) < np.clip(0.06 + 0.06 * z, 0, 0.6)).astype(int), 0)
    
    # Etiqueta: deserción al inicio del 2° año (incluye efecto de señales + ruido)
    logit = (z * 1.0 - 0.10
             - 0.025 * (df["asistencia_s4_s6_pct"] - 80)
             - 0.50 * (df["nota_promedio_parcial"] - 4.5)
             + 0.45 * df["arancel_atrasado"] + 0.6 * df["beneficio_en_riesgo"]
             - 0.35 * df["uso_tutoria"])
    p = 1 / (1 + np.exp(-(logit - 0.25)))
    df["deserta_primer_anio"] = (rng.random(N) < p).astype(int)
    
    motivos = ["Laboral/horario", "Económico", "Vocacional", "Familiar/cuidado", "Académico", "Salud/bienestar", "Traslado"]
    def motivo(r):
        w = np.array([0.6 + r.horas_trabajo_semana / 25, 0.6 + r.arancel_atrasado + r.beneficio_en_riesgo,
                      0.8, 0.4 + 1.5 * r.cuida_dependientes, 0.4 + max(0, 4.5 - r.nota_promedio_parcial),
                      0.5, 0.2 + max(0, r.tiempo_traslado_min - 60) / 40])
        return rng.choice(motivos, p=w / w.sum())
    df["motivo_declarado_salida"] = [motivo(r) if r.deserta_primer_anio else "" for r in df.itertuples()]
    
    # Respuesta abierta a check-in de bienestar (semana 4), texto sintético
    frases = {
        "ok": ["Todo bien por ahora, me gusta la carrera.", "Me está costando un poco matemáticas pero voy bien.",
               "Contento con el grupo de curso.", "Sin problemas, gracias por preguntar.", ""],
        "trabajo": ["Me cambiaron el turno en la pega y llego tarde a clases.", "Trabajo de lunes a sábado y no alcanzo a estudiar.",
                    "Salgo del trabajo muy cansado y me quedo dormido en clases."],
        "cuidado": ["No tengo con quién dejar a mi hijo en la tarde.", "Mi mamá está enferma y la estoy cuidando.",
                    "Se me hace difícil compatibilizar con la casa y los niños."],
        "academico": ["No entiendo nada en programación y me da vergüenza preguntar.", "Me fue mal en la primera prueba y estoy desmotivada.",
                      "Siento que no tengo la base del liceo para esto."],
        "economico": ["Estoy esperando que me salga la gratuidad, si no no puedo seguir.", "No me alcanza para la locomoción todos los días.",
                      "Debo dos cuotas y me da miedo que me echen."],
        "vocacional": ["No sé si esta carrera es para mí.", "Entré porque mi familia quería, pero no me gusta."],
    }
    def checkin(r):
        if rng.random() < 0.35:
            return ""  # no responde
        w = {"ok": 3.0 - 1.5 * r.zlat, "trabajo": 0.3 + r.horas_trabajo_semana / 20, "cuidado": 0.2 + 1.5 * r.cuida_dependientes,
             "academico": 0.3 + max(0, 4.8 - r.nota_promedio_parcial), "economico": 0.2 + r.arancel_atrasado + r.beneficio_en_riesgo,
             "vocacional": 0.4}
        k = list(w); pw = np.clip(np.array([w[x] for x in k]), 0.05, None); pw /= pw.sum()
        cat = rng.choice(k, p=pw)
        return rng.choice(frases[cat])
    df["respuesta_checkin_s4"] = [checkin(r) for r in df.itertuples()]
    
    # Dimensiones de la Ficha Única del Becado (Fundación Puente)
    inst_list = ["Duoc UC San Joaquín", "INACAP Santiago Centro", "Santo Tomás Santiago", "Universidad Central", "Universidad de Chile", "Pontificia Universidad Católica", "IP Chile"]
    df["institucion_educativa"] = rng.choice(inst_list, size=N)
    df["tramo_fuas_pct"] = np.where(df["gratuidad"] == 1, rng.integers(10, 41, N), rng.integers(40, 70, N))
    
    def ficha_eco(r):
        return f"Tramo FUAS {r.tramo_fuas_pct}%. Beca Mensual Puente asignada. Arancel: {'Gratuidad activa' if r.gratuidad == 1 else 'Pendiente / En copago'}."
    def ficha_acad(r):
        return f"Promedio parcial {r.nota_promedio_parcial:.1f}. Asistencia actual {r.asistencia_s4_s6_pct:.0f}%. Entregas atrasadas: {r.entregas_atrasadas}."
    def ficha_fam(r):
        return f"{'Primera generación universitaria en su familia. ' if r.primera_generacion == 1 else ''}{'Tiene personas dependientes a su cuidado. ' if r.cuida_dependientes == 1 else 'Sin dependientes declarados.'}"
    def ficha_bienestar(r):
        return f"{'Reporta necesidad de apoyo psicosocial. ' if r.contacto_bienestar == 1 else 'Sin alertas críticas en su check-in. '}"
    def ficha_red(r):
        return f"{'Traslado extenso (' + str(r.tiempo_traslado_min) + ' min). ' if r.tiempo_traslado_min > 60 else 'Traslado habitual. '}{'Sede ' + r.sede + '.'}"
    def ficha_beneficios(r):
        return f"Beca Mensual Puente [S01]{', Gratuidad [S06]' if r.gratuidad == 1 else ''}, TNE [S06]{', Ayuda de Cuidado [S05]' if r.cuida_dependientes == 1 else ''}."

    df["dim_economica"] = [ficha_eco(r) for r in df.itertuples()]
    df["dim_academica"] = [ficha_acad(r) for r in df.itertuples()]
    df["dim_familiar"] = [ficha_fam(r) for r in df.itertuples()]
    df["dim_bienestar"] = [ficha_bienestar(r) for r in df.itertuples()]
    df["dim_red"] = [ficha_red(r) for r in df.itertuples()]
    df["dim_beneficios"] = [ficha_beneficios(r) for r in df.itertuples()]
    df["origen_registro"] = "Formulario Becado & Verificación Social"
    df["fecha_actualizacion"] = "Noviembre 2026"

    df = df.drop(columns=["zlat"])
    # Algunos faltantes realistas
    for c, frac in [("nem", 0.04), ("logins_lms_semana", 0.03), ("tiempo_traslado_min", 0.06)]:
        df.loc[rng.random(N) < frac, c] = np.nan
    return df


if __name__ == "__main__":
    import sys
    generar().to_csv(sys.argv[1], index=False, encoding="utf-8")
