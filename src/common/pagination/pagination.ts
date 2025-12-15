export interface Pagination<Model> {
  items: Model[];
  meta: IPaginationMeta;
  links: IPaginationLinks;
}

export interface IPaginationMeta {
  itemCount: number;
  totalItems?: number;
  itemsPerPage: number;
  totalPages?: number;
  currentPage: number;
}

export interface IPaginationLinks {
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
}

export interface IPaginationOptions {
  route: string;
  page: number;
  limit: number;
}
