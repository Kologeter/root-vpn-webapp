import ReactDOM from 'react-dom/client';
import React from 'react';
import MainRouter from './MainRouter';
import './index.css';
// import CssBaseline from '@mui/material/CssBaseline';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ScopedCssBaseline>
            <MainRouter />
        </ScopedCssBaseline>
        {/*<CssBaseline />*/}
        {/*<MainRouter />*/}
    </React.StrictMode>
);
