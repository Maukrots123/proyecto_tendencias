// Contenido de ./Scripts/cargarCabeza2.js

/**
 * Inicializa y controla la cabeza de robot 3D en un elemento canvas específico.
 * Retorna un objeto con métodos para controlar la instancia (ej. stop, dispose).
 * @param {HTMLCanvasElement} canvasElement - El elemento <canvas> donde dibujar el robot.
 * @param {HTMLElement} canvasContainerElement - El elemento contenedor del canvas (para eventos de mouse).
 * @returns {object} Un objeto con métodos para controlar la instancia del robot.
 */
function initRobotHead(canvasElement, canvasContainerElement) {
    // 1. Define la escena para los objetos 3D.
    const scene = new THREE.Scene();

    // Obtener las dimensiones iniciales del contenedor del canvas
    let containerWidth = canvasContainerElement.clientWidth;
    let containerHeight = canvasContainerElement.clientHeight;

    // Crea una cámara de perspectiva.
    const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);

    // Crea un renderizador WebGL.
    const renderer = new THREE.WebGLRenderer({ canvas: canvasElement, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Añadir luces a la escena
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-5, 25, 15);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;

    // Añadir un plano para recibir sombras
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);

    // 2. Cargar el modelo 3D del robot
    let robot;
    let robotPartToMove;
    let robotEyeLeft;
    let robotEyeRight;

    const initialRobotYawRotation = Math.PI / 4;

    const loader = new THREE.GLTFLoader();

    // *** RUTA DEL MODELO GLB CORREGIDA AQUÍ ***
    loader.load(
        './3D models/cabeza.glb', // Usamos cabeza.glb como indicaste
        function (glb) {
            robot = glb.scene;
            scene.add(robot);

            // console.log("--- INICIO DE INSPECCIÓN DE JERARQUÍA DEL MODELO ---");
            // console.log("Objeto robot (glb.scene):", robot);

            // function listChildren(obj, level = 0) {
            //     const indent = '  '.repeat(level);
            //     console.log(`${indent}► Nombre: "${obj.name || 'SIN_NOMBRE'}", Tipo: ${obj.type}, Children: ${obj.children.length}`);
            //     if (obj.children && obj.children.length > 0) {
            //         obj.children.forEach(child => listChildren(child, level + 1));
            //     }
            // }
            // listChildren(robot);
            // console.log("--- FIN DE INSPECCIÓN DE JERARQUÍA DEL MODELO ---");

            robot.scale.set(0.9, 0.9, 0.9);
            robot.position.set(-0.2, 1.0, 0);

            const characterGroup = robot.getObjectByName('Character');

            if (characterGroup) {
                robotPartToMove = characterGroup.getObjectByName('body');

                if (!robotPartToMove) {
                    console.warn("¡Advertencia! No se encontró el objeto 'body' dentro de 'Character'. La rotación se aplicará al robot completo como fallback.");
                    robotPartToMove = robot;
                } //else {
                    // console.log("Parte del robot para mover encontrada:", robotPartToMove);
                // }

                if (robotPartToMove) {
                    robotPartToMove.rotation.y = initialRobotYawRotation;
                }

                const faceGroup = robotPartToMove ? robotPartToMove.getObjectByName('face') : null;
                // console.log("1# Objeto 'face' encontrado:", faceGroup);
                if (faceGroup) {
                    const eyeContainerGroup = faceGroup.getObjectByName('Ojos');
                    // console.log("2# Objeto 'Ojos' encontrado:", eyeContainerGroup);

                    if (eyeContainerGroup) {
                        robotEyeLeft = eyeContainerGroup.getObjectByName('Ojo1');
                        robotEyeRight = eyeContainerGroup.getObjectByName('Ojo2');

                        // if (robotEyeLeft) {
                        //     console.log("Ojo izquierdo (Ojo1) encontrado:", robotEyeLeft);
                        // } else {
                        //     console.warn("¡Advertencia! No se encontró el objeto 'Ojo1' dentro de 'face' -> 'Ojos'.");
                        // }
                        // if (robotEyeRight) {
                        //     console.log("Ojo derecho (Ojo2) encontrado:", robotEyeRight);
                        // } else {
                        //     console.warn("¡Advertencia! No se encontró el objeto 'Ojo2' dentro de 'face' -> 'Ojos'.");
                        // }
                    } else {
                        console.warn("¡Advertencia! No se encontró el objeto 'Ojos' dentro de 'face'. Los ojos no se moverán.");
                    }
                } else {
                    console.warn("¡Advertencia! No se encontró el objeto 'face' dentro de 'body'. Los ojos no se moverán.");
                }

            } else {
                console.warn("¡Advertencia! No se encontró el objeto 'Character'. La rotación y el parpadeo se aplicarán al robot completo como fallback.");
                robotPartToMove = robot;
            }

            // Estas funciones ahora se inician DESPUÉS de que el modelo se cargue para esta instancia específica
            startRandomMessageInterval();
            startBlinkingInterval();
        },
        function (xhr) {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened while loading the model:', error);
        }
    );

    // 3. Variables para la posición del cursor y la rotación del robot
    const mouse = new THREE.Vector2();
    let targetRotationOffsetX = 0;
    let targetRotationOffsetY = 0;

    // AJUSTE PARA MÁS FLUIDEZ EN EL MOVIMIENTO DE LA CABEZA
    const rotationSpeed = 0.03;

    const maxHeadYawRotation = Math.PI / 8;
    const maxHeadPitchRotation = Math.PI / 10;

    // 4. Detectar movimiento del cursor - Ahora usando el contenedor específico
    canvasContainerElement.addEventListener('mousemove', (event) => {
        const rect = canvasElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        mouse.x = (x / rect.width) * 2 - 1;
        mouse.y = -((y / rect.height) * 2 - 1);

        targetRotationOffsetY = mouse.x * maxHeadYawRotation;
        targetRotationOffsetX = -mouse.y * maxHeadPitchRotation;
    });

    canvasContainerElement.addEventListener('mouseleave', () => {
        targetRotationOffsetX = 0;
        targetRotationOffsetY = 0;
    });

    // Bucle de Animación (render loop)
    let animationFrameId; // Variable para controlar el requestAnimationFrame

    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        // *** IMPORTANTE: Actualizar TWEEN.js en cada fotograma ***
        TWEEN.update();

        if (robotPartToMove) {
            const currentTargetYaw = initialRobotYawRotation + targetRotationOffsetY;
            const currentTargetPitch = targetRotationOffsetX;

            robotPartToMove.rotation.y += (currentTargetYaw - robotPartToMove.rotation.y) * rotationSpeed;
            robotPartToMove.rotation.x += (currentTargetPitch - robotPartToMove.rotation.x) * rotationSpeed;

            robotPartToMove.rotation.x = Math.max(-maxHeadPitchRotation, Math.min(maxHeadPitchRotation, robotPartToMove.rotation.x));
            robotPartToMove.rotation.y = Math.max(initialRobotYawRotation - maxHeadYawRotation,
                                                 Math.min(initialRobotYawRotation + maxHeadYawRotation, robotPartToMove.rotation.y));
        }

        renderer.render(scene, camera);
    }

    animate(); // Inicia la animación cuando se inicializa el robot

    // 6. Manejar el redimensionamiento de la ventana del navegador
    // Esta parte puede necesitar un manejo más global si varios robots comparten el mismo resize listener
    // Por ahora, lo mantenemos por instancia, pero si afecta a todos los canvases,
    // es mejor que se gestione una sola vez en el script principal.
    // Para este caso, solo afecta al canvas de su propia instancia.
    const onResize = () => {
        containerWidth = canvasContainerElement.clientWidth;
        containerHeight = canvasContainerElement.clientHeight;

        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(containerWidth, containerHeight);
    };
    window.addEventListener('resize', onResize);


    camera.position.z = 5;

    // === LÓGICA DE GLOBOS DE TEXTO ===
    // (Ahora encapsulada dentro de la función para ser específica de esta instancia)
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

    let messageIntervalTimer;

    function showRandomBotMessage() {
        // Esta función NO debe mostrar los globos de texto externos del HTML
        // porque el sistema de chat ya maneja los mensajes.
        // Aquí solo simulamos que el bot "podría" estar pensando/hablando si fuera su propio espacio.
        // Si quieres que el bot hable en el chat principal, usa addBotCommentToChat
        // en el script principal.
        // La lógica de `showTextBubble` con `textBubblesContainer` no se aplica
        // en este contexto de un avatar dentro de la burbuja de chat.
        // Si la quieres para debugging, puedes descomentar la línea de console.log.
        // console.log(`[Robot Interno]: ${botMessages[Math.floor(Math.random() * botMessages.length)]}`);
    }

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

    // === LÓGICA DE PARPADEO ===
    const blinkCloseDuration = 100;
    const blinkOpenDuration = 100;
    const blinkClosedPause = 50;
    const closedEyeScaleY = 0.01;
    const openEyeScaleY = 1.0;

    /**
     * Realiza la animación de parpadeo suave para los ojos del robot usando TWEEN.js.
     */
    function blinkEyes() {
        if (!robotEyeLeft || !robotEyeRight || !(robotEyeLeft.isMesh) || !(robotEyeRight.isMesh)) {
            // console.warn("Los objetos de los ojos no se encontraron o no son THREE.Mesh para el parpadeo. Asegúrate de que 'Ojo1' y 'Ojo2' estén dentro de 'Ojos' y sean meshes válidos en tu GLB.");
            return;
        }

        // console.log("Iniciando parpadeo suave. Ojo1:", robotEyeLeft, "Ojo2:", robotEyeRight);

        const createEyeTween = (eyeMesh, targetScaleY, duration, onCompleteCallback) => {
            return new TWEEN.Tween({ scaleY: eyeMesh.scale.y })
                .to({ scaleY: targetScaleY }, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((obj) => {
                    eyeMesh.scale.y = obj.scaleY;
                })
                .onComplete(() => {
                    if (onCompleteCallback) onCompleteCallback();
                });
        };

        const closeEyeLeft = createEyeTween(robotEyeLeft, closedEyeScaleY, blinkCloseDuration);
        const closeEyeRight = createEyeTween(robotEyeRight, closedEyeScaleY, blinkCloseDuration);
        const pauseClosed = new TWEEN.Tween({}).to({}, blinkClosedPause);
        const openEyeLeft = createEyeTween(robotEyeLeft, openEyeScaleY, blinkOpenDuration);
        const openEyeRight = createEyeTween(robotEyeRight, openEyeScaleY, blinkOpenDuration);

        closeEyeLeft.chain(pauseClosed);
        closeEyeRight.chain(pauseClosed);
        pauseClosed.chain(openEyeLeft, openEyeRight);

        closeEyeLeft.start();
        closeEyeRight.start();
    }

    let blinkingIntervalTimer; // Para controlar el temporizador de parpadeo

    function startBlinkingInterval() {
        if (blinkingIntervalTimer) {
            clearTimeout(blinkingIntervalTimer);
        }
        const minBlinkDelay = 2000;
        const maxBlinkDelay = 4000;
        const setNextBlinkTimer = () => {
            const randomDelay = Math.random() * (maxBlinkDelay - minBlinkDelay) + minBlinkDelay;
            blinkingIntervalTimer = setTimeout(() => {
                blinkEyes();
                setNextBlinkTimer();
            }, randomDelay);
        };
        setNextBlinkTimer();
    }

    // --- Métodos de control para la instancia del robot ---
    return {
        scene,
        camera,
        renderer,
        robotModel: robot, // Podría ser null al principio, se asigna al cargar
        animate,
        stop: () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(messageIntervalTimer); // Detener el intervalo de mensajes
            clearTimeout(blinkingIntervalTimer); // Detener el intervalo de parpadeo
        },
        dispose: () => {
            // Detener animaciones y liberar recursos
            cancelAnimationFrame(animationFrameId);
            clearTimeout(messageIntervalTimer);
            clearTimeout(blinkingIntervalTimer);

            // Eliminar el event listener de redimensionamiento específico de esta instancia
            window.removeEventListener('resize', onResize);

            // Limpiar la memoria del renderizador
            renderer.dispose();

            // Limpiar la escena (geometrías, materiales, texturas)
            scene.traverse((object) => {
                if (!object.isMesh) return;
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            // Limpiar la escena de todos los objetos
            scene.clear();
        }
    };
}

// Hacemos la función accesible globalmente (o usando módulos si tuvieras un setup más complejo)
window.initRobotHead = initRobotHead;