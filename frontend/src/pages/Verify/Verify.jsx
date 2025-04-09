import { useContext, useEffect, useState } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from './../../components/context/StoreContext';
import axios from 'axios';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { url } = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true; // Flag to prevent state updates if component unmounts

        const verifyPayment = async () => {
            const success = searchParams.get("success");
            const orderId = searchParams.get("orderId");

            if (!success || !orderId) {
                setError("Invalid payment details. Redirecting...");
                setTimeout(() => navigate('/'), 2000);
                return;
            }

            try {
                const { data } = await axios.post(`${url}api/order/verify`, { success, orderId });

                if (isMounted) {
                    if (data.success) {
                        navigate('/myorders');
                    } else {
                        setError("Payment verification failed. Redirecting...");
                        setTimeout(() => navigate('/'), 2000);
                    }
                }
            } catch (error) {
                console.error("Payment verification error:", error);
                if (isMounted) {
                    setError("Something went wrong. Redirecting...");
                    setTimeout(() => navigate('/'), 2000);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        verifyPayment();

        return () => {
            isMounted = false; // Cleanup function to prevent state updates
        };
    }, [searchParams, navigate, url]);

    return (
        <div className="verify">
            {loading ? (
                <div className="spinner"></div>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <p>Redirecting...</p>
            )}
        </div>
    );
};

export default Verify;
