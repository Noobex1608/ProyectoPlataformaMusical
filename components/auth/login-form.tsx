"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Music, User } from "lucide-react"

interface AuthFormProps {
  onLogin: (user: any) => void
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [loading, setLoading] = useState(false)

  const handleRegister = async (formData: FormData) => {
    setLoading(true)

    // Simular registro (aquí conectarías con Supabase Auth)
    const userData = {
      id: Math.random().toString(),
      email: formData.get("email"),
      nombre: formData.get("nombre"),
      tipo_usuario: formData.get("tipo_usuario"),
      biografia: formData.get("biografia") || "",
    }

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onLogin(userData)
    setLoading(false)
  }

  const handleLogin = async (formData: FormData) => {
    setLoading(true)

    // Simular login
    const userData = {
      id: "1",
      email: formData.get("email"),
      nombre: "Usuario Demo",
      tipo_usuario: "fan",
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    onLogin(userData)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Music className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">MusicApp</CardTitle>
          <CardDescription>Plataforma de monetización musical</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form action={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form action={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input id="nombre" name="nombre" placeholder="Tu nombre" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_usuario">Tipo de cuenta</Label>
                  <Select name="tipo_usuario" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fan">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Fan - Escuchar y apoyar artistas
                        </div>
                      </SelectItem>
                      <SelectItem value="artista">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          Artista - Crear y monetizar música
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biografia">Biografía (opcional)</Label>
                  <Textarea id="biografia" name="biografia" placeholder="Cuéntanos sobre ti..." rows={3} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registrando..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
