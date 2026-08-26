import React from 'react'
import { useNavigate } from 'react-router-dom'

const Contact = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Contact Page</h1>
            <br/>
            <div className="contact-buttons">
                <button className="btn button1" onClick={() => navigate('info') }>Contact Info</button>
                <button className="btn button1" onClick={() => navigate('form') }>Contact Form</button>
            </div>
        </div>
    )
}

export default Contact