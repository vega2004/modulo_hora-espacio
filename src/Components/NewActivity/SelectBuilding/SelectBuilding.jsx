import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectBuilding.css';
import Swal from 'sweetalert2';
import '../SweetAlertCss/sweetalert-custom.css';

import edificioA from './images/tepeji.jpg';
import edificioB from './images/tepeji.jpg';
import edificioC from './images/tepeji.jpg';
import edificioD from './images/tepeji.jpg';
import edificioE from './images/tepeji.jpg';
import edificioI from './images/tepeji.jpg';

const imagenesPorEdificio = {
  A: edificioA,
  B: edificioB,
  C: edificioC,
  D: edificioD,
  E: edificioE,
  I: edificioI
};

const SelectBuilding = () => {
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Bandera para evitar mostrar el Swal si ya está oculto
  const popupMostrado = useRef(false);

  useEffect(() => {
  const ejecutarPopup = async () => {
    const ocultar = localStorage.getItem('ocultarBienvenida');

    // ✅ Prevenir ejecución doble por React Strict Mode
    if (ocultar !== 'true' && !popupMostrado.current) {
      popupMostrado.current = true;

      const result = await Swal.fire({
        title: 'Selecciona un edificio',
        text: 'Consulta la disponibilidad de aulas y laboratorios',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Entendido',
        cancelButtonText: 'No volver a mostrar',
        position: 'center',
        customClass: {
          popup: 'swal-popup-universidad',
          title: 'swal-title-universidad',
          htmlContainer: 'swal-text-universidad',
          icon: 'swal-icon-universidad',
          confirmButton: 'btn-swal-confirmar',
          cancelButton: 'btn-swal-cancelar'
        },
        backdrop: 'rgba(0,0,0,0.4)'
      });

      if (result.dismiss === Swal.DismissReason.cancel) {
        localStorage.setItem('ocultarBienvenida', 'true');
      }
    }
  };

  ejecutarPopup();

    // Luego fetch de edificios
    const fetchEdificios = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('https://uaeh-control-bfbybef7bdhehkfz.mexicocentral-01.azurewebsites.net/api/Aulas/obtenerAulas', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error al obtener aulas');
        const data = await res.json();

        const edificiosUnicos = [...new Set(data.map(a => a.edificio))]
          .filter(Boolean)
          .map(edificio => ({
            nombre: `Edificio ${edificio}`,
            valor: edificio,
            imagen: imagenesPorEdificio[edificio] || edificioA
          }));

        setEdificios(edificiosUnicos);
      } catch (err) {
        console.error('Error al obtener edificios:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los edificios',
          timer: 2500,
          showConfirmButton: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEdificios();
  }, []);


  const handleSeleccion = (valor) => {
    navigate(`/ClassroomAvailability?edificio=${valor}`);
  };

  return (
    <section className="select-building-container">
      <h2 className="title">Selecciona un edificio</h2>
      <div className="grid-edificios">
        {loading ? (
          <p>Cargando edificios...</p>
        ) : (
          edificios.length === 0 ? (
            <p>No hay edificios disponibles.</p>
          ) : (
            edificios.map(ed => (
              <div key={ed.valor} className="card-edificio" onClick={() => handleSeleccion(ed.valor)}>
                <img src={ed.imagen} alt={ed.nombre} className="imagen-edificio" />
                <div className="nombre-edificio">{ed.nombre}</div>
              </div>
            ))
          )
        )}
      </div>
    </section>
  );
};

export default SelectBuilding;
