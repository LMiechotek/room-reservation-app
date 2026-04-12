# Erro 1 – Prioridade alta :

A tela de edição de reservas não tem rota

Logar admin > Editar reserva > Erro ao atualizar reservas
❌ Back não esta utilizando token e responde com 401

# Erro 2 – Prioridade alta :

A tela de reservas do professor tem acesso á tela de admin

Logar Professor > Reservas > Nova reserva > Tela admin

✅ Corrigido

# Erro 3 – Prioridade alta :

A tela de salas do professor não permite reserva de salas 

Logar Professor > Salas > Reservar Sala > Nada acontece
❌ Back não esta utilizando token e responde com 401

## Erro 4 – Prioridade média :

A tela de edição não manda a edição para o banco de dados, o e-mail não é modificado
Logar admin > Cadastrar usuário > Colocar um e-mail > Usuário atualizado > e-mail continua sem alteração
❌ Back não recebe email na rota PUT

## Erro 5 – Prioridade média :

A tela de registro de salas do admin permite adicionar salas com exatamente as mesmas características

Logar admin > Cadastrar sala > Inserir sala > Tela de salas > Cadastrar sala >  Inserir mesma sala > Sala cadastrada
❌ Back deve restringir o cadastro e responder de acordo

## Erro 6 – Prioridade média :

A tela de registro de salas do admin tem dois campos para computadores quando a opção laboratório é selecionada

Logar admin > Cadastrar sala > Inserir sala > Selecionar laboratório > Input para quantidade de computadores aparece
✅ Corrigido

### Erro 7 – Prioridade baixa :

Falta de feedback na tela quando não coloca um e-mail institucional (o console gera a mensagem correta)

Logar admin > Cadastrar usuário > Colocar um e-mail não institucional > Mensagem na tela “Erro ao salvar usuário”
✅ Corrigido

### Erro 8 – Prioridade baixa :

Erro ao tentar validar um e-mail com dígitos inválidos, falta de feedback ao usuário

Logar admin > Cadastrar usuário > Colocar um e-mail com espaço no meio > Mensagem na tela “Erro ao salvar usuário”
✅ Corrigido

### Erro 9 – Prioridade baixa :

A tela de edição salas do admin não mostra a quantidade de equipamento atual

Logar admin > Lista de sala > Editar sala > Não mostra o equipamento atual

### Erro 10 – Prioridade baixa :

A tela de login não apresenta nenhum erro quando um e-mail de estrutura inválida é inserido (ex:
 ab çd@unespar.edu.br )

Logar > Colocar e-mail de estrutura invalida > Não loga porém não apresenta nenhum erro visual
