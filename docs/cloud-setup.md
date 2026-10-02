# Ativar a sincronização entre aparelhos

O projeto `unova-black` já foi criado na organização Cutinski, na região `sa-east-1` (São Paulo), com custo de criação informado de US$ 0/mês. O banco e a função de gravação estão instalados. O login público ainda aguarda configuração de e-mail; a versão pública continua salvando somente neste aparelho.

Projeto: `pbnsjnnxugypejmjjbxu` · [Painel do Supabase](https://supabase.com/dashboard/project/pbnsjnnxugypejmjjbxu).

## Verificação realizada

A migração `create_private_journey_sync` foi aplicada. Um teste em transação, revertido ao terminar, confirmou gravação por proprietário, isolamento entre duas contas, bloqueio de inserção em nome de outra conta, rejeição de revisão antiga e ausência de leitura/gravação anônima. Os advisors de segurança e desempenho não apontaram problemas. Nenhum usuário ou progresso de teste permaneceu no banco.

Esses testes verificam o banco; login por e-mail e sincronização pelo navegador ainda precisam de teste após configurar o envio.

## Próximos passos

1. Banco já instalado neste projeto. `supabase/schema.sql` descreve a estrutura; não reaplicar nele, pois as políticas já existem.
2. Habilitar acesso por e-mail. No template de Magic Link, incluir o código `{{ .Token }}` para usar OTP, em vez de depender de um link de navegação. Configurar o envio de e-mail conforme o provedor escolhido.
3. Preencher `cloud-config.js` com a URL `https://<project-ref>.supabase.co` e a chave **publishable/anon pública**. Nunca usar secret key ou service_role no navegador.
4. Regerar `sw.js` com `python scripts/build-service-worker.py` e publicar, para atualizar o arquivo de configuração também no cache offline.
5. Testar duas contas diferentes: cada uma deve ler apenas sua própria jornada. Testar dois aparelhos da mesma conta: login, confirmação da jornada inicial, alterações, retomada offline e conflito simultâneo.

A gravação ocorre na função `save_journey`. Ela compara a revisão esperada antes de atualizar. Uma aba antiga não pode silenciosamente sobrescrever uma versão mais recente da conta. Ao escolher entre conta e aparelho, o app explica qual versão será substituída; uma cópia pode ser baixada antes em Minha jornada.

O envio padrão do Supabase só entrega e-mails a membros da organização. Para usuários públicos, configurar SMTP próprio e os templates de confirmação de cadastro e Magic Link com `{{ .Token }}`. Não publicar um formulário de código antes de testar cadastro e acesso de uma conta externa à organização. Custos, limites e disponibilidade dependem do projeto e do provedor; o guia não cria assinatura nem serviço automaticamente.

Referências: [OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [templates](https://supabase.com/docs/guides/auth/auth-email-templates), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
