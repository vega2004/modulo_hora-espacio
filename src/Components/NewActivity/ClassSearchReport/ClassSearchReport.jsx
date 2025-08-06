import React, { useEffect, useState } from 'react';
import './ClassSearchReport.css';
import Swal from 'sweetalert2';

const ClasssearchReport = () => {
    const [filtros, setFiltros] = useState({
        nombreCurso: '',
        nombreProfesor: '',
        dia: '',
        grado: '',
        grupo: '',
        carrera: '',
        aula: '',
        horaInicio: '',
        horaFin: '',
        capacidad: ''
    });

    const [opciones, setOpciones] = useState({
        profesores: [],
        asignaturas: [],
        aulas: [],
        dias: [],
        nivelAcademico: []
    });

    const [horarios, setHorarios] = useState([]);
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);

    const generarHoras = (inicio = 7, fin = 21) => {
        const horas = [];
        for (let h = inicio; h <= fin; h++) {
            horas.push(`${h.toString().padStart(2, '0')}:00`);
        }
        return horas;
    };

    const cargarOpciones = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = { Authorization: `Bearer ${token}` };

            const endpoints = {
                profesores: '/api/Profesores/obtenerProfesores',
                asignaturas: '/api/Asignatura/obtenerAsignaturas',
                aulas: '/api/Aulas/obtenerAulas',
                dias: '/api/Dias/obtenerDias',
                nivelAcademico: '/api/NivelAcademico/obtenerNivelAcademico'
            };

            const results = await Promise.all(
                Object.entries(endpoints).map(async ([key, url]) => {
                    const res = await fetch(`https://localhost:7101${url}`, { headers });
                    const data = await res.json();
                    return [key, data];
                })
            );

            setOpciones(Object.fromEntries(results));
        } catch (err) {
            console.error('❌ Error al cargar opciones:', err);
        }
    };

    const obtenerTodasLasClases = async () => {
        setLoading(true);
        setBusquedaRealizada(false);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://localhost:7101/api/Clases/consultar/general', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error('Error al cargar todas las clases');
            const data = await response.json();
            setClases(data);
        } catch (error) {
            console.error('Error al obtener todas las clases:', error);
            alert('Hubo un error al cargar todas las clases.');
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');

            const {
                capacidad,
                ...otrosFiltros
            } = filtros;

            const filtrosConvertidos = {
                ...otrosFiltros,
                grado: filtros.grado !== '' ? parseInt(filtros.grado, 10) : undefined,
                horaInicio: filtros.horaInicio !== '' ? filtros.horaInicio : undefined,
                horaFin: filtros.horaFin !== '' ? filtros.horaFin : undefined,
                nombreCurso: filtros.nombreCurso || undefined,
                nombreProfesor: filtros.nombreProfesor || undefined,
                dia: filtros.dia || undefined,
                grupo: filtros.grupo || undefined,
                carrera: filtros.carrera || undefined,
                aula: filtros.aula || undefined
            };

            const filtrosLimpios = Object.fromEntries(
                Object.entries(filtrosConvertidos).filter(([_, v]) => v !== '' && v !== undefined)
            );

            const response = await fetch('https://localhost:7101/api/Clases/consultar/general', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(filtrosLimpios)
            });

            if (!response.ok) throw new Error('Error al consultar clases');
            let data = await response.json();

            // Aquí filtramos por capacidad manualmente
            if (capacidad !== '') {
                const capacidadNum = parseInt(capacidad, 10);
                data = data.filter(clase => parseInt(clase.capacidad) === capacidadNum);
            }

            setBusquedaRealizada(true);

            if (data.length === 0) {
                setClases([]);
                Swal.fire({
                    icon: 'info',
                    title: 'Sin coincidencias',
                    text: 'No se encontraron clases con los criterios seleccionados.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                setClases(data);
            }

        } catch (error) {
            console.error('Error al filtrar clases:', error);
            setClases([]);
            setBusquedaRealizada(true);
            Swal.fire({
                icon: 'info',
                title: 'Sin coincidencias',
                text: 'No se encontraron clases con los criterios seleccionados.',
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        cargarOpciones();
        setHorarios(generarHoras());
        obtenerTodasLasClases();
    }, []);

    const gradosUnicos = [...new Set(opciones.nivelAcademico.map(n => n.grado))];
    const gruposUnicos = [...new Set(opciones.nivelAcademico.map(n => n.grupo))];
    const carrerasUnicas = [...new Set(opciones.nivelAcademico.map(n => n.carrera))];

    return (
        <div className="classsearch-report-container">
            <h2 className="classsearch-title">Reporte de Clases</h2>

            <div className="classsearch-filters">
                <select name="nombreCurso" value={filtros.nombreCurso} onChange={handleChange}>
                    <option value="">Todas las asignaturas</option>
                    {opciones.asignaturas.map(a => (
                        <option key={a.id} value={a.nombre}>{a.nombre}</option>
                    ))}
                </select>
                <select name="nombreProfesor" value={filtros.nombreProfesor} onChange={handleChange}>
                    <option value="">Todos los profesores</option>
                    {opciones.profesores.map(p => (
                        <option key={p.id} value={`${p.nombre} ${p.apPaterno} ${p.apMaterno}`}>
                            {`${p.nombre} ${p.apPaterno} ${p.apMaterno}`}
                        </option>
                    ))}
                </select>
                <select name="dia" value={filtros.dia} onChange={handleChange}>
                    <option value="">Todos los días</option>
                    {opciones.dias.map(d => (
                        <option key={d.id} value={d.nombre}>{d.nombre}</option>
                    ))}
                </select>
                <select name="grado" value={filtros.grado} onChange={handleChange}>
                    <option value="">Todos los grados</option>
                    {gradosUnicos.map((g, i) => (
                        <option key={i} value={g}>{g}</option>
                    ))}
                </select>
                <select name="grupo" value={filtros.grupo} onChange={handleChange}>
                    <option value="">Todos los grupos</option>
                    {gruposUnicos.map((g, i) => (
                        <option key={i} value={g}>{g}</option>
                    ))}
                </select>
                <select name="carrera" value={filtros.carrera} onChange={handleChange}>
                    <option value="">Todas las carreras</option>
                    {carrerasUnicas.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                    ))}
                </select>
                <select name="aula" value={filtros.aula} onChange={handleChange}>
                    <option value="">Todas las aulas</option>
                    {opciones.aulas.map(a => (
                        <option key={a.id} value={a.nombre}>{a.nombre}</option>
                    ))}
                </select>
                <select name="horaInicio" value={filtros.horaInicio} onChange={handleChange}>
                    <option value="">Hora Inicio</option>
                    {horarios.map((h, i) => (
                        <option key={`ini-${i}`} value={h}>{h}</option>
                    ))}
                </select>
                <select name="horaFin" value={filtros.horaFin} onChange={handleChange}>
                    <option value="">Hora Fin</option>
                    {horarios.map((h, i) => (
                        <option key={`fin-${i}`} value={h}>{h}</option>
                    ))}
                </select>
                <select name="capacidad" value={filtros.capacidad} onChange={handleChange}>
                    <option value="">Todas las capacidades</option>
                    {[...new Set(opciones.aulas.map(a => a.capacidad))]
                        .filter(cap => cap !== null && cap !== undefined)
                        .map((cap, i) => (
                            <option key={i} value={String(cap)}>{cap}</option>
                        ))}
                </select>

                <button className="btn-buscar" onClick={handleBuscar} disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </div>

            <div className="tabla-resultados">
                <table className="classsearch-table">
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Día</th>
                            <th>Hora Inicio</th>
                            <th>Hora Fin</th>
                            <th>Profesor</th>
                            <th>Aula</th>
                            <th>Capacidad</th>
                            <th>Grado</th>
                            <th>Grupo</th>
                            <th>Carrera</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(clases.length === 0 && busquedaRealizada) ? (
                            <tr className="no-results-row">
                                <td colSpan="9">
                                    <div className="no-results-message">
                                        <img src="https://cdn-icons-png.flaticon.com/512/751/751463.png"
                                            alt="No resultados"
                                            className="no-results-icon"
                                            style={{ width: '64px', marginBottom: '10px' }}
                                        />
                                        <p>No se encontraron clases que coincidan con los criterios ingresados.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            clases.map((clase, index) => (
                                <tr key={index}>
                                    <td>{clase.nombreCurso}</td>
                                    <td>{clase.dia}</td>
                                    <td>{clase.horaInicio}</td>
                                    <td>{clase.horaFin}</td>
                                    <td>{clase.profesor}</td>
                                    <td>{clase.aula}</td>
                                    <td>{clase.capacidad}</td>
                                    <td>{clase.grado}</td>
                                    <td>{clase.grupo}</td>
                                    <td>{clase.carrera}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClasssearchReport;
