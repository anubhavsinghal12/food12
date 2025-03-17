import React, { useContext, useEffect } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from './../../components/context/StoreContext';
import axios from 'axios';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            if (!success || !orderId) {
                console.warn("Missing success or orderId parameter, redirecting...");
                navigate('/'); // Redirect to homepage
                return;
            }

            try {
                const response = await axios.post(
                    `${url}/api/order/verify`,
                    { success, orderId },
                    { headers: { "Content-Type": "application/json" } } // Ensure JSON headers
                );

                if (response.data.success) {
                    console.log("Payment verified successfully, redirecting to orders...");
                    navigate('/myorders'); // Redirect to my orders
                } else {
                    console.warn("Payment verification failed, redirecting...");
                    navigate('/'); // Redirect to homepage
                }
            } catch (error) {
                console.error("Payment verification failed:", error.message);
                navigate('/');
            }
        };

        verifyPayment();
    }, [success, orderId, navigate, url]); // Ensure dependencies are correct

    return (
        <div className="verify">
            <div className="spinner"></div>
        </div>
    );
};

export default Verify;
