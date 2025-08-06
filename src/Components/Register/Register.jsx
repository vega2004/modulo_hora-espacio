import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (nombre.trim().length < 3 || apellidos.trim().length < 3) {
            setError("Nombre y apellidos deben tener al menos 3 caracteres.");
            setSuccess('');
            return;
        }

        if (!email.includes('@')) {
            setError("Correo inválido.");
            setSuccess('');
            return;
        }

        if (pass.trim().length < 8) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            setSuccess('');
            return;
        }

        if (pass !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            setSuccess('');
            return;
        }

        if ([nombre, apellidos, email, pass, confirmPassword].some(f => f.includes(' '))) {
            setError("Los campos no deben contener espacios.");
            setSuccess('');
            return;
        }

        setError('');
        setSuccess("¡Registro exitoso!");

        const userInfo = {
            nombre,
            apellidos,
            email,
            pass
        };

        // POST a la API
        try {
            const response = await fetch("https://localhost:7101/api/Usuarios/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userInfo),
            });

            if (response.status === 409) {
                const data = await response.json();
                setError(data.error || "El correo ya está registrado.");
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setSuccess("¡Registro exitoso!");
                navigate('/Login');
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Error al registrar.");
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            setError("Error de red. Intenta más tarde.");
        }
    };

    return (
        <div className='wrapper-registro'>
            <form onSubmit={handleSubmit}>
                <h1>Registro</h1>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="input-box-registro">
                    <FaUser className='icon-left' />
                    <input
                        type="text"
                        placeholder='Nombre'
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className="input-box-registro">
                    <FaUser className='icon-left' />
                    <input
                        type="text"
                        placeholder='Apellidos'
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        required
                    />
                </div>
                <div className="input-box-registro">
                    <FaEnvelope className='icon-left' />
                    <input
                        type="text"
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-box-registro">
                    <FaLock className='icon-left' />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder='Password'
                        value={pass}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                <div className="input-box-registro">
                    <FaLock className='icon-left' />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder='Confirm Password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>

                <button type="submit">Registrar</button>

                <div className="register-link-registro">
                    <p>Ya tienes una cuenta? <Link to="/Login">Inicia Sesión</Link></p>
                </div>
            </form>
        </div>
    );
};

export default Register;
