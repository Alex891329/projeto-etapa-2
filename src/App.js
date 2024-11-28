import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './componentes/Login';
import Registro from './componentes/Registro';
import Mapas from "./componentes/Mapas";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Registro" element={<Registro />} />
                <Route path="/Mapas" element={<Mapas />} />
            </Routes>
        </Router>
    );
}

export default App;
