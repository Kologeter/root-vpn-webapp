import ReactDOM from 'react-dom/client';
import React from 'react';
import MainRouter from './MainRouter';
import './index.css';
import { CssBaseline } from "@mui/material";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <CssBaseline />
        <MainRouter />
    </React.StrictMode>
);
