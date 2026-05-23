export class WebModel<T> {
  data?: T;
  page?: Paging;
  errors?: string;
}

export class Paging {
  size?: number;
  total_item?: number;
  total_page?: number;
}
