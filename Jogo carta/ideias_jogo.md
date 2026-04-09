# 🎮 Ideias para o Jogo de Cartas

> Documento criado em 26/03/2026 para registrar e organizar as ideias do projeto.

---

## 📋 Conceito Geral

- **Gênero:** Jogo de cartas estratégico (TCG/CCG)
- **Inspirações:** Magic: The Gathering (formato Commander), Yu-Gi-Oh!
- **Ritmo de partida:** Partidas longas e estratégicas

---

## 🃏 Estrutura de Deck

- **Deck Principal:** 100 cartas
- **Limite de Cópias:** Até 3 cópias de cada carta (exceto terrenos/recursos básicos, se houver)
- **Extra Deck:** **5 cartas** (funcionam como Comandantes / cartas emblemáticas)
  - Invocadas através de **recurso especial do arquétipo** (ex: Fé para Anjos)
  - São as cartas mais poderosas do deck
- **Regra de Características (3+2):** Todo arquétipo deve possuir **exatamente 3 mecânicas principais** (que ditam e limitam seu combo de vitória) e **2 mecânicas secundárias** (ferramentas de suporte ou troca básica que auxiliam, mas não constroem a vitória por si sós).
- **Limite de mão:** 9 cartas (efeitos podem alterar esse limite)
- **Zonas por linha:** Infinitas (sem limite de espaço no campo)



---

## 📅 Estrutura das Cartas

Cada carta no jogo segue um padrão rigoroso de informações:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Nome** | Nome único da carta. | "Leviatã das Sombras" |
| **Arquétipo** | Temática da carta (pode ser híbrido). | "Abissal / Demônio" |
| **Tipo** | Classe funcional da carta. | "Monstro" |
| **Custo de Éter** | Valor em Éter para jogar a carta. | 5 Éter |
| **Descrição / Efeito** | Habilidades e Palavras-Chave. | "Invocação: Congele um alvo." |
| **Dano / Vida** | Atributos de combate (se aplicável). | 8 D / 12 V |

---

## 🎴 Tipos de Cartas

As cartas são divididas em categorias que determinam sua função no campo:

| Tipo | Função | Regra de Uso |
|------|--------|--------------|
| **Híbridas (ex: / Terreno)** | Cartas que possuem o selo "/ Terreno". Podem ser jogadas de graça (1 por turno na Retaguarda) no **Modo Recurso** (+1 Éter, silenciadas). O jogador pode escolher "Desativar" esse modo em qualquer Fase Principal, devolvendo os stats originais (mágicas ativam na hora). | Linha Inferior |
| **Monstro / Criatura** | O executor principal de combate e recursos. | Linha Superior / Inferior |
| **Equipamento** | Buffs que se anexam a Monstros. | Anexado a um Monstro |
| **Artefato** | Itens com efeitos persistentes ou utilitários. | Linha Inferior |
| **Estrutura / Monumento** | Fortificações que dão bônus passivos para a linha. | Linha Inferior |
| **Mágica (Feitiço)** | Efeitos de uso único resolvidos imediatamente. | Turno do Dono |
| **Reação (Instantâneo)** | Efeitos surpresa que podem ser usados a qualquer momento. | Qualquer Turno |

---


## 🏛️ Arquétipos

Os decks são **fortemente baseados em arquétipos** — cada arquétipo tem sua identidade, estética e sinergia de cartas.


### Lista de Arquétipos (Experimento)

| Arquétipo | Documentação | Temática | Estilo de Jogo Principal |
|-----------|--------------|----------|------------------------|
| **Anjos** | [Arquetipos/Anjos.md](Arquetipos/Anjos.md) | Ordem / Luz | Defesa, **Escudo Divino** e Fé. |
| **Demônios** | [Arquetipos/Demonios.md](Arquetipos/Demonios.md) | Caos / Trevas | **Oferenda** (pagar com vida) e **Exumar**. |
| **Dragões** | [Arquetipos/Dragoes.md](Arquetipos/Dragoes.md) | Poder Bruto | **Atropelar**, **Sobrecarga** e dano massivo. |
| **Abissais** | [Arquetipos/Abissais.md](Arquetipos/Abissais.md) | Horror Oceânico | **Maré**, **Avanço/Retirada** e **Dragar/Vaticinar**. |
| **Mecânicos** | [Arquetipos/Mecanicos.md](Arquetipos/Mecanicos.md) | Tecnologia | **Artefatos**, **Estruturas** e **Simbiose**. |
| **Pútridos** | [Arquetipos/Putridos.md](Arquetipos/Putridos.md) | Mortos-Vivos | **Último Suspiro** e **Eco**. |
| **Goblins** | [Arquetipos/Goblins.md](Arquetipos/Goblins.md) | Tribo Caótica | **Tributo**, enxame e agressividade. |
| **Espectros** | [Arquetipos/Espectros.md](Arquetipos/Espectros.md) | Almas / Éter | **Sombra**, **Infundir** e infração de defesas. |
| **Aranhas** | [Arquetipos/Aranhas.md](Arquetipos/Aranhas.md) | Insetóides | **Aprisionar**, **Infestação** e **Veneno**. |
| **Sombrios** | [Arquetipos/Sombrios.md](Arquetipos/Sombrios.md) | Furtividade | **Roubo** (Éter), **Emboscada** e **Gancho**. |

