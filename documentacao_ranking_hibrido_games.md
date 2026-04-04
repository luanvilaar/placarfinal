# Documentação — Web App de Ranking Dinâmico Híbrido Games

## 1. Visão geral

O web app será responsável por operar e exibir ao vivo o ranking eliminatório da prova final do Híbrido Games.

A proposta do sistema é unir:

- operação simples para a equipe de staff;
- atualização rápida dos resultados por parcial;
- classificação automática por menor tempo;
- avanço automático das equipes classificadas para o próximo round;
- exibição pública em uma tela separada, com visual forte, moderno e responsivo.

O sistema deve funcionar como uma central de controle da fase final eliminatória, permitindo que o público acompanhe em tempo real quem avançou, quem foi eliminado e quem segue vivo até o último round.

---

## 2. Estrutura do sistema

O sistema terá **2 abas principais de operação** e **1 página pública separada**.

### Aba 1 — Cadastro de equipes
Responsável por registrar as equipes participantes.

Cada equipe deve conter:

**Nome da equipe**  
Campo obrigatório.

**Nome da categoria**  
Campo obrigatório.

### Ações disponíveis
Cadastrar equipe  
Editar equipe  
Excluir equipe

### Regras
Não permitir cadastro com campos vazios.  
Não permitir equipes duplicadas dentro da mesma categoria.  
Permitir listagem simples com busca e ordenação.

---

### Aba 2 — Cadastro de pontuação
Responsável por lançar os resultados de cada equipe em cada round.

O resultado será registrado em **formato de tempo**, sendo que:

**Formato aceito:** `00:00`

### Regras de validação do campo tempo
Aceitar apenas números.  
Aceitar apenas um separador `:`.  
Não permitir letras.  
Não permitir caracteres especiais.  
Não permitir mais dígitos do que o padrão `00:00`.  
Aplicar máscara automática enquanto o operador digita.  
Se o valor estiver incompleto, o sistema não deve salvar.

### Exemplos válidos
`05:32`  
`12:09`  
`00:58`

### Exemplos inválidos
`5:32`  
`abcde`  
`12-09`  
`123:45`  
`00:0a`

### Comportamento esperado
Ao salvar o tempo, o sistema deve converter internamente esse valor para segundos apenas para cálculo e ordenação, mas continuar exibindo ao usuário o formato `00:00`.

---

## 3. Lógica do ranking eliminatório

A prova final será composta por **4 parciais**, que equivalem a **4 rounds**.

Fluxo:

**Round 1**  
Todas as equipes cadastradas iniciam nesta parcial.

**Round 2**  
Somente as equipes classificadas no Round 1 avançam automaticamente.

**Round 3**  
Somente as equipes classificadas no Round 2 avançam automaticamente.

**Round 4**  
Somente as equipes classificadas no Round 3 avançam automaticamente.

### Regra principal de classificação
O **menor tempo é o melhor resultado**.

A ordenação do ranking em cada round será feita do menor para o maior tempo.

---

## 4. Campo de eliminação por round

O sistema deve possuir um campo de configuração para definir **quantas equipes serão eliminadas em cada round**.

Exemplo de configuração:

Round 1 → eliminar 2 equipes  
Round 2 → eliminar 2 equipes  
Round 3 → eliminar 2 equipes  
Round 4 → round final sem eliminação

### Regra de avanço
Após o fechamento de um round:

- o sistema ordena todas as equipes pelo menor tempo;
- marca automaticamente as equipes eliminadas com base na quantidade definida;
- envia automaticamente as equipes classificadas para o round seguinte;
- bloqueia no próximo round qualquer equipe eliminada anteriormente.

---

## 5. Fluxo operacional do sistema

### Etapa 1 — Cadastro inicial
O operador cadastra todas as equipes e suas categorias.

### Etapa 2 — Configuração da etapa eliminatória
O operador define:

- quantidade total de rounds: 4;
- quantidade de eliminados por round;
- ordem de exibição;
- status do evento: aberto, em andamento ou encerrado.

### Etapa 3 — Lançamento dos tempos
Durante a prova, o operador seleciona o round atual e lança o tempo de cada equipe apta.

