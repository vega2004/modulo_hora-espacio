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
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const ClassroomAvailability = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const edificio = new URLSearchParams(location.search).get('edificio');

    const [aulas, setAulas] = useState([]);
    const [aulaSeleccionada, setAulaSeleccionada] = useState('');
    const [horarios, setHorarios] = useState([]);

    useEffect(() => {
        const fetchAulas = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(`https://localhost:7101/api/Aulas/clases/por-edificio/${edificio}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setAulas(data);
            } catch (err) {
                console.error('❌ Error al obtener aulas por edificio:', err);
            }
        };

        if (edificio) fetchAulas();
    }, [edificio]);

    useEffect(() => {
        const fetchHorario = async () => {
            if (!aulaSeleccionada) return;

            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(`https://localhost:7101/api/Clases/aula/${aulaSeleccionada}/horarios`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                console.log('✅ Horarios obtenidos del backend:', data);
                setHorarios(data);
            } catch (err) {
                console.error('❌ Error al obtener horario:', err);
            }
        };

        fetchHorario();
    }, [aulaSeleccionada]);

    const renderCelda = (dia, hora) => {
        const [slotInicio, slotFin] = hora.split(' - ');

        const clase = horarios.find(h => {
            const [claseInicio, claseFin] = h.horarios.split(' - ');
            return (
                normalizarTexto(h.dia) === normalizarTexto(dia) &&
                estaDentroDelRango(slotInicio, slotFin, claseInicio, claseFin)
            );
        });

        return (
            <td key={`${dia}-${hora}`} className={clase ? 'celda-reservada' : 'celda-disponible'}>
                {clase && (
                    <>
                        <div>{clase.asignatura}</div>
                        <small>{clase.profesor}</small>
                    </>
                )}
            </td>
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
                        {aulas.map((aula) => (
                            <option key={aula.idAula || aula.id} value={aula.idAula || aula.id}>
                                {aula.aula || aula.nombre}
                            </option>
                        ))}
                    </select>

                    <button onClick={irAVistaGeneral} className="btn-ver-disponibilidad">
                        Ver disponibilidad general del edificio
                    </button>
                </div>
            </div>

            {aulaSeleccionada && (
                <table className="matriz-disponibilidad-aulas">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            {DIAS.map((dia) => (
                                <th key={dia}>{dia}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {HORAS.map((hora) => (
                            <tr key={hora}>
                                <td className="hora-etiqueta">{hora}</td>
                                {DIAS.map((dia) => renderCelda(dia, hora))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ClassroomAvailability;