> 💡 Cada arquétipo possui mecânicas e sinergias detalhadas em seus respectivos arquivos dentro da pasta `/Arquetipos/`.

---

## 🎯 Mecânicas de Jogo

### Campo de Batalha — Sistema de Duas Linhas

O campo de cada jogador é dividido em **duas linhas**:

| Linha | Nome (provisório) | Função Principal |
|-------|-------------------|------------------|
| **Superior** | Linha de Combate | Cartas posicionadas aqui atuam em combate / efeitos ofensivos |
| **Inferior** | Linha de Recursos | Cartas posicionadas aqui geram **Éter**. |

#### Regras de Movimentação entre Linhas:
- **Da Frente para Trás (Superior ➔ Inferior):** A carta **não pode** ter atacado nem defendido neste turno.
- **De Trás para Frente (Inferior ➔ Superior):** Requer o pagamento de um custo de **2 de Éter**.

> 💡 Isso impede que uma unidade ataque e logo em seguida se proteja ou gere recursos na mesma rodada, além de exigir investimento para colocar unidades em posição de ataque.

### Sistema de Recursos

- **Éter (Recurso Genérico):**
  - O jogador começa com **0 de Éter**. A geração inicial depende inteiramente de jogar **Terrenos** na Linha Inferior.
  - Gerado por sua base de Terrenos, Estruturas e Monstros na Linha Inferior (Retaguarda).
  - Pode-se jogar **1 Terreno por turno gratuitamente** na Retaguarda.
  - Usado para jogar cartas da Mão e ativar habilidades.
- Alguns arquétipos podem ter **mecânicas especiais** além do Éter (ex: Fé dos Anjos).

### Fluxo de Turno

- **Compra:** O jogador compra **1 carta** do Deck Principal no início de cada um de seus turnos.
- **Exaustão (Virar):** 
  - Uma carta deve ser **Virada** ao declarar um ataque.
  - Uma carta deve ser **Virada** caso sua habilidade exija isso como custo de ativação.
  - Cartas viradas não podem atacar ou ativar habilidades que exijam "Virar" até serem desviradas no início do próximo turno do dono.


### Condição de Vitória

- **Pontos de Vida (HP):** Cada jogador inicia com **100 Pontos de Vida**.
- **Objetivo:** Reduzir o HP do oponente a **0**.
- **Deck Out:** Perde a partida o jogador que precisar comprar uma carta e não houver mais cartas no seu Deck Principal.

---

## ⚔️ Palavras-Chave / Habilidades Gerais

Habilidades que **qualquer carta pode ter**, independente do arquétipo.

> ⚠️ Nomes provisórios — inspirados em Magic/Yu-Gi-Oh, serão renomeados para o universo do jogo.

