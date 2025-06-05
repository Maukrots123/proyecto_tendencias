# -*- coding: utf-8 -*-
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
import uuid
from datetime import datetime, timedelta
import random

# --- Configuración de Conexión a Cassandra ---
CASSANDRA_HOST = '127.0.0.1'
KEYSPACE = 'recomendador_musical' # Asegúrate de que este sea tu keyspace real

# --- Nombre del archivo HTML de salida para las recomendaciones ---
OUTPUT_HTML_FILE = 'recomendaciones_generadas.html'

cluster = Cluster([CASSANDRA_HOST])
session = cluster.connect(KEYSPACE)

print "Conectado a Cassandra en %s, Keyspace: %s" % (CASSANDRA_HOST, KEYSPACE)

# --- Función para obtener un usuario aleatorio de la base de datos ---
def obtener_usuario_aleatorio():
    try:
        filas = session.execute("SELECT id_usuario, nombre, ciudad FROM usuarios LIMIT 100")
        usuarios_existentes = []
        for fila in filas:
            usuarios_existentes.append({'id_usuario': fila.id_usuario, 'nombre': fila.nombre, 'ciudad': fila.ciudad})

        if not usuarios_existentes:
            print "No hay usuarios en la tabla 'usuarios'."
            return None
        return random.choice(usuarios_existentes)
    except Exception as e:
        print "Error al obtener usuario aleatorio: %s" % e
        return None

# --- Función para recomendar canciones por ciudad y generar HTML ---
# Esta función generará un HTML completo para el iframe, no solo un fragmento.
def recomendar_por_ciudad_para_iframe(id_usuario, nombre_usuario, ciudad_usuario, limite=5):
    html_output = []
    
    # Encabezado básico para un documento HTML completo que será incrustado
    html_output.append(u"<!DOCTYPE html>")
    html_output.append(u"<html>")
    html_output.append(u"<head>")
    html_output.append(u"<meta charset='utf-8'>")
    html_output.append(u"<title>Recomendaciones</title>")
  
    html_output.append(u"<style>")
    html_output.append(u"    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8f8f8; }")
    html_output.append(u"    table { width: 100%; border-collapse: collapse; margin-top: 1.5em; font-size: 1em; color: #333; }")
    html_output.append(u"    th, td { border: 1px solid #ddd; padding: 12px 15px; text-align: left; }")
    html_output.append(u"    th { background-color: #f2f2f2; font-weight: 600; color: #333; text-transform: uppercase; }")
    html_output.append(u"    tr:nth-child(even) { background-color: #f9f9f9; }")
    html_output.append(u"    tr:hover { background-color: #f1f1f1; }")
    html_output.append(u"    ul { list-style: none; padding: 0; margin-top: 1em; }")
    html_output.append(u"    li { background-color: #eef; border: 1px solid #dde; margin-bottom: 0.8em; padding: 15px; border-radius: 5px; font-size: 1.05em; color: #444; }")
    html_output.append(u"    li strong { color: #2c3e50; font-weight: 700; }")
    html_output.append(u"    h3 { font-size: 1.5em; margin-top: 1.5em; color: #333; }")
    html_output.append(u"    p { font-size: 1.1em; line-height: 1.6; color: #555; }")
    html_output.append(u"</style>")
    html_output.append(u"</head>")
    html_output.append(u"<body>")

    # Contenido de las recomendaciones
    html_output.append(u"<h3>Recomendaciones para %s en %s:</h3>" % (nombre_usuario, ciudad_usuario))
    
    try:
        # Asegúrate de que las tablas en Cassandra (usuarios, escuchas_por_ciudad, canciones)
        # tengan datos y las columnas correctas para que esto funcione.
        # Si 'ciudad' no es parte de la clave primaria, necesitarás ALLOW FILTERING para desarrollo.
        # En producción, considera un modelo de datos diferente o un índice secundario.
        query = session.prepare(
            "SELECT id_cancion FROM escuchas_por_ciudad WHERE ciudad = ? LIMIT 1000 ALLOW FILTERING;" 
        )
        filas_escuchas = session.execute(query, [ciudad_usuario])

        conteo_canciones = {}
        for fila in filas_escuchas:
            cancion_id = fila.id_cancion
            conteo_canciones[cancion_id] = conteo_canciones.get(cancion_id, 0) + 1
        
        # Ordenar y limitar las canciones populares
        canciones_populares_ids = sorted(conteo_canciones.items(), key=lambda x: x[1], reverse=True)[:limite]

        if not canciones_populares_ids:
            html_output.append(u"<p>No se encontraron escuchas recientes en %s para recomendar. Prueba con otra ciudad o añade datos.</p>" % ciudad_usuario)
        else:
            html_output.append(u"<ul>")
            
            prepared_stmt_canciones = session.prepare("SELECT titulo, artista, genero FROM canciones WHERE id_cancion = ?;")
            
            for cancion_id, conteo in canciones_populares_ids:
                try:
                    fila_cancion = session.execute(prepared_stmt_canciones, [cancion_id]).one()
                    if fila_cancion:
                        html_output.append(u"<li><strong>%s</strong> por %s (%s) - Escuchas: %d</li>" % (fila_cancion.titulo, fila_cancion.artista, fila_cancion.genero, conteo))
                except Exception as e:
                    print "Error al obtener detalles de la cancion %s: %s" % (cancion_id, e)
            html_output.append(u"</ul>")

    except Exception as e:
        html_output.append(u"<p>Error al obtener recomendaciones de canciones: %s</p>" % e)
        print "Error al recomendar canciones por ciudad: %s" % e # Imprimir a consola para depuración
    
    html_output.append(u"</body>")
    html_output.append(u"</html>")
    
    return u"\n".join(html_output)

# --- Ejecutar la recomendación y guardar en HTML ---
if __name__ == "__main__":
    print "Iniciando proceso de generacion de recomendaciones musicales en '%s'..." % OUTPUT_HTML_FILE
    usuario_ejemplo = obtener_usuario_aleatorio()

    recomendaciones_html_para_iframe = u"<p>No se pudo generar recomendaciones para el iframe.</p>"
    if usuario_ejemplo:
        print "\n--- Generando recomendaciones para el usuario: %s ---" % usuario_ejemplo['nombre']
        recomendaciones_html_para_iframe = recomendar_por_ciudad_para_iframe(
            usuario_ejemplo['id_usuario'],
            usuario_ejemplo['nombre'],
            usuario_ejemplo['ciudad']
        )
    else:
        print "No se pudo realizar la recomendacion sin un usuario de ejemplo."

    # Escribir el HTML generado en el archivo de salida para el iframe
    try:
        with open(OUTPUT_HTML_FILE, 'wb') as f: # 'wb' para escribir bytes, Python 2.7.18
            f.write(recomendaciones_html_para_iframe.encode('utf-8'))
        print "\nRecomendaciones generadas en '%s' exitosamente." % OUTPUT_HTML_FILE
    except Exception as e:
        print "Error al escribir el archivo HTML de recomendaciones: %s" % e


# --- Cerrar Conexión (siempre al final de tu script principal) ---
session.shutdown()
cluster.shutdown()
print "\nConexion a Cassandra cerrada."