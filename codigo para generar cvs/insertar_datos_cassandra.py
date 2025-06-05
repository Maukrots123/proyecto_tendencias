# -*- coding: utf-8 -*-
import csv
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
from cassandra.util import uuid_from_time
import uuid # Para manejar UUIDs si los necesitas en alguna conversión
from datetime import datetime

# --- Configuración de Conexión a Cassandra ---
CASSANDRA_HOST = '127.0.0.1' # Asegúrate de que esta IP sea la correcta
KEYSPACE = 'recomendador_musical'

# Si tienes autenticación, descomenta y configura (nombre de usuario, contraseña)
# auth_provider = PlainTextAuthProvider(username='tu_usuario', password='tu_contraseña')
# cluster = Cluster([CASSANDRA_HOST], auth_provider=auth_provider)
cluster = Cluster([CASSANDRA_HOST]) # Sin autenticación por defecto
session = cluster.connect(KEYSPACE)

print "Conectado a Cassandra en %s, Keyspace: %s" % (CASSANDRA_HOST, KEYSPACE)

# --- Insertar Usuarios ---
print "Insertando usuarios..."
with open('usuarios.csv', 'rb') as f:
    reader = csv.reader(f)
    header = next(reader) # Leer la cabecera
    # Mapeo de cabecera a índice para flexibilidad
    header_map = {col: i for i, col in enumerate(header)}

    prepared_stmt_usuarios = session.prepare(
        "INSERT INTO usuarios (id_usuario, nombre, ciudad) VALUES (?, ?, ?)"
    )
    for row in reader:
        try:
            # Asegúrate de que el UUID se parsea correctamente
            id_usuario_str = row[header_map['id_usuario']]
            id_usuario = uuid.UUID(id_usuario_str)
            nombre = row[header_map['nombre']]
            ciudad = row[header_map['ciudad']]
            session.execute(
                prepared_stmt_usuarios,
                [id_usuario, nombre, ciudad]
            )
        except Exception as e:
            print "Error insertando usuario %s: %s" % (row, e)
print "Insertados usuarios."

# --- Insertar Canciones ---
print "Insertando canciones..."
with open('canciones.csv', 'rb') as f:
    reader = csv.reader(f)
    header = next(reader)
    header_map = {col: i for i, col in enumerate(header)}

    prepared_stmt_canciones = session.prepare(
        "INSERT INTO canciones (id_cancion, titulo, artista, genero) VALUES (?, ?, ?, ?)"
    )
    for row in reader:
        try:
            id_cancion_str = row[header_map['id_cancion']]
            id_cancion = uuid.UUID(id_cancion_str)
            titulo = row[header_map['titulo']]
            artista = row[header_map['artista']]
            genero = row[header_map['genero']]
            session.execute(
                prepared_stmt_canciones,
                [id_cancion, titulo, artista, genero]
            )
        except Exception as e:
            print "Error insertando cancion %s: %s" % (row, e)
print "Insertadas canciones."

# --- Insertar Escuchas y Actualizar el Contador OLAP ---
print "Insertando escuchas y actualizando contadores OLAP..."

# Necesitamos mapeos para obtener genero y ciudad por ID
# Esto se haría en la aplicación real consultando Cassandra,
# pero para la inserción masiva, cargamos de los CSVs previamente.
usuarios_map = {}
with open('usuarios.csv', 'rb') as f:
    reader = csv.reader(f)
    header = next(reader)
    h_id_usuario = header.index('id_usuario')
    h_ciudad = header.index('ciudad')
    for row in reader:
        usuarios_map[row[h_id_usuario]] = row[h_ciudad]

canciones_map = {}
with open('canciones.csv', 'rb') as f:
    reader = csv.reader(f)
    header = next(reader)
    h_id_cancion = header.index('id_cancion')
    h_genero = header.index('genero')
    for row in reader:
        canciones_map[row[h_id_cancion]] = row[h_genero]

# Preparamos las sentencias
prepared_stmt_escuchas_usuario = session.prepare(
    "INSERT INTO escuchas_por_usuario (id_usuario, fecha_escucha, id_cancion) VALUES (?, ?, ?)"
)
prepared_stmt_escuchas_genero = session.prepare(
    "INSERT INTO escuchas_por_genero (genero, fecha_escucha, id_cancion, id_usuario) VALUES (?, ?, ?, ?)"
)
prepared_stmt_escuchas_ciudad = session.prepare(
    "INSERT INTO escuchas_por_ciudad (ciudad, fecha_escucha, id_cancion, id_usuario) VALUES (?, ?, ?, ?)"
)
prepared_stmt_contador_genero = session.prepare(
    "UPDATE escuchas_genero_diarias SET total_escuchas = total_escuchas + 1 WHERE genero = ? AND fecha_escucha = ?"
)

total_escuchas_procesadas = 0
with open('escuchas.csv', 'rb') as f:
    reader = csv.reader(f)
    header = next(reader)
    header_map = {col: i for i, col in enumerate(header)}

    for row in reader:
        try:
            id_usuario_str = row[header_map['id_usuario']]
            id_cancion_str = row[header_map['id_cancion']]
            fecha_escucha_str = row[header_map['fecha_escucha']]

            id_usuario = uuid.UUID(id_usuario_str)
            id_cancion = uuid.UUID(id_cancion_str)
            fecha_escucha_date = datetime.strptime(fecha_escucha_str, '%Y-%m-%d').date()

            genero_cancion = canciones_map.get(id_cancion_str)
            ciudad_usuario = usuarios_map.get(id_usuario_str)

            session.execute(
                prepared_stmt_escuchas_usuario,
                [id_usuario, fecha_escucha_date, id_cancion]
            )

            if genero_cancion:
                session.execute(
                    prepared_stmt_escuchas_genero,
                    [genero_cancion, fecha_escucha_date, id_cancion, id_usuario]
                )
                session.execute(
                    prepared_stmt_contador_genero,
                    [genero_cancion, fecha_escucha_date]
                )

            if ciudad_usuario:
                session.execute(
                    prepared_stmt_escuchas_ciudad,
                    [ciudad_usuario, fecha_escucha_date, id_cancion, id_usuario]
                )
            total_escuchas_procesadas += 1

        except Exception as e:
            print "Error insertando escucha %s: %s" % (row, e)

print "Insertadas y procesadas %d escuchas." % total_escuchas_procesadas

# --- Cerrar Conexión ---
session.shutdown()
cluster.shutdown()
print "Conexión a Cassandra cerrada."
print "\nDatos insertados exitosamente en Cassandra (con Python 2.7)!"