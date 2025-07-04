import React from 'react';

const SimpleApp = () => {
  return React.createElement('div', {
    style: {
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, sans-serif'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: { color: '#348e91', marginBottom: '1rem' }
    }, '🎤 ArtistaSegundoParcial'),
    React.createElement('p', {
      key: 'subtitle',
      style: { color: '#666', fontSize: '1.2rem' }
    }, 'Microfrontend cargado exitosamente!'),
    React.createElement('div', {
      key: 'content',
      style: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginTop: '2rem',
        maxWidth: '600px',
        margin: '2rem auto'
      }
    }, [
      React.createElement('h2', {
        key: 'welcome',
        style: { color: '#348e91', marginBottom: '1rem' }
      }, 'Panel de Artista'),
      React.createElement('p', {
        key: 'description'
      }, 'Esta es una versión simplificada de ArtistaSegundoParcial para probar la carga del microfrontend.')
    ])
  ]);
};

export default SimpleApp;
