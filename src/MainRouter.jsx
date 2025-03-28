// import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import SuccessPage from './SuccessPage';
import CountryPage from "./CountryPage.jsx";
import VlessSettings from "./VlessPage.jsx";
import ProtocolPage from "./ProtocolPage.jsx";
import DownloadLinks from "./DownloadLinks.jsx";
import OutlineSettings from "./OutlinePage.jsx";
import TvPage from "./TvPage.jsx";


function MainRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/country" element={<CountryPage />} />
                <Route path='/protocol' element={<ProtocolPage />} />
                <Route path='/vless' element={<VlessSettings />}/>
                <Route path='/outline' element={<OutlineSettings />}/>
                <Route path='/downloadapp' element={<DownloadLinks />} />
                <Route path={'/tv'} element={<TvPage />} />
            </Routes>
        </Router>
    );
}

export default MainRouter;
