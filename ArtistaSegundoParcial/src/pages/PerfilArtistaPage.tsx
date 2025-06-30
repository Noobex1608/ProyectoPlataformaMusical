import { useEffect, useState } from 'react';
import type { PerfilArtista } from '../types/PerfilArtista';
import PerfilArtistaForm from '../components/PerfilArtistaForm';
import PerfilArtistaList from '../components/PerfilArtistaList';

const PerfilArtistaPage = () => {
  const [perfil, setPerfil] = useState<PerfilArtista | null>(() => {
    const stored = localStorage.getItem('perfilArtista');
    return stored ? JSON.parse(stored) : null;
  });

  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    if (perfil) {
      localStorage.setItem('perfilArtista', JSON.stringify(perfil));
    }
  }, [perfil]);

  const handleGuardar = (nuevoPerfil: PerfilArtista) => {
    setPerfil(nuevoPerfil);
    setModoEdicion(false);
  };

  return (
    <section className="main-content">
      {(!perfil || modoEdicion) ? (
        <PerfilArtistaForm onGuardar={handleGuardar} perfilInicial={perfil || undefined} />
      ) : (
        <PerfilArtistaList perfil={perfil} onEditar={() => setModoEdicion(true)} />
      )}
    </section>
  );
};

export default PerfilArtistaPage;
