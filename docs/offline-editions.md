# Downloads offline por edição

Em **Trocar jogo → Usar sem internet**, cada edição pode ser baixada ou removida. Nenhum jogo é baixado automaticamente na primeira instalação. Black, a hack Complete Unova v1.12 e Platinum têm manifestos independentes, gerados a partir das dependências de suas páginas, mapas e ícones. A interface mostra o tamanho bruto aproximado; os bytes de armazenamento do navegador podem variar. Os registros de progresso em localStorage/IndexedDB não são lidos, escritos ou removidos pelo gerenciador.

## Integridade e atualização

Cada arquivo possui SHA-256. O service worker confere respostas antes de armazenar, reutiliza arquivos antigos somente se os hashes coincidirem e escreve o marcador de conclusão por último. Download interrompido, conteúdo alterado ou falta de espaço remove a tentativa incompleta; downloads existentes e saves ficam separados. As operações são serializadas entre abas. O status verifica todos os arquivos antes de informar disponibilidade; um arquivo ausente nunca é preenchido silenciosamente com outra revisão.

Uma atualização prepara somente as edições já baixadas, em caches da revisão nova. Se qualquer uma falhar, a preparação nova é revertida; o worker anterior continua servindo sua revisão. Não há `skipWaiting()` nem `clients.claim()`: é preciso fechar as abas controladas para ativar a atualização. Enquanto há um worker em instalação/espera, alterações dos downloads ficam bloqueadas, evitando perda da seleção durante a troca. O navegador pode retomar a atualização ao reabrir com conexão.

Caches do antigo bundle compartilhado são migrados pelas páginas presentes nele. São removidos na ativação somente depois da preparação íntegra das edições correspondentes. Caches de outras aplicações são preservados. O estado offline guarda apenas a edição preferida, sem cópias de saves. Na entrada raiz, um jogo íntegro já baixado serve de alternativa quando não há conexão; o link explícito de Black continua pedindo Black. Pedidos externos e métodos diferentes de GET não são interceptados.

## Uso e limites

Abra o jogo com conexão, entre em Trocar jogo, expanda Usar sem internet e aguarde “Download concluído”. Depois reabra o guia para ser controlado pelo worker. Links das fontes e sincronização precisam de conexão. A interface não substitui o save local por uma promessa de backup permanente: exportar o progresso continua disponível.

Fontes técnicas: [ciclo de vida dos service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) e [SHA-256 via SubtleCrypto.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest). Arquivos: `scripts/build-service-worker.py`, `scripts/service-worker-template.js`, `offline.js`. Após editar páginas, scripts, estilos ou o template, regenere Black 2 quando necessário e execute o gerador do worker.

Validação: testes simulam seleção explícita, consulta offline, download interrompido, revisão incorreta, quota, retentativa, remoção isolada, atualização com worker antigo, migração do bundle e perda de arquivo. DOM verifica controles, erro persistente, foco, armazenamento bloqueado e os três saves intactos. A geração é reproduzível. Navegação/offline real em Safari/iPhone, suspensão, quota real e zoom/toque permanecem pendentes; este PR não faz merge/deploy.
