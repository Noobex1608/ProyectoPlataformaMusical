export interface Transaccion {
    id: number;
    tipo: Membresia | Propina | Recompensa;
    descripcion: string;
    monto: number;
    fecha: Date;
}
import { Membresia } from "./membresia.model";
import { Propina } from "./propina.model";
import { Recompensa } from "./recompensa.model";
