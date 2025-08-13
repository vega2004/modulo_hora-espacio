import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaSearch } from 'react-icons/fa';
import './ManageDocentes.css';

const ManageDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [form, setForm] = useState({ nombre: '', apPaterno: '', apMaterno: '' });
  const [busqueda, setBusqueda] = useState('');
  const [campoBusqueda, setCampoBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const cargarDocentes = async () => {
    try {
      const res = await fetch('https://uaeh-control-bfbybef7bdhehkfz.mexicocentral-01.azurewebsites.net/api/Profesores/obtenerProfesores', { headers });
      const data = await res.json();
      setDocentes(data);
      setPaginaActual(1);
    } catch (err) {
      console.error(err);
    }
  };

  const buscarDocentes = async () => {
    if (busqueda.trim() === '') {
      cargarDocentes();
      return;
    }

    try {
      const res = await fetch(`https://uaeh-control-bfbybef7bdhehkfz.mexicocentral-01.azurewebsites.net/api/Profesores/obtenerProfesores/${encodeURIComponent(busqueda)}`, { headers });
      const data = await res.json();

      if (campoBusqueda === '*' || campoBusqueda === '') {
        // Búsqueda global
        setDocentes(data);
      } else {
        // Filtro por campo específico
        const filtrados = data.filter((doc) => {
          const valor = doc[campoBusqueda]?.toLowerCase() || '';
          return valor.includes(busqueda.toLowerCase());
        });
        setDocentes(filtrados);
      }

      setPaginaActual(1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (busqueda.trim() === '') {
      cargarDocentes();
    }
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
        ? `https://uaeh-control-bfbybef7bdhehkfz.mexicocentral-01.azurewebsites.net/api/Profesores/modificar/${editandoId}`
        : 'https://uaeh-control-bfbybef7bdhehkfz.mexicocentral-01.azurewebsites.net/api/Profesores/crear/profesores';

      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Error al guardar docente');

      Swal.fire({
        icon: 'success',
        title: editandoId ? 'Docente actualizado' : 'Docente creado',
        timer: 1500,
        showConfirmButton: false
      });

      setForm({ nombre: '', apPaterno: '', apMaterno: '' });
      setEditandoId(null);
      cargarDocentes();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar docente' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (docente) => {
    setForm({
      nombre: docente.nombre,
      apPaterno: docente.apPaterno,
      apMaterno: docente.apMaterno
    });
    setEditandoId(docente.id);
  };

  const handleEliminar = async (docente) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar docente?',
      text: `${docente.nombre} ${docente.apPaterno} ${docente.apMaterno}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`https://uaeh-control-bfbybef7bdhehkfz.mexicocentral-01.azurewebsites.net/api/Profesores/eliminar/${docente.id}`, {
          method: 'DELETE',
          headers
        });
        if (!res.ok) throw new Error();
        Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1200, showConfirmButton: false });
        cargarDocentes();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar' });
      }
    }
  };

  const docentesPaginados = docentes.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);
  const totalPaginas = Math.ceil(docentes.length / elementosPorPagina);

  return (
    <div className="manage-docentes-container">
      <h2>Gestionar Docentes</h2>

      <form onSubmit={handleSubmit} className="form-nuevo-docente">
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input name="apPaterno" placeholder="Apellido Paterno" value={form.apPaterno} onChange={handleChange} required />
        <input name="apMaterno" placeholder="Apellido Materno" value={form.apMaterno} onChange={handleChange} required />
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

      <div className="barra-busqueda">
        <select
          value={campoBusqueda}
          onChange={(e) => setCampoBusqueda(e.target.value)}
          className="select-campo-busqueda"
        >
          <option value="" disabled>Filtrar por...</option>
          <option value="*">Todos los campos</option>
          <option value="nombre">Nombre</option>
          <option value="apPaterno">Apellido Paterno</option>
          <option value="apMaterno">Apellido Materno</option>
        </select>



        <input
          type="text"
          placeholder={`Buscar por ${campoBusqueda || 'todos los campos'}...`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button onClick={buscarDocentes} disabled={!busqueda.trim()}>
          <FaSearch style={{ marginRight: '6px' }} />
          Buscar
        </button>

      </div>

      <table className="tabla-docentes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido Paterno</th>
            <th>Apellido Materno</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {docentesPaginados.map(docente => (
            <tr key={docente.id}>
              <td>{docente.nombre}</td>
              <td>{docente.apPaterno}</td>
              <td>{docente.apMaterno}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditar(docente)}>Editar</button>
                <button className="btn-eliminar" onClick={() => handleEliminar(docente)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {docentesPaginados.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>No se encontraron docentes.</td>
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

export default ManageDocentes;
