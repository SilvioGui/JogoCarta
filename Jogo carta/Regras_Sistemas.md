# ⚙️ Manual de Sistemas e Motor do Jogo (Rules Engine)

Este documento define as regras fundamentais de resolução de efeitos, combate e visibilidade de informações durante uma partida. Estas são as leis que regem o código (ou a mesa) do jogo.

---

## 1. Zonas de Jogo e Visibilidade

Como a informação é tratada entre os jogadores:

1. **O Deck Principal (Main Deck):** 
   - **Visibilidade:** Totalmente Privada e Oculta. Ninguém pode olhar a ordem das cartas a menos que um efeito permita (ex: *Dragar* ou *Vaticinar*). Embaralhamentos resetam o conhecimento do deck.
2. **A Mão (Hand):** 
   - **Visibilidade:** Privada. O oponente só sabe a quantidade de cartas que você possui, nunca o conteúdo. Limite padrão de 9 cartas.
3. **O Extra Deck (Comandantes/Apoio):** 
   - **Visibilidade:** Totalmente **Pública**. Qualquer jogador pode consultar as 5 cartas selecionadas no Extra Deck do oponente a qualquer momento do jogo. Isso permite prever as "condições de vitória" inimigas e preparar estratégias.
4. **O Cemitério (Graveyard):** 
   - **Visibilidade:** Totalmente **Pública**. As cartas vão para o cemitério viradas para cima. Jogadores podem folhear e checar a quantidade e os tipos de cartas no cemitério aliado ou inimigo a qualquer momento.
5. **O Campo (Linha Superior e Inferior):** 
   - **Visibilidade:** Pública. Todo monstro, artefato ou estrutura baixado na mesa tem seus status visíveis e atualizados em tempo real. Mágicas viradas para baixo (se existirem) são exceção e permanecem ocultas.

---

## 2. A Corrente de Habilidades (O Sistema de Pilha)

Quando vários efeitos acontecem ao mesmo tempo ou jogadores tentam responder às jogadas dos outros, o jogo usa a **Corrente de Resolução (LIFO - Last In, First Out)**.

- **Regra de Ouro:** O último efeito ativado na Corrente é o primeiro a ser resolvido.
- **Como Funciona na Prática:**
  - Jogador A declara a mágica *Bola de Fogo* visando o monstro do Jogador B. (Corrente 1).
  - Jogador B responde ativando a carta de reação *Escudo de Vidro* visando proteger seu próprio monstro. (Corrente 2).
  - Jogador A responde ativando a mágica *Quebrar Encanto* visando destruir o escudo antes dele se formar. (Corrente 3).
- **A Resolução:** Ninguém joga mais nada. A corrente resolve do topo para a base.
  - Correte 3 resolve: O feitiço anula/quebra a defesa.
  - Corrente 2 falha: O escudo não se forma, pois foi anulado.
  - Corrente 1 resolve: A *Bola de Fogo* atinge o monstro desprotegido.

---

## 3. Fase de Combate (O Cálculo de Dano)

O combate é o coração do jogo e segue fases estritas para evitar conflitos de "quem morreu primeiro".

### Passo 1: Declaração de Ataque
O jogador atacante escolhe uma de suas unidades na Linha Superior que não atacou neste turno. Ele seleciona o **Alvo**. O Alvo deve ser uma criatura na Linha Superior inimiga. Se a Linha Superior inimiga estiver vazia, o ataque pode ser direcionado diretamente aos **Pontos de Vida (100 HP)** do jogador adversário.

### Passo 2: Fase de Interceptação/Bloqueio (Opcional)
Habilidades ativas são checadas. Se um monstro do defensor tiver **Provocar** ou decidir ativar **Intervenção**, ele puxa o ataque para si, trocando o alvo validado no Passo 1.

### Passo 3: Janela de Reação (Pilha do Combate)
Antes dos "socos serem trocados", abre-se a janela para os jogadores usarem mágicas rápidas (Reações, Emboscadas, Buffs). Elas são resolvidas aqui usando a regra da **Corrente de Habilidades**.

### Passo 4: Troca de Dano (Matemática Simultânea)
Não há "quem bate primeiro" a menos que uma habilidade dite.
- O dano é aplicado mutuamente: O Atacante recebe dano igual ao Poder Defensor; o Defensor recebe dano igual ao Poder Atacante.
- **Vazamento de Dano (Regra Estrita):** Se um Atacante com 10 de Poder bate num Defensor com 2 de Vida, os 8 de dano excedentes **não passam para o jogador**. O dano se encerra no monstro, a menos que o Atacante possua palavras-chave específicas como **Atropelar** ou **Perfurar**. 

