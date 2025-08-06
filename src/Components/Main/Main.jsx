import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel'; // ← nuevo
import "react-responsive-carousel/lib/styles/carousel.min.css"; // ← nuevo
import './Main.css';
import img1 from '../../Assets/img1.png';
import img2 from '../../Assets/img2.png';
import img3 from '../../Assets/img3.png';
import image1 from '../../Assets/image 1.png';
import image2 from '../../Assets/image 2.png';
import image3 from '../../Assets/image 3.png';

const Main = () => {
    const navigate = useNavigate();
    const nombre = localStorage.getItem('nombre');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('nombre');
        navigate('/login');
    };

    return (
        <main className="main-content">
            <div className="carousel-wrapper">
                <Carousel autoPlay infiniteLoop showThumbs={false}>
                    <div>
                        <img src={img1} alt="Slide 1" />
                    </div>
                    <div>
                        <img src={img2} alt="Slide 1" />
                    </div>
                    <div>
                        <img src={img3} alt="Slide 1" />
                    </div>
                </Carousel>
            </div>

            <div className="cards-container">
                <div className="card" onClick={() => navigate('/ManageClases')}>
                    <img src={image1} alt="Slide 1" className="card-image" />
                    <div className="card-footer">
                        <h3>Asignación de Aulas</h3>
                    </div>
                </div>

                <div className="card" onClick={() => navigate('/SelectBuilding')}>
                    <img src={image2} alt="Slide 1" className="card-image" />
                    <div className="card-footer">
                        <h3>Ver Disponibilidad</h3>
                    </div>
                </div>

                <div className="card" onClick={() => navigate('/ClassSearchReport')}>
                    <img src={image3} alt="Slide 1" className="card-image" />
                    <div className="card-footer">
                        <h3>Buscar Clases</h3>
                    </div>
                </div>
            </div>

        </main>
    );
};

export default Main;
