import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ManageAulas.css';
import { FaPlus, FaEdit, FaSearch } from 'react-icons/fa';

const TIPOS = ['Laboratorio', 'Aula'];
const EDIFICIOS = ['A', 'B', 'C', 'D', 'E'];

const ManageAulas = () => {
  const [aulas, setAulas] = useState([]);
  const [form, setForm] = useState({ nombre: '', tipo: '', edificio: '', capacidad: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const cargarAulas = async () => {
    try {
      const res = await fetch('https://localhost:7101/api/Aulas/obtenerAulas', { headers });
      const data = await res.json();
      setAulas(data);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al cargar aulas:', error);
    }
  };

  const buscarAulas = async (nombre) => {
    try {
      const res = await fetch(`https://localhost:7101/api/Aulas/buscar/${encodeURIComponent(nombre)}`, { headers });
      if (!res.ok) throw new Error('Error al buscar aulas');
      const data = await res.json();
      setAulas(data);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setAulas([]);
    }
  };

  useEffect(() => {
    if (busqueda.trim() === '') cargarAulas();
  }, [busqueda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editandoId
        ? `https://localhost:7101/api/Aulas/modificarAula/${editandoId}`
        : 'https://localhost:7101/api/Aulas/crearAula';

      const method = editandoId ? 'PUT' : 'POST';
      const body = JSON.stringify({
        ...form,
        capacidad: parseInt(form.capacidad, 10) || 0
      });

      const res = await fetch(url, { method, headers, body });
      if (!res.ok) throw new Error('Error en la operación');

      Swal.fire({
        icon: 'success',
        title: editandoId ? 'Aula actualizada' : 'Aula creada',
        timer: 1500,
        showConfirmButton: false
      });

      setForm({ nombre: '', tipo: '', edificio: '', capacidad: '' });
      setEditandoId(null);
      cargarAulas();
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo completar la operación' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (aula) => {
    setForm({
      nombre: aula.nombre,
      tipo: aula.tipo,
      edificio: aula.edificio,
      capacidad: aula.capacidad.toString()
    });
    setEditandoId(aula.id);
  };

  const handleEliminar = async (id, nombre) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar el aula "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`https://localhost:7101/api/Aulas/eliminarAula/${id}`, {
          method: 'DELETE',
          headers
        });
        if (!res.ok) throw new Error('Error al eliminar');
        Swal.fire({ icon: 'success', title: 'Aula eliminada', timer: 1200, showConfirmButton: false });
        cargarAulas();
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar' });
      }
    }
  };

  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const aulasPaginadas = aulas.slice(indiceInicio, indiceInicio + elementosPorPagina);
  const totalPaginas = Math.ceil(aulas.length / elementosPorPagina);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="crear-aula-container">
      <h2>GESTIONAR AULAS</h2>

      <form onSubmit={handleSubmit} className="formulario-aula">
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del salón" required />
        <input name="capacidad" type="number" value={form.capacidad} onChange={handleChange} placeholder="Capacidad" required />
        <select name="tipo" value={form.tipo} onChange={handleChange} required>
          <option value="">Tipo</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select name="edificio" value={form.edificio} onChange={handleChange} required>
          <option value="">Edificio</option>
          {EDIFICIOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button type="submit" className='btn-guardar-aula' disabled={loading}>
          {loading ? 'Guardando...' : editandoId ? (
            <>
              <FaEdit style={{ marginRight: '6px' }} /> Actualizar
            </>
          ) : (
            <>
              <FaPlus style={{ marginRight: '6px' }} /> Agregar
            </>
          )}
        </button>
      </form>

      <div className="barra-busqueda-aula">
        <input type="text" placeholder="Buscar aula..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <button onClick={() => buscarAulas(busqueda)}>
          <FaSearch/> Buscar
        </button>
      </div>

      <table className="tabla-aulas">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Edificio</th>
            <th>Capacidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {aulasPaginadas.map(a => (
            <tr key={a.id}>
              <td>{a.nombre}</td>
              <td>{a.tipo}</td>
              <td>{a.edificio}</td>
              <td>{a.capacidad}</td>
              <td>
                <button className="btn-editar-aula" onClick={() => handleEditar(a)}>Editar</button>
                <button className="btn-eliminar-aula" onClick={() => handleEliminar(a.id, a.nombre)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {aulasPaginadas.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>
                No se encontraron aulas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPaginas > 1 && (
        <div className="paginacion-aula">
          <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>◀ Anterior</button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>Siguiente ▶</button>
        </div>
      )}
    </div>
  );
};

export default ManageAulas; 