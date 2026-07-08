# MN AnimaT3D — Aplicativo Android

Este pacote é um projeto Android Studio pronto para transformar o MN AnimaT3D em aplicativo Android instalável.

## O que foi preparado

- App Android nativo com `WebView` carregando o MN AnimaT3D offline em `app/src/main/assets/index.html`.
- JavaScript, CSS e bibliotecas 3D locais dentro do APK.
- Tela cheia e modo imersivo para celular.
- Suporte a WebGL/Three.js pelo WebView do Android.
- Importação de arquivos pelo seletor do Android para o botão de abrir/importar.
- Exportação de imagem pelo botão **Salvar imagem**, gravando em `Pictures/MN AnimaT3D` no Android 10 ou superior.
- Configuração Gradle/Android Studio atualizada para `compileSdk 35`, `minSdk 23` e `targetSdk 35`.

## Compatibilidade com Motorola Edge 20 Lite

O Motorola Edge 20 Lite roda Android compatível com este projeto. O app foi configurado com `minSdk 23`, então funciona em Android 6.0 ou superior. Para melhor desempenho no viewport 3D, mantenha o Android System WebView/Chrome atualizado no celular.

## Como gerar APK instalável no Android Studio

1. Extraia este ZIP em uma pasta do computador.
2. Abra o **Android Studio**.
3. Clique em **Open** e selecione a pasta extraída deste projeto.
4. Aguarde o Gradle sincronizar.
5. Para instalar direto no Motorola:
   - Ative **Opções do desenvolvedor** no celular.
   - Ative **Depuração USB**.
   - Conecte o celular no cabo USB.
   - No Android Studio, selecione o Motorola Edge 20 Lite e clique em **Run ▶**.
6. Para gerar um APK manual:
   - Vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - O arquivo será gerado em `app/build/outputs/apk/debug/app-debug.apk`.
   - Envie esse APK para o celular e instale.

## Como gerar versão assinada para distribuir

1. No Android Studio, vá em **Build > Generate Signed Bundle / APK**.
2. Escolha **APK**.
3. Crie ou selecione uma chave `.jks`.
4. Escolha o tipo **release**.
5. Gere o APK assinado.

## Observação importante

Neste ambiente do ChatGPT não há Android SDK/Gradle instalado para compilar o APK final diretamente aqui. Por isso, o pacote entregue é o projeto Android Studio ajustado e pronto para gerar o APK no seu computador.
