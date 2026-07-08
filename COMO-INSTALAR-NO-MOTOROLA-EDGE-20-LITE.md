# Instalar no Motorola Edge 20 Lite

## Método recomendado: pelo Android Studio

1. Instale o Android Studio no Windows.
2. Abra este projeto pelo botão **Open**.
3. Aguarde a sincronização do Gradle.
4. No Motorola Edge 20 Lite:
   - Abra **Configurações > Sobre o telefone**.
   - Toque 7 vezes em **Número da versão** para liberar as opções de desenvolvedor.
   - Volte para **Sistema > Opções do desenvolvedor**.
   - Ative **Depuração USB**.
5. Conecte o celular ao computador por USB.
6. Aceite a autorização de depuração no celular.
7. No Android Studio, selecione o aparelho e clique em **Run ▶**.

## Método por APK

1. No Android Studio, clique em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Pegue o arquivo `app-debug.apk` em `app/build/outputs/apk/debug/`.
3. Envie o APK para o celular.
4. No celular, toque no APK e permita a instalação de app desconhecido quando o Android pedir.
5. Abra o app **MN AnimaT3D**.

## Observações

- O app funciona offline porque os arquivos HTML/CSS/JS/Three.js ficam dentro do APK.
- A função **Salvar imagem** grava em `Pictures/MN AnimaT3D` no Android 10 ou superior.
- Para renderização 3D melhor, atualize o Chrome/Android System WebView pela Play Store.
