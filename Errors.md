# Prioridade alta :

A tela de edição de reservas não tem rota

Logar admin > Editar reserva > Erro ao atualizar reservas

✅ Corrigido

# Prioridade alta :

A tela de reservas do professor tem acesso á tela de admin

Logar Professor > Reservas > Nova reserva > Tela admin

✅ Corrigido

# Prioridade alta :

A tela de salas do professor não permite reserva de salas 

Logar Professor > Salas > Reservar Sala > Nada acontece

✅ Corrigido

## Prioridade média:
Arrumar toast

login admin > editar reserva > selecionar horario ja reservado
reposta 400 error	"Sala já reservada nesse horário"

login admin > salas > Criar sala com mesmo nome e bloco
error 409 "Já existe uma sala com esse nome/número neste bloco"

## Prioridade média :

A tela de edição não manda a edição para o banco de dados, o e-mail não é modificado
Logar admin > Cadastrar usuário > Colocar um e-mail > Usuário atualizado > e-mail continua sem alteração

❌ Back não pede id

## Prioridade média :

A tela de registro de salas do admin permite adicionar salas com exatamente as mesmas características

Logar admin > Cadastrar sala > Inserir sala > Tela de salas > Cadastrar sala >  Inserir mesma sala > Sala cadastrada

✅ Corrigido

## Prioridade média :

A tela de registro de salas do admin tem dois campos para computadores quando a opção laboratório é selecionada

Logar admin > Cadastrar sala > Inserir sala > Selecionar laboratório > Input para quantidade de computadores aparece
✅ Corrigido

### Prioridade baixa :

Falta de feedback na tela quando não coloca um e-mail institucional (o console gera a mensagem correta)

Logar admin > Cadastrar usuário > Colocar um e-mail não institucional > Mensagem na tela “Erro ao salvar usuário”
✅ Corrigido

### Prioridade baixa :

Erro ao tentar validar um e-mail com dígitos inválidos, falta de feedback ao usuário

Logar admin > Cadastrar usuário > Colocar um e-mail com espaço no meio > Mensagem na tela “Erro ao salvar usuário”
✅ Corrigido

### Prioridade baixa :

A tela de edição salas do admin não mostra a quantidade de equipamento atual

Logar admin > Lista de sala > Editar sala > Não mostra o equipamento atual

✅ Corrigido

### Prioridade baixa :

A tela de login não apresenta nenhum erro quando um e-mail de estrutura inválida é inserido (ex:
 ab çd@unespar.edu.br )

Logar > Colocar e-mail de estrutura invalida > Não loga porém não apresenta nenhum erro visual
