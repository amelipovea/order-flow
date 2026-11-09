param(
    [string]$ApiBase = "http://localhost:8181/api"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " ORDERFLOW - PRUEBA DE API REST" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`n[1/6] Comprobando el runtime..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Method Get -Uri "$ApiBase/system/health"
$health | Format-List

Write-Host "`n[2/6] Creando un pedido de prueba..." -ForegroundColor Yellow
$body = @{
    customerId = "Cliente de prueba"
    email      = "prueba@orderflow.local"
    items      = 2
    total      = 150.00
} | ConvertTo-Json

$order = Invoke-RestMethod `
    -Method Post `
    -Uri "$ApiBase/orders" `
    -ContentType "application/json" `
    -Body $body

$order | Format-List

Write-Host "`n[3/6] Consultando los pedidos..." -ForegroundColor Yellow
Invoke-RestMethod -Method Get -Uri "$ApiBase/orders" |
    Format-Table id, customerId, total, status -AutoSize

Write-Host "`n[4/6] Evaluando la promoción..." -ForegroundColor Yellow
$promotion = Invoke-RestMethod `
    -Method Post `
    -Uri "$ApiBase/promotions/evaluate/$($order.id)"

$promotion | Format-List

Write-Host "`n[5/6] Actualizando el estado del pedido..." -ForegroundColor Yellow
$statusBody = @{ status = "PROCESSING" } | ConvertTo-Json

$updated = Invoke-RestMethod `
    -Method Put `
    -Uri "$ApiBase/orders/$($order.id)/status" `
    -ContentType "application/json" `
    -Body $statusBody

$updated | Format-List

Write-Host "`n[6/6] Consultando los bundles OSGi..." -ForegroundColor Yellow
$bundles = Invoke-RestMethod -Method Get -Uri "$ApiBase/system/bundles"

$bundles |
    Where-Object {
        $_.symbolicName -in @(
            "order-service",
            "promotion-engine",
            "orderflow-rest-api"
        )
    } |
    Format-Table id, symbolicName, version, state -AutoSize

Write-Host "`nPrueba terminada. Pedido creado: $($order.id)" -ForegroundColor Green
