import { useContext, useEffect } from 'react';
import './Verify.css';
import { useSearchParams } from 'react-router-dom';
import { StoreContext } from './../../components/context/StoreContext';
import axios from 'axios';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url } = useContext(StoreContext);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!success || !orderId) {
                console.warn("Missing success or orderId parameter, redirecting...");
                window.location.href = "https://food-del-7hph.onrender.com/"; // Redirect to homepage
                return;
            }

            try {
                const response = await axios.post(
                    `${url}/api/order/verify`,
                    { success, orderId },
                    { headers: { "Content-Type": "application/json" } }
                );

                if (response.data.success) {
                    console.log("Payment verified successfully, redirecting to my orders...");
                    window.location.href = "https://food-del-7hph.onrender.com/myorders"; // Redirect to my orders
                } else {
                    console.warn("Payment verification failed, redirecting...");
                    window.location.href = "https://food-del-7hph.onrender.com/"; // Redirect to homepage
                }
            } catch (error) {
                console.error("Payment verification failed:", error.message);
                window.location.href = "https://food-del-7hph.onrender.com/"; // Redirect to homepage
            }
        };

        verifyPayment();
    }, [success, orderId, url]);

    return (
        <div className="verify">
            <div className="spinner"></div>
        </div>
    );
};

export default Verify;
