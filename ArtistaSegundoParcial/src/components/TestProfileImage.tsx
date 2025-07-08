import React from 'react';

interface TestProfileImageProps {
  src?: string;
}

// Componente de prueba completamente aislado
const TestProfileImage: React.FC<TestProfileImageProps> = ({ src }) => {
  const testImage = src || "https://images.unsplash.com/photo-1494790108755-2616c65ab526?w=400&h=400&fit=crop&crop=face";

  console.log('🧪 TestProfileImage - props:', { src });
  console.log('🧪 TestProfileImage - usando imagen:', testImage);

  // Función para medir dimensiones reales
  const measureElement = (elementId: string) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        console.log(`🧪 Medidas de ${elementId}:`, {
          rect: { width: rect.width, height: rect.height },
          computed: { 
            width: computedStyle.width, 
            height: computedStyle.height,
            borderRadius: computedStyle.borderRadius,
            objectFit: computedStyle.objectFit
          }
        });
        
        // Agregar info al DOM
        const infoDiv = document.getElementById(`${elementId}-info`);
        if (infoDiv) {
          infoDiv.innerHTML = `
            <small>
              Rect: ${Math.round(rect.width)}x${Math.round(rect.height)}px<br/>
              CSS: ${computedStyle.width} x ${computedStyle.height}<br/>
              Border-radius: ${computedStyle.borderRadius}
            </small>
          `;
        }
      }
    }, 100);
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      margin: '20px', 
      border: '2px solid red',
      textAlign: 'center' as const
    }}>
      <h3 style={{ color: 'red', margin: '0 0 20px 0' }}>🧪 COMPONENTE DE PRUEBA</h3>
      
      {/* Método 1: Con estilos inline absolutos */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: 'blue', margin: '10px 0' }}>Método 1: Estilos inline</h4>
        <img 
          id="test-img-1"
          src={testImage}
          alt="Test Profile 1"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            objectFit: 'cover' as const,
            border: '3px solid blue',
            display: 'block',
            margin: '0 auto'
          }}
          onLoad={() => {
            console.log('🧪 Imagen 1 cargada');
            measureElement('test-img-1');
          }}
          onError={() => console.log('🧪 Error cargando imagen 1')}
        />
        <div id="test-img-1-info" style={{ fontSize: '12px', marginTop: '5px' }}></div>
      </div>

      {/* Método 2: Con div y background-image */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: 'green', margin: '10px 0' }}>Método 2: Background-image</h4>
        <div
          id="test-bg-1"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundImage: `url(${testImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '3px solid green',
            margin: '0 auto'
          }}
          ref={() => measureElement('test-bg-1')}
        />
        <div id="test-bg-1-info" style={{ fontSize: '12px', marginTop: '5px' }}></div>
      </div>

      {/* Método 3: Con CSS reset forzado */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: 'purple', margin: '10px 0' }}>Método 3: CSS reset forzado</h4>
        <img 
          id="test-img-3"
          src={testImage}
          alt="Test Profile 3"
          style={{
            all: 'unset' as any,
            width: '120px !important' as any,
            height: '120px !important' as any,
            borderRadius: '50% !important' as any,
            objectFit: 'cover' as const,
            border: '3px solid purple !important' as any,
            display: 'block !important' as any,
            margin: '0 auto !important' as any,
            boxSizing: 'border-box' as const
          }}
          onLoad={() => {
            console.log('🧪 Imagen 3 cargada');
            measureElement('test-img-3');
          }}
        />
        <div id="test-img-3-info" style={{ fontSize: '12px', marginTop: '5px' }}></div>
      </div>

      {/* Método 4: SVG como contenedor */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: 'orange', margin: '10px 0' }}>Método 4: SVG</h4>
        <svg width="120" height="120" style={{ border: '3px solid orange', display: 'block', margin: '0 auto' }}>
          <defs>
            <clipPath id="circle-clip">
              <circle cx="60" cy="60" r="60"/>
            </clipPath>
          </defs>
          <image 
            href={testImage} 
            x="0" 
            y="0" 
            width="120" 
            height="120" 
            clipPath="url(#circle-clip)"
            preserveAspectRatio="xMidYMid slice"
            onLoad={() => console.log('🧪 SVG imagen cargada')}
          />
        </svg>
      </div>

      {/* Información de debug */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        border: '1px solid #ccc',
        textAlign: 'left' as const,
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <strong>Debug Info:</strong><br/>
        - User Agent: {navigator.userAgent}<br/>
        - Viewport: {window.innerWidth}x{window.innerHeight}<br/>
        - Device Pixel Ratio: {window.devicePixelRatio}
      </div>
    </div>
  );
};

export default TestProfileImage;