### Etapa 4 — Fechamento do round
Quando todos os tempos daquele round forem registrados, o sistema:

- calcula a classificação;
- destaca classificados e eliminados;
- gera automaticamente a lista do próximo round.

### Etapa 5 — Exibição pública
A página pública recebe os dados atualizados em tempo real e mostra:

- ranking do round atual;
- equipes classificadas;
- equipes eliminadas;
- status da competição;
- avanço de round;
- grande destaque visual para líderes, cortes e classificados.

---

## 6. Regras de negócio

### 6.1 Cadastro de equipes
Uma equipe precisa ter nome e categoria para existir no sistema.

### 6.2 Participação por round
Uma equipe só pode receber tempo no round para o qual ela estiver classificada.

### 6.3 Critério de ordenação
Menor tempo vence.

### 6.4 Critério de eliminação
As últimas posições do round, de acordo com a quantidade configurada, são eliminadas.

### 6.5 Critério de avanço
Todas as equipes não eliminadas avançam automaticamente.

### 6.6 Edição de resultado
Se um resultado for editado, o sistema deve recalcular imediatamente:

- posição do round;
- lista de eliminados;
- lista de classificados;
- composição do round seguinte.

### 6.7 Integridade da competição
Não deve ser permitido avançar manualmente equipes se o round anterior ainda não estiver fechado.

---

## 7. Estrutura de dados sugerida

### Equipe
- id
- nome
- categoria
- status
- criado_em

### Round
- id
- numero_round
- quantidade_eliminados
- status
- criado_em

### Resultado
- id
- equipe_id
- round_id
- tempo_formatado
- tempo_em_segundos
- classificacao
- eliminado
- classificado
- atualizado_em

---

## 8. Estados de status

### Status da equipe
Ativa  
Classificada  
Eliminada  
Campeã

### Status do round
Aguardando  
Em andamento  
Fechado

### Status do evento
Preparação  
Ao vivo  
Encerrado

---

## 9. Página pública para telão

O sistema deve gerar um link separado para uma página pública responsiva, pensada para TV, telão e transmissão.

### Objetivo da tela pública
Comunicar ao público, com impacto visual imediato:

- quem está liderando;
- quem avançou;
- quem foi eliminado;
- em qual round a prova está;
- qual é o corte eliminatório.

### Elementos obrigatórios
**Título do evento**  
Híbrido Games — Final Eliminatória

**Round atual em destaque**  
Ex.: ROUND 2 DE 4

**Tabela de ranking ao vivo**  
Posição  
Nome da equipe  
Categoria  
Tempo  
Status

**Faixa visual de corte**  
Linha horizontal ou bloco visual separando os classificados dos eliminados.

**Sinal visual de status**
Classificado  
Eliminado  
Líder atual

**Animações de atualização**
Subida e descida no ranking  
Troca de posição  
Entrada de eliminado  
Destaque do líder  
Atualização do round

### Comportamento responsivo
A tela deve funcionar em:

- desktop;
- notebook;
- tablet;
- TV e telão em formato widescreen.

---

## 10. Direção visual do produto

A linguagem visual deve seguir uma estética premium, escura, tecnológica e esportiva, inspirada no arquivo de referência enviado pelo usuário.

A referência utiliza:

- fundo escuro quase preto;
- transparências com vidro fosco;
- bordas sutis;
- brilho suave;
- tipografia leve e moderna;
- detalhes técnicos com fonte monoespaçada;
- sensação de interface de controle ao vivo.

---

## 11. Tipografia

### Fonte principal
**Inter**

Usar para:

- títulos;
- números de ranking;
- nomes de equipes;
- labels principais;
- interface geral.

### Características
Limpa  
Moderna  
Alta legibilidade  
Boa leitura em desktop e telão

### Fonte secundária
**JetBrains Mono**

Usar para:

- labels técnicos;
- rounds;
- status do sistema;
- contadores;
- informações auxiliares.

### Hierarquia tipográfica sugerida
**Título principal:** 40px a 56px  
**Subtítulo / round atual:** 24px a 32px  
**Posição no ranking:** 28px a 40px  
**Nome da equipe:** 18px a 24px  
**Dados secundários:** 12px a 14px  
**Labels técnicos:** 10px a 12px

