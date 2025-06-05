✨ Mi Recomendador Musical con Cassandra y Python ✨
Este proyecto es un sistema de recomendación de música y análisis de datos diseñado e implementado con Apache Cassandra 
como base de datos NoSQL y Python 2.7 para la lógica de la aplicación. Su objetivo es demostrar cómo se pueden generar 
recomendaciones básicas de canciones y realizar análisis OLAP simplificados sobre el historial de escuchas.

🚀 Características Principales
Modelado de Datos NoSQL: Esquema simplificado en Cassandra para almacenar información de usuarios, canciones y escuchas.
Recomendación de Música Básica: Implementación de un algoritmo simple para sugerir canciones.
Análisis OLAP Simplificado: Procesamiento analítico en línea para explorar tendencias de escuchas por género y tiempo.
Generación de Reportes Web: Los resultados de las recomendaciones y el análisis se visualizan en tablas HTML,
accesibles desde una página web principal.


⚙️ Cómo Empezar
Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

Prerrequisitos
Asegúrate de tener instalado lo siguiente:

Apache Cassandra 3.11.10: Necesitas una instancia de Cassandra corriendo localmente
Python 2.7: El proyecto está desarrollado en Python 2.7.
Librerías de Python: Instala el controlador de Cassandra para Python:

- pip install cassandra-driver

📦 Configuración de la Base de Datos Cassandra
Inicia tu servidor Cassandra: Si Cassandra no está en ejecución, inícialo. En Windows, 
puedes hacerlo desde el directorio bin de tu 
instalación de Cassandra:


C:\Cassandra\apache-cassandra-3.11.10\bin\

Alli en la carpeta abres un cmd (borrando la ruta y escribiendo cmd seguido de un enter) y solo escribes "cassandra"

- Crea el esquema de la base de datos:
Abre una terminal y navega hasta la raíz de tu proyecto (my_music_recommender/). Luego, ejecuta el archivo CQL para
crear el keyspace y todas las tablas:

cqlsh -f "base de datos/recomendador_musical_schema.cql"

Asegúrate de incluir las comillas alrededor de la ruta base de datos/ 
debido al espacio en el nombre de la carpeta.

- Importa los datos de ejemplo:
Estos archivos CSV contienen datos básicos para poblar tus tablas. Abre cqlsh, selecciona el keyspace y usa el comando COPY 
para importar cada tabla. Ejecuta esto desde la raíz de tu proyecto para que las rutas sean correctas:

USE recomendador_musical;

COPY canciones FROM 'data/canciones.csv' WITH HEADER = TRUE;
COPY usuarios FROM 'data/usuarios.csv' WITH HEADER = TRUE;
COPY escuchas_por_usuario FROM 'data/escuchas_por_usuario.csv' WITH HEADER = TRUE;

# Sal de cqlsh
exit;
(Nota: Las tablas escuchas_genero_diarias y recomendaciones_generadas se generarán dinámicamente 
cuando ejecutes los scripts de la aplicación si no existen, o se actualizarán si ya tienen datos).

💻 Ejecutar la Aplicación
Genera los reportes HTML:
Abre una terminal y navega a la carpeta app/ de tu proyecto.
Ejecuta los scripts de Python para generar los archivos HTML que se mostrarán en la web. Estos scripts interactuarán con 
Cassandra para procesar y actualizar los datos:

python analisis_olap.py
python recomendar_canciones.py

- Abre la aplicación web:
Una vez que los scripts hayan terminado de ejecutarse y hayan generado o actualizado los archivos HTML, 
simplemente abre el archivo index.html
