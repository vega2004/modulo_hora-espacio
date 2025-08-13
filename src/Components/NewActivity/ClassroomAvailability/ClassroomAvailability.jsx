import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ClassroomAvailability.css';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS = [
    '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00',
    '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
    '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
    '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00',
    '19:00 - 20:00', '20:00 - 21:00'
];

const estaDentroDelRango = (slotInicio, slotFin, claseInicio, claseFin) => {
    return claseInicio <= slotInicio && slotFin <= claseFin;
};

const normalizarTexto = (texto) =>
    (texto || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();


const ClassroomAvailability = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const edificio = new URLSearchParams(location.search).get('edificio');

    const [aulas, setAulas] = useState([]);
    const [aulaSeleccionada, setAulaSeleccionada] = useState('');
    const [todasLasClases, setTodasLasClases] = useState([]);
    const [horarios, setHorarios] = useState([]);

    useEffect(() => {
        const fetchAulas = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(`https://uaeh-control-bfbybef7bdhehkfz.mexicocentral-01.azurewebsites.net/api/Aulas/clases/por-edificio/${edificio}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();
                console.log('🧪 Datos de aulas por edificio:', data);

                if (Array.isArray(data)) {
                    const aulasUnicas = [];
                    const idsRegistrados = new Set();

                    data.forEach(aula => {
                        if (!idsRegistrados.has(aula.idAula)) {
                            idsRegistrados.add(aula.idAula);
                            aulasUnicas.push({
                                idAula: aula.idAula,
                                aula: aula.aula
                            });
                        }
                    });

                    setAulas(aulasUnicas);
                    setTodasLasClases(data);
                } else {
                    setAulas([]);
                    setTodasLasClases([]);
                }
            } catch (err) {
                console.error('❌ Error al obtener aulas:', err);
                setAulas([]);
                setTodasLasClases([]);
            }
        };

        if (edificio) fetchAulas();
    }, [edificio]);

    // ✅ Filtrar clases por aula seleccionada
    useEffect(() => {
        if (!aulaSeleccionada) {
            setHorarios([]);
            return;
        }

        const clasesFiltradas = todasLasClases.filter(
            (clase) => clase.idAula === parseInt(aulaSeleccionada)
        );
        setHorarios(clasesFiltradas);
    }, [aulaSeleccionada, todasLasClases]);

    const renderCelda = (dia, hora) => {
        const [slotInicio, slotFin] = hora.split(' - ');

        const clase = horarios.find(h => {
            if (!h || !h.dia || !h.horaInicio || !h.horaFin) return false;
            return (
                normalizarTexto(h.dia) === normalizarTexto(dia) &&
                estaDentroDelRango(slotInicio, slotFin, h.horaInicio, h.horaFin)
            );
        });

        if (clase) {
            const titulo = `${clase.asignatura ?? ''} — ${clase.profesor ?? ''}`;
            return (
                <td
                    key={`${dia}-${hora}`}
                    className="celda-reservada"
                    title={titulo}
                >
                    <div>{clase.asignatura}</div>
                    <small>{clase.profesor}</small>
                </td>
            );
        }

        return (
            <td
                key={`${dia}-${hora}`}
                className="celda-disponible"
                title="Disponible"
            />
        );
    };

    const irAVistaGeneral = () => {
        navigate(`/BuildingAvailabilityMatrix?edificio=${edificio}`);
    };

    return (
        <div className="wrapper-select-aulas">
            <h2 className="titulo-matriz-aulas">Disponibilidad de Aulas - Edificio {edificio}</h2>

            <div className="seccion-controles-aulas">
                <button className="btn-volver-panel" onClick={() => navigate('/Main')}>
                    ⬅ Inicio
                </button>

                <div className="acciones-derecha-aulas">
                    <select
                        value={aulaSeleccionada}
                        onChange={(e) => setAulaSeleccionada(e.target.value)}
                    >
                        <option value="">Seleccione un aula</option>
                        {Array.isArray(aulas) && aulas.length > 0 ? (
                            aulas.map((aula) => (
                                <option key={aula.idAula} value={aula.idAula}>
                                    {aula.aula}
                                </option>
                            ))
                        ) : (
                            <option disabled>No hay aulas disponibles</option>
                        )}
                    </select>

                    <button onClick={irAVistaGeneral} className="btn-ver-disponibilidad">
                        Ver disponibilidad general del edificio
                    </button>
                </div>
            </div>

            {aulaSeleccionada && (
                <div className="tabla-scroll-x">
                    <table className="matriz-disponibilidad-aulas">
                        <thead>
                            <tr>
                                <th className="hora-sticky">Hora</th>
                                {DIAS.map((dia) => <th key={dia}>{dia}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {HORAS.map((hora) => (
                                <tr key={hora}>
                                    <td className="hora-etiqueta hora-sticky">{hora}</td>
                                    {DIAS.map((dia) => renderCelda(dia, hora))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClassroomAvailability;
