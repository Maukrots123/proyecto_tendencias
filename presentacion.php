<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Servicio Comunitario UNEG - Presentación</title>
    <link rel="icon" href="./uneg.png" >
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="estilo_presentacion.css">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
    <div id="niebla" class="niebla"></div>
    <div id="fadein" class="fadein">
        <div id="sidebar">
            <div id="toggle-btn">
                <span>&#9776;</span>
            </div>
            <ul>
                <li>
                    <img src="./uneg.png" alt="Logo UNEG" class="logo">
                </li>
                <li><a href="index.php">Inicio</a></li>
            </ul>
        </div>

        <div id="Encabezado" class="encabezado">    
            <h1 class="titulo-glowing">Servicio Comunitario UNEG</h1>
            <p style="font-size:35px; color: darkblue">Tejiendo el futuro con IA</p>
        </div>

        <a href="chat.php" class="button-85">Chat bot</a>

        <div id="textBubblesContainer"></div>
        <div id="robotCanvasContainer">
            <canvas id="robotCanvas"></canvas>
        </div>

        <script src="./Scripts/three.min.js"></script>
        <script src="./Scripts/GLTFLoader.js"></script>
        <script src="./Scripts/tween.umd.min.js"></script>
        <script src="./Scripts/cargar3D.js"></script>

        <script>
            window.onload = function() {
                let btn = document.getElementById('toggle-btn');
                let side = document.getElementById('sidebar');
                btn.addEventListener('click', function() {
                    btn.classList.toggle('active');
                    side.classList.toggle('active');
                });
            }

            document.getElementById('fadein').style.opacity = 0;
            setTimeout(() => {
                document.getElementById('fadein').style.opacity = 1;
                document.getElementById('fadein').style.transition = 'opacity 2s';
            }, 1000);
        </script>

        <div class="hero">
            <div class="cube"></div>
            <div class="cube"></div>
            <div class="cube"></div>
            <div class="cube"></div>
            <div class="cube"></div>
            <div class="cube"></div>
        </div>
    </div>
</body>
</html>
