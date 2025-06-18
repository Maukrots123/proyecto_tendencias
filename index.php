<?php 
include("session.php"); 
?>


<!DOCTYPE HTML>
<html>
<head>
    <title>SERVICIO COMUNITARIO UNEG</title>
    <meta charset="utf-8">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="estilo_extra.css">
</head>
<body>

    <header id="header" class="alt">
        <div class="logo"><a href="index.html">SERVICIO COMUNITARIO <span>UNEG</span></a></div>
        <a href="#menu">Menu</a>
    </header>

    <nav id="menu">
  <ul class="links">
    <li><a href="index.php">Inicio</a></li>

    <?php if (!$usuario): ?>
      <li><a href="#login">Accesar</a></li>
    <?php endif; ?>

    <?php if ($rol == 2): ?>
      <li><a href="presentacion.php">Chatbot</a></li>
    <?php endif; ?>

    <?php if ($rol == 1): ?>
      <li class="has-submenu">
        <a href="#" class="toggle-submenu">Agregar</a>
        <ul class="submenu">
          <li><a href="agregar_usuario.php">Agregar usuarios</a></li>
          <li><a href="agregar_noticia.php">Agregar noticia</a></li>
        </ul>
      </li>
    <?php endif; ?>

    <li class="has-submenu">
      <a href="#" class="toggle-submenu">Formularios</a>
      <ul class="submenu">
        <li><a href="documentos/ANTEPROYECTO.docx" download class="descargar">Anteproyecto</a></li>
        <li><a href="documentos/carta de presentacion.docx" download class="descargar">Carta de presentacion</a></li>
        <li><a href="documentos/CONSTANCIA DE CULMINACIÓN DEL SERVICIO COMUNITARIO.docx" download class="descargar">Constancia de culminacion</a></li>
        <li><a href="documentos/EVALUACIÒN AL  ESTUDIANTE.docx" download class="descargar">Evaluacion al estudiante</a></li>
        <li><a href="documentos/propuesta de plan de trabajo.docx" download class="descargar">Propuesta de plan de trabajo</a></li>
        <li><a href="documentos/Registro  de Asesoría Académico.docx" download class="descargar">Registro de Asesoria</a></li>
        <li><a href="documentos/REPORTE DE ACTIVIDADES.docx" download class="descargar">Reporte de actividades</a></li>
        <li><a href="documentos/SEGUIMIENTO DEL PLAN DE ACCIÓN.docx" download class="descargar">Seguimiento del plan de acción</a></li>
      </ul>
    </li>

    <li class="has-submenu">
      <a href="#" class="toggle-submenu">Reglamentos y leyes</a>
      <ul class="submenu">
        <li><a href="documentos/Ley_del_servicio_comunitario.pdf" download class="descargar">Ley de Servicio Comunitario</a></li>
        <li><a href="documentos/reglamento_uneg_2_.pdf" download class="descargar">Reglamento UNEG</a></li>
      </ul>
    </li>

    <li><a href="#footer">Acerca de</a></li>

    <?php if ($usuario): ?>
        <li><a href="cerrar_sesion.php"><i class="fa fa-user"></i> Cerrar sesión (<?= htmlspecialchars($usuario) ?>)</a></li>

    <?php endif; ?>
  </ul>
