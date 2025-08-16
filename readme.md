# Monitor de Intensidade Sonora IoT com Dashboard Real-Time

Este projeto implementa um sistema completo de Internet das Coisas (IoT) para monitorar a intensidade sonora de um ambiente em tempo real. O sistema utiliza uma Raspberry Pi Pico W para capturar e processar o áudio, um servidor backend em Node.js para gerenciar a comunicação e um dashboard web para a visualização dinâmica dos dados.

A comunicação entre o dispositivo e o servidor é feita utilizando **WebSockets**, garantindo uma conexão persistente e de baixa latência, ideal para streaming de dados.

![Dashboard Screenshot](https://imgur.com/dTLHIa2.png) ## 1. Visão Geral da Arquitetura

O ecossistema é dividido em três componentes principais:

1.  **Firmware (Dispositivo Embarcado):**

    - **Hardware:** Raspberry Pi Pico W.
    - **Linguagem:** C/C++.
    - **Função:** Captura o áudio através de um microfone, processa os dados para calcular o nível em decibéis (dB) e a classificação sonora ("Baixo", "Moderado", "Alto") e uma mensagem de alerta baseado na classificação sonora, e transmite esses dados para o servidor via WebSocket.

2.  **Servidor (Backend):**

    - **Tecnologia:** Node.js com TypeScript.
    - **Bibliotecas Chave:** `express`, `ws` (WebSocket).
    - **Função:** Atua como um servidor WebSocket. Ele recebe os dados da Pico W e os retransmite (broadcast) em tempo real para todos os clientes de dashboard conectados.

3.  **Dashboard (Frontend):**
    - **Tecnologia:** HTML, CSS, JavaScript puro.
    - **Função:** Conecta-se ao servidor via WebSocket, recebe o fluxo de dados e atualiza a interface do usuário (UI) de forma fluida, exibindo o nível de dB e uma simulação da ledbar do dispositivo físico.

## 2. Funcionalidades

- **Monitoramento em Tempo Real:** Comunicação de baixa latência graças ao uso de WebSockets.
- **Processamento no Dispositivo:** O cálculo de RMS e a conversão para decibéis são feitos diretamente na Pico W, otimizando o uso da banda de rede.
- **Backend Escalável:** O servidor Node.js atua como um "espelho", retransmitindo os dados e permitindo que múltiplos dashboards visualizem a mesma informação simultaneamente.
- **Interface Reativa e Otimizada:** O frontend utiliza `requestAnimationFrame` para desacoplar a renderização da chegada de dados, garantindo uma UI suave mesmo com altas taxas de atualização.

## 3. Guia de Instalação e Execução

Para colocar o sistema para funcionar, siga os passos para configurar o Backend e o Frontend.

### 3.1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.
- Um editor de código como o [VS Code](https://code.visualstudio.com/).
- Firmware do projeto gravado na Raspberry Pi Pico W.

### 3.2. Configurando o Servidor (Backend)

1.  **Clone o Repositório:**

    ```bash
    git clone https://github.com/LincolnMatheus97/iot-amostragem-mic.git
    cd iot-amostragem-mic/api-mic-amostragem
    ```

2.  **Instale as Dependências:**
    Este comando lerá o arquivo `package.json` e instalará todas as dependências necessárias automaticamente.

    ```bash
    npm install
    ```

    As principais tecnologias instaladas são:

    - **`express`**: Framework web para servir a página do dashboard.
    - **`typescript`**: Superset do JavaScript que adiciona tipagem estática.
    - **`ws`**: Biblioteca para implementação do servidor WebSocket.
    - **`ts-node` e `nodemon`**: Ferramentas de desenvolvimento para rodar o servidor em TypeScript e reiniciá-lo automaticamente.

3.  **Execute o Servidor em Modo de Desenvolvimento:**
    Este comando iniciará o servidor na porta 8080 e o reiniciará a cada alteração no código.
    ```bash
    npm run dev
    ```
    Você deverá ver a seguinte mensagem no terminal, indicando que o servidor está pronto para receber conexões:
    ```
    Servidor escutando na porta 8080
    ```

### 3.3. Acessando o Dashboard (Frontend)

Com o servidor rodando, abra seu navegador de internet e acesse:

[http://localhost:8080](http://localhost:8080)

O dashboard será carregado e tentará se conectar ao servidor WebSocket. Assim que a sua Raspberry Pi Pico W estiver ligada e conectada, os dados começarão a aparecer na tela.

## 4. Estrutura de Arquivos (Servidor)

O backend e o frontend estão organizados na seguinte estrutura de pastas:

/api-mic-amostragem
├── public/
│ ├── static/
│ │ ├── css/
│ │ │ └── style.css # Estilos da página
│ │ └── js/
│ │ └── script.js # Lógica do dashboard
│ └── templates/
│ └── index.html # Estrutura do dashboard
├── src/
│ └── index.ts # Código-fonte do servidor Node.js
├── package.json
└── tsconfig.json

## 5. Detalhes da API e Protocolo de Dados

A comunicação é feita através do protocolo WebSocket (`ws://`). Não há uma API REST tradicional com múltiplos endpoints. Existe uma única via de comunicação onde o dispositivo envia mensagens e o servidor as retransmite.

### Formato da Mensagem

A Raspberry Pi Pico W envia os dados como uma string JSON a cada ~100ms. O formato da mensagem é:

```json
{
  "niveldB": 75.24,
  "nivelSom": "Alto"
}
```

- **niveldB (float):** O nível de decibéis calculado, com duas casas decimais.
- **nivelSom (string):** A classificação do nível sonoro ("Baixo", "Moderado", "Alto").

O servidor recebe essa mensagem e a retransmite exatamente no mesmo formato para todos os clientes do dashboard.

## 6. Evolução Técnica: De HTTP para WebSockets

A decisão de migrar do protocolo HTTP para WebSockets foi crucial para a performance e a natureza real-time do projeto.

- **HTTP (Modelo Anterior):** Exigia que a Pico W estabelecesse uma nova conexão TCP, enviasse cabeçalhos completos e encerrasse a conexão para cada pacote de dados. Esse ciclo gerava um overhead significativo, inadequado para um fluxo contínuo.
- **WebSockets (Modelo Atual):** Após um único handshake, uma conexão TCP persistente é mantida. As mensagens são trocadas como "frames" leves, eliminando a repetição de cabeçalhos e reduzindo drasticamente a latência e o consumo de recursos, o que é vital para um dispositivo embarcado como o RP2040.

Essa mudança transformou o sistema de um que "reportava dados" para um que verdadeiramente "transmite um fluxo de dados em tempo real".
