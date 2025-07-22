import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, throwError, switchMap } from 'rxjs';
import { supabase } from '../supabase.service';
import { ArchivoUpload, ConfiguracionUpload, CONFIGURACIONES_UPLOAD } from '../models/contenido-exclusivo.model';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor() { }

  /**
   * Sube un archivo al bucket de Supabase Storage
   */
  uploadFile(
    file: File, 
    tipoContenido: string, 
    artistaId: string,
    tipo: 'contenido' | 'portada' = 'contenido'
  ): Observable<{ url: string; path: string }> {
    
    console.log(`🚀 Iniciando upload de ${tipo}:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      tipoContenido,
      artistaId
    });

    // DIAGNÓSTICO RLS: Verificar auth.uid() vs artistaId y obtener ID compatible
    return from(
      this.getArtistaIdForRLS(artistaId)
    ).pipe(
      switchMap((rlsArtistaId: string) => {
        console.log('🔐 ArtistId para RLS:', rlsArtistaId);
        console.log('🎵 ArtistId original:', artistaId);
        
        // Validar archivo antes de subir
        const validationResult = this.validateFile(file, tipoContenido, tipo);
        if (!validationResult.valid) {
          throw new Error(validationResult.error!);
        }

        // Generar nombre único para el archivo usando el artistaId compatible con RLS
        const fileName = this.generateFileName(file, rlsArtistaId, tipo);
        const bucketName = CONFIGURACIONES_UPLOAD[tipoContenido]?.bucketName || 'contenido-exclusivo';
        
        // Ruta completa en el bucket usando artistaId compatible con RLS
        const filePath = `${rlsArtistaId}/${tipoContenido}/${tipo}/${fileName}`;

        console.log(`📁 Subiendo a bucket '${bucketName}' con ruta RLS: ${filePath}`);

        return from(
          supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            })
        ).pipe(
          map((response: any) => ({ response, bucketName, filePath, rlsArtistaId }))
        );
      }),
      map(({ response, bucketName, filePath, rlsArtistaId }: any) => {
        console.log('📤 Respuesta de upload:', response);
        
        if (response.error) {
          console.error('❌ Error detallado de Supabase:', {
            message: response.error.message,
            details: response.error.details,
            code: response.error.code,
            hint: response.error.hint
          });
          
          // Si es error RLS, dar información útil
          if (response.error.message?.includes('row-level security') || 
              response.error.message?.includes('policy')) {
            console.error('🚨 ERROR RLS DETECTADO:');
            console.error('💡 Solución requerida: Ejecutar script SQL fix_contenido_exclusivo_rls.sql en Supabase');
            console.error('🔗 Ruta del archivo:', filePath);
            console.error('🎵 ArtistId usado:', rlsArtistaId);
          }
          
          throw new Error(`Error subiendo archivo: ${response.error.message}`);
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        console.log('✅ Upload exitoso con RLS, URL:', urlData.publicUrl);
        console.log('📁 Archivo guardado en:', filePath);
        console.log('🎵 ArtistId usado:', rlsArtistaId);

        return {
          url: urlData.publicUrl,
          path: filePath
        };
      }),
      catchError(error => {
        console.error('❌ Error en upload:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un archivo del storage
   */
  deleteFile(filePath: string, bucketName: string = 'contenido-exclusivo'): Observable<boolean> {
    console.log(`🗑️ Eliminando archivo: ${filePath} del bucket: ${bucketName}`);
    
    return from(
      supabase.storage
        .from(bucketName)
        .remove([filePath])
    ).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Error eliminando archivo: ${response.error.message}`);
        }
        console.log('✅ Archivo eliminado exitosamente');
        return true;
      }),
      catchError(error => {
        console.error('❌ Error eliminando archivo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Valida un archivo antes de subirlo
   */
  private validateFile(
    file: File, 
    tipoContenido: string, 
    tipo: 'contenido' | 'portada'
  ): { valid: boolean; error?: string } {
    
    const configKey = tipo === 'portada' ? 'portada' : tipoContenido;
    const config = CONFIGURACIONES_UPLOAD[configKey];
    
    if (!config) {
      return { valid: false, error: `Tipo de contenido no soportado: ${tipoContenido}` };
    }

    // Validar tamaño
    if (file.size > config.maxSizeBytes) {
      const maxSizeMB = Math.round(config.maxSizeBytes / (1024 * 1024));
      return { 
        valid: false, 
        error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB` 
      };
    }

    // Validar tipo MIME
    if (!config.allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Tipo de archivo no permitido. Tipos permitidos: ${config.allowedTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }

  /**
   * Genera un nombre único para el archivo
   */
  private generateFileName(file: File, artistaId: string, tipo: 'contenido' | 'portada'): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    
    return `${tipo}_${timestamp}_${randomId}.${extension}`;
  }

  /**
   * Obtiene el artistaId correcto para usar con las políticas RLS
   * Usa auth.uid() si coincide con un artista, o el artistaId original como fallback
   */
  private async getArtistaIdForRLS(artistaId: string): Promise<string> {
    try {
      console.log('🔐 Iniciando verificación RLS para artistaId:', artistaId);
      
      // Obtener el usuario autenticado
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Error obteniendo usuario autenticado:', error);
        console.warn('⚠️ Usando artistaId original sin autenticación:', artistaId);
        return artistaId;
      }

      if (!user) {
        console.warn('⚠️ No hay usuario autenticado');
        console.warn('💡 Esto probablemente causará error RLS');
        console.warn('🔄 Usando artistaId original:', artistaId);
        return artistaId;
      }

      console.log('✅ Usuario autenticado encontrado:', user.id);
      console.log('🎵 ArtistId solicitado:', artistaId);

      // Si auth.uid() coincide con artistaId, perfecto
      if (user.id === artistaId) {
        console.log('✅ auth.uid() coincide con artistaId - RLS debería funcionar');
        return artistaId;
      }

      console.log('⚠️ auth.uid() NO coincide con artistaId');
      console.log('🔍 Verificando relación en tabla artistas...');

      // Verificar si el usuario está relacionado con el artista en la base de datos
      const { data: artista, error: artistaError } = await supabase
        .from('artistas')
        .select('id, user_id, nombre')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .single();

      if (artistaError) {
        console.warn('⚠️ No se encontró relación artista-usuario:', artistaError.message);
        console.warn('💡 Esto puede indicar problemas de políticas RLS');
        console.warn('🔄 Intentando con auth.uid():', user.id);
        return user.id; // Usar auth.uid() para cumplir con RLS básico
      }

      if (artista) {
        console.log('✅ Artista encontrado en BD:', artista);
        console.log('🔗 Relación user_id:', artista.user_id);
        console.log('🎵 ID artista:', artista.id);
        
        // Usar el ID del artista encontrado
        return artista.id;
      }

      // Último fallback: usar auth.uid()
      console.warn('🔄 Fallback final: usando auth.uid() para RLS:', user.id);
      return user.id;

    } catch (error) {
      console.error('❌ Error en getArtistaIdForRLS:', error);
      console.warn('🔄 Fallback de emergencia: usando artistaId original:', artistaId);
      return artistaId; // Fallback al original
    }
  }

  /**
   * Obtiene el progreso de subida (simplificado para esta implementación)
   */
  getUploadProgress(file: File): Observable<number> {
    // En una implementación más avanzada, esto podría trackear el progreso real
    // Por ahora, simulamos el progreso
    return new Observable(observer => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          observer.next(progress);
          observer.complete();
          clearInterval(interval);
        } else {
          observer.next(progress);
        }
      }, 200);
    });
  }

  /**
   * Verifica si el bucket existe y está configurado correctamente
   */
  checkBucketExists(bucketName: string = 'contenido-exclusivo'): Observable<boolean> {
    return from(supabase.storage.getBucket(bucketName)).pipe(
      map(response => {
        console.log('🪣 Verificación de bucket:', response);
        return !response.error;
      }),
      catchError(error => {
        console.error('❌ Error verificando bucket:', error);
        return throwError(() => error);
      })
    );
  }
}
