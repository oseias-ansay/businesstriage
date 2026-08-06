# ⚠️ PASTA ANTIGA — NÃO EDITE NADA AQUI

Esta é uma **cópia obsoleta** do projeto Business Triage.

O projeto ativo está em:

```
C:\Projetos\business-triage
```

Todo o trabalho (autenticação, rotas, módulo financeiro) foi copiado para lá
em 01/08/2026. Qualquer alteração feita **nesta** pasta não terá efeito: o
`npm run dev` e o build de produção rodam a partir do caminho novo.

## O que fazer

Confirme que o projeto novo sobe:

```powershell
cd C:\Projetos\business-triage
npm install
npm run dev
```

Funcionando, apague esta pasta e as outras cópias:

```powershell
Remove-Item -Recurse -Force "C:\Projetos\Site da GO Admnistração e Consultoria\business-triage"
Remove-Item -Recurse -Force "C:\Projetos\Site da GO Admnistração e Consultoria\business-triage-app"
Remove-Item -Force "C:\Projetos\Site da GO Admnistração e Consultoria\business-triage-app.rar"
```

Manter duas cópias do mesmo projeto é como trabalhar com dois cadernos iguais:
mais cedo ou mais tarde você anota em um e procura no outro.
