@echo off
setlocal
cd /d "%~dp0"
if exist gradlew.bat (
  call gradlew.bat assembleDebug
) else (
  echo Este projeto nao inclui Gradle Wrapper.
  echo Abra no Android Studio e use: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
  echo Ou instale o Gradle no Windows e execute: gradle assembleDebug
  pause
)
