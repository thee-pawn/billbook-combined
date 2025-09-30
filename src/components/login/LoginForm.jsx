/**
 * Login form component
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormInput, PhoneInput, Button, ErrorMessage } from '../common';

const LoginForm = ({ onSubmit, isLoading, errorMessage, onForgotPassword, onSignUp }) => {
    const [credentials, setCredentials] = useState({
        countryCode: '+91',
        phone: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleCountryCodeChange = (e) => {
        setCredentials(prev => ({ ...prev, countryCode: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            phone: credentials.countryCode + credentials.phone,
            password: credentials.password
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login</h2>

            <ErrorMessage message={errorMessage} />

            <PhoneInput
                value={credentials.phone}
                onChange={handleChange}
                countryCode={credentials.countryCode}
                onCountryCodeChange={handleCountryCodeChange}
                required
            />

            <FormInput
                type="password"
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                required
            />

            <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
            >
                {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="flex items-center justify-between mt-4">
                <div className="flex-shrink-0">
                    <Button variant="link" onClick={onForgotPassword}>
                        Forgot Password?
                    </Button>
                </div>
                <div className="flex flex-row items-center text-sm text-gray-600">
                    <span>New user? </span><span>
                    <Button variant="link" onClick={onSignUp} className="font-semibold">
                        Sign up
                        </Button>
                        </span>
                </div>
            </div>
        </form>
    );
};

LoginForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    errorMessage: PropTypes.string,
    onForgotPassword: PropTypes.func.isRequired,
    onSignUp: PropTypes.func.isRequired
};

export default LoginForm;
