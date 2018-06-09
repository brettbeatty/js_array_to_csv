class ArrayToCSV {
  static call(args) {
    return new ArrayToCSV(args).call();
  }

  constructor({ array, keys }) {
    this.array = array;
    this.keys = keys;
  }

  call() {
    const { array } = this;
    let { keys } = this;
    if (keys === undefined) keys = this.defaultKeys();
    return [
      keys.map(JSON.stringify).join(','),
      ...array.map(object =>
        keys.map(key =>
          JSON.stringify(object[key])
        ).join(',')
      )
    ].join('\n');
  }

  defaultKeys() {
    const { array } = this;
    const keySet = new Set();
    array.forEach(object =>
      Object.getOwnPropertyNames(object).forEach(key =>
        keySet.add(key)
      )
    );
    return Array.from(keySet.keys());
  }
}

class SaveArrayAsCSV {
  static call(args) {
    return new SaveArrayAsCSV(args).call();
  }

  constructor({ array, fileName, keys }) {
    this.array = array;
    this.fileName = fileName;
    this.keys = keys;
  }

  call() {
    const { array, keys } = this;
    let { fileName } = this;
    if (fileName === undefined) fileName = this.defaultFileName();
    const csv = ArrayToCSV.call({ array, keys });
    FileSaver.call({
      data: [csv],
      fileName,
      type: 'text/csv;charset=utf-8'
    });
  }

  defaultFileName() {
    return `${new Date().valueOf().toString()}.csv`;
  }
}

class FileSaver {
  static call(args) {
    return new FileSaver(args).call();
  }

  constructor({ data, fileName, type }) {
    this.data = data;
    this.fileName = fileName;
    this.type = type;
  }

  call() {
    const { data, fileName, type } = this;
    const file = new Blob(data, { type });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

