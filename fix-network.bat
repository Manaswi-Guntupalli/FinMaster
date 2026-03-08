@echo off
echo Fixing Network Settings for FinMaster...
echo.
echo Step 1: Changing network to Private...
powershell -Command "Set-NetConnectionProfile -NetworkCategory Private"
echo.
echo Step 2: Ensuring firewall rules are active...
netsh advfirewall firewall delete rule name="FinMaster Node Server"
netsh advfirewall firewall add rule name="FinMaster Node Server" dir=in action=allow protocol=TCP localport=3000
echo.
echo Done! Try connecting from your phone now.
echo.
pause
