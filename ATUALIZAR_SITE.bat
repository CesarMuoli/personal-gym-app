@echo off
chcp 65001 > nul
cd /d "%~dp0"
title Atualizador do PersonalGYM

echo.
echo ========================================================
echo        🚀 ATUALIZADOR AUTOMÁTICO - PERSONALGYM
echo ========================================================
echo.
echo  [1/3] Identificando alterações no projeto...
git add .

echo.
echo  [2/3] Registrando pacote de atualização...
git commit -m "Atualização: Módulo Financeiro, Cibersegurança, RLS e Correções"

echo.
echo  [3/3] Enviando para o GitHub e atualizando no Render...
git push origin main

echo.
echo ========================================================
echo  ✅ SUCESSO TOTAL!
echo  Suas alterações foram enviadas com segurança.
echo  O Render já começou a atualizar seu site na internet!
echo ========================================================
echo.
pause