| Palavra-Chave | Inspiração | Efeito (proposta) | Status |
|---------------|------------|-------------------|--------|
| **Atropelar** | Trample (Magic) | Dano excedente passa para o jogador | ✅ Aprovado |
| **Elo Vital** | Lifelink (Magic) | Dano causado recupera vida do dono | ✅ Aprovado |
| **Toque Mortal** | Deathtouch (Magic) | Qualquer dano causado destrói a criatura alvo | ✅ Aprovado |
| **Veneno** | Infect/Poison (Magic) | Aplica contadores de veneno; condição de derrota alternativa? | ✅ Aprovado |
| **Ímpeto** | Haste (Magic) | Pode atacar no turno em que é invocada | ✅ Aprovado |
| **Vigilância** | Vigilance (Magic) | Ataca sem "virar" / sem perder ação defensiva | ✅ Aprovado |
| **Voar** | Flying (Magic) | Só pode ser bloqueada por outras criaturas com Voar | ✅ Aprovado |
| **Escudo** | Ward/Hexproof | Proteção contra efeitos direcionados | ✅ Aprovado |
| **Perfurar** | Pierce/Direct | Ignora defesa / dano direto ao jogador? | ✅ Aprovado |
| **Drenar** | Drain | Rouba vida do oponente | ✅ Aprovado |
| **Ataque Estendido** | - | Pode atacar mesmo estando na Linha Inferior (Retaguarda) | ✅ Aprovado |
| **Guardião** | - | Pode bloquear ataques mesmo estando na Linha Inferior (Retaguarda) | ✅ Aprovado |
| **Investida** | - | Ao atacar, pode mover-se entre as linhas sem custo | ✅ Aprovado |
| **Recuar** | - | Ao atacar, move-se automaticamente para a Linha Inferior | ✅ Aprovado |
| **Alcance** | Range | Pode atacar unidades na Linha Inferior do oponente diretamente | ✅ Aprovado |
| **Gancho** | - | Ao atacar, puxa uma unidade da Linha Inferior do oponente para a Superior | ✅ Aprovado |
| **Repulsão** | - | Ao atacar, empurra a unidade alvo para a Linha Inferior | ✅ Aprovado |
| **Comandar** | - | Enquanto na Linha Inferior, concede bônus para a Superior | ✅ Aprovado |
| **Emboscada** | Flash | Pode ser invocada da mão como uma Reação durante um ataque | ✅ Aprovado |
| **Retaliação** | First Strike | Quando defende, causa dano antes da unidade atacante | ✅ Aprovado |
| **Meditar** | - | Se passar o turno na Retaguarda sem agir, ganha bônus no próximo turno | ✅ Aprovado |
| **Roubo** | - | Ao causar dano, rouba Éter do oponente | ✅ Aprovado |
| **Invocação** | Battlecry | Efeito ativado imediatamente ao entrar no campo | ✅ Aprovado |
| **Último Suspiro** | Deathrattle | Efeito ativado ao ser destruído e enviado ao cemitério | ✅ Aprovado |
| **Provocar** | Taunt | Obriga oponentes a atacarem esta unidade na Linha Superior | ✅ Aprovado |
| **Escudo Divino** | - | Ignora a primeira instância de dano recebida | ✅ Aprovado |
| **Blindado** | Tough | Reduz todo o dano recebido em 1 (mínimo 1) | ✅ Aprovado |
| **Regenerar** | - | Recupera [X] de Vida no início de cada turno do dono | ✅ Aprovado |
| **Canalizar** | - | Pode gastar Éter adicional para ativar efeito na Retaguarda | ✅ Aprovado |
| **Sobrecarga** | - | Gera Éter bônus agora, mas reduz a geração no próximo turno | ✅ Aprovado |
| **Tributo** | - | Pode sacrificar aliado para reduzir custo de Éter | ✅ Aprovado |
| **Revelação** | - | Efeito ao ser comprada ou buscada do deck | ✅ Aprovado |
| **Transpor** | - | Pode ser invocada diretamente na Linha Inferior (Retaguarda) | ✅ Aprovado |
| **Flanquear** | - | Bônus ao atacar com o apoio de unidades com Alcance na Linha Inferior | ✅ Aprovado |
| **Supremacia** | - | Bônus ativo enquanto tiver mais unidades na Linha Superior que o oponente | ✅ Aprovado |
| **Elo de Linha** | - | Bônus se houver unidade com mesma habilidade na linha oposta | ✅ Aprovado |
| **Eco** | - | Ao morrer, transfere atributos base para a próxima unidade na mesma linha | ✅ Aprovado |
| **Sombra** | - | Não pode ser alvo de mágicas se houver unidade com Provocar no campo | ✅ Aprovado |
| **Sifão** | - | Drena vida inimiga e gera Éter se estiver na Retaguarda | ✅ Aprovado |
| **Ressoar** | - | Ativa bônus se gastar exatamente o Éter restante no pool | ✅ Aprovado |
| **Consumir** | - | Requer destruir um Artefato/Estrutura aliado para ativar efeito | ✅ Aprovado |
| **Exumar** | - | Pode ser invocada do Cemitério pagando Éter + Vida | ✅ Aprovado |
| **Herança** | - | Ao morrer, anexa-se a um aliado como Equipamento de buff | ✅ Aprovado |
| **Infundir** | - | Ganha poder na mão baseado no Éter gasto em outras cartas | ✅ Aprovado |
| **Vaticinar** | Scry | Olha o topo do deck e reorganiza ou envia para o fundo | ✅ Aprovado |
| **Dádiva** | - | Se for descartada, concede bônus permanente para um aliado | ✅ Aprovado |
| **Avanço** | - | Efeito ativado ao mover-se da Linha Inferior para a Superior | ✅ Aprovado |
| **Retirada** | - | Efeito ativado ao mover-se da Linha Superior para a Inferior | ✅ Aprovado |
| **Ascensão [X]** | - | Se a unidade sobreviver em campo por X turnos, ela evolui | ✅ Aprovado |
| **Efêmero** | - | Atributos altos, mas a unidade é destruída ao final do turno | ✅ Aprovado |
| **Hibernar** | - | Entra virada e não desvira no próximo turno em troca de efeito passivo | ✅ Aprovado |
| **Bastião** | - | Enquanto na Linha Superior, protege a Linha Inferior com Escudo Divino | ✅ Aprovado |
| **Suprimento** | - | Enquanto na Linha Inferior, reduz custo de Éter na Linha Superior em 1 | ✅ Aprovado |
| **Radar** | - | Enquanto na Linha Inferior, permite ignorar Provocar e Sombra | ✅ Aprovado |
| **Vingança** | - | Habilidades que dobram de poder se a Vida do Jogador estiver baixa | ✅ Aprovado |
| **Limiar** | - | Bônus ativo se o seu deck tiver 10 ou menos cartas | ✅ Aprovado |
| **Oferenda** | - | Substitui o custo de Éter pelo sacrifício de Pontos de Vida | ✅ Aprovado |
| **Congelar** | - | A unidade alvo não pode atacar, defender, usar habilidades ou mover-se por 1 turno | ✅ Aprovado |
| **Silenciar** | - | Anula permanentemente todas as habilidades e palavras-chave do alvo | ✅ Aprovado |
| **Aprisionar** | - | Impede que a unidade alvo seja movida entre as linhas por 2 turnos | ✅ Aprovado |
| **Égide [X]** | - | Reduz todo o dano causado ao Jogador em X | ✅ Aprovado |
| **Intervenção** | - | Todo dano que o Jogador receberia é transferido para esta unidade | ✅ Aprovado |
| **Amedrontar** | Intimidate | Unidades com Poder (Dano) inferior não podem bloquear ou atacar esta carta | ✅ Aprovado |

