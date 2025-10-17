import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Container } from '@mui/material';

const MainLayout: React.FC = () => {
    return (
        <>
            <Header />
            <Container component="main" sx={{ mt: 4 }}>
                <Outlet />
            </Container>
        </>
    );
};

export default MainLayout;
