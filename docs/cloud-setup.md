# Ativar a sincronização entre aparelhos

A integração foi preparada para um projeto Supabase controlado pelo proprietário do Unova Black. Ainda não há projeto configurado, portanto a versão pública salva somente neste aparelho.

1. Criar o projeto Supabase e executar `supabase/schema.sql` no SQL Editor.
2. Habilitar acesso por e-mail. No template de Magic Link, incluir o código `{{ .Token }}` para usar OTP, em vez de depender de um link de navegação. Configurar o envio de e-mail conforme o provedor escolhido.
3. Preencher `cloud-config.js` com a URL `https://<project-ref>.supabase.co` e a chave **publishable/anon pública**. Nunca usar secret key ou service_role no navegador.
4. Regerar `sw.js` com `python scripts/build-service-worker.py` e publicar, para atualizar o arquivo de configuração também no cache offline.
5. Testar duas contas diferentes: cada uma deve ler apenas sua própria jornada. Testar dois aparelhos da mesma conta: login, confirmação da jornada inicial, alterações, retomada offline e conflito simultâneo.

A gravação ocorre na função `save_journey`. Ela compara a revisão esperada antes de atualizar. Uma aba antiga não pode silenciosamente sobrescrever uma versão mais recente da conta. Ao escolher entre conta e aparelho, o app explica qual versão será substituída; uma cópia pode ser baixada antes em Minha jornada.

O Supabase padrão precisa de configuração adequada de entrega de e-mail para usuários públicos. Custos, limites e disponibilidade dependem do projeto e do provedor; o guia não cria assinatura nem serviço automaticamente.

Referências: [OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [templates](https://supabase.com/docs/guides/auth/auth-email-templates), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