### Passo 5: Resolução de Mortes
Verifica-se qual unidade teve a Vida reduzida a 0 ou menos.
- As unidades destruídas são enviadas ao Cemitério.
- É exclusivamente nesta etapa de "chegada ao cemitério" que habilidades do tipo **Último Suspiro** são acionadas na Corrente.

---

## 4. Início da Partida (Setup)

### Mão Inicial
- Cada jogador embaralha seu Deck Principal (100 cartas) e compra **7 cartas** como mão inicial.

### Mulligan (Troca de Mão)
- Após ver as 7 cartas, cada jogador pode decidir fazer **1 Mulligan**:
  - Devolva todas as 7 cartas para o deck, embaralhe e compre **7 novas cartas**.
  - Só pode ser feito **1 vez** por jogador por partida. Sem segunda chance.
- Ambos os jogadores decidem o Mulligan simultaneamente (antes de revelar quem aceita ou troca).

### Primeiro Turno
- O jogador que começa (determinado aleatoriamente) **pula a Fase de Compra** no seu primeiro turno. Isso compensa a vantagem de jogar primeiro.
- O segundo jogador compra normalmente no Turno 1.

---

## 5. Sistema de Recurso Dual (Terrenos Híbridos)

### Sem Geração Passiva
- O jogo **NÃO** distribui Éter automaticamente no turno. A geração depende puramente das cartas em campo.

### Terrenos (Modo Recurso Ativo)
- Não existem cartas exclusivas de Terreno. O jogo usa a tipagem híbrida (ex: `/ Terreno`).
- **Invocação como Recurso:** Você pode baixar **1 carta com o selo de "Terreno" por turno, de graça (Custo 0)**, na Retaguarda. Ela entra em **Modo Recurso**.
- Enquanto estiver em Modo Recurso, a carta gera **+1 de Éter** por turno, mas fica silenciada (sem nome, stats ou efeitos ativos). Ela deve permanecer neste estado por pelo menos **1 round completo** após ser baixada.

### Ação de Reversão (Ligar a Carta)
- Na sua Fase Principal, você pode escolher **qualquer número** de cartas em Modo Recurso para "Ligar".
- **Custo de Reversão:** Gratuito (0 Éter), a menos que o texto da própria carta especifique um custo de ativação.
- **Consequência Imediata:** 
  - A carta para de gerar Éter.
  - A carta recupera seu Nome, Tipo, Poder, Vida e Efeitos. 
  - **Mágicas Híbridas:** Se uma carta do tipo `Mágica / Terreno` for revertida, ela é **ativada imediatamente**, seu efeito entra na Corrente (Pilha) e, após resolvido, a carta vai para o Cemitério.
- *Nota Tática:* Isso permite transformar sua reserva de mana em um exército ou em uma salva de feitiços surpresa no momento crítico do jogo.

### Éter na Retaguarda
- **APENAS** as cartas em "Modo Recurso" ou que possuam habilidades explícitas de "Gera X Éter" geram energia. 
- Monstros comuns na Linha Inferior **NÃO** geram Éter automaticamente se não estiverem em Modo Recurso.

### Fórmula por Turno
```
Éter Total = Σ(geração de cartas em Modo Recurso + Estruturas ativas na Linha Inferior)
```

### Éter não Gasto
- No final do turno, o Éter restante é **perdido** (reseta para 0). 
- **Exceção (Dragões):** Cartas com a mecânica de "Tesouro" convertem o Éter não gasto em Tesouro, que é preservado entre turnos mas só pode ser usado para cartas do arquétipo Dragão.

---

## 6. Regras de Tokens

Tokens são cartas geradas por efeitos de outras cartas (Ovos de Aranha, Sucatas de Goblin, Filhotes, etc.). Eles não existem no deck original.

### Regras Básicas
- **Custo:** Tokens são sempre de custo **0 de Éter** (não foram "pagos" para entrar).
- **Tipo:** Podem ser Monstros (Filhotes, Zumbis) ou Artefatos (Sucata, Ovos).
- **Atributos:** Definidos pelo efeito que os criou (ex: "1 Dano / 1 Vida").

### Comportamento ao Serem Destruídos
- Tokens vão para o **Cemitério** momentaneamente (ativam **Último Suspiro** se tiverem).
- Imediatamente após a resolução do Último Suspiro, o Token é **removido do jogo** (banido). Ele **não permanece** no Cemitério.
- **Consequência:** Tokens não podem ser alvo de **Exumar** (não podem ser trazidos de volta do Cemitério).

---

## 7. Regra de Empate (Morte Simultânea)

- Se ambos os jogadores chegarem a **0 HP** no mesmo instante (ex: efeito de Atropelar + Intervenção causam dano mútuo fatal), a partida termina em **empate**.
- Se ambos os jogadores sofrerem **Deck Out** simultaneamente (ambos sem cartas ao comprar), a partida também termina em **empate**.
