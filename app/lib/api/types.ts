export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    size: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
} 