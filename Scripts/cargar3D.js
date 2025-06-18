// 1. Configuración de la Escena Three.js
// Crea una nueva escena, que es un contenedor para todos los objetos 3D.
const scene = new THREE.Scene();

// Obtiene una referencia al elemento canvas del HTML.
const canvas = document.getElementById('robotCanvas');
// Obtiene una referencia al div contenedor del canvas.
const canvasContainer = document.getElementById('robotCanvasContainer');

// Obtiene una referencia al contenedor donde se mostrarán los globos de texto.
const textBubblesContainer = document.getElementById('textBubblesContainer');


// Obtener las dimensiones iniciales del contenedor
// clientWidth y clientHeight dan el tamaño del área visible del elemento, excluyendo bordes y barras de desplazamiento.
let containerWidth = canvasContainer.clientWidth;
let containerHeight = canvasContainer.clientHeight;

// Crea una cámara de perspectiva. Los parámetros son:
// 75: Campo de visión (Field of View - FOV) vertical en grados.
// containerWidth / containerHeight: Relación de aspecto de la cámara (ancho / alto del CONTENEDOR).
// 0.1: Plano de recorte cercano (objetos más cerca que esto no se renderizarán).
// 1000: Plano de recorte lejano (objetos más lejos que esto no se renderizarán).
const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);

// Crea un renderizador WebGL. Es el motor que dibuja la escena en el canvas.
// 'canvas': El elemento HTMLCanvasElement donde se dibujará la escena.
// 'alpha: true': Hace que el fondo del renderizador sea transparente (si no quieres un color de fondo sólido).
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

// Establece el tamaño del renderizador para que coincida con el tamaño del CONTENEDOR del canvas.
renderer.setSize(containerWidth, containerHeight);
// *** HABILITAR SOMBRAS EN EL RENDERIZADOR ***
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // O THREE.PCFShadowMap para sombras más duras

// Opcional: Descomenta la siguiente línea para establecer un color de fondo sólido (ej. azul claro)
// renderer.setClearColor(0xabcdef, 1);

// Añadir luces a la escena (¡importante para ver el modelo!)
// Sin luces, los modelos aparecerán completamente negros en un renderizador 3D.

// Luz Ambiental: Ilumina todos los objetos de la escena de manera uniforme, sin sombras fuertes.
// 0xffffff: Color blanco de la luz.
// 0.8: Intensidad de la luz (0 a 1).
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

scene.add(ambientLight);

// Luz Direccional: Simula la luz del sol o una fuente de luz distante, con sombras paralelas.
// 0xffffff: Color blanco de la luz.
// 0.6: Intensidad de la luz.
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(-5, 25, 15);
directionalLight.target.position.set(0, 0, 0);
//directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);
scene.add(directionalLight.target);

// *** CONFIGURAR LUZ DIRECCIONAL PARA EMITIR SOMBRAS ***
directionalLight.castShadow = true;

// Ajustes avanzados para la calidad de la sombra (puede requerir tweaking)
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
// Opcional: para visualizar el frustum de la luz (solo para depuración)
// const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(helper);
// const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(shadowHelper);


// *** AÑADIR UN PLANO PARA RECIBIR SOMBRAS ***
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc }); // Un color más claro para el plano
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotar para que sea horizontal
plane.position.y = 0; // Posición debajo del robot
plane.receiveShadow = true; // El plano recibirá sombras
scene.add(plane);

// 2. Cargar el modelo 3D del robot
let robot; // Variable global para almacenar el objeto principal del modelo (gltf.scene).
// robotPartToMove será la parte específica del robot (el 'Body') que rotará.
let robotPartToMove;
let robotEyeLeft;  // Variable para el ojo izquierdo
let robotEyeRight; // Variable para el ojo derecho

// Crea una instancia del cargador GLTF. Este cargador es necesario para modelos .gltf y .glb.
const loader = new THREE.GLTFLoader();

