// components/BandClaim.js
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, CircularProgress, Typography } from '@mui/material';

const BandClaim = ({ bandSlug, onClaimStatusChange }) => {
    const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if the current user owns the band
    useEffect(() => {
        const checkOwnership = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(`${process.env.REACT_APP_API_URL}/bands/${bandSlug}/check-ownership`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setIsOwner(data.isOwner);
            } catch (error) {
                console.error('Error checking band ownership:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            checkOwnership();
        } else {
            setLoading(false);
        }
    }, [bandSlug, isAuthenticated, getAccessTokenSilently]);

    const handleClaim = async () => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }

        try {
            setLoading(true);
            const token = await getAccessTokenSilently();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/bands/${bandSlug}/claim`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setIsOwner(true);
                if (onClaimStatusChange) {
                    onClaimStatusChange(true);
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to claim band');
            }
        } catch (error) {
            console.error('Error claiming band:', error);
            alert('Error claiming band');
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async () => {
        try {
            setLoading(true);
            const token = await getAccessTokenSilently();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/bands/${bandSlug}/release`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setIsOwner(false);
                if (onClaimStatusChange) {
                    onClaimStatusChange(false);
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to release band');
            }
        } catch (error) {
            console.error('Error releasing band:', error);
            alert('Error releasing band');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <CircularProgress size={24} />;
    }

    return (
        <div>
            {isOwner ? (
                <>
                    <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                        You manage this band
                    </Typography>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={handleRelease}
                        size="small"
                    >
                        Release Management
                    </Button>
                </>
            ) : (
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleClaim}
                    size="small"
                >
                    Claim Management
                </Button>
            )}
        </div>
    );
};

export default BandClaim;