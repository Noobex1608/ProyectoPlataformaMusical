import { Membresia } from './membresia.model';
import { Propina } from './propina.model';
import { Recompensa } from './recompensa.model';

export interface Transaccion {
usuario: any;
    id: number;
    tipo: Membresia | Propina | Recompensa;
    descripcion: string;
    usuarioId: number;
    monto: number;
    fecha: Date;
}
