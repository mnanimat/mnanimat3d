#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ -f ./gradlew ]; then
  ./gradlew assembleDebug
else
  echo "Este projeto nao inclui Gradle Wrapper. Abra no Android Studio e use Build > Build Bundle(s) / APK(s) > Build APK(s)."
  echo "Ou instale o Gradle e execute: gradle assembleDebug"
fi
