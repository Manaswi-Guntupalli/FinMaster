@echo off
echo Adding Windows Firewall rule for FinMaster...
netsh advfirewall firewall add rule name="FinMaster Node Server" dir=in action=allow protocol=TCP localport=3000
echo.
echo Firewall rule added successfully!
echo You can now access the app from your phone.
echo.
pause
