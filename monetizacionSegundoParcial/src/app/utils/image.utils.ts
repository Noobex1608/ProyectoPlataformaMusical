// Utilidades para manejo de imágenes con Supabase Storage
export class ImageUtils {
    private static readonly SUPABASE_URL = 'https://eyewdvpiokrfqspbjdbf.supabase.co';
    private static readonly IMAGES_BUCKET = 'images';

    /**
     * Genera la URL pública de una imagen en Supabase Storage
     */
    static getPublicImageUrl(filePath: string): string {
        return `${this.SUPABASE_URL}/storage/v1/object/public/${this.IMAGES_BUCKET}/${filePath}`;
    }

    /**
     * Genera la URL de una imagen de perfil de artista por defecto
     */
    static getDefaultArtistImageUrl(): string {
        // Usar una imagen por defecto que existe en el bucket
        return this.getPublicImageUrl('profile-images/default-artist.jpg');
    }

    /**
     * Genera la URL de avatar por defecto basado en el nombre
     */
    static getAvatarUrl(name: string): string {
        // Limpiar el nombre para evitar problemas con caracteres especiales
        const cleanName = name.replace(/[^\w\s]/g, '').trim();
        const encodedName = encodeURIComponent(cleanName);
        
        // Parámetros optimizados para mejor compatibilidad
        const params = [
            `name=${encodedName}`,
            'size=200',
            'background=667eea',
            'color=ffffff',
            'rounded=true',
            'font-size=0.6',
            'bold=true'
        ];
        
        const url = `https://ui-avatars.com/api/?${params.join('&')}`;
        console.log('🖼️ Generated cleaned avatar URL for "' + name + '": ' + url);
        return url;
    }

    /**
     * Determina qué imagen usar: propia, por defecto o avatar generado
     */
    static getImageUrl(imageUrl?: string, artistName?: string): string {
        console.log('🖼️ ImageUtils.getImageUrl called with:', { imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : imageUrl, artistName });
        
        if (imageUrl && imageUrl.trim() !== '') {
            // Si la imagen ya es base64, usarla directamente
            if (imageUrl.startsWith('data:image/')) {
                console.log('🖼️ Using base64 image data directly');
                return imageUrl;
            }
            
            // Si la imagen es una URL completa, usarla directamente
            if (imageUrl.startsWith('http')) {
                console.log('🖼️ Using provided HTTP URL:', imageUrl);
                return imageUrl;
            }
            
            // Si es una ruta relativa, generar URL de Supabase
            const supabaseUrl = this.getPublicImageUrl(imageUrl);
            console.log('🖼️ Generated Supabase URL:', supabaseUrl);
            return supabaseUrl;
        }

        // Si no hay imagen y hay nombre, generar avatar
        if (artistName) {
            const avatarUrl = this.getAvatarUrl(artistName);
            console.log('🖼️ Generated avatar URL:', avatarUrl);
            return avatarUrl;
        }

        // Como último recurso, imagen por defecto
        const defaultUrl = this.getDefaultArtistImageUrl();
        console.log('🖼️ Using default URL:', defaultUrl);
        return defaultUrl;
    }

    /**
     * Genera una imagen SVG de avatar local como último recurso
     */
    static getLocalAvatarSvg(name: string): string {
        const initials = name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
        
        const svg = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#667eea"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="60" 
                  fill="white" text-anchor="middle" dy="0.35em" font-weight="bold">
                ${initials}
            </text>
        </svg>`;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * Valida si una URL de imagen es accesible
     */
    static async isImageAccessible(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
}
