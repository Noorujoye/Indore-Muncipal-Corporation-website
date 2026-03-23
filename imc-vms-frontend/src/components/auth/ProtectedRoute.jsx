import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/apiClient';

let cachedMe = null;
let cachedMeAt = 0;
let inFlightMePromise = null;

const ME_CACHE_TTL_MS = 5000;

const clearCachedMe = () => {
    cachedMe = null;
    cachedMeAt = 0;
    inFlightMePromise = null;
};

const fetchMeCached = async () => {
    const now = Date.now();
    if (cachedMe && now - cachedMeAt < ME_CACHE_TTL_MS) return cachedMe;

    if (!inFlightMePromise) {
        inFlightMePromise = apiClient
            .get('/auth/me')
            .then((me) => {
                cachedMe = me;
                cachedMeAt = Date.now();
                return me;
            })
            .catch((err) => {
                clearCachedMe();
                throw err;
            })
            .finally(() => {
                inFlightMePromise = null;
            });
    }

    return inFlightMePromise;
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const [resolvedRole, setResolvedRole] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const resolveSession = async () => {
            try {
                const me = await fetchMeCached();
                const role = me?.role;
                const name = me?.name;

                if (!cancelled && role) {
                    setResolvedRole(role);
                    if (role === 'VENDOR') {
                        localStorage.removeItem('imc_role');
                        localStorage.setItem('user_role', 'VENDOR');
                    } else {
                        localStorage.removeItem('user_role');
                        localStorage.setItem('imc_role', role);
                    }
                    if (name) {
                        if (role === 'VENDOR') localStorage.setItem('vendor_name', name);
                        else localStorage.setItem('user_name', name);
                    }
                }
            } catch {
                if (!cancelled) {
                    setResolvedRole(null);
                }
                localStorage.removeItem('imc_role');
                localStorage.removeItem('user_role');
                localStorage.removeItem('vendor_name');
                localStorage.removeItem('user_name');
            } finally {
                if (!cancelled) setChecking(false);
            }
        };

        resolveSession();
        return () => { cancelled = true; };
    }, []);

    if (checking) return null;

    
    if (!resolvedRole) {
        if (location.pathname.startsWith('/vendor')) {
            return <Navigate to="/vendor/login" replace state={{ from: location }} />;
        }
        return <Navigate to="/imc/login" replace state={{ from: location }} />;
    }

    
    if (allowedRoles.length > 0) {
        
        
        

        
        
        if (!allowedRoles.includes(resolvedRole)) {
            
            if (resolvedRole === 'VENDOR') {
                return <Navigate to="/vendor/dashboard" replace />;
            } else if (['CREATOR', 'VERIFIER', 'APPROVER'].includes(resolvedRole)) {
                return <Navigate to="/imc/dashboard" replace />;
            } else {
                return <Navigate to="/" replace />;
            }
        }
    }

    
    return children;
};

export default ProtectedRoute;
