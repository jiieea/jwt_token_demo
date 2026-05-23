export class WebModel<T> {
  data?: T;
  message?: string;
  paging?: Page;
  errors?: string;
}

export class Page {
  pages: number;
  total_item: number;
  total_page: number;
}
