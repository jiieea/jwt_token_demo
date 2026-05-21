export class WebModel<T> {
  data?: T;
  page?: Paging;
}

export class Paging {
  size?: number;
  current_page?: number;
  total_page?: number;
}
