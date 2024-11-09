// import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import SuccessPage from './SuccessPage';
import CountryPage from "./CountryPage.jsx";
import VlessSettings from "./VlessPage.jsx";

function MainRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/country" element={<CountryPage />} />
                <Route path='/vless/conf/:id' element={<VlessSettings />}/>
            </Routes>
        </Router>
    );
}

export default MainRouter;