</nav>




    <section class="banner full">
        <article>
            <img src="imagenes/imagen_13.jpg" alt="Campus UNEG" width="1440" height="961">
            <div class="inner">
                <header>
                    <p>Compromiso social y desarrollo para Ciudad Guayana</p>
                    <h2>SERVICIO COMUNITARIO UNEG</h2>
                </header>
            </div>
        </article>
        <article>
            <img src="imagenes/imagen_10.jpg" alt="Estudiantes UNEG en la comunidad" width="1440" height="961">
            <div class="inner">
                <header>
                    <p>Transformando vidas a través de la acción social</p>
                    <h2>Impacto Positivo</h2>
                </header>
            </div>
        </article>
        <article>
            <img src="imagenes/imagen_12.jpg" alt="Aprendizaje y servicio UNEG" width="1440" height="962">
            <div class="inner">
                <header>
                    <p>Formación integral para futuros profesionales</p>
                    <h2>Experiencia Enriquecedora</h2>
                </header>
            </div>
        </article>
        <article>
            <img src="imagenes/imagen_6.jpg" alt="Proyecto social UNEG" width="1440" height="961">
            <div class="inner">
                <header>
                    <p>Iniciativas que construyen un futuro mejor</p>
                    <h2>Proyectos en Acción</h2>
                </header>
            </div>
        </article>
        <article>
            <img src="imagenes/imagen_3.jpg" alt="Voluntariado UNEG" width="1440" height="962">
            <div class="inner">
                <header>
                    <p>Únete a nuestra misión de servir a la sociedad</p>
                    <h2>Participa y Contribuye</h2>
                </header>
            </div>
        </article>
    </section>

    ---



    <section id="one" class="wrapper style2">
        <div class="inner">
            <div class="grid-style">

                <div>
                    <div class="box">
                        <div class="image fit">
                            <img src="imagenes/imagen_14.jpg" alt="Áreas de Impacto del Servicio Comunitario UNEG" width="600" height="300">
                        </div>
                        <div class="content">
                            <header class="align-center">
                                <p>Salud, educación, ambiente y más</p>
                                <h2>Nuestras Áreas de Impacto</h2>
                            </header>
                            <p>El Servicio Comunitario de la UNEG abarca diversas áreas para atender las necesidades de Ciudad Guayana. Desde programas de salud preventiva hasta iniciativas educativas y de conservación ambiental, trabajamos por el bienestar de nuestra gente.</p>
                            <footer class="align-center">
                                <a href="#" class="button alt">Conocer los reglamentos</a>
                            </footer>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="box">
                        <div class="image fit">
                            <img src="imagenes/imagen_10.jpg" alt="Beneficios del Servicio Comunitario para estudiantes UNEG" width="600" height="300">
                        </div>
                        <div class="content">
                            <header class="align-center">
                                <p>Crecimiento personal y profesional</p>
                                <h2>Beneficios para Estudiantes</h2>
                            </header>
                            <p>Participar en el Servicio Comunitario te permite aplicar tus conocimientos, desarrollar nuevas habilidades, fortalecer tu liderazgo y ética profesional, y contribuir directamente al desarrollo de tu entorno. ¡Es una experiencia que te transformará!</p>
                            <footer class="align-center">
                                <a href="#" class="button alt">Regístrate Aquí</a>
                            </footer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    ---

    <section id="two" class="wrapper style3">
        <div class="inner">
            <header class="align-center">
                <p>Formando ciudadanos comprometidos con el futuro de nuestra región</p>
                <h2>El Compromiso Social de la UNEG</h2>
            </header>
        </div>
    </section>

      <section class="wrapper style2">
    <div class="inner">
        <header class="align-center">
            <h2>¿Qué es el Servicio Comunitario en la UNEG?</h2>
            <p>Un pilar fundamental en la formación del profesional UNEG</p>
        </header>
        <div class="flex flex-2">
            <div class="centrar_imagen">
                <img src="imagenes/imagen_5.jpg" alt="servicio" width="1170" height="500">
            </div>
            <div class="content justificar">
                <p>El servicio comunitario en la UNEG es un componente fundamental de la formación universitaria que busca integrar los conocimientos académicos con el servicio directo a la comunidad. Este programa fomenta activamente valores como la solidaridad, la corresponsabilidad y la responsabilidad social en nuestros estudiantes.</p>
                <p>Es un requisito obligatorio que, sin remuneración alguna, busca enriquecer la formación académica de cada estudiante al permitirles aplicar sus conocimientos de forma práctica para resolver problemas sociales reales y contribuir directamente al desarrollo comunitario. Sus fines principales son claros: fomentar valores éticos y ciudadanos, realizar un acto de reciprocidad con la sociedad, integrar las instituciones educativas con la comunidad, y formar un sólido capital social.</p>
                <p>Esta experiencia implica una relación directa entre la teoría y la práctica, lo que permite a los estudiantes contextualizar sus aprendizajes y producir conocimientos prácticos que son directamente transferibles a la sociedad. Además, el servicio comunitario facilita la adquisición de destrezas técnicas y profesionales, así como competencias laborales valiosas como el trabajo en equipo, la planificación y la resolución de problemas. En resumen, es una experiencia formativa esencial que trasciende el ámbito académico tradicional, comprometiendo a los estudiantes con la realidad social y fomentando su capacidad para generar un impacto positivo y duradero en la colectividad.</p>
            </div>
        </div>
    </div>
</section>

   <?php if (!$usuario): ?>
     <section id="login" class="login-section">
  <h2>Iniciar Sesión</h2>
  <form action="login.php" method="POST">
    <label for="username">Usuario</label>
    <input type="text" id="username" name="username" placeholder="Tu nombre de usuario" required />

    <label for="password">Contraseña</label>
    <input type="password" id="password" name="password" placeholder="••••••••" required />

    <button type="submit">Entrar</button>
  </form>
</section>
   <?php endif; ?>

    <footer id="footer">
        <div class="container">
            <ul class="icons">
                <li><a href="#" class="icon fa-twitter"><span class="label">Twitter</span></a></li>
                <li><a href="#" class="icon fa-facebook"><span class="label">Facebook</span></a></li>
                <li><a href="#" class="icon fa-instagram"><span class="label">Instagram</span></a></li>
                <li><a href="#" class="icon fa-envelope-o"><span class="label">Email</span></a></li>
            </ul>
        </div>
    </footer>

    <div class="copyright">
        Ciudad Guayana <a href="#">ServicioComunitarioUNEG.org</a>.
    </div>

    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/jquery.scrollex.min.js"></script>
    <script src="assets/js/skel.min.js"></script>
    <script src="assets/js/util.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/modal_login.js"></script> 

    <script>
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar/ocultar submenús al hacer clic
  document.querySelectorAll('.toggle-submenu').forEach(toggle => {
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const submenu = toggle.nextElementSibling;
      submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
    });
  });

  // Notificación al descargar
  document.querySelectorAll('.descargar').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        alert('✅ Documento descargado exitosamente');
      }, 1000);
    });
  });
});
</script>



</body>
</html>