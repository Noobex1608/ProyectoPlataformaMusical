"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Banknote, AlertCircle, CheckCircle } from "lucide-react"

interface WithdrawalFormProps {
  saldoDisponible: number
  onWithdraw: (amount: number, bankData: any) => void
}

export function WithdrawalForm({ saldoDisponible, onWithdraw }: WithdrawalFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleWithdraw = async (formData: FormData) => {
    const amount = Number.parseFloat(formData.get("amount") as string)

    if (amount > saldoDisponible) {
      alert("No tienes suficiente saldo disponible")
      return
    }

    setLoading(true)

    const bankData = {
      bankName: formData.get("bankName"),
      accountNumber: formData.get("accountNumber"),
      accountType: formData.get("accountType"),
      accountHolder: formData.get("accountHolder"),
      routingNumber: formData.get("routingNumber"),
    }

    // Simular procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    onWithdraw(amount, bankData)
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold">¡Retiro Solicitado!</h2>
            <p className="text-muted-foreground">
              Tu solicitud de retiro ha sido procesada. Los fondos llegarán a tu cuenta en 2-3 días hábiles.
            </p>
            <Button onClick={() => setSuccess(false)}>Hacer otro retiro</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <Banknote className="h-12 w-12 mx-auto text-green-500" />
        <h1 className="text-3xl font-bold">Retirar Fondos</h1>
        <p className="text-muted-foreground">Transfiere tus ganancias a tu cuenta bancaria</p>
      </div>

      {/* Saldo disponible */}
      <Card>
        <CardHeader>
          <CardTitle>Saldo Disponible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">${saldoDisponible.toFixed(2)}</div>
            <Badge variant="secondary">Disponible para retiro</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de retiro */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Retiro</CardTitle>
          <CardDescription>Ingresa los datos de tu cuenta bancaria</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a retirar</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                max={saldoDisponible}
                min="10"
                step="0.01"
                required
              />
              <p className="text-sm text-muted-foreground">Mínimo: $10.00 | Máximo: ${saldoDisponible.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">Titular de la cuenta</Label>
              <Input id="accountHolder" name="accountHolder" placeholder="Nombre completo" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banco</Label>
                <Select name="bankName" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu banco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bancolombia">Bancolombia</SelectItem>
                    <SelectItem value="davivienda">Davivienda</SelectItem>
                    <SelectItem value="bbva">BBVA</SelectItem>
                    <SelectItem value="banco_bogota">Banco de Bogotá</SelectItem>
                    <SelectItem value="nequi">Nequi</SelectItem>
                    <SelectItem value="daviplata">Daviplata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo de cuenta</Label>
                <Select name="accountType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahorros">Ahorros</SelectItem>
                    <SelectItem value="corriente">Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Número de cuenta</Label>
              <Input id="accountNumber" name="accountNumber" placeholder="1234567890" required />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Información importante:</p>
                  <ul className="mt-1 text-yellow-700 space-y-1">
                    <li>• Los retiros se procesan en 2-3 días hábiles</li>
                    <li>• Se cobra una comisión del 2% por retiro</li>
                    <li>• Monto mínimo de retiro: $10.00</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Procesando retiro..." : "Solicitar Retiro"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
