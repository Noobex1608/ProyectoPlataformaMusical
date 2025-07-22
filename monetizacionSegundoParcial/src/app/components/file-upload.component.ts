import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FileUploadService } from '../services/file-upload.service';
import { ArchivoUpload, CONFIGURACIONES_UPLOAD } from '../models/contenido-exclusivo.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      <div class="upload-area" 
           [class.dragover]="isDragOver"
           [class.uploading]="archivoUpload && archivoUpload.uploading"
           (click)="fileInput.click()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        
        <!-- Estado inicial o sin archivo -->
        <div *ngIf="!archivoUpload" class="upload-prompt">
          <div class="upload-icon">{{ getUploadIcon() }}</div>
          <h4>{{ label }}</h4>
          <p>Arrastra tu archivo aquí o haz clic para seleccionar</p>
          <small>{{ getFileTypesText() }}</small>
          <small>Tamaño máximo: {{ getMaxSizeText() }}</small>
        </div>

        <!-- Estado subiendo -->
        <div *ngIf="archivoUpload && archivoUpload.uploading" class="upload-progress">
          <div class="progress-circle">
            <div class="progress-text">{{ archivoUpload.uploadProgress || 0 }}%</div>
          </div>
          <p>Subiendo {{ archivoUpload.file.name || 'archivo' }}...</p>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="archivoUpload.uploadProgress || 0"></div>
          </div>
        </div>

        <!-- Estado completado -->
        <div *ngIf="archivoUpload && !archivoUpload.uploading && archivoUpload.url" class="upload-success">
          <div class="success-icon">✅</div>
          <h4>¡Archivo subido exitosamente!</h4>
          <p>{{ archivoUpload.file.name || 'archivo' }}</p>
          <button class="btn-secondary btn-small" (click)="removeFile($event)">
            <span class="icon">🗑️</span>
            Cambiar archivo
          </button>
        </div>

        <!-- Estado de error -->
        <div *ngIf="archivoUpload && archivoUpload.error" class="upload-error">
          <div class="error-icon">❌</div>
          <h4>Error al subir archivo</h4>
          <p>{{ archivoUpload.error || 'Error desconocido' }}</p>
          <button class="btn-primary btn-small" (click)="retryUpload()">
            <span class="icon">🔄</span>
            Reintentar
          </button>
        </div>
      </div>

      <input #fileInput 
             type="file" 
             [accept]="getAcceptedTypes()"
             (change)="onFileSelected($event)"
             style="display: none;">
    </div>
  `,
  styles: [`
    .file-upload-container {
      width: 100%;
    }

    .upload-area {
      border: 2px dashed #e0e0e0;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-area:hover {
      border-color: #4a90e2;
      background: #f0f7ff;
    }

    .upload-area.dragover {
      border-color: #4a90e2;
      background: #e6f3ff;
      transform: scale(1.02);
    }

    .upload-area.uploading {
      border-color: #ff9500;
      background: #fff9f0;
      cursor: default;
    }

    .upload-prompt {
      width: 100%;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .upload-prompt h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .upload-prompt p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .upload-prompt small {
      display: block;
      color: #888;
      margin: 0.25rem 0;
    }

    .upload-progress {
      width: 100%;
    }

    .progress-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: conic-gradient(#4a90e2 0deg, #e0e0e0 0deg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem auto;
      position: relative;
    }

    .progress-text {
      font-weight: bold;
      color: #333;
      font-size: 0.9rem;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 1rem;
    }

    .progress-fill {
      height: 100%;
      background: #4a90e2;
      transition: width 0.3s ease;
    }

    .upload-success {
      width: 100%;
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .upload-success h4 {
      margin: 0 0 0.5rem 0;
      color: #28a745;
      font-size: 1.2rem;
    }

    .upload-error {
      width: 100%;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .upload-error h4 {
      margin: 0 0 0.5rem 0;
      color: #dc3545;
      font-size: 1.2rem;
    }

    .btn-secondary, .btn-primary {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn-primary {
      background: #4a90e2;
      color: white;
    }

    .btn-primary:hover {
      background: #357abd;
    }

    .btn-small {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }
  `]
})
export class FileUploadComponent implements OnDestroy {
  @Input() label: string = 'Subir archivo';
  @Input() tipoContenido: string = 'foto';
  @Input() artistaId: string = '';
  @Input() tipo: 'contenido' | 'portada' = 'contenido';
  @Output() onFileUploaded = new EventEmitter<{ url: string; path: string }>();
  @Output() onFileRemoved = new EventEmitter<void>();
  @Output() onUploadError = new EventEmitter<string>();

  archivoUpload: ArchivoUpload | null = null;
  isDragOver = false;
  private subscription = new Subscription();

  constructor(private fileUploadService: FileUploadService) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  private uploadFile(file: File): void {
    console.log(`📁 Iniciando upload de ${this.tipo}:`, file);

    this.archivoUpload = {
      file,
      tipo: this.tipo,
      uploading: true,
      uploadProgress: 0
    };

    // Simular progreso
    const progressInterval = setInterval(() => {
      if (this.archivoUpload && this.archivoUpload.uploading) {
        this.archivoUpload.uploadProgress += Math.random() * 20;
        if (this.archivoUpload.uploadProgress >= 95) {
          this.archivoUpload.uploadProgress = 95;
          clearInterval(progressInterval);
        }
      }
    }, 200);

    this.subscription.add(
      this.fileUploadService.uploadFile(file, this.tipoContenido, this.artistaId, this.tipo)
        .subscribe({
          next: (result) => {
            clearInterval(progressInterval);
            if (this.archivoUpload) {
              this.archivoUpload.uploading = false;
              this.archivoUpload.uploadProgress = 100;
              this.archivoUpload.url = result.url;
            }
            console.log('✅ Upload completado:', result);
            this.onFileUploaded.emit(result);
          },
          error: (error) => {
            clearInterval(progressInterval);
            if (this.archivoUpload) {
              this.archivoUpload.uploading = false;
              this.archivoUpload.error = error.message || 'Error desconocido';
            }
            console.error('❌ Error en upload:', error);
            this.onUploadError.emit(error.message);
          }
        })
    );
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.archivoUpload = null;
    this.onFileRemoved.emit();
  }

  retryUpload(): void {
    if (this.archivoUpload && this.archivoUpload.file) {
      this.uploadFile(this.archivoUpload.file);
    }
  }

  getUploadIcon(): string {
    const icons: { [key: string]: string } = {
      foto: '📸',
      video: '🎬',
      cancion: '🎵',
      album: '💿',
      letra: '📝',
      portada: '🖼️'
    };
    return icons[this.tipo === 'portada' ? 'portada' : this.tipoContenido] || '📁';
  }

  getFileTypesText(): string {
    const configKey = this.tipo === 'portada' ? 'portada' : this.tipoContenido;
    const config = CONFIGURACIONES_UPLOAD[configKey];
    if (!config) return 'Archivos admitidos';
    
    const types = config.allowedTypes.map(type => {
      const extension = type.split('/')[1];
      return extension.toUpperCase();
    }).join(', ');
    
    return `Tipos admitidos: ${types}`;
  }

  getMaxSizeText(): string {
    const configKey = this.tipo === 'portada' ? 'portada' : this.tipoContenido;
    const config = CONFIGURACIONES_UPLOAD[configKey];
    if (!config) return '';
    
    const sizeMB = Math.round(config.maxSizeBytes / (1024 * 1024));
    return `${sizeMB}MB`;
  }

  getAcceptedTypes(): string {
    const configKey = this.tipo === 'portada' ? 'portada' : this.tipoContenido;
    const config = CONFIGURACIONES_UPLOAD[configKey];
    return config?.allowedTypes.join(',') || '*';
  }
}
