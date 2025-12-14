import Pagination from '@mui/material/Pagination';
import './PaginationComponent.css';

export interface PaginationComponentProps {
    count: number;
    page: number;
    onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

export default function PaginationComponent({
    count,
    page,
    onChange,
}: PaginationComponentProps) {
    return (
        <div className="pagination-wrapper">
            <Pagination
                count={count}
                page={page}
                onChange={onChange}
                variant="outlined"
                color="secondary"
                className="dish-pagination"
            />
        </div>
    );
}