# -*- coding: utf-8 -*-
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
from datetime import datetime, timedelta, date
import random

# --- Configuración de Conexión a Cassandra ---
CASSANDRA_HOST = '127.0.0.1'
KEYSPACE = 'recomendador_musical'

# --- Nombre del archivo HTML de salida para el análisis OLAP ---
OUTPUT_HTML_FILE = 'analisis_olap_generado.html'

cluster = Cluster([CASSANDRA_HOST])
session = cluster.connect(KEYSPACE)

print "Conectado a Cassandra en %s, Keyspace: %s" % (CASSANDRA_HOST, KEYSPACE)

# --- Función para obtener un género aleatorio de la base de datos ---
def obtener_genero_aleatorio():
    try:
        # Recupera géneros de la tabla de canciones.
        filas = session.execute("SELECT genero FROM canciones LIMIT 5000 ALLOW FILTERING;")
        
        generos_existentes = set()
        for fila in filas:
            if fila.genero:
                generos_existentes.add(fila.genero)
        
        if not generos_existentes:
            print "Advertencia: No se encontraron géneros en la tabla 'canciones'. Asegurese de que la tabla tiene datos."
            return [] # Retorna una lista vacía si no hay géneros
        
        return list(generos_existentes) # Retorna la lista completa de géneros
    except Exception as e:
        print "Error al obtener generos disponibles: %s" % e
        return [] # Retorna una lista vacía en caso de error

# --- Función para generar el HTML completo del análisis OLAP ---
def generar_analisis_olap_html_completo():
    html_output = []

    # --- INICIO del documento HTML para el IFRAME ---
    html_output.append(u"<!DOCTYPE html>")
    html_output.append(u"<html>")
    html_output.append(u"<head>")
    html_output.append(u"<meta charset='utf-8'>")
    html_output.append(u"<title>Análisis OLAP</title>")
    # --- ESTILOS CSS para el IFRAME ---
    html_output.append(u"<style>")
    html_output.append(u"    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8f8f8; color: #333; }")
    html_output.append(u"    h2 { font-size: 1.8em; margin-bottom: 1em; color: #4CAF50; text-align: center; }")
    html_output.append(u"    h3 { font-size: 1.5em; margin-top: 1.5em; color: #333; text-align: center; }")
    html_output.append(u"    p { font-size: 1.1em; line-height: 1.6; color: #555; text-align: center; margin-bottom: 1.5em; }")
    html_output.append(u"    table { width: 100%; border-collapse: collapse; margin-top: 1.5em; font-size: 1em; color: #333; box-shadow: 0px 0px 8px rgba(0,0,0,0.05); }")
    html_output.append(u"    th, td { border: 1px solid #ddd; padding: 12px 15px; text-align: left; }")
    html_output.append(u"    th { background-color: #f2f2f2; font-weight: 600; color: #333; text-transform: uppercase; }")
    html_output.append(u"    tr:nth-child(even) { background-color: #f9f9f9; }")
    html_output.append(u"    tr:hover { background-color: #f1f1f1; }")
    html_output.append(u"    .no-data { text-align: center; padding: 20px; color: #888; font-style: italic; }")
    html_output.append(u"</style>")
    html_output.append(u"</head>")
    html_output.append(u"<body>")
    # --- FIN del HEAD y comienzo del BODY ---

    # --- Contenido del Análisis OLAP ---

    # 1. Análisis de un género específico (ahora con reintento para asegurar datos)
    generos_disponibles = obtener_genero_aleatorio() # Obtiene la lista completa de géneros
    encontrado_con_datos = False
    
    # Definir el rango de fechas reciente para buscar datos
    # Ajusta esta fecha si tus datos no llegan hasta hoy
    fecha_fin_genero = date(2025, 6, 4) # O date.today() si tus datos son actuales
    
    # Intentar hasta 5 géneros diferentes para encontrar uno con datos
    for _ in range(5): # Limitar a 5 intentos para evitar bucles infinitos
        if not generos_disponibles:
            break # Salir si no hay géneros disponibles

        genero_para_analisis = random.choice(generos_disponibles)
        generos_disponibles.remove(genero_para_analisis) # Remover para no intentar el mismo género

        # Rango de fechas para el género específico (un mes atrás)
        dias_atras = random.randint(7, 30) # Un rango de días para variar el inicio
        fecha_inicio_genero = fecha_fin_genero - timedelta(days=dias_atras)

        # Intentar obtener los resultados para este género y fecha
        temp_html_fragment = total_escuchas_por_genero_y_fecha_fragmento(
            genero=genero_para_analisis,
            fecha_inicio=fecha_inicio_genero,
            fecha_fin=fecha_fin_genero
        )
        
        # Verificar si el fragmento contiene el mensaje de "No se encontraron datos"
        if u"No se encontraron datos para los criterios especificados." not in temp_html_fragment:
            html_output.append(u"<h2>📊 Análisis de Escuchas por Género y Fecha 📊</h2>")
            html_output.append(u"<p>Análisis de escuchas para el género '%s' entre %s y %s:</p>" % (
                genero_para_analisis, fecha_inicio_genero.strftime('%Y-%m-%d'), fecha_fin_genero.strftime('%Y-%m-%d')
            ))
            html_output.append(temp_html_fragment)
            encontrado_con_datos = True
            break # Salir del bucle una vez que se encuentra un género con datos
        else:
            print "No se encontraron datos para el género '%s' en el rango %s-%s. Intentando con otro género..." % (genero_para_analisis, fecha_inicio_genero.strftime('%Y-%m-%d'), fecha_fin_genero.strftime('%Y-%m-%d'))
    
    if not encontrado_con_datos:
        html_output.append(u"<h2>📊 Análisis de Escuchas por Género y Fecha 📊</h2>")
        html_output.append(u"<p class='no-data'>No se pudo encontrar un género con datos recientes para el análisis específico después de varios intentos. Asegúrese de que hay datos en 'escuchas_genero_diarias' y 'canciones'.</p>")


    # 2. Análisis de todos los géneros (rango de fechas dinámico reciente)
    # Rango de fechas para el análisis de todos los géneros:
    fecha_fin_todos = date(2025, 6, 4) # O date.today() si tus datos son actuales
    dias_aleatorios_atras_todos = random.randint(7, 45) # Un rango más amplio para este análisis
    fecha_inicio_todos = fecha_fin_todos - timedelta(days=dias_aleatorios_atras_todos)
    
    html_output.append(u"<h3>Total de escuchas de todos los géneros entre %s y %s:</h3>" % (
        fecha_inicio_todos.strftime('%Y-%m-%d'), fecha_fin_todos.strftime('%Y-%m-%d')
    ))
    html_output.append(u"<p>Este análisis muestra las tendencias de escucha en general.</p>")

    html_output.append(total_escuchas_por_genero_y_fecha_fragmento(
        genero=None, # Para todos los géneros
        fecha_inicio=fecha_inicio_todos,
        fecha_fin=fecha_fin_todos
    ))

    # --- FIN del documento HTML para el IFRAME ---
    html_output.append(u"</body>")
    html_output.append(u"</html>")
    
    return u"\n".join(html_output)


