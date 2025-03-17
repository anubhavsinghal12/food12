import React, { useContext, useEffect, useState } from 'react';
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
        const verifyPayment = async () => {
            const success = searchParams.get("success");
            const orderId = searchParams.get("orderId");

            if (!success || !orderId) {
                setTimeout(() => navigate('/'), 1000); // Avoid immediate navigation
                return;
            }

            try {
                const response = await axios.post(`${url}/api/order/verify`, { success, orderId });
                
                if (response.data.success) {
                    navigate('/myorders');
                } else {
                    setError("Payment verification failed. Redirecting...");
                    setTimeout(() => navigate('/'), 2000);
                }
            } catch (error) {
                console.error("Payment verification failed:", error);
                setError("Something went wrong. Redirecting...");
                setTimeout(() => navigate('/'), 2000);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, []); // Run only once on mount

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
