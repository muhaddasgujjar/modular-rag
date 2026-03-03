$r1 = Invoke-RestMethod -Uri "http://localhost:8000/chat" -Method POST -Headers @{"Content-Type" = "application/json"} -Body '{"session_id":"sessXY","message":"What is Apex?"}'
Write-Host "Reply 1:" $r1.data.reply "`n"

$r2 = Invoke-RestMethod -Uri "http://localhost:8000/chat" -Method POST -Headers @{"Content-Type" = "application/json"} -Body '{"session_id":"sessXY","message":"What are the governor limits for SOQL?"}'
Write-Host "Reply 2:" $r2.data.reply "`n"

$r3 = Invoke-RestMethod -Uri "http://localhost:8000/chat" -Method POST -Headers @{"Content-Type" = "application/json"} -Body '{"session_id":"sessXY","message":"Can you tell me what Apex is again?"}'
Write-Host "Reply 3:" $r3.data.reply "`n"
