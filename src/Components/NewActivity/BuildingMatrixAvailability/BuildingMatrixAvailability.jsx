import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './BuildingMatrixAvailability.css';

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const HORAS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

const alnumSort = (a,b) => a.localeCompare(b, 'es', { numeric:true, sensitivity:'base' });

const BuildingAvailabilityMatrix = () => {
  const location = useLocation();
  const edificio = new URLSearchParams(location.search).get('edificio');

  const [clases, setClases] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`https://localhost:7101/api/Aulas/clases/por-edificio/${edificio}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setClases(data);

        const aulasUnicas = [...new Set(data.map(c => c.aula))].sort(alnumSort);
        setAulas(aulasUnicas);
      } catch (err) {
        console.error('❌ Error al obtener clases del edificio:', err);
      }
    };
    if (edificio) fetchData();
  }, [edificio]);

  // Index: aula -> dia -> hora -> clase
  const index = useMemo(() => {
    const idx = {};
    for (const c of clases) {
      const aula = c.aula;
      const dia = c.dia;
      if (!idx[aula]) idx[aula] = {};
      if (!idx[aula][dia]) idx[aula][dia] = {};
      // marca ocupadas todas las horas dentro del rango [inicio, fin)
      for (const h of HORAS) {
        if (h >= c.horaInicio && h < c.horaFin) {
          idx[aula][dia][h] = c;
        }
      }
    }
    return idx;
  }, [clases]);

  // Capacidad por aula (si viene inconsistente en clases, toma el máximo encontrado)
  const capacidadPorAula = useMemo(() => {
    const cap = {};
    for (const c of clases) {
      if (c.capacidad != null) {
        cap[c.aula] = Math.max(cap[c.aula] ?? 0, Number(c.capacidad) || 0);
      }
    }
    return cap;
  }, [clases]);

  const renderCelda = (aula, hora) => {
    const clase = index[aula]?.[diaSeleccionado]?.[hora];
    if (clase) {
      return (
        <td className="celda-edificio-ocupada" key={`${aula}-${hora}`}>
          <div>
            {clase.asignatura}
            <small>{clase.profesor}</small>
          </div>
        </td>
      );
    }
    return <td className="celda-edificio-libre" key={`${aula}-${hora}`} />;
  };

  return (
    <div className="wrapper-matriz-edificio">
      <h2 className="h2">Matriz de Disponibilidad - Edificio {edificio}</h2>

      <div className="controles-edificio-select">
        <select value={diaSeleccionado} onChange={e => setDiaSeleccionado(e.target.value)}>
          {DIAS.map(dia => <option key={dia} value={dia}>{dia}</option>)}
        </select>
      </div>

      <div className="tabla-scroll-x">
        <table className="matriz-edificio-disponibilidad">
          <thead>
            <tr>
              <th className="hora-sticky">Hora</th>
              {aulas.map(aula => (
                <th key={aula}>
                  {aula}
                  <br />
                  <small>Cap: {capacidadPorAula[aula] ?? '—'} alumnos</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora, i) => (
              <tr key={hora}>
                <td className="hora-columna hora-sticky">
                  {`${hora} - ${HORAS[i + 1] || '21:00'}`}
                </td>
                {aulas.map(aula => renderCelda(aula, hora))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuildingAvailabilityMatrix;
