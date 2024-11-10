import {useEffect, useState} from 'react';
import axios from 'axios';
import {QRCodeSVG} from 'qrcode.react';
import './App.css';
import {useParams} from "react-router-dom";

function VlessSettings() {
    const { id } = useParams();
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [qrVisible, setQrVisible] = useState(false);
    const [qrData, setQrData] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [linkVless, setLinkVless] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const links = [
        linkVless,
        "False"
    ].filter(Boolean);  // Исключаем пустые значения

    const handleCopy = (link, index) => {
        navigator.clipboard.writeText(link);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const showQrCode = (link) => {
        setQrData(link);
        setQrVisible(true);
    };

    const closeQrPopup = () => setQrVisible(false);

    useEffect(() => {
        axios.get(`https://test.root-vpn.ru/vless/conf/getinfo/${id}`)
            .then(response => {
                const data = response.data;
                setUsername(data.username);
                setExpirationDate(data.expirationDate);
                setLinkVless(data.LinkVless);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="container">
            <h1>User Information</h1>
            <p>Username: {username}</p>
            <p>Status: <span className="status active">active</span></p>
            <p>Data Limit: ∞</p>
            <p>Data Used: 0 GB</p>
            <p>Expiration Date: {expirationDate}</p>

            <h2>Links:</h2>
            <ul>
                {links.map((link, index) => (
                    <li key={index}>
                        <input type="text" value={link} readOnly />
                        <button onClick={() => handleCopy(link, index)} className="copy-button">
                            {copiedIndex === index ? 'Copied!' : 'Copy'}
                        </button>
                        <button onClick={() => showQrCode(link)} className="qr-button">QR Code</button>
                    </li>
                ))}
            </ul>

            {qrVisible && qrData && (
                <div className="qr-popup">
                    <div className="qr-close-button">
                        <button onClick={closeQrPopup}>X</button>
                    </div>
                    <QRCodeSVG value={qrData} size={256} />
                </div>
            )}
        </div>
    );
}

export default VlessSettings;

