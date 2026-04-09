---
name: Feedback e Preferências de Colaboração
description: Preferências do Bruno para colaboração com Claude no JogoCarta.
type: feedback
---

# Feedback e Preferências

## Organização com Agentes
Usar agentes especializados por domínio antes de implementar features. O Bruno valoriza estrutura antes de código.

**Why:** Pediu explicitamente a criação de agentes antes de qualquer código.
**How to apply:** Ao receber uma nova tarefa complexa, identificar qual agente é responsável e aplicar suas diretrizes.

## Cartas do Criador
NUNCA editar cartas com `creator_seal = 1` sem permissão explícita.

**Why:** Cartas criadas inteiramente pelo Bruno têm proteção especial definida por ele mesmo nas regras do jogo.
**How to apply:** Qualquer UPDATE em `cards` deve incluir `WHERE creator_seal = 0` por padrão.

## Idioma
Código e variáveis em inglês; comentários, UI e conversas em português.

**Why:** Padrão de projetos profissionais — código universalmente legível, UI localizada.
**How to apply:** Sempre nomear variáveis/funções em inglês e escrever strings de interface em PT-BR.

## Documentação de Regras
A pasta `Jogo carta/` é a fonte de verdade das regras do jogo. Sempre consultar antes de implementar mecânicas.

**Why:** Bruno mantém os documentos de design atualizados como guia do projeto.
**How to apply:** Antes de implementar qualquer mecânica de jogo, verificar se está documentada em `Jogo carta/`.
