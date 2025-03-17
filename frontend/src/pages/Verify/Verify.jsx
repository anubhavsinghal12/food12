import React, { useContext, useEffect } from 'react';
import './Verify.css';
import { useSearchParams } from 'react-router-dom';
import { StoreContext } from './../../components/context/StoreContext';
import axios from 'axios';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url } = useContext(StoreContext); // Ensure this has the correct backend URL

    const verifyPayment = async () => {
        if (!success || !orderId) {
            window.location.href = "https://food-del-7hph.onrender.com/"; // Redirect to homepage
            return;
        }

        try {
            const response = await axios.post(`${url}/api/order/verify`, { success, orderId });

            if (response.data.success) {
                window.location.href = "https://food-del-7hph.onrender.com/myorders"; // Redirect to orders page
            } else {
                window.location.href = "https://food-del-7hph.onrender.com/"; // Redirect to homepage if verification fails
            }
        } catch (error) {
            console.error("Payment verification failed:", error);
            window.location.href = "https://food-del-7hph.onrender.com/"; // Redirect on error
        }
    };

    useEffect(() => {
        verifyPayment();
    }, [success, orderId]); // Run only when params change

    return (
        <div className="verify">
            <div className="spinner"></div>
        </div>
    );
};

export default Verify;
