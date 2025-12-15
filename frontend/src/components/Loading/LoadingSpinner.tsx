import CircularProgress from '@mui/material/CircularProgress';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 'medium', fullPage = false }: LoadingSpinnerProps) {
  const sizeMap = {
    small: 30,
    medium: 50,
    large: 70,
  };

  if (fullPage) {
    return (
      <div className="loading-spinner-full-page">
        <CircularProgress
          size={sizeMap[size]}
          sx={{
            color: '#646cff',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="loading-spinner-container">
      <CircularProgress
        size={sizeMap[size]}
        sx={{
          color: '#646cff',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
    </div>
  );
}
