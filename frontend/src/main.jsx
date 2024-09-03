import ReactDOM from 'react-dom/client';
import React from 'react';
import MainRouter from './MainRouter';
import './index.css';

ReactDOM.createRoot(
    <React.StrictMode>
            <MainRouter />
    </React.StrictMode>,
    document.getElementById('root')
);