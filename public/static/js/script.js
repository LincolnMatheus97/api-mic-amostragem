document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTOS DA PÁGINA ---
    const dbLevelElement = document.getElementById("db-level");
    const soundLevelElement = document.getElementById("sound-level");
    const stateLevelElement = document.getElementById("state-level")
    const ledbarContainer = document.getElementById("ledbar-container");

    // --- CONFIGURAÇÕES DA LEDBAR ---
    const QTD_LEDS = 25;
    const LEDS_VERDES = 13;
    const LEDS_AMARELOS = 8;
    const MIN_DB_MAPA = 30.0;
    const MAX_DB_MAPA = 103.0;

    // --- CRIAÇÃO DOS LEDS VIRTUAIS ---
    for (let i = 0; i < QTD_LEDS; i++) {
        const led = document.createElement("div");
        led.classList.add("led");
        ledbarContainer.appendChild(led);
    }
    const leds = document.querySelectorAll(".led");

    // 1. Variável global para guardar o último estado recebido
    let ultimoEstadoRecebido = null;

    // 2. A função que sabe como desenhar TUDO na tela com base em um estado
    function atualizarUI(estado) {
        if (!estado) return;

        const { niveldB, nivelSom } = estado;

        // Atualiza os textos
        dbLevelElement.textContent = niveldB.toFixed(2);
        soundLevelElement.textContent = nivelSom;

        if (soundLevelElement.textContent == 'Baixo') {
            stateLevelElement.textContent = 'Nivel Seguro!';
        } else if (soundLevelElement.textContent == 'Moderado') {
            stateLevelElement.textContent = 'Cuidado com o tempo!';
        } else {
            stateLevelElement.textContent = 'Nivel Prejudicial';
        }

        // --- Lógica de atualização da Ledbar ---
        let ledsAcesos = 0;
        if (niveldB > MIN_DB_MAPA) {
            const percentual = (niveldB - MIN_DB_MAPA) / (MAX_DB_MAPA - MIN_DB_MAPA);
            ledsAcesos = Math.round(percentual * QTD_LEDS);
        }
        ledsAcesos = Math.max(0, Math.min(QTD_LEDS, ledsAcesos));
        
        leds.forEach((led, index) => {
            if (index < ledsAcesos) {
                if (index < LEDS_VERDES) {
                    led.style.backgroundColor = "#2ecc71"; // Verde
                } else if (index < LEDS_VERDES + LEDS_AMARELOS) {
                    led.style.backgroundColor = "#f1c40f"; // Amarelo
                } else {
                    led.style.backgroundColor = "#e74c3c"; // Vermelho
                }
            } else {
                led.style.backgroundColor = "transparent";
            }
        });
    }

    // 3. O loop de renderização principal
    function loopDeRenderizacao() {
        // Se temos um novo estado para renderizar, fazemos isso
        if (ultimoEstadoRecebido) {
            atualizarUI(ultimoEstadoRecebido);
            // Limpamos para não renderizar o mesmo dado duas vezes
            ultimoEstadoRecebido = null;
        }
        // Pedimos ao navegador para chamar esta função novamente no próximo quadro
        requestAnimationFrame(loopDeRenderizacao);
    }


    // --- CONEXÃO WEBSOCKET ---
    function conectarWebSocket() {
        const socket = new WebSocket(`ws://${window.location.hostname}:8080`);

        socket.onopen = () => {
            console.log("Conectado ao servidor WebSocket!");
            soundLevelElement.textContent = "--";
            stateLevelElement.textContent = "--";
        };

        socket.onmessage = (event) => {
            try {
                // A única tarefa aqui é guardar o dado mais recente.
                ultimoEstadoRecebido = JSON.parse(event.data);
            } catch (error) {
                console.error("Erro ao processar a mensagem JSON:", error);
            }
        };

        socket.onclose = () => {
            console.log("Desconectado do servidor WebSocket. Tentando reconectar em 3 segundos...");
            dbLevelElement.textContent = "--";
            soundLevelElement.textContent = "--";
            stateLevelElement.textContent = "--";
            setTimeout(conectarWebSocket, 3000);
        };

        socket.onerror = (error) => {
            console.error("Erro no WebSocket:", error);
            socket.close();
        };
    }

    // Inicia a primeira conexão com o WebSocket
    conectarWebSocket();
    // Inicia o loop de renderização da interface
    loopDeRenderizacao();
});