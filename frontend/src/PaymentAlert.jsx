import React, {useEffect} from 'react';
import './PaymentAlert.css';
import PropTypes from "prop-types";

const PaymentAlert = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose(); // закрываем уведомление через 3 секунды
            }, 3000);

            return () => clearTimeout(timer); // очищаем таймер при размонтировании компонента
        }
    }, [show, onClose]);

    return (
        show && (
            <div className="alert-container">
                <div className="alert-message">{message}</div>
            </div>
        )
    );
};

PaymentAlert.propTypes = {
    message: PropTypes.string.isRequired,  // message должен быть строкой
    show: PropTypes.bool.isRequired,       // show должен быть булевым значением
    onClose: PropTypes.func.isRequired,    // onClose должен быть функцией
};


export default PaymentAlert;
