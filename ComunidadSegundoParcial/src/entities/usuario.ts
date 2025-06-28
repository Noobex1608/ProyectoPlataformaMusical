export interface Usuario {
    id: number;
    name: string;
    email: string;
    password: string;
    age?: number;
    created_at: Date;
    description?: string;
    imageUrl?: string;
}