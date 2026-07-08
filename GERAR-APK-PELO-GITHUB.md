# Gerar o APK automaticamente pelo GitHub Actions

Este projeto já inclui o arquivo:

```text
.github/workflows/build-apk.yml
```

Ele gera um APK debug instalável automaticamente pelo GitHub Actions.

## Passo a passo

1. Crie um repositório no GitHub.
2. Envie todos os arquivos deste projeto para o repositório.
3. Entre no repositório pelo navegador.
4. Clique em **Actions**.
5. Clique no workflow **Gerar APK Android**.
6. Clique em **Run workflow**.
7. Aguarde o processo terminar.
8. Abra a execução concluída e baixe o arquivo em **Artifacts**.
9. O artifact terá o nome:

```text
MN-AnimaT3D-app-debug-apk
```

Dentro dele estará o APK:

```text
app-debug.apk
```

## Como instalar no Motorola Edge 20 Lite

1. Baixe o APK no celular.
2. Toque no arquivo `app-debug.apk`.
3. Autorize **instalar apps desconhecidos** para o navegador ou gerenciador de arquivos.
4. Toque em **Instalar**.

## Observação

Esse APK debug serve para teste e instalação direta. Para publicar na Play Store, gere uma versão **release assinada** no Android Studio.
