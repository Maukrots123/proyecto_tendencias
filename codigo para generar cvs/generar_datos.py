import pandas as pd
from faker import Faker
import uuid
import random
from datetime import datetime, timedelta

# Inicializar Faker para generar datos aleatorios en español
fake = Faker('es_ES')

# --- Generar Datos de Usuarios ---
num_usuarios = 100
usuarios_data = []
ciudades_comunes = ['Caracas', 'Bogota', 'Mexico DF', 'Madrid', 'Buenos Aires', 'Lima', 'Santiago', 'Quito', 'La Paz', 'Montevideo']

for _ in range(num_usuarios):
    usuarios_data.append({
        'id_usuario': uuid.uuid4(),
        'nombre': fake.name(),
        'ciudad': random.choice(ciudades_comunes)
    })
df_usuarios = pd.DataFrame(usuarios_data)
df_usuarios.to_csv('usuarios.csv', index=False)
print(f"Generados {num_usuarios} usuarios en usuarios.csv")

# --- Generar Datos de Canciones ---
num_canciones = 100
canciones_data = []
generos = ['Rock', 'Pop', 'Salsa', 'Reggaeton', 'Electrónica', 'Clásica', 'Jazz', 'Merengue', 'Bachata', 'Hip Hop']
artistas_famosos = ['Queen', 'Madonna', 'Nirvana', 'The Beatles', 'Michael Jackson', 'Shakira', 'Maluma', 'Juan Luis Guerra', 'Rubén Blades', 'Soda Stereo', 'Bad Bunny', 'Karol G']

for i in range(num_canciones):
    canciones_data.append({
        'id_cancion': uuid.uuid4(),
        'titulo': fake.catch_phrase(), # Título de canción aleatorio
        'artista': random.choice(artistas_famosos),
        'genero': random.choice(generos)
    })
df_canciones = pd.DataFrame(canciones_data)
df_canciones.to_csv('canciones.csv', index=False)
print(f"Generadas {num_canciones} canciones en canciones.csv")

# --- Generar Datos de Escuchas ---
num_escuchas = 500 # Un usuario puede tener varias escuchas, así que generamos más escuchas que usuarios/canciones
escuchas_data = []
fechas_posibles = [datetime.now() - timedelta(days=random.randint(1, 90)) for _ in range(num_escuchas)] # Fechas en los últimos 90 días

# Crear mapeos de ID para facilitar la selección aleatoria por los IDs reales
id_usuarios_existentes = [u['id_usuario'] for u in usuarios_data]
id_canciones_existentes = [c['id_cancion'] for c in canciones_data]

for _ in range(num_escuchas):
    usuario_id_aleatorio = random.choice(id_usuarios_existentes)
    cancion_id_aleatoria = random.choice(id_canciones_existentes)
    fecha_escucha_aleatoria = random.choice(fechas_posibles).strftime('%Y-%m-%d')

    escuchas_data.append({
        'id_usuario': usuario_id_aleatorio,
        'id_cancion': cancion_id_aleatoria,
        'fecha_escucha': fecha_escucha_aleatoria
    })
df_escuchas = pd.DataFrame(escuchas_data)
df_escuchas.to_csv('escuchas.csv', index=False)
print(f"Generadas {num_escuchas} escuchas en escuchas.csv")

print("\n¡Datos de prueba generados exitosamente!")