// Inicia la carga del modelo 3D.
// El primer argumento es la ruta al archivo del modelo.
loader.load(
    './3D models/robot2.glb', // Asegúrate de que esta ruta es correcta y la extensión coincide.
    function (glb) {
        // La función de callback se ejecuta una vez que el modelo ha sido cargado.
        robot = glb.scene; // 'gltf.scene' contiene la jerarquía de objetos 3D del modelo.
        scene.add(robot); // Añade el modelo completo a la escena.
        
        // *** ESTO ES LO CRUCIAL: REVISA LA CONSOLA DEL NAVEGADOR ***
        console.log("--- INICIO DE INSPECCIÓN DE JERARQUÍA DEL MODELO ---");
        console.log("Objeto robot (glb.scene):", robot);

        // Función para listar todos los hijos de un objeto de forma recursiva
        function listChildren(obj, level = 0) {
            const indent = '  '.repeat(level);
            console.log(`${indent}► Nombre: "${obj.name || 'SIN_NOMBRE'}", Tipo: ${obj.type}, Children: ${obj.children.length}`);

            if (obj.children && obj.children.length > 0) {
                obj.children.forEach(child => listChildren(child, level + 1));
            }
        }

        // Llama a la función para listar los hijos desde el objeto raíz del robot
        listChildren(robot);

        console.log("--- FIN DE INSPECCIÓN DE JERARQUÍA DEL MODELO ---");
        // *************************************************************

        // Opcional: Ajustar escala y posición inicial del robot completo.
        robot.scale.set(0.6, 0.6, 0.6); 
        robot.position.set(0, 1, 0);   
            
        const characterGroup = robot.getObjectByName('Character'); 

        if (characterGroup) {
            robotPartToMove = characterGroup.getObjectByName('body'); 
            
            if (!robotPartToMove) {
                console.warn("¡Advertencia! No se encontró el objeto 'body' dentro de 'Character'. La rotación se aplicará al robot completo como fallback.");
                robotPartToMove = robot; 
            } else {
                console.log("Parte del robot para mover encontrada:", robotPartToMove);
            }

            // *** LÓGICA PARA ENCONTRAR LOS OJOS (AHORA CON NOMBRES Ojo1, Ojo2, Ojos) ***
            // Accedemos a 'face' dentro de 'body' (robotPartToMove).
            const faceGroup = robotPartToMove ? robotPartToMove.getObjectByName('face') : null;
            console.log("1# Objeto 'face' encontrado:", faceGroup);
            // Verificamos si 'face' existe antes de buscar los ojos.
            if (faceGroup) {
                // Accedemos a 'Ojos' (antes 'Group') dentro de 'face'.
                const eyeContainerGroup = faceGroup.getObjectByName('Ojos'); // Nombres nuevos: 'Ojos'

                if (eyeContainerGroup) {
                    // Finalmente, encontramos Ojo1 y Ojo2 (antes Rectangle 3 y Rectangle 4) dentro de 'Ojos'.
                    robotEyeLeft = eyeContainerGroup.getObjectByName('Ojo1'); // Nombres nuevos: 'Ojo1'
                    robotEyeRight = eyeContainerGroup.getObjectByName('Ojo2'); // Nombres nuevos: 'Ojo2'

                    if (robotEyeLeft) {
                        console.log("Ojo izquierdo (Ojo1) encontrado");
                    } else {
                        console.warn("¡Advertencia! No se encontró el objeto 'Ojo1' dentro de 'face' -> 'Ojos'.");
                    }
                    if (robotEyeRight) {
                        console.log("Ojo derecho (Ojo2) encontrado");
                    } else {
                        console.warn("¡Advertencia! No se encontró el objeto 'Ojo2' dentro de 'face' -> 'Ojos'.");
                    }
                } else {
                    console.warn("¡Advertencia! No se encontró el objeto 'Ojos' dentro de 'face'. Los ojos no se moverán.");
                }
            } else {
                console.warn("¡Advertencia! No se encontró el objeto 'face' dentro de 'body'. Los ojos no se moverán.");
            }

        } else {
            console.warn("¡Advertencia! No se encontró el objeto 'Character'. La rotación y el parpadeo se aplicarán al robot completo como fallback.");
            robotPartToMove = robot; 
            // Si 'Character' no existe, los ojos tampoco se encontrarán con esta jerarquía.
        }
        // *** FIN DE LA LÓGICA DE BÚSQUEDA DE OJOS ***


        // Inicia el temporizador para los mensajes aleatorios una vez que el robot se ha cargado
        startRandomMessageInterval();
        // Inicia el temporizador para el parpadeo
        startBlinkingInterval();
    },
    // Opcional: Función de progreso de carga (muestra el porcentaje de carga en la consola).
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // Función de error: se ejecuta si hay un problema al cargar el modelo.
    function (error) {
        console.error('An error happened while loading the model:', error);
    }
);

// 3. Variables para la posición del cursor y la rotación del robot
const mouse = new THREE.Vector2(); 
let targetRotationX = 0; 
let targetRotationY = 0; 
const rotationSpeed = 0.05; 

// 4. Detectar movimiento del cursor
window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mouse.x = (x / rect.width) * 2 - 1;
    mouse.y = -((y / rect.height) * 2 - 1); 

    targetRotationY = mouse.x * Math.PI * 0.25; 
    targetRotationX = mouse.y * Math.PI * 0.25; 
});

// 5. Bucle de Animación (render loop)
function animate() {
    requestAnimationFrame(animate);

    // *** IMPORTANTE: Actualizar TWEEN.js en cada fotograma ***
    TWEEN.update(); 

    if (robotPartToMove) { 
        robotPartToMove.rotation.y += (targetRotationY - robotPartToMove.rotation.y) * rotationSpeed;
        robotPartToMove.rotation.x += (targetRotationX - robotPartToMove.rotation.x) * rotationSpeed;
        robotPartToMove.rotation.x = Math.max(-Math.PI * 0.1, Math.min(Math.PI * 0.1, robotPartToMove.rotation.x));
    }

    renderer.render(scene, camera);
}

animate(); 

// 6. Manejar el redimensionamiento de la ventana del navegador
window.addEventListener('resize', () => {
    containerWidth = canvasContainer.clientWidth;
    containerHeight = canvasContainer.clientHeight;

    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(containerWidth, containerHeight);
});

// Posición inicial de la cámara en la escena 3D.
camera.position.z = 5;


// === LÓGICA DE GLOBOS DE TEXTO ===

const botMessages = [
    "¡Hola! ¿tienes problemas con tu proyecto de servicio comunitario?",
    "Estoy aquí para escucharte.",
    "¿Qué tal el día?",
    "¡Qué interesante!",
    "Cálmate, estoy Pensando... 🤔",
    "¿Hay algo más en lo que pueda asistirte?",
    "¡Me alegra verte!",
    "El clima es agradable hoy, ¿no crees?",
    "Recuerda que estoy aprendiendo.",
    "Eres Bienvenido"
];

function showTextBubble(message, displayDuration = 3000, animationDuration = 500) {
    const bubble = document.createElement('div');
    bubble.classList.add('text-bubble');
    bubble.textContent = message;

    if (textBubblesContainer) { // Asegúrate de que el contenedor exista antes de intentar añadir un hijo
        textBubblesContainer.appendChild(bubble);

        const containerRect = textBubblesContainer.getBoundingClientRect();
        const bubbleWidth = bubble.offsetWidth;
        const bubbleHeight = bubble.offsetHeight;

        // Calcular posiciones aleatorias dentro de los límites del contenedor
        const randomLeft = Math.random() * (containerRect.width - bubbleWidth);
        const randomTop = Math.random() * (containerRect.height - bubbleHeight);

        bubble.style.left = `${randomLeft}px`;
        bubble.style.top = `${randomTop}px`;

        bubble.classList.add('fade-in');

        setTimeout(() => {
            bubble.classList.remove('fade-in');
            bubble.classList.add('fade-out');

            setTimeout(() => {
                if (bubble.parentNode) { 
                    bubble.parentNode.removeChild(bubble);
                }
            }, animationDuration);

        }, displayDuration);
    } else {
        console.error("Error: El contenedor 'textBubblesContainer' no fue encontrado en el DOM. Asegúrate de que el ID esté correcto y el elemento exista en tu HTML antes de que el script intente acceder a él.");
    }
}

function showRandomBotMessage() {
    const randomIndex = Math.floor(Math.random() * botMessages.length);
    const message = botMessages[randomIndex];
    showTextBubble(message);
}

let messageIntervalTimer; 

function startRandomMessageInterval() {
    if (messageIntervalTimer) {
        clearTimeout(messageIntervalTimer);
    }

    const minDelay = 5000; 
    const maxDelay = 15000; 

    const setNextMessageTimer = () => {
        const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
        messageIntervalTimer = setTimeout(() => {
            showRandomBotMessage(); 
            setNextMessageTimer(); 
        }, randomDelay);
    };

    setNextMessageTimer(); 
}

