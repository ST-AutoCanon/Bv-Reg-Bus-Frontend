export function Title(data: any = {}) {
    data.title = data.title || 'Default title';
    document.title = data.title;
  }