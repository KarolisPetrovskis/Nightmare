import Snackbar from '@mui/joy/Snackbar';
import { useState, useEffect } from 'react';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarNotificationProps {
    open: boolean;
    onClose: () => void;
    message: string;
    type?: SnackbarType;
    autoHideDuration?: number;
}

export default function SnackbarNotification({
    open,
    onClose,
    message,
    type = 'success',
    autoHideDuration = 3000,
}: SnackbarNotificationProps) {
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    useEffect(() => {
        if (isOpen && autoHideDuration) {
            const timer = setTimeout(() => {
                setIsOpen(false);
                onClose();
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoHideDuration, onClose]);

    const alertColorMap: Record<SnackbarType, 'success' | 'danger' | 'warning' | 'neutral'> = {
        success: 'success',
        error: 'danger',
        warning: 'warning',
        info: 'neutral',
    };

    return (
<Snackbar
    open={isOpen}
    onClose={() => {
        setIsOpen(false);
        onClose();
    }}
    size="lg"
    variant="soft"
    color={alertColorMap[type]}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
    {message}
</Snackbar>

    );
}