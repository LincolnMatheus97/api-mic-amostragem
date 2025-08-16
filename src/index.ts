import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';

// 1. Inicialização
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

// Configuração para servir a página HTML estática (para o browser)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'templates', 'index.html'));
});

// 2. Lógica do WebSocket
wss.on('connection', (ws) => {
    // Esta mensagem deve aparecer no console do servidor quando a Pico conectar
    console.log('Um cliente conectou via WebSocket!');

    // Adiciona um listener para mensagens recebidas deste cliente
    ws.on('message', (message) => {
        const messageString = message.toString();
        console.log('Dados recebidos da Pico W:', messageString);

        // Tenta fazer o parse do JSON
        try {
            const dadosJson = JSON.parse(messageString);
            
            // Retransmite os dados para TODOS os outros clientes (browsers) conectados
            wss.clients.forEach((client) => {
                // Envia para todos, exceto para o cliente que enviou a mensagem (a própria Pico)
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(dadosJson));
                }
            });

        } catch (error) {
            console.error('Erro ao fazer parse do JSON:', error);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado.');
    });
    
    ws.on('error', (error) => {
        console.error('Erro no WebSocket:', error);
    });
});

// 3. Iniciando o Servidor
server.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
});