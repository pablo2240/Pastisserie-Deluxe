import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Pago = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/checkout', { replace: true });
    }, [navigate]);

    return null;
};

export default Pago;
