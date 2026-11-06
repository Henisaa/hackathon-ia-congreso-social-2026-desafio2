"""Catálogo de servicios y beneficios: base verificada de Fundación Puente, Estado (Mineduc/Junaeb) e IES,
más filas que agrega el equipo en la pestaña `servicios_extra`."""
import re
import pandas as pd

CATEGORIAS = {"academico", "economico", "laboral", "cuidado", "bienestar", "vocacional", "organizacion", "traslado"}
ORIGENES = {"real", "sintético", "sintetico"}
BASE_IDS = {f"S{i:02d}" for i in range(1, 10)}

def validar_servicio(fila) -> str:
    g = lambda c: str(fila.get(c, "")).strip()
    if not re.fullmatch(r"[A-Za-z]{1,3}\d{1,3}", g("id_servicio")): return "id_servicio debe ser 1 a 3 letras y 1 a 3 números, por ejemplo X01"
    if g("id_servicio").upper() in BASE_IDS: return "ese id ya existe en el catálogo base (usen X01, X02…)"
    if g("categoria").lower() not in CATEGORIAS: return f"categoria debe ser una de: {', '.join(sorted(CATEGORIAS))}"
    for c in ("nombre", "para_que_sirve", "cuando_sugerirlo", "como_acceder"):
        if not g(c): return f"falta completar '{c}'"
    if not g("fuente_url").startswith("http"): return "fuente_url debe ser un enlace (http…) a la fuente del servicio"
    if g("origen_dato").lower() not in ORIGENES: return "origen_dato debe ser 'real' o 'sintético'"
    return ""

def catalogo(aqui, extra: pd.DataFrame | None = None) -> pd.DataFrame:
    base = pd.read_csv(aqui / "datos" / "catalogo_servicios.csv", dtype=str)
    if extra is not None and len(extra):
        ex = extra.copy(); ex["id_servicio"] = ex["id_servicio"].str.strip().str.upper()
        # Aseguramos que tenga las columnas mínimas
        for col in base.columns:
            if col not in ex.columns:
                ex[col] = ""
        base = pd.concat([base, ex[base.columns]], ignore_index=True).drop_duplicates("id_servicio")
    return base

def texto(cat: pd.DataFrame) -> str:
    lineas = []
    for r in cat.itertuples():
        origen = getattr(r, "tipo_origen", "Verificado")
        plazo = getattr(r, "plazo_recordatorio", "Consultar")
        lineas.append(f"- [{r.id_servicio}] {r.nombre} ({r.categoria} · {origen}): {r.para_que_sirve}. Sugerir si: {r.cuando_sugerirlo}. Cómo acceder: {r.como_acceder} (Plazos: {plazo})")
    return "\n".join(lineas)

def clasificar_beneficios(cat: pd.DataFrame, perfil: dict) -> dict[str, list[dict]]:
    """
    Pilar 3 del documento: Clasifica la oferta verificada en 3 categorías:
    1. 'podrias_postular': Beneficios a los que el estudiante podría acceder según su caso.
    2. 'ya_lo_tienes': Beneficios activos actualmente reportados por el estudiante o la fundación.
    3. 'revisa_requisito': Trámites o requisitos pendientes de revisión para mantener sus apoyos.
    """
    ya_tienes = set(perfil.get("beneficios_activos", ["S01"])) # Por defecto becado tiene Beca Mensual S01
    trabaja = perfil.get("trabaja", False) or perfil.get("horas_trabajo_semana", 0) > 0
    cuida = perfil.get("cuida_dependientes", False)
    gratuidad = perfil.get("gratuidad", False)
    promedio = perfil.get("nota_promedio", 5.0)
    region = perfil.get("de_region", False)

    resultado = {"podrias_postular": [], "ya_lo_tienes": [], "revisa_requisito": []}

    for r in cat.itertuples():
        sid = r.id_servicio
        item = {
            "id": sid,
            "nombre": r.nombre,
            "categoria": r.categoria,
            "origen": getattr(r, "tipo_origen", "Verificado"),
            "plazo": getattr(r, "plazo_recordatorio", "Consultar calendario"),
            "como_acceder": r.como_acceder,
            "para_que_sirve": r.para_que_sirve,
            "motivo": ""
        }

        # 1. Ya lo tienes
        if sid in ya_tienes:
            item["motivo"] = "Activo en tu registro de becado. Recuerda mantener tus compromisos formativos."
            resultado["ya_lo_tienes"].append(item)
            continue

        if sid == "S06" and gratuidad:
            item["motivo"] = "Cuentas con Gratuidad estatal asignada para este periodo académico."
            resultado["ya_lo_tienes"].append(item)
            continue

        # 2. Revisa este requisito
        if sid == "S06" and not gratuidad:
            item["motivo"] = "Revisa tu estado FUAS: podrías optar a becas de arancel o gratuidad en el siguiente proceso."
            resultado["revisa_requisito"].append(item)
            continue

        if sid == "S08":
            item["motivo"] = "Talleres del programa formativo: asiste a las sesiones para cumplir tu porcentaje de participación."
            resultado["revisa_requisito"].append(item)
            continue

        # 3. Podrías postular (Personalizado según situación declarada)
        aplica = False
        if sid == "S02" and promedio < 5.0:
            item["motivo"] = f"Tus notas parciales ({promedio:.1f}) sugieren reforzamiento en asignaturas clave."
            aplica = True
        elif sid == "S07" and (trabaja or cuida):
            item["motivo"] = "Compatibiliza tu estudio con tus turnos laborales o responsabilidades familiares de cuidado."
            aplica = True
        elif sid == "S05" and region:
            item["motivo"] = "Alianza con Fundación La Llave para estudiantes que provienen de regiones."
            aplica = True
        elif sid in ("S03", "S04", "S09"):
            item["motivo"] = "Disponible para becados de Fundación Puente ante necesidades específicas."
            aplica = True

        if aplica:
            resultado["podrias_postular"].append(item)
        else:
            resultado["revisa_requisito"].append(item)

    return resultado
