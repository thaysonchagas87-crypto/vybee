<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VYBEE | The Ultimate Arena</title>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root { --black: #050505; --graphite: #1A1A1A; --neon-green: #39FF14; --neon-orange: #FF5F1F; --text: #E0E0E0; }
        * { box-sizing: border-box; transition: all 0.2s ease-in-out; }
        body, html { margin: 0; padding: 0; background: var(--black); color: var(--text); font-family: 'Rajdhani', sans-serif; height: 100vh; overflow: hidden; }
        
        /* Layout */
        .app-shell { display: flex; height: 100vh; }
        
        /* Sidebar Hexagonal */
        .hive-nav { width: 80px; background: #000; display: flex; flex-direction: column; align-items: center; padding-top: 20px; border-right: 1px solid var(--graphite); }
        .hex-btn { width: 50px; height: 50px; background: var(--graphite); clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); margin-bottom: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; font-size: 20px; }
        .hex-btn:hover { background: var(--neon-green); color: #000; transform: scale(1.1); box-shadow: 0 0 15px var(--neon-green); }
        .hex-btn.active { border: 2px solid var(--neon-orange); color: var(--neon-orange); box-shadow: 0 0 10px var(--neon-orange); }

        /* Canais */
        .channel-bar { width: 240px; background: var(--graphite); border-right: 1px solid #000; padding: 20px; display: flex; flex-direction: column; }
        .brand { font-size: 28px; font-weight: bold; margin-bottom: 30px; letter-spacing: 2px; }
        .brand span { color: var(--neon-orange); }
        .section-label { color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px; }
        .channel { padding: 8px 12px; margin-bottom: 5px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; }
        .channel:hover { background: rgba(57, 255, 20, 0.1); color: var(--neon-green); }
        .channel.active { background: rgba(255, 95, 31, 0.1); color: var(--neon-orange); border-left: 3px solid var(--neon-orange); }

        /* Main Arena */
        .arena-core { flex: 1; display: flex; flex-direction: column; }
        .video-engine { flex: 2; background: #000; position: relative; border-bottom: 2px solid var(--graphite); display: flex; align-items: center; justify-content: center; }
        .video-placeholder { text-align: center; color: #333; }
        .video-placeholder h2 { margin: 0; font-size: 2rem; }
        .badge-4k { position: absolute; top: 20px; left: 20px; background: var(--neon-orange); color: #000; padding: 4px 12px; font-weight: bold; border-radius: 2px; animation: pulse 2s infinite; }

        /* Chat System */
        .chat-system { flex: 1; display: flex; flex-direction: column; padding: 20px; background: var(--black); }
        .messages { flex: 1; overflow-y: auto; padding-right: 10px; }
        .msg { margin-bottom: 12px; font-size: 16px; border-left: 2px solid var(--graphite); padding-left: 10px; }
        .msg b { color: var(--neon-green); margin-right: 8px; }
        .input-wrap { display: flex; background: var(--graphite); padding: 5px; border: 1px solid var(--neon-green); margin-top: 10px; }
        input { flex: 1; background: transparent; border: none; color: white; padding: 12px; outline: none; font-family: 'Rajdhani'; font-size: 16px; }
        .send-btn { background: var(--neon-orange); border: none; color: black; font-weight: bold; padding: 0 20px; cursor: pointer; }

        /* Arena Sports Module */
        .arena-module { width: 300px; background: var(--graphite); padding: 20px; border-left: 1px solid #000; }
        .stat-card { background: #000; padding: 15px; margin-bottom: 15px; border: 1px solid var(--neon-green); position: relative; }
        .stat-card h4 { margin: 0 0 10px 0; color: var(--neon-orange); }
        .score { font-size: 32px; font-weight: bold; display: flex; justify-content: space-between; }

        @keyframes pulse { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }
    </style>
</head>
<body>

<div class="app-shell">
    <!-- Navegação em Colmeia -->
    <nav class="hive-nav">
        <div class="hex-btn active">V</div>
        <div class="hex-btn">J</div>
        <div class="hex-btn">E</div>
        <div class="hex-btn" style="margin-top: auto; color: var(--neon-green)">+</div>
    </nav>

    <!-- Canais -->
    <aside class="channel-bar">
        <div class="brand">VY<span>BEE</span></div>
        
        <div class="section-label">Canais Arena</div>
        <div class="channel active">📢 lobby-geral</div>
        <div class="channel">🎮 squad-room</div>
        <div class="channel">🎙️ voz-pro</div>
        
        <div style="margin-top: 20px;" class="section-label">Live Events</div>
        <div class="channel" style="color: var(--neon-orange)">🔴 CAMPEONATO 4K</div>
        <div class="channel">📺 replay-lutas</div>
    </aside>

    <!-- Main Engine -->
    <main class="arena-core">
        <section class="video-engine">
            <div class="badge-4k">ULTRA HD 4K | 60 FPS</div>
            <div class="video-placeholder">
                <h2 id="video-status">CONECTANDO AO STREAM...</h2>
                <p>LATÊNCIA: 12ms | BITRATE: 15000kbps</p>
            </div>
        </section>

        <section class="chat-system">
            <div class="messages" id="chat-flow">
                <div class="msg"><b>ARQUITETO_IA:</b> Bem-vindo ao VYBEE. Estética Neon e Performance 4K ativa.</div>
                <div class="msg"><b>SISTEMA:</b> thaysonchagas87 entrou na Arena.</div>
            </div>
            <div class="input-wrap">
                <input type="text" id="msg-input" placeholder="Digite na Colmeia..." onkeypress="handleKey(event)">
                <button class="send-btn" onclick="sendMsg()">ENVIAR</button>
            </div>
        </section>
    </main>

    <!-- Módulo de Esportes Arena -->
    <aside class="arena-module">
        <h3 style="color: var(--neon-green)">VYBEE ARENA</h3>
        <div class="stat-card">
            <h4>PLACAR AO VIVO</h4>
            <div class="score">
                <span>TEAM A</span>
                <span style="color: var(--neon-orange)">2</span>
                <span>-</span>
                <span style="color: var(--neon-orange)">1</span>
                <span>TEAM B</span>
            </div>
        </div>
        <div class="stat-card">
            <h4>TORNEIO ATIVO</h4>
            <div style="font-size: 14px;">Chaveamento: Final Regional</div>
            <div style="color: var(--neon-green); margin-top: 5px;">Premiação: 5.000 BEES</div>
        </div>
    </aside>
</div>

<script>
    // Lógica de Chat Fluido
    function sendMsg() {
        const input = document.getElementById('msg-input');
        const flow = document.getElementById('chat-flow');
        if (input.value.trim() !== "") {
            const div = document.createElement('div');
            div.className = 'msg';
            div.innerHTML = `<b>VOCÊ:</b> ${input.value}`;
            flow.appendChild(div);
            input.value = "";
            flow.scrollTop = flow.scrollHeight;
            
            // Simulação de Resposta para mostrar fluidez
            setTimeout(() => {
                const botDiv = document.createElement('div');
                botDiv.className = 'msg';
                botDiv.innerHTML = `<b>VYBEE_BOT:</b> Mensagem processada em 4K!`;
                flow.appendChild(botDiv);
                flow.scrollTop = flow.scrollHeight;
            }, 1000);
        }
    }

    function handleKey(e) { if (e.key === 'Enter') sendMsg(); }

    // Simulação de Carregamento de Vídeo
    setTimeout(() => {
        document.getElementById('video-status').innerText = "LIVE: FINAL DO CAMPEONATO";
        document.getElementById('video-status').style.color = "var(--neon-green)";
    }, 3000);
</script>
</body>
</html>
