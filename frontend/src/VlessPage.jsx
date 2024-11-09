import {useEffect, useState} from 'react';
import { QRCode } from 'qrcode.react';
import './App.css';
import {useParams} from "react-router-dom";

function VlessSettings() {
    const { id } = useParams();
    const [copied, setCopied] = useState(false);
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
    ];


    const handleCopy = (link) => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const showQrCode = (link) => {
        setQrData(link);
        setQrVisible(true);
    };

    const closeQrPopup = () => setQrVisible(false);

    useEffect(() => {
        fetch(`https://test.root-vpn.ru/vless/conf/getinfo/${id}`).then(
            response => {
                if (!response.ok) {
                    throw new Error('Ошибка сети');
                }
                return response.json();
            }).then(data => {
            setUsername(data.username);
            setExpirationDate(data.expirationDate);
            setLinkVless(data.LinkVless)
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
                        <button onClick={() => handleCopy(link)} className="copy-button">
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button onClick={() => showQrCode(link)} className="qr-button">QR Code</button>
                    </li>
                ))}
            </ul>

            {qrVisible && (
                <div className="qr-popup">
                    <div className="qr-close-button">
                        <button onClick={closeQrPopup}>X</button>
                    </div>
                    <QRCode value={qrData} size={256} />
                </div>
            )}
        </div>
    );
}

export default VlessSettings;
