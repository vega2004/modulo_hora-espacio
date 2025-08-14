// App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  FaBars,
  FaHome,
  FaCalendarAlt,
  FaDoorClosed,
  FaBookOpen,
  FaClock,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaCalendarCheck,
  FaDoorOpen,
  FaTools,
  FaSignOutAlt
} from 'react-icons/fa';

import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Main from './Components/Main/Main';
import TitleWithTransition from './Components/TitleWithTransition/TitleWithTransition';
import TransitionWrapper from './Components/TransitionWrapper/TransitionWrapper';
import ManageDocentes from './Components/NewActivity/NewTeacher/ManageDocentes';
import ManageAulas from './Components/NewActivity/NewClassroom/ManageAulas';
import ManageNivelAcademico from './Components/NewActivity/NewAcademicLevel/ManageNivelAcademico';
import ManageClases from './Components/NewActivity/NewClass/ManageClases';
import SelectBuilding from './Components/NewActivity/SelectBuilding/SelectBuilding';
import ClassroomAvailability from './Components/NewActivity/ClassroomAvailability/ClassroomAvailability';
import BuildingAvailabilityMatrix from './Components/NewActivity/BuildingMatrixAvailability/BuildingMatrixAvailability';
import ClassSearchReport from './Components/NewActivity/ClassSearchReport/ClassSearchReport';
import ManageAsignaturas from './Components/NewActivity/NewCourse/ManageAsignaturas';
import './App.css';
import logoUAEH from './Assets/logo_uaeh.png';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
  const [userName, setUserName] = useState(localStorage.getItem('nombre') || '');

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        userName={userName}
        setUserName={setUserName}
      />
    </Router>
  );
};

const AppContent = ({ isLoggedIn, setIsLoggedIn, userName, setUserName }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('nombre');
    setIsLoggedIn(false);
    setUserName('');
    setMenuOpen(false);
    navigate('/login');
  };

  const handleSuccessfulLogin = (token, nombre) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('nombre', nombre);
    setIsLoggedIn(true);
    setUserName(nombre);
    navigate('/Main');
  };

  return (
    <div className="app-wrapper">
      <nav className={`navbar ${isLoggedIn ? 'navbar-loggedin' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo-section">
            <img src={logoUAEH} alt="Logo UAEH" className="navbar-logo" />
          </div>

          <div className="navbar-content-section">
            <div className="navbar-title-container">
              {isLoggedIn ? (
                <h1 className="navbar-title">
                  Bienvenido,&nbsp;<strong>{userName}</strong>
                </h1>
              ) : (
                <h1 className="navbar-title">
                  <span>Elijo ser</span> <strong>Garza</strong>
                </h1>
              )}
            </div>

            {!isLoggedIn && (
              <ul className="navbar-menu">
                <li className="navbar-item">
                  <Link to="/Login" className="navbar-link">Iniciar Sesión</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/Register" className="navbar-link">Registrar</Link>
                </li>
              </ul>
            )}

            {isLoggedIn && (
              <button
                className="hamburger-btn"
                onClick={toggleMenu}
                aria-label="Abrir menú"
              >
                <FaBars size={28} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {isLoggedIn && (
        <aside className={`side-menu ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li className="menu-principal">
              <Link to="/Main" onClick={toggleMenu} className="menu-principal-link">
                <FaHome className="menu-icono-principal" />
                <span>Principal</span>
              </Link>
            </li>

            <li className="menu-spacer" />
            <li className="menu-section-title">Nuevo</li>

            <li><Link to="/ManageClases" onClick={toggleMenu}><FaClock className="menu-icon" />Clase</Link></li>
            <li><Link to="/ManageAulas" onClick={toggleMenu}><FaDoorClosed className="menu-icon" />Salón</Link></li>
            <li><Link to="/ManageAsignaturas" onClick={toggleMenu}><FaBookOpen className="menu-icon" />Asignatura</Link></li>
            <li><Link to="/ManageDocentes" onClick={toggleMenu}><FaChalkboardTeacher className="menu-icon" />Docente</Link></li>
            <li><Link to="/ManageNivelAcademico" onClick={toggleMenu}><FaGraduationCap className="menu-icon" />Carrera</Link></li>

            <li className="menu-spacer" />
            <li className="menu-section-title">Consultar</li>
            <li><Link to="/ClassSearchReport" onClick={toggleMenu}><FaCalendarCheck className="menu-icon" />Clases</Link></li>

            <li className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt className="menu-icon" />Cerrar Sesión
              </button>
            </li>
          </ul>
        </aside>
      )}

      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}

      <div className="main-content">

        <TransitionWrapper location={location}>
          <Routes location={location}>
            <Route path="/" element={<Login onLoginSuccess={handleSuccessfulLogin} />} />
            <Route path="/Login" element={<Login onLoginSuccess={handleSuccessfulLogin} />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Main" element={<Main />} />
            <Route path="/ManageDocentes" element={<ManageDocentes />} />
            <Route path="/ManageAulas" element={<ManageAulas />} />
            <Route path="/ManageNivelAcademico" element={<ManageNivelAcademico />} />
            <Route path="/ManageClases" element={<ManageClases />} />
            <Route path="/SelectBuilding" element={<SelectBuilding />} />
            <Route path="/ClassroomAvailability" element={<ClassroomAvailability />} />
            <Route path="/BuildingAvailabilityMatrix" element={<BuildingAvailabilityMatrix />} />
            <Route path="/ClassSearchReport" element={<ClassSearchReport />} />
            <Route path="/ManageAsignaturas" element={<ManageAsignaturas />} />
          </Routes>
        </TransitionWrapper>
      </div>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span className="site-footer__brand">UTTT · UAEH</span>
          <span className="site-footer__sep">•</span>
          <span>
            © {new Date().getFullYear()} Kevin Alexander Vega Zarza & Leonardo Isaac Barrera Tejeda — Proyecto de Estadía Universidad Tecnológica Tula-Tepeji para la Universidad Autónoma del Estado de Hidalgo, Campus Tepeji del Río. Todos los derechos reservados. Uso académico.
          </span>
          <span className="site-footer__sep">•</span>
          <a href="/aviso-legal">Aviso legal</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