### Peso tipográfico
Títulos: 300 a 500  
Dados principais: 500 a 700  
Texto auxiliar: 300 a 400

---

## 12. Paleta de cores

Com base no estilo da referência, a interface deve trabalhar com contraste forte e poucos acentos de cor.

### Cores base
**Preto principal:** `#030303`  
**Preto secundário:** `#0B0C0E`  
**Superfície escura:** `rgba(255,255,255,0.06)`  
**Borda sutil:** `rgba(255,255,255,0.10)`  
**Texto principal:** `rgba(255,255,255,0.90)`  
**Texto secundário:** `rgba(255,255,255,0.50)`  
**Texto fraco:** `rgba(255,255,255,0.30)`

### Cor de destaque principal
**Violeta tecnológico:** `#8B5CF6`

Usar para:

- líder do ranking;
- glow de destaque;
- botões principais;
- marcador de round ativo;
- animações de atualização.

### Cores de status sugeridas
**Classificado:** `#22C55E`  
**Eliminado:** `#EF4444`  
**Em atenção / pendente:** `#F59E0B`  
**Neutro / aguardando:** `#94A3B8`

### Regra visual importante
O violeta deve ser usado como cor de energia e tecnologia, sem poluir a interface.  
Os estados de prova devem ser comunicados principalmente por verde e vermelho.  
A base da experiência deve continuar escura e sofisticada.

---

## 13. Componentes visuais principais

### Cards
Fundo escuro com leve transparência  
Borda fina branca translúcida  
Cantos arredondados  
Efeito glass sutil

### Tabela de ranking
Linhas bem espaçadas  
Destaque maior para posição e nome da equipe  
Tempo alinhado à direita  
Status com badge visual

### Linha de corte
A linha de corte precisa ser muito evidente visualmente.

Sugestão:

- traço luminoso;
- label “LINHA DE CORTE”;
- mudança de cor abaixo da linha;
- animação breve quando o ranking atualizar.

### Badges
ROUND AO VIVO  
CLASSIFICADO  
ELIMINADO  
LÍDER  
FINALIZADO

---

## 14. Interações e animações

O sistema deve transmitir sensação de evento ao vivo.

### Animações indicadas
Fade de entrada nas linhas do ranking  
Deslocamento vertical quando houver troca de posição  
Glow no novo líder  
Piscar leve quando um novo resultado for lançado  
Animação de corte quando uma equipe for eliminada

### Regras de UX
As animações devem ser rápidas e elegantes.  
Não devem atrapalhar a leitura do telão.  
O foco principal deve ser sempre a clareza do ranking.

---

## 15. Estrutura visual das telas

### Tela de operação
Deve priorizar rapidez de uso.

Bloco de topo com:

- nome do evento;
- round atual;
- botão de salvar;
- botão de fechar round;
- botão de abrir tela pública.

Conteúdo central com:

- lista de equipes;
- input de tempo;
- status da equipe no round;
- classificação parcial.

### Tela pública
Deve priorizar impacto visual.

Bloco de topo com logo e nome do evento.  
Bloco central com ranking gigante.  
Linha de corte muito evidente.  
Rodapé com status do round e número de equipes restantes.

---

## 16. Resumo da lógica principal

O sistema funciona assim:

1. cadastra as equipes e categorias;
2. define os 4 rounds;
3. define quantos serão eliminados por round;
4. recebe os tempos no formato `00:00`;
5. converte esses tempos para cálculo interno;
6. ordena do menor para o maior;
7. elimina automaticamente os últimos colocados;
8. envia automaticamente os classificados para o próximo round;
9. atualiza a tela pública ao vivo;
10. repete o fluxo até o round final.

---

## 17. Diretriz final de produto

Este web app não deve parecer apenas uma planilha de resultados.  
Ele precisa parecer uma **central oficial de competição**, com leitura rápida para operação e forte apelo visual para o público.

A experiência ideal é:

- simples para quem lança;
- automática para quem gerencia;
- emocionante para quem assiste.

