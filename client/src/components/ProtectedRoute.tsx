import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
    // ✨ [수정] JSX.Element 대신 React.ReactElement 사용
    children: React.ReactElement;
}

export default function ProtectedRoute({ children }: Props) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}