import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './ManageAsignaturas.css';
import { FaPlus, FaEdit, FaSearch } from 'react-icons/fa';

const ManageAsignaturas = () => {
  const [periodo, setPeriodo] = useState('');
  const periodosPredefinidos = ['Enero - Junio', 'Julio - Diciembre'];
  const [asignaturas, setAsignaturas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const cargarAsignaturas = async () => {
    try {
      const res = await fetch('https://localhost:7101/api/Asignatura/obtenerAsignaturas', { headers });
      const data = await res.json();
      setAsignaturas(data);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    }
  };

  const buscarAsignaturasPorNombre = async (nombreBusqueda) => {
    try {
      const res = await fetch(`https://localhost:7101/api/Asignatura/obtenerAsignaturas/${encodeURIComponent(nombreBusqueda)}`, { headers });
      if (!res.ok) throw new Error('Error al buscar asignaturas');
      const data = await res.json();
      setAsignaturas(data);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setAsignaturas([]);
    }
  };

  useEffect(() => {
    if (busqueda.trim() === '') {
      cargarAsignaturas();
    }
  }, [busqueda]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editandoId
        ? `https://localhost:7101/api/Asignatura/modificarAsignatura/${editandoId}`
        : 'https://localhost:7101/api/Asignatura/crear/asignatura';

      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          nombre,
          periodo
        })
      });

      if (!res.ok) throw new Error('Error en la operación');

      Swal.fire({
        icon: 'success',
        title: editandoId ? 'Asignatura actualizada' : 'Asignatura creada',
        timer: 1500,
        showConfirmButton: false
      });

      setNombre('');
      setPeriodo('');
      setEditandoId(null);
      cargarAsignaturas();
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo completar la operación' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (asignatura) => {
    setNombre(asignatura.nombre);
    setPeriodo(asignatura.periodo);
    setEditandoId(asignatura.id);
  };

  const handleEliminar = async (nombreAsignatura) => {
    const asignatura = asignaturas.find(a => a.nombre === nombreAsignatura);
    if (!asignatura) return;

    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar la asignatura "${nombreAsignatura}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`https://localhost:7101/api/Asignatura/eliminarAsignatura/${asignatura.id}`, {
          method: 'DELETE',
          headers
        });
        if (!res.ok) throw new Error('Error al eliminar');
        Swal.fire({ icon: 'success', title: 'Asignatura eliminada', timer: 1200, showConfirmButton: false });
        cargarAsignaturas();
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar' });
      }
    }
  };

  // Paginación
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const asignaturasPaginadas = asignaturas.slice(indiceInicio, indiceInicio + elementosPorPagina);
  const totalPaginas = Math.ceil(asignaturas.length / elementosPorPagina);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="manage-asignaturas-container">
      <h2>Gestionar Asignaturas</h2>

      <form onSubmit={handleSubmit} className="form-nueva-asignatura">
        <input
          list="asignaturasList"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la asignatura"
          required
        />
        <datalist id="asignaturasList">
          {asignaturas.map(a => (
            <option key={a.id} value={a.nombre} />
          ))}
        </datalist>

        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          required
        >
          <option value="">Selecciona un periodo</option>
          {periodosPredefinidos.map((p, index) => (
            <option key={index} value={p}>{p}</option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
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

      {/* 🔍 Barra de búsqueda */}
      <div className="barra-busqueda">
        <input
          type="text"
          placeholder="Buscar asignatura..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button type="button" onClick={() => buscarAsignaturasPorNombre(busqueda)}>
          <FaSearch />
        </button>
      </div>

      <table className="tabla-asignaturas">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Periodo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaturasPaginadas.map(a => (
            <tr key={a.id}>
              <td>{a.nombre}</td>
              <td>{a.periodo}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditar(a)}>Editar</button>
                <button className="btn-eliminar" onClick={() => handleEliminar(a.nombre)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {asignaturasPaginadas.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>
                No se encontraron asignaturas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPaginas > 1 && (
        <div className="paginacion">
          <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
            ◀ Anterior
          </button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageAsignaturas;