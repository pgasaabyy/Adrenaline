# Adrenaline - Sistema de Academia

Este projeto é um sistema de gerenciamento de academia, "Adrenaline", desenvolvido com HTML, CSS, JavaScript para o frontend, Node.js com Express para o backend e MySQL como banco de dados.

## Estrutura do Banco de Dados

O banco de dados `johnnys_strong` contém as seguintes tabelas:

- **`users`**: Armazena informações de todos os usuários do sistema (administradores, personal trainers e usuários comuns).
  - `id`: Chave primária, auto-incremento.
  - `name`: Nome do usuário.
  - `email`: Email do usuário (único).
  - `password`: Senha do usuário.
  - `role`: Papel do usuário (`admin`, `personal`, `user`).

- **`employees`**: Armazena informações específicas de funcionários (personal trainers e administradores).
  - `id`: Chave primária, auto-incremento.
  - `user_id`: Chave estrangeira para `users.id`.
  - `function`: Função do funcionário (ex: 'Personal Trainer', 'Administrador').

- **`training_plans`**: Armazena os planos de treino criados pelos personal trainers para os usuários.
  - `id`: Chave primária, auto-incremento.
  - `personal_trainer_id`: Chave estrangeira para `employees.id` (o personal trainer que criou o plano).
  - `user_id`: Chave estrangeira para `users.id` (o usuário que receberá o plano).
  - `plan_details`: Detalhes do plano de treino.
  - `start_date`: Data de início do plano.
  - `end_date`: Data de término do plano.

- **`training_sessions`**: Armazena as sessões de treino agendadas.
  - `id`: Chave primária, auto-incremento.
  - `training_plan_id`: Chave estrangeira para `training_plans.id`.
  - `date`: Data da sessão.
  - `time`: Hora da sessão.
  - `status`: Status da sessão (`scheduled`, `completed`, `cancelled`).

- **`user_progress`**: Armazena o progresso dos usuários nos treinos.
  - `id`: Chave primária, auto-incremento.
  - `training_plan_id`: Chave estrangeira para `training_plans.id`.
  - `date`: Data do registro de progresso.
  - `progress_details`: Detalhes do progresso.

## Como Configurar o Banco de Dados

1. Certifique-se de ter o MySQL instalado e em execução.
2. Acesse o seu cliente MySQL (ex: MySQL Workbench, linha de comando).
3. Execute o script `schema.sql` para criar o banco de dados e as tabelas:
   ```bash
   mysql -u seu_usuario -p < schema.sql
   ```
   (Substitua `seu_usuario` pelo seu usuário MySQL e digite sua senha quando solicitado.)

## Próximos Passos

- Configuração do backend com Node.js e Express.
- Desenvolvimento do frontend.
- Implementação das funcionalidades.
- Integração e testes.
- Documentação detalhada.

