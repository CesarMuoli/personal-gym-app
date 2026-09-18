@echo off
chcp 65001 > nul
cd /d "%~dp0"
title Servidor Local - PersonalGYM

echo.
echo ========================================================
echo        ⚡ INICIANDO PERSONALGYM NO SEU COMPUTADOR
echo ========================================================
echo.
echo Abrindo o servidor local...
echo Para fechar quando terminar, basta fechar esta janela.
echo.
npm run dev
