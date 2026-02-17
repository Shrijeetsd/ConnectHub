@echo off
echo Starting ConnectHub Backend and Frontend...

:: Start Backend
start "ConnectHub Backend" cmd /k "cd backend && npm install && npm run dev"

:: Start Frontend
start "ConnectHub Frontend" cmd /k "cd admin-panel && npm install && npm run dev"

echo Servers are starting in separate windows...
