# JavaScript Array to CSV
My roommate is learning HTML, and he asked me if there was a way to display information from a form in a spreadsheet. He's trying to do everything client side, so I wanted to see if I could come up with a way to dump an array of JavaScript objects to a CSV. Here's what I came up with.

### Object Parameters
In the past I've normally used regular, ordered parameters in my JavaScript functions. I decided to experiment with named parameters. In some cases it felt cumbersome having to repeat parameter names, but I did like how it felt to pass them in by name. And it was nice to be able to pass them in any order.

### Service Pattern
I originally wrote this as top-level functions, but I didn't like having functions named things like 'defaultKeys'. So I decided to group the functions into the three classes I ended up with.

## FileSaver
The biggest problem I saw was saving information from JavaScript to the user's computer. My solution to the issue is based on [this StackOverflow answer](https://stackoverflow.com/a/30832210). I haven't checked that it works on any browsers other than my own.

```JavaScript
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
```

It works by creating a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) with the data provided, creating a link to the blob, clicking the link to prompt the user to open/download the file, and removing the link from the document.

## ArrayToCSV
The next piece I worked converts the array of objects to a CSV string.

```JavaScript
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
```

### Columns
There are a couple of ways the columns can be generated. If an array called 'keys' is provided, it is used as the column array. Otherwise the columns are inferred by iterating the array and adding each object's keys to a key set, which is then used as the column array.

## SaveArrayAsCSV
It was then time to put the other two pieces together. I decided to default the filename to a time string with the .csv extension.

```JavaScript
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
```