### Mecânicas a explorar:
- **Virar/Exaurir** — cartas "cansam" depois de atacar?
- **Contra-ataque** — defender causa dano de volta?
- **Emboscada** — jogar carta da mão como resposta a um ataque?
- **Sacrifício** — destruir cartas próprias para ativar efeitos poderosos?
- **Encantamentos / Equipamentos** — buffs que ficam em campo?

> 📌 **Prioridade:** Definir as mecânicas gerais primeiro, depois montar as mecânicas únicas de cada arquétipo em cima dessas bases.


---

## 🛠️ Lógica do Jogo e Sistemas

Esta seção detalha as funções e comportamentos técnicos que regem as interações do jogo.

### 🗃️ Gerenciamento de Zonas (Deck, Mão e Cemitério)

- **ComprarCarta(quantidade):** Remove a carta do topo do Deck Principal e adiciona à Mão do jogador.
- **ProcurarNoDeck(condicao):** Abre a interface do deck para o jogador escolher uma carta específica (ex: buscar um Anjo) e depois chama **EmbaralharDeck()**.
- **ProcurarNoCemiterio(condicao):** Permite visualizar e resgatar cartas já destruídas ou usadas.
- **MandarAoCemiterio(alvo):** Move uma carta do Campo ou da Mão diretamente para o Cemitério.
- **DescartarDaMao(quantidade):** Obriga o jogador a enviar cartas da própria mão para o cemitério (por limite de mão cheio ou efeito inimigo).
- **EmbaralharDeck():** Randomiza a ordem das cartas no Deck Principal.
4. **Construção de Decks:** Decks terão limites fixos de cartas e foco em sinergias tribais/arquetípicas.
5. **Autoria Protegida:** Qualquer carta criada e idealizada inteiramente pelo Criador Humano recebe o selo de autoria `🛡️ [Criador]` ou nota equivalente. A IA **NÃO PODE** editar, nerfar, buffar ou remover estas cartas sob nenhuma circunstância sem pedir permissão explícita primeiro.

### 🏛️ Controle de Campo e Sistema de Linhas

