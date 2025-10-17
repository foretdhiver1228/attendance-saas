import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api'; // Backend API base URL

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const jwtToken = await response.text(); // Backend returns JWT as plain text
                sessionStorage.setItem('jwtToken', jwtToken);
                setMessage('Login successful! Redirecting...');
                setTimeout(() => navigate('/'), 2000); // Redirect to home or dashboard
            } else {
                const errorData = await response.text(); // Assuming backend sends plain text error
                setMessage(errorData || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Network error during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Log In
                </Typography>
                <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Log In'}
                    </Button>
                    {message && (
                        <Alert severity={message.includes('successful') ? 'success' : 'error'}>
                            {message}
                        </Alert>
                    )}
                    <Box sx={{ mt: 2 }}>
                        <Link href="/signup" variant="body2">
                            {"Don't have an account? Sign Up"}
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
