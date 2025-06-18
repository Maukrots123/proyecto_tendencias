<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Chatbot UNEG</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; }
    #chat { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    .msg { margin: 10px 0; }
    .user { color: blue; }
    .bot { color: green; }
  </style>
</head>
<body>
  <div id="chat">
    <h2>🤖 Chatbot UNEG</h2>
    <div id="messages"></div>
    <input type="text" id="input" placeholder="Escribe tu pregunta..." style="width: 80%;">
    <button onclick="sendMessage()">Enviar</button>
  </div>

  <script>
    async function sendMessage() {
      const input = document.getElementById('input');
      const userText = input.value.trim();
      if (!userText) return;

      input.value = '';
      showMessage(userText, 'user');

      try {
        const response = await fetch('con_chat.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText })
        });

        const data = await response.json();
        const botReply = data.reply || 'No pude responder. Intenta de nuevo.';
        showMessage(botReply, 'bot');
      } catch (error) {
        showMessage('Error al conectar con el servidor.', 'bot');
      }
    }

    function showMessage(text, sender) {
      const messages = document.getElementById('messages');
      const msg = document.createElement('div');
      msg.className = 'msg ' + sender;
      msg.textContent = (sender === 'user' ? 'Tú: ' : 'Chatbot: ') + text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }
  </script>
</body>
</html>
