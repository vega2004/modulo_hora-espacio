import React, { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import './ManageClases.css';

const ManageClases = () => {
  const [form, setForm] = useState({
    idProfesor: '',
    idAsignatura: '',
    idNivelAcademico: '',
    idAula: '',
    horaInicio: '',
    horaFin: '',
    idDia: ''
  });

  const [opciones, setOpciones] = useState({
    profesores: [],
    asignaturas: [],
    niveles: [],
    aulas: [],
    dias: []
  });

  const [clases, setClases] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const formRef = useRef(null);
  const elementosPorPagina = 10;

  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const generarHoras = (inicio = 7, fin = 21) => {
    const horas = [];
    for (let h = inicio; h <= fin; h++) {
      horas.push(h.toString().padStart(2, '0') + ':00');
    }
    return horas;
  };

  const cargarOpciones = async () => {
    try {
      const endpoints = {
        profesores: '/api/Profesores/obtenerProfesores',
        asignaturas: '/api/Asignatura/obtenerAsignaturas',
        niveles: '/api/NivelAcademico/obtenerNivelAcademico',
        aulas: '/api/Aulas/obtenerAulas',
        dias: '/api/Dias/obtenerDias'
      };

      const resultados = await Promise.all(
        Object.entries(endpoints).map(async ([key, url]) => {
          const res = await fetch(`https://localhost:7101${url}`, { headers });
          const data = await res.json();
          return [key, data];
        })
      );

      setOpciones(Object.fromEntries(resultados));
    } catch (error) {
      console.error('Error al cargar opciones:', error);
    }
  };

  const cargarClases = async () => {
    try {
      const res = await fetch('https://localhost:7101/api/Clases/filtrar', {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      });
      const data = await res.json();
      setClases(Array.isArray(data) ? data : data.resultado || []);
    } catch (err) {
      console.error('Error al cargar clases:', err);
    }
  };

  const buscarClases = async () => {
    try {
      if (busqueda.trim() === '') {
        await cargarClases();
        return;
      }

      const campos = [
        'nombreCurso', 'nombreProfesor', 'dia', 'grupo',
        'carrera', 'aula', 'horaInicio', 'horaFin', 'grado', 'capacidad'
      ];

      let resultadosTotales = [];

      for (let campo of campos) {
        const body = {};

        // Agrega dinámicamente el campo con valor si aplica
        if (['grado', 'capacidad'].includes(campo)) {
          const numero = parseInt(busqueda);
          if (!isNaN(numero)) {
            body[campo] = numero;
          }
        } else {
          body[campo] = busqueda.trim();
        }

        const res = await fetch('https://localhost:7101/api/Clases/filtrar', {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const data = await res.json();
          const resultado = Array.isArray(data) ? data : data.resultado || [];
          resultadosTotales = [...resultadosTotales, ...resultado];
        }
      }

      // Eliminar duplicados por ID
      const clasesUnicas = resultadosTotales.filter(
        (item, index, self) => index === self.findIndex(t => t.id === item.id)
      );

      if (clasesUnicas.length > 0) {
        setClases(clasesUnicas);     // 🔥 Esto reemplaza completamente la lista
        setPaginaActual(1);          // ✅ Volver a la página 1
        document.querySelector('.tabla-clases')?.scrollIntoView({ behavior: 'smooth' }); // (opcional)
      } else {
        setClases([]);
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron clases con ese término.'
        });
      }

    } catch (err) {
      console.error('Error en búsqueda:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Falló la búsqueda.' });
    }
  };


  useEffect(() => {
    cargarOpciones();
    cargarClases();
  }, []);

  useEffect(() => {
    if (busqueda.trim() === '') {
      console.log('Busqueda vacía, recargando clases...');
      cargarClases();
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
        ? `https://localhost:7101/api/Clases/actualizar/${editandoId}`
        : `https://localhost:7101/api/Clases/crear/clases`;
      const method = editandoId ? 'PATCH' : 'POST';

      const body = {
        idProfesor: parseInt(form.idProfesor),
        idAsignatura: parseInt(form.idAsignatura),
        idNivelAcademico: parseInt(form.idNivelAcademico),
        idAula: parseInt(form.idAula),
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        idDia: parseInt(form.idDia)
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        icon: 'success',
        title: editandoId ? 'Clase actualizada' : 'Clase creada',
        timer: 1500,
        showConfirmButton: false
      });

      setForm({
        idProfesor: '',
        idAsignatura: '',
        idNivelAcademico: '',
        idAula: '',
        horaInicio: '',
        horaFin: '',
        idDia: ''
      });
      setEditandoId(null);
      cargarClases();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar clase' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (clase) => {
    console.log("Clase a editar:", clase);

    setEditandoId(clase.id);
    setForm({
      idProfesor: clase.idProfesor?.toString() || '',
      idAsignatura: clase.idAsignatura?.toString() || '',
      idNivelAcademico: clase.idNivelAcademico?.toString() || '',
      idAula: clase.idAula?.toString() || '',
      horaInicio: clase.horaInicio || '',
      horaFin: clase.horaFin || '',
      idDia: clase.idDia?.toString() || ''
    });

    setTimeout(() => {
      requestAnimationFrame(() => {
        if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
      });
    }, 0);
  };

  const handleEliminar = async (clase) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar clase?',
      text: 'Esta acción es irreversible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    });

    if (confirm.isConfirmed) {
      try {
        const url = `https://localhost:7101/api/Clases/eliminar/${clase.id}`;
        const res = await fetch(url, { method: 'DELETE', headers });

        if (!res.ok) throw new Error();

        Swal.fire({ icon: 'success', title: 'Clase eliminada', timer: 1200, showConfirmButton: false });
        cargarClases();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la clase' });
      }
    }
  };

  const horarios = generarHoras();
  const clasesPaginadas = Array.isArray(clases)
    ? clases.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina)
    : [];
  const totalPaginas = Math.ceil((Array.isArray(clases) ? clases.length : 0) / elementosPorPagina);

  return (
    <div className="manage-clases-container">
      <h2>Gestionar Clases</h2>

      <form ref={formRef} className="form-nueva-clase" onSubmit={handleSubmit}>
        <select name="idProfesor" value={form.idProfesor} onChange={handleChange} required>
          <option value="">Seleccione Profesor</option>
          {opciones.profesores.map(p => (
            <option key={p.id} value={p.id.toString()}>{`${p.nombre} ${p.apPaterno} ${p.apMaterno}`}</option>
          ))}
        </select>
        <select name="idAsignatura" value={form.idAsignatura} onChange={handleChange} required>
          <option value="">Seleccione Asignatura</option>
          {opciones.asignaturas.map(a => (
            <option key={a.id} value={a.id.toString()}>{a.nombre}</option>
          ))}
        </select>
        <select name="idNivelAcademico" value={form.idNivelAcademico} onChange={handleChange} required>
          <option value="">Seleccione Nivel Académico</option>
          {opciones.niveles.map(n => (
            <option key={n.id} value={n.id.toString()}>{`${n.tipo} - ${n.grado}° ${n.grupo} (${n.carrera})`}</option>
          ))}
        </select>
        <select name="idAula" value={form.idAula} onChange={handleChange} required>
          <option value="">Seleccione Aula</option>
          {opciones.aulas.map(a => (
            <option key={a.id} value={a.id.toString()}>{`${a.nombre} (cap. ${a.capacidad})`}</option>
          ))}
        </select>
        <select name="horaInicio" value={form.horaInicio} onChange={handleChange} required>
          <option value="">Hora Inicio</option>
          {horarios.map((h, i) => (
            <option key={i} value={h}>{h}</option>
          ))}
        </select>
        <select name="horaFin" value={form.horaFin} onChange={handleChange} required>
          <option value="">Hora Fin</option>
          {horarios.map((h, i) => (
            <option key={i} value={h}>{h}</option>
          ))}
        </select>
        <select name="idDia" value={form.idDia} onChange={handleChange} required>
          <option value="">Día</option>
          {opciones.dias.map(d => (
            <option key={d.id} value={d.id.toString()}>{d.nombre}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : editandoId ? 'Actualizar' : 'Agregar'}</button>
      </form>

      <div className="barra-busqueda">
        <input
          type="text"
          placeholder="Buscar ..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={buscarClases}>Buscar</button>
      </div>

      <table className="tabla-clases">
        <thead>
          <tr>
            <th>Profesor</th>
            <th>Asignatura</th>
            <th>Grupo</th>
            <th>Aula</th>
            <th>Día</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clasesPaginadas.map(clase => (
            <tr key={clase.id}>
              <td>{clase.profesor}</td>
              <td>{clase.nombreCurso}</td>
              <td>{clase.grupo}</td>
              <td>{clase.aula}</td>
              <td>{clase.dia}</td>
              <td>{clase.horaInicio}</td>
              <td>{clase.horaFin}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditar(clase)}>Editar</button>
                <button className="btn-eliminar" onClick={() => handleEliminar(clase)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {clasesPaginadas.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>No hay clases registradas.</td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPaginas > 1 && (
        <div className="paginacion">
          <button onClick={() => setPaginaActual(p => p - 1)} disabled={paginaActual === 1}>◀</button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual === totalPaginas}>▶</button>
        </div>
      )}
    </div>
  );
};

export default ManageClases;