- **InvocarCarta(alvoLinha):** Tira a carta da mão e a posiciona na Linha Superior (Combate) ou Linha Inferior (Recursos), deduzindo o custo em Éter.
- **InvocarDoExtraDeck(alvoExtraDeck):** Checa se o jogador possui o recurso especial do arquétipo (ex: 5 de Fé) e invoca a carta emblemática diretamente para o campo.
- **MoverParaFrente(alvo):** Move uma unidade da Linha Inferior para a Superior. Esta função aciona internamente **PagarEter(2)**.
- **MoverParaTras(alvo):** Move uma unidade da Linha Superior para a Inferior. Checa a condição: "A carta alvo já atacou ou defendeu neste turno?". Se sim, a ação é bloqueada.
- **AnexarEquipamento(equipamento, monstroAlvo):** Vincula uma carta de Equipamento a um Monstro específico em campo, aplicando os buffs.

### 💎 Gerenciamento de Recursos

- **CalcularGeracaoDeEter():** No início do turno, varre a Linha Inferior do jogador e soma a geração de Éter disponível.
- **PagarEter(custo):** Deduz o Éter do pool atual do jogador ao jogar uma carta ou ativar habilidade.
- **AdicionarRecursoEspecial(tipo, quantidade):** Adiciona pontos aos contadores específicos de arquétipo (ex: Fé dos Anjos).
- **PagarRecursoEspecial(tipo, quantidade):** Deduz os pontos específicos ao ativar invocações do Extra Deck.

### ⚔️ Combate e Status

- **VirarCarta(alvo):** Muda o status da carta para "Exausta" (não pode atacar ou usar habilidades de virar).
- **DesvirarCartas():** No início do turno do dono, retorna todas as suas cartas viradas para a posição pronta.
- **DarAlvo(tipoDeAlvo):** Função global chamada quando uma mágica ou ataque precisa escolher quem vai ser afetado (Monstro, Jogador, Estrutura).
- **DeclararAtaque(atacante, alvo):** Inicia a fase de combate. Chama automaticamente a função **VirarCarta(atacante)**.
- **DeclararBloqueio(defensor, atacante):** Intercepta o ataque caso o defensor esteja na Linha Superior (ou tenha a habilidade Guardião na Inferior).
- **CausarDano(fonte, alvo, quantidade):** Subtrai a Vida do Monstro alvo ou os Pontos de Vida do Jogador. Checa palavras-chave como Perfurar ou Atropelar.
- **DestruirCarta(alvo):** Chamada quando a Vida de um Monstro chega a 0 ou um Artefato/Estrutura é quebrado. Aciona **MandarAoCemiterio(alvo)**.

### ⚡ Efeitos e Pilha (Resolução)

- **AtivarHabilidade(fonte):** Coloca o efeito de um Monstro, Mágica ou Reação na fila para ser resolvido.
- **ResolverPilha():** Processa os efeitos na ordem correta (LIFO - Last In, First Out), permitindo Reações em resposta a outras ações.

---

## 🛠️ Tecnologias / Ferramentas
<!-- A definir -->

## 💡 Ideias Soltas / Brainstorm
<!-- Anotações rápidas -->

---

## ✅ Perguntas Respondidas

| # | Pergunta | Resposta |
|---|----------|----------|
| 2 | Quantas cartas no Extra Deck? | **5 cartas** (estilo Comandante) |
| 3 | Quantas zonas por linha? | **Infinitas** |
| 4 | Limite de cartas na mão? | **9 cartas** (efeitos podem alterar) |

## ❓ Perguntas em Aberto

1. Qual o nome do recurso **genérico**? **Éter**.
2. Como funciona a condição de vitória? **100 Pontos de Vida (ou Deck out).**
3. Quantas cartas compra por turno? **1 carta**.
4. Quais dessas palavras-chave vão pro jogo? **Todas as listadas foram aprovadas.**
5. Existe mecânica de "virar" carta após atacar? **Sim, ao atacar ou por efeito de habilidade.**
6. Qual a mecânica única de cada arquétipo?
   - **Abissais:** (3 Principais) **Fluxo da Maré**, **Avanço/Retirada**, **Dragar/Vaticinar**. (2 Secundárias) **Controle Sombrio/Silêncio**, **Veneno/Predadores**.
   - **Aranhas:** (3 Principais) **Aprisionar (Casulo)**, **Infestação (Filhotes)**, **Veneno**. (2 Secundárias) **Tocaia (Emboscada)**, **Teia/Radar**.

---

> *Este documento será atualizado conforme as discussões evoluírem.*
