// ============================================================
// ARQUIVO CENTRAL DE TEXTOS — JOGOCARTA
// Todos os textos da UI estão aqui para facilitar a tradução.
// Para adicionar outro idioma, copie este arquivo e traduza.
// ============================================================

export const ptBR = {
  common: {
    appName: 'JogoCarta',
    tagline: 'O campo de batalha te aguarda',
    loading: 'Carregando...',
    back: 'Voltar',
    logout: 'Sair',
    comingSoon: 'Em breve',
    available: 'Disponível',
    themeToggleDark: 'Modo Escuro',
    themeToggleLight: 'Modo Claro',
    closeInfo: 'Fechar dica',
    showInfo: 'Ver dica',
    close: 'Fechar',
  },

  auth: {
    login: {
      title: 'Entrar na conta',
      identifier: 'Email ou nome de usuário',
      identifierPlaceholder: 'seu@email.com ou usuario',
      password: 'Senha',
      passwordPlaceholder: '••••••••',
      submit: 'Entrar',
      submitting: 'Entrando...',
      noAccount: 'Ainda não tem conta?',
      createAccount: 'Criar conta',
      errors: {
        identifier: 'Informe seu email ou nome de usuário',
        password: 'Informe sua senha',
        generic: 'Erro ao fazer login. Tente novamente.',
      },
    },
    register: {
      title: 'Criar conta',
      subtitle: 'Crie sua conta e entre em batalha',
      username: 'Nome de usuário',
      usernamePlaceholder: 'seu_usuario',
      email: 'Email',
      emailPlaceholder: 'seu@email.com',
      password: 'Senha',
      passwordPlaceholder: '••••••••',
      confirmPassword: 'Confirmar senha',
      confirmPasswordPlaceholder: '••••••••',
      submit: 'Criar conta',
      submitting: 'Criando conta...',
      hasAccount: 'Já tem conta?',
      login: 'Entrar',
      errors: {
        usernameMin: 'Mínimo 3 caracteres',
        usernameMax: 'Máximo 20 caracteres',
        usernamePattern: 'Apenas letras, números, _ e -',
        email: 'Email inválido',
        passwordMin: 'Mínimo 8 caracteres',
        passwordUpper: 'Deve ter uma letra maiúscula',
        passwordLower: 'Deve ter uma letra minúscula',
        passwordNumber: 'Deve ter um número',
        confirmPassword: 'As senhas não coincidem',
        generic: 'Erro ao criar conta. Tente novamente.',
      },
    },
  },

  gameMode: {
    title: 'Escolha seu Destino',
    welcomeBack: 'Bem-vindo de volta, ',
    subtitle: 'Selecione o modo de jogo para iniciar sua jornada',
    normalMode: {
      title: 'Modo Normal',
      description:
        'Construa seu deck, escolha seus Comandantes e entre em batalha com suas próprias estratégias. O modo completo do JogoCarta.',
      play: 'Jogar Modo Normal',
    },
    randomMode: {
      title: 'Cartas Aleatórias',
      description:
        'Desafie adversários com decks gerados aleatoriamente. Teste sua habilidade sem preparação!',
      play: 'Em breve',
    },
  },

  mainMenu: {
    greeting: 'Olá, ',
    subtitle: 'O que deseja fazer hoje?',
    backToModes: 'Trocar Modo',

    decks: {
      title: 'Baralhos',
      description: 'Construa e gerencie seus decks com até 100 cartas.',
      status: 'available' as const,
      tutorial:
        'O Main Deck precisa de exatamente 100 cartas. Você pode ter no máximo 3 cópias de qualquer carta. O Extra Deck contém seus 5 Comandantes. E você precisa de exatamente 12 Relíquias (6 modelos × 2 cópias) por deck.',
    },
    collection: {
      title: 'Minhas Cartas',
      description: 'Veja toda a sua coleção — filtre por arquétipo, raridade e tipo.',
      status: 'available' as const,
      tutorial:
        'Aqui estão todas as cartas que você possui. Cartas obtidas por invocações e recompensas aparecem aqui e podem ser usadas nos seus baralhos.',
    },
    summon: {
      title: 'Invocar Cartas',
      description: 'Abra pacotes e expanda sua coleção com novas cartas.',
      status: 'available' as const,
      tutorial:
        'Abra pacotes temáticos para obter cartas de arquétipos específicos: Anjos, Demônios, Dragões, Abissais e mais. Quanto mais raro o pacote, maiores as chances de cartas poderosas.',
    },
    play: {
      title: 'Jogar',
      description: 'Entre em uma partida. O sistema encontrará um adversário compatível.',
      status: 'available' as const,
      tutorial:
        'O matchmaking encontra um adversário do seu nível. Você precisa ter um deck construído. Partidas seguem as fases: INÍCIO → COMPRA → FASE PRINCIPAL 1 → COMBATE → FASE PRINCIPAL 2 → FIM.',
    },
    tutorial: {
      title: 'Tutorial',
      description: 'Aprenda as regras, mecânicas e estratégias do jogo.',
      status: 'available' as const,
      tutorial:
        'O tutorial explica todas as mecânicas: sistema de Éter, Corrente de Habilidades (pilha LIFO), combate entre linhas, Relíquias, Comandantes e muito mais.',
    },
    ranking: {
      title: 'Classificação',
      description: 'Os melhores jogadores da temporada e sua posição global.',
      status: 'soon' as const,
      tutorial:
        'O ranking é atualizado após cada partida ranqueada. Suba de posição vencendo batalhas para mostrar seu domínio das cartas.',
    },
    shop: {
      title: 'Loja',
      description: 'Adquira pacotes especiais, cosméticos e itens de temporada.',
      status: 'soon' as const,
      tutorial:
        'A loja oferece pacotes especiais, skins de cartas e itens cosméticos. Nenhum item de loja afeta o poder das cartas — apenas a aparência.',
    },
    settings: {
      title: 'Configurações',
      description: 'Personalize som, perfil e preferências visuais.',
      status: 'soon' as const,
      tutorial:
        'Aqui você pode configurar áudio, notificações, editar seu perfil e ajustar a aparência do jogo.',
    },
  },

  tutorialModal: {
    title: 'Como Jogar JogoCarta',
    readMore: 'Ler mais',
    sections: [
      {
        title: 'Objetivo do Jogo',
        content:
          'Reduza o HP do oponente a 0 (começa com 100 HP) para vencer. Alternativas: Deck Out (oponente sem cartas para comprar) ou Empate quando ambos chegam a 0 HP simultaneamente.',
      },
      {
        title: 'Estrutura do Deck',
        content:
          'Main Deck: 100 cartas, máximo 3 cópias por carta. Extra Deck: 5 Comandantes (sempre visível para ambos). Relíquias: exatamente 6 modelos × 2 cópias = 12 cartas obrigatórias. Mão inicial: 7 cartas. Mulligan: 1 vez. Limite de mão: 9 cartas.',
      },
      {
        title: 'Campo — Duas Linhas',
        content:
          'Linha Superior (Front): zona de combate — cartas aqui atacam e bloqueiam. Linha Inferior (Back): zona de recursos — cartas em Modo Recurso geram Éter e fornecem suporte. Mover de Back → Front custa 2 Éter. Mover de Front → Back requer que a carta não tenha atacado ou defendido no turno atual.',
      },
      {
        title: 'Éter — O Recurso',
        content:
          'Gerado por cartas em Modo Recurso na Linha Inferior. Você pode jogar 1 Terreno gratuitamente por turno na Linha Inferior. O Éter não gasto reseta para 0 ao final do turno — exceto Dragões com a habilidade Tesouro, que preservam Éter entre turnos.',
      },
      {
        title: 'Fases do Turno',
        content:
          'INÍCIO (efeitos de início disparam) → COMPRA (compra 1 carta) → FASE PRINCIPAL 1 (jogue cartas, ative efeitos) → COMBATE (declare atacantes e bloqueadores) → FASE PRINCIPAL 2 (ative efeitos, prepare defesas) → FIM (descarte até 9 cartas na mão, Éter reseta).',
      },
      {
        title: 'Corrente de Habilidades (Pilha)',
        content:
          'Sistema LIFO — Last In, First Out. Similar à pilha do Magic: The Gathering. Qualquer jogador pode adicionar reações à pilha em momentos de prioridade. A última habilidade adicionada é a primeira a resolver. Isso permite estratégias complexas de resposta e contra-resposta.',
      },
      {
        title: 'Combate e Dano',
        content:
          'Cartas na Linha Superior atacam e bloqueiam. Dano excedente (a diferença após destruir uma carta) NÃO passa para o jogador — a menos que o atacante tenha Atropelar ou Perfurar. Escudo Divino (Anjos) absorve o primeiro dano recebido.',
      },
      {
        title: 'Arquétipos',
        content:
          'Anjos (Fé, defesa), Demônios (Oferenda, Exumar), Dragões (Tesouro, Atropelar), Abissais (Fluxo da Maré, Dragar), Mecânicos (Artefatos, Estruturas), Pútridos (Último Suspiro, Eco), Goblins (Tributo, Enxame), Espectros (Sombra, Infundir), Aranhas (Aprisionar, Veneno), Sombrios (Roubo, Emboscada). Cada arquétipo tem 3 mecânicas principais + 2 secundárias.',
      },
    ],
  },
} as const;

export type Locale = typeof ptBR;