// === LÓGICA DE PARPADEO (CORREGIDA CON TWEEN.js Y NUEVOS NOMBRES) ===

// Variables para controlar la animación del parpadeo
const blinkCloseDuration = 100; // Duración solo del cierre del ojo
const blinkOpenDuration = 100;  // Duración solo de la apertura del ojo
const blinkClosedPause = 50;    // Pausa cuando el ojo está completamente cerrado

const closedEyeScaleY = 0.01; // Escala Y cuando el ojo está cerrado (casi plano)
const openEyeScaleY = 1.0; // Escala Y cuando el ojo está abierto (normal)

/**
 * Realiza la animación de parpadeo suave para los ojos del robot usando TWEEN.js.
 */
function blinkEyes() {
    // Es crucial que los objetos de los ojos sean meshes (THREE.Mesh)
    // y que la propiedad 'scale' sea el método correcto para animar el parpadeo en tu modelo.
    if (!robotEyeLeft || !robotEyeRight || !(robotEyeLeft.isMesh) || !(robotEyeRight.isMesh)) {
        console.warn("Los objetos de los ojos no se encontraron o no son THREE.Mesh para el parpadeo. Asegúrate de que 'Ojo1' y 'Ojo2' sean meshes válidos en tu GLB dentro del grupo 'Ojos'.");
        return;
    }

    console.log("Iniciando parpadeo suave. Ojo Izquierdo:", robotEyeLeft, "Ojo Derecho:", robotEyeRight);
    
    // Helper para crear un tween para un ojo específico
    const createEyeTween = (eyeMesh, targetScaleY, duration, onCompleteCallback) => {
        return new TWEEN.Tween({ scaleY: eyeMesh.scale.y })
            .to({ scaleY: targetScaleY }, duration)
            .easing(TWEEN.Easing.Quadratic.Out) // Facilita la animación (comienza rápido, termina lento)
            .onUpdate((obj) => {
                eyeMesh.scale.y = obj.scaleY; // Actualiza la escala Y del ojo en cada fotograma del tween
            })
            .onComplete(() => {
                if (onCompleteCallback) onCompleteCallback();
            });
    };

    // 1. Cerrar los ojos (animación hacia closedEyeScaleY)
    const closeEyeLeft = createEyeTween(robotEyeLeft, closedEyeScaleY, blinkCloseDuration);
    const closeEyeRight = createEyeTween(robotEyeRight, closedEyeScaleY, blinkCloseDuration);

    // 2. Pausar cuando los ojos están cerrados (un tween que no hace nada pero espera)
    const pauseClosed = new TWEEN.Tween({})
        .to({}, blinkClosedPause); 

    // 3. Abrir los ojos (animación de vuelta a openEyeScaleY)
    const openEyeLeft = createEyeTween(robotEyeLeft, openEyeScaleY, blinkOpenDuration);
    const openEyeRight = createEyeTween(robotEyeRight, openEyeScaleY, blinkOpenDuration);

    // Encadenar las animaciones para que se ejecuten en secuencia: Cerrar -> Pausar -> Abrir
    closeEyeLeft.chain(pauseClosed);
    closeEyeRight.chain(pauseClosed); // Ambos ojos se cierran y luego esperan con pauseClosed

    pauseClosed.chain(openEyeLeft, openEyeRight); // Después de la pausa, ambos ojos se abren

    // Iniciar la animación de cierre para ambos ojos
    closeEyeLeft.start();
    closeEyeRight.start();
}

// Inicia el temporizador para el parpadeo aleatorio
function startBlinkingInterval() {
    const minBlinkDelay = 2000; // Mínimo 2 segundos entre parpadeos
    const maxBlinkDelay = 4000; // Máximo 4 segundos entre parpadeos

    const setNextBlinkTimer = () => {
        const randomDelay = Math.random() * (maxBlinkDelay - minBlinkDelay) + minBlinkDelay;
        setTimeout(() => {
            blinkEyes(); // Realiza un parpadeo
            setNextBlinkTimer(); // Programa el siguiente parpadeo
        }, randomDelay);
    };

    // Inicia el primer temporizador para el parpadeo
    setNextBlinkTimer();
}