import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import './Main.css';

import img1 from '../../Assets/img1.png';
import img2 from '../../Assets/img2.png';
import img3 from '../../Assets/img3.png';
import image1 from '../../Assets/image1.png';
import image2 from '../../Assets/image2.png';
import image3 from '../../Assets/image3.png';

const Main = () => {
  const navigate = useNavigate();
  const nombre = localStorage.getItem('nombre'); // por si lo quieres mostrar

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('nombre');
    navigate('/login');
  };

  return (
    <main className="main-content">
      {/* Carrusel responsivo (alto dinámico segun imagen) */}
      <div className="carousel-wrapper" aria-label="Anuncios y novedades">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          emulateTouch
          swipeable
          interval={4500}
          stopOnHover
          dynamicHeight     // 👈 que se ajuste al alto real de las imágenes
          renderIndicator={(onClickHandler, isSelected, index, label) => {
            // indicadores más visibles pero discretos
            const className = isSelected ? 'indicator selected' : 'indicator';
            return (
              <li
                className={className}
                onClick={onClickHandler}
                onKeyDown={onClickHandler}
                value={index}
                key={index}
                role="button"
                tabIndex={0}
                aria-label={`${label} ${index + 1}`}
              />
            );
          }}
        >
          <div>
            <img src={img1} alt="Promoción o anuncio 1" loading="lazy" />
          </div>
          <div>
            <img src={img2} alt="Promoción o anuncio 2" loading="lazy" />
          </div>
          <div>
            <img src={img3} alt="Promoción o anuncio 3" loading="lazy" />
          </div>
        </Carousel>
      </div>

      {/* Tarjetas responsivas */}
      <div className="cards-container" aria-label="Acciones rápidas">
        <div
          className="card"
          onClick={() => navigate('/ManageClases')}
          role="button"
          tabIndex={0}
          onKeyDown={(e)=> (e.key==='Enter'||e.key===' ') && navigate('/ManageClases')}
        >
          <img src={image1} alt="Asignación de aulas" className="card-image" loading="lazy" />
          <div className="card-footer">
            <h3 title="Asignación de Aulas">Asignación de Aulas</h3>
          </div>
        </div>

        <div
          className="card"
          onClick={() => navigate('/SelectBuilding')}
          role="button"
          tabIndex={0}
          onKeyDown={(e)=> (e.key==='Enter'||e.key===' ') && navigate('/SelectBuilding')}
        >
          <img src={image2} alt="Ver disponibilidad" className="card-image" loading="lazy" />
          <div className="card-footer">
            <h3 title="Ver Disponibilidad">Ver Disponibilidad</h3>
          </div>
        </div>

        <div
          className="card"
          onClick={() => navigate('/ClassSearchReport')}
          role="button"
          tabIndex={0}
          onKeyDown={(e)=> (e.key==='Enter'||e.key===' ') && navigate('/ClassSearchReport')}
        >
          <img src={image3} alt="Buscar clases" className="card-image" loading="lazy" />
          <div className="card-footer">
            <h3 title="Buscar Clases">Buscar Clases</h3>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Main;
