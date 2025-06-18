<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chat Interface</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <link rel="stylesheet" href="estilo_chat.css" />
</head>
<body>

    <div class="chat-container">
        <div class="chat-header">
            <div class="left">
                <a href="presentacion.php" style="color: inherit; text-decoration: none; display: flex; align-items: center;">
                    <i class="material-icons">arrow_back</i>
                    <span>Regresar</span>
                </a>
            </div>
            <div class="right">
                <i class="material-icons">search</i>
                <i class="material-icons">more_vert</i>
            </div>
        </div>

        <div class="chat-messages"></div>

        <div class="chat-input">
            <i class="material-icons add-icon">add</i>
            <input type="text" id="messageInput" placeholder="Your message..." />
            <button id="sendButton" class="send-button">
                <i class="material-icons">send</i>
            </button>
        </div>
    </div>
    
    <script src="./Scripts/three.min.js"></script>
    <script src="./Scripts/GLTFLoader.js"></script>
    <script src="./Scripts/tween.umd.min.js"></script>
    <script src="./Scripts/cargarCabeza.js"></script>

    <script>
        const robotInstances = new WeakMap();

        function initializeRobotCanvas(canvasElement) {
            const canvasContainerElement = canvasElement.closest('.robot-avatar-container');
            if (!canvasContainerElement) {
                console.error("No se encontró el contenedor '.robot-avatar-container'");
                return;
            }
            if (!robotInstances.has(canvasElement)) {
                const robotControls = window.initRobotHead(canvasElement, canvasContainerElement);
                robotInstances.set(canvasElement, robotControls);
            }
        }

        function getCurrentTime() {
            const now = new Date();
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        function createBotMessageHtml(messageText, time) {
            return `
                <div class="message-row received">
                    <div class="robot-avatar-container">
                        <canvas class="robotCanvas"></canvas>
                    </div>
                    <div class="message-bubble received">${messageText}</div>
                    <span class="message-time">${time}</span>
                </div>
            `;
        }

        function createUserMessageHtml(messageText, time) {
            return `
                <div class="message-row sent">
                    <span class="message-time">${time}</span>
                    <div class="message-bubble sent">${messageText}</div>
                    <div class="avatar-container">
                        <img src="./usuario.png" style="width:100%; height:100%" />
                    </div>
                </div>
            `;
        }

        function sendMessage(messageText) {
            const chatMessages = document.querySelector('.chat-messages');
            const messageHtml = createUserMessageHtml(messageText, getCurrentTime());
            chatMessages.insertAdjacentHTML('beforeend', messageHtml);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function obtenerRespuestaIA(mensajeUsuario) {
            try {
                const response = await fetch('con_chat.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: mensajeUsuario })
                });
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                const data = await response.json();
                return data.reply || "Lo siento, no entendí eso.";
            } catch (error) {
                console.error("Error llamando a la IA:", error);
                return "Error al conectar con la IA.";
            }
        }

        async function handleBotResponse(userMessage) {
            const chatMessages = document.querySelector('.chat-messages');
            const thinkingRowHtml = createBotMessageHtml(
                `Pensando<span class="thinking-dots">.</span>`,
                getCurrentTime()
            );
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = thinkingRowHtml.trim();
            const thinkingMessageRow = tempDiv.firstChild;
            thinkingMessageRow.classList.add('thinking-message');
            chatMessages.appendChild(thinkingMessageRow);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const thinkingCanvas = thinkingMessageRow.querySelector('.robotCanvas');
            if (thinkingCanvas) initializeRobotCanvas(thinkingCanvas);

            const respuestaIA = await obtenerRespuestaIA(userMessage);

            if (thinkingCanvas && robotInstances.has(thinkingCanvas)) {
                robotInstances.get(thinkingCanvas).dispose();
                robotInstances.delete(thinkingCanvas);
            }
            chatMessages.removeChild(thinkingMessageRow);

            const finalMessageHtml = createBotMessageHtml(respuestaIA, getCurrentTime());
            chatMessages.insertAdjacentHTML('beforeend', finalMessageHtml);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const lastMessageCanvas = chatMessages.lastElementChild.querySelector('.robotCanvas');
            if (lastMessageCanvas) initializeRobotCanvas(lastMessageCanvas);
        }

        // ✅ Esta es la función que te faltaba
        async function addBotCommentToChat(messageText, thinkingTimeMs = 1200) {
            const chatMessages = document.querySelector('.chat-messages');
            const thinkingRowHtml = createBotMessageHtml(`Pensando<span class="thinking-dots">.</span>`, getCurrentTime());

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = thinkingRowHtml.trim();
            const thinkingMessageRow = tempDiv.firstChild;
            thinkingMessageRow.classList.add('thinking-message');
            chatMessages.appendChild(thinkingMessageRow);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const thinkingCanvas = thinkingMessageRow.querySelector('.robotCanvas');
            if (thinkingCanvas) initializeRobotCanvas(thinkingCanvas);

            await new Promise(resolve => setTimeout(resolve, thinkingTimeMs));

            if (thinkingCanvas && robotInstances.has(thinkingCanvas)) {
                robotInstances.get(thinkingCanvas).dispose();
                robotInstances.delete(thinkingCanvas);
            }
            chatMessages.removeChild(thinkingMessageRow);

            const finalMessageHtml = createBotMessageHtml(messageText, getCurrentTime());
            chatMessages.insertAdjacentHTML('beforeend', finalMessageHtml);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const lastMessageCanvas = chatMessages.lastElementChild.querySelector('.robotCanvas');
            if (lastMessageCanvas) initializeRobotCanvas(lastMessageCanvas);
        }

        document.addEventListener('DOMContentLoaded', () => {
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');

            const handleSendMessage = async () => {
                const text = messageInput.value.trim();
                if (text !== '') {
                    sendMessage(text);
                    messageInput.value = '';
                    await handleBotResponse(text);
                }
            };

            sendButton.addEventListener('click', handleSendMessage);
            messageInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSendMessage();
                }
            });

            const initialRobotCanvas = document.querySelector('.message-row.received .robotCanvas');
            if (initialRobotCanvas) initializeRobotCanvas(initialRobotCanvas);

            // ✅ Saludo inicial automático
            setTimeout(() => {
                addBotCommentToChat("¡Hola! Soy Rebeca junior, la asistente virtual del Servicio Comunitario de la UNEG.");
            }, 1000);

            setTimeout(() => {
                addBotCommentToChat("Estoy aquí para ayudarte con cualquier duda sobre tu servicio comunitario. ¿En qué puedo ayudarte hoy?");
            }, 3000);
        });
    </script>
</body>
</html>
