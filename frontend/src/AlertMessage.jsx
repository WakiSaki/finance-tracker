import { useState, useEffect } from "react";

function AlertMessage({ message, type }) {
    let bgColor;
    const [visible, setVisible] = useState(true);   // Track whether the message should be visible or not

    // Set the message to be invisible after 4 seconds, parent component undocks message
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 3000);
    }, []);

    // Set the background color based on the type of message
    if(type === "good") {
        bgColor = 'bg-green-500';
    } else if(type === "bad") {
        bgColor = 'bg-red-500';
    }

    return (
        <span
            className={`${bgColor} p-2 rounded-lg shadow-lg text-white
                        fixed top-5 right-5 text-center
                        transition-opacity duration-500
                        ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            {message}
        </span>
    );
}

export default AlertMessage;