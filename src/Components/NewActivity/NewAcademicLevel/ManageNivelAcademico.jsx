import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ManageNivelAcademico.css';

const TIPOS_BASE = ['Bachillerato', 'Licenciatura'];
const CARRERAS_BASE = ['Ingeniería Industrial', 'Médico Cirujano', 'Administración'];

const ManageNivelAcademico = () => {
  const [niveles, setNiveles] = useState([]);
  const [form, setForm] = useState({ tipo: '', grado: '', grupo: '', carrera: '' });
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [customTipo, setCustomTipo] = useState(false);
  const [customCarrera, setCustomCarrera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const cargarNiveles = async () => {
    try {
      const res = await fetch('https://localhost:7101/api/NivelAcademico/obtenerNivelAcademico', { headers });
      const data = await res.json();
      setNiveles(data);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al cargar niveles académicos:', error);
    }
  };

  const buscarNiveles = async (filtro) => {
    try {
      const res = await fetch(`https://localhost:7101/api/NivelAcademico/obtenerNivelAcademico/${encodeURIComponent(filtro)}`, { headers });
      const data = await res.json();
      setNiveles(data);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    }
  };

  useEffect(() => {
    if (busqueda.trim() === '') {
      cargarNiveles();
    }
  }, [busqueda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (e) => {
    if (e.target.value === 'otros') {
      setCustomTipo(true);
      setForm(prev => ({ ...prev, tipo: '' }));
    } else {
      setCustomTipo(false);
      setForm(prev => ({ ...prev, tipo: e.target.value }));
    }
  };

  const handleCarreraChange = (e) => {
    if (e.target.value === 'otros') {
      setCustomCarrera(true);
      setForm(prev => ({ ...prev, carrera: '' }));
    } else {
      setCustomCarrera(false);
      setForm(prev => ({ ...prev, carrera: e.target.value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editandoId
        ? `https://localhost:7101/api/NivelAcademico/modificar/${editandoId}`
        : 'https://localhost:7101/api/NivelAcademico/crear/nivelAcademico';

      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          id: editandoId || 0,
          tipo: form.tipo,
          grado: parseInt(form.grado, 10),
          grupo: form.grupo,
          carrera: form.carrera
        })
      });

      if (!res.ok) throw new Error('Error al guardar');

      Swal.fire({
        icon: 'success',
        title: editandoId ? 'Nivel actualizado' : 'Nivel creado',
        timer: 1500,
        showConfirmButton: false
      });

      setForm({ tipo: '', grado: '', grupo: '', carrera: '' });
      setCustomTipo(false);
      setCustomCarrera(false);
      setEditandoId(null);
      cargarNiveles();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el nivel académico.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (nivel) => {
    setForm({
      tipo: nivel.tipo,
      grado: nivel.grado,
      grupo: nivel.grupo,
      carrera: nivel.carrera
    });
    setEditandoId(nivel.id);
    setCustomTipo(!TIPOS_BASE.includes(nivel.tipo));
    setCustomCarrera(!CARRERAS_BASE.includes(nivel.carrera));
  };

  const handleEliminar = async (nivel) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar nivel académico?',
      text: `${nivel.tipo} - ${nivel.grado}°${nivel.grupo} (${nivel.carrera})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`https://localhost:7101/api/NivelAcademico/eliminar/${nivel.id}`, {
          method: 'DELETE',
          headers
        });
        if (!res.ok) throw new Error();
        Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1200, showConfirmButton: false });
        cargarNiveles();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
      }
    }
  };

  const nivelesPaginados = niveles.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);
  const totalPaginas = Math.ceil(niveles.length / elementosPorPagina);

  return (
    <div className="manage-nivel-academico-container">
      <h2>Gestionar Nivel Académico</h2>

      <form onSubmit={handleSubmit} className="form-nivel-academico">
        {customTipo ? (
          <input type="text" name="tipo" placeholder="Tipo..." value={form.tipo} onChange={handleChange} required />
        ) : (
          <select name="tipo" value={form.tipo} onChange={handleTipoChange} required>
            <option value="">Seleccione tipo...</option>
            {TIPOS_BASE.map(t => <option key={t} value={t}>{t}</option>)}
            <option value="otros">Otros...</option>
          </select>
        )}

        <input type="number" name="grado" placeholder="Grado" value={form.grado} onChange={handleChange} required min={1} />
        <input type="text" name="grupo" placeholder="Grupo" value={form.grupo} onChange={handleChange} required />

        {customCarrera ? (
          <input type="text" name="carrera" placeholder="Carrera..." value={form.carrera} onChange={handleChange} required />
        ) : (
          <select name="carrera" value={form.carrera} onChange={handleCarreraChange} required>
            <option value="">Seleccione carrera...</option>
            {CARRERAS_BASE.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="otros">Otros...</option>
          </select>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando…' : editandoId ? 'Actualizar' : 'Guardar'}
        </button>
      </form>

      <div className="barra-busqueda">
        <input
          type="text"
          placeholder="Buscar nivel académico..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={() => buscarNiveles(busqueda)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fill="currentColor" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l4.39 4.38-1.4 1.42-4.4-4.39zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
          </svg>
          Buscar
        </button>
      </div>

      <table className="tabla-nivel-academico">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Grado</th>
            <th>Grupo</th>
            <th>Carrera</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {nivelesPaginados.map(n => (
            <tr key={n.id}>
              <td>{n.tipo}</td>
              <td>{n.grado}</td>
              <td>{n.grupo}</td>
              <td>{n.carrera}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditar(n)}>Editar</button>
                <button className="btn-eliminar" onClick={() => handleEliminar(n)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {nivelesPaginados.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>
                No se encontraron niveles académicos.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPaginas > 1 && (
        <div className="paginacion">
          <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1}>◀</button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas}>▶</button>
        </div>
      )}
    </div>
  );
};

export default ManageNivelAcademico;