# --- Consulta OLAP: Total de escuchas por género en un rango de fechas (genera un fragmento HTML) ---
def total_escuchas_por_genero_y_fecha_fragmento(genero=None, fecha_inicio=None, fecha_fin=None):
    fragment_output = []
    
    fecha_inicio_str = fecha_inicio.strftime('%Y-%m-%d') if fecha_inicio else "Inicio de todos los tiempos"
    fecha_fin_str = fecha_fin.strftime('%Y-%m-%d') if fecha_fin else "Fin de todos los tiempos"
    
    try:
        base_query = "SELECT genero, fecha_escucha, total_escuchas FROM escuchas_genero_diarias"
        where_conditions = []
        query_params = []
        
        if genero:
            where_conditions.append("genero = ?")
            query_params.append(genero)
        
        if fecha_inicio:
            where_conditions.append("fecha_escucha >= ?")
            query_conditions_str = " AND ".join(where_conditions)
            query_params.append(fecha_inicio)
        
        if fecha_fin:
            where_conditions.append("fecha_escucha <= ?")
            query_params.append(fecha_fin)
            
        final_query_cql = base_query
        if where_conditions:
            final_query_cql += " WHERE " + " AND ".join(where_conditions)
        
        final_query_cql += " ALLOW FILTERING;"

        # print "Ejecutando consulta OLAP (fragmento): %s con parametros: %s" % (final_query_cql, query_params) # Descomentar para depuración
        
        prepared_stmt = session.prepare(final_query_cql)
        filas = session.execute(prepared_stmt, query_params)

        resultados = {}
        for fila in filas:
            current_genero = fila.genero
            total_escuchas = fila.total_escuchas
            resultados[current_genero] = resultados.get(current_genero, 0) + total_escuchas
            
        if not resultados:
            fragment_output.append(u"<p class='no-data'>No se encontraron datos para los criterios especificados.</p>")
        else:
            fragment_output.append(u"<table>")
            fragment_output.append(u"<thead><tr><th>Género</th><th>Total Escuchas</th></tr></thead>")
            fragment_output.append(u"<tbody>")
            for g, total in sorted(resultados.items()): # Ordenar por género para consistencia
                fragment_output.append(u"<tr><td>%s</td><td>%d</td></tr>" % (g, total))
            fragment_output.append(u"</tbody></table>")

    except Exception as e:
        fragment_output.append(u"<p class='no-data'>Error al realizar el análisis OLAP: %s</p>" % e)
        print "Error al realizar el analisis OLAP (fragmento): %s" % e
    
    return u"\n".join(fragment_output)

# --- Ejecutar la generación del análisis OLAP principal ---
if __name__ == "__main__":
    print "Iniciando proceso de generacion de analisis OLAP en '%s'..." % OUTPUT_HTML_FILE
    
    # Llama a la función principal que genera el HTML completo con los análisis
    final_olap_html_content = generar_analisis_olap_html_completo()

    try:
        with open(OUTPUT_HTML_FILE, 'wb') as f:
            f.write(final_olap_html_content.encode('utf-8'))
        print "\nAnálisis OLAP generado en '%s' exitosamente." % OUTPUT_HTML_FILE
    except Exception as e:
        print "Error al escribir el archivo HTML de análisis OLAP: %s" % e

# --- Cerrar Conexión ---
session.shutdown()
cluster.shutdown()
print "\nConexión a Cassandra cerrada."