"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, DollarSign } from "lucide-react"

interface TipFormProps {
  artista: {
    id: string
    nombre: string
    avatar?: string
  }
  onTip: (amount: number, message: string, paymentData: any) => void
}

export function TipForm({ artista, onTip }: TipFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const quickAmounts = [5, 10, 25, 50, 100]

  const handleTip = async (formData: FormData) => {
    const amount = selectedAmount || Number.parseFloat(customAmount)
    if (!amount || amount <= 0) return

    setLoading(true)

    const paymentData = {
      cardNumber: formData.get("cardNumber"),
      expiryDate: formData.get("expiryDate"),
      cvv: formData.get("cvv"),
      cardName: formData.get("cardName"),
    }

    const message = formData.get("message") as string

    // Simular procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onTip(amount, message, paymentData)
    setLoading(false)
  }

  const finalAmount = selectedAmount || Number.parseFloat(customAmount) || 0

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <Heart className="h-12 w-12 mx-auto text-red-500" />
        <h1 className="text-3xl font-bold">Apoyar a {artista.nombre}</h1>
        <p className="text-muted-foreground">Envía una propina para mostrar tu apoyo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecciona el monto</CardTitle>
          <CardDescription>Elige una cantidad rápida o ingresa un monto personalizado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Montos rápidos */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount("")
                }}
                className="h-12"
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Monto personalizado */}
          <div className="space-y-2">
            <Label htmlFor="customAmount">Monto personalizado</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="customAmount"
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(0)
                }}
                className="pl-10"
                min="1"
                step="0.01"
              />
            </div>
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje (opcional)</Label>
            <Textarea id="message" name="message" placeholder="Escribe un mensaje de apoyo..." rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Formulario de pago */}
      {finalAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Información de Pago</CardTitle>
            <CardDescription>Propina: ${finalAmount.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleTip} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                  <Input id="cardName" name="cardName" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número de tarjeta</Label>
                  <Input id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
                  <Input id="expiryDate" name="expiryDate" placeholder="MM/AA" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" name="cvv" placeholder="123" required />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg">Total a enviar:</span>
                  <span className="text-2xl font-bold text-green-600">${finalAmount.toFixed(2)}</span>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Enviando propina..." : `Enviar $${finalAmount.toFixed(2)}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
