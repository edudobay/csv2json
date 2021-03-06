export function fieldAssigner(fieldSpec: string): RecursiveAssigner {
  const parts = fieldSpec.split('.')
  const _assigners = []
  for (const part of parts) {
    if (/^\[\d+]$/.test(part)) {
      const index = Number(part.substring(1, part.length - 1))
      _assigners.push(assigners.arrayIndex(index))
    } else {
      _assigners.push(assigners.attr(part))
    }
  }

  if (!_assigners.length)
    return assigners.empty()

  return assigners.pipe(..._assigners)
}

// TODO: Improve type safety
type Record = any;
type Value = any;

type FnAssign = (record: Record, value: Value) => Value;
type FnGet = (record: Record) => Value;

interface Assigner {
  assign: FnAssign;
}

class RecursiveAssigner implements Assigner {
  public readonly assign: FnAssign;
  public readonly get: FnGet;

  constructor( assign: FnAssign, get: FnGet ) {
    this.assign = assign;
    this.get = get;
  }
}

const getters = {
  attribute(name: string|number) {
    return record => record != null ? record[name] : null
  },
}

const assigners = {
  empty() {
    return new RecursiveAssigner(
      (record: Record, value: Value) => record,
      (record) => null
    )
  },

  attr(name: string) {
    return new RecursiveAssigner(
      (record, value) => ({ ...record, [name]: value }),
      getters.attribute(name)
    )
  },

  arrayIndex(index: number) {
    return new RecursiveAssigner(
      (record, value) => {
        const output = record == null ? [] : [...record]
        output[index] = value
        return output
      },
      getters.attribute(index)
    )
  },

  pipe(...assigners: RecursiveAssigner[]): RecursiveAssigner {
    if (!assigners.length) {
      throw new Error('pipe must be called with at least 1 argument')
    } else if (assigners.length === 1) {
      return assigners[0]
    }
    return assigners.reduce(
      (acc, next) => new RecursiveAssigner(
        (record, value) => acc.assign(
          record,
          next.assign(
            acc.get(record),
            value
        )),
        record => next.get(acc.get(record))
      ),
    )
  },
}

export class CSVReader {
  private separator: string;
  private fields: RecursiveAssigner[];
  private records: string[][];

  constructor({ separator }: { separator: string }) {
    this.separator = separator;
    this.fields = [];
    this.records = [];
  }

  get headerWasRead() {
    return this.fields != null
  }

  readLine(line: string) {
    if (this.headerWasRead) {
      this._readRecord(line)
    } else {
      this._readHeader(line)
    }
  }

  _readHeader(line: string) {
    this.fields = line.split(this.separator).map(fieldSpec => fieldAssigner(fieldSpec))
  }

  _readRecord(line: string) {
    this.records.push(line.split(this.separator))
  }

  get rawRecords() {
    return [...this.records]
  }

  _assignRecord(record, field, value) {
    return {...record, [field]: value}
  }

  _formatRecord(rawRecord: string[]) {
    return this.fields.reduce((record, assigner, index) => assigner.assign(record, rawRecord[index]), {})
  }

  getRecords() {
    return this.records.map(record => this._formatRecord(record))
  }
}

module.exports = {
  assigners,
  getters,
  CSVReader,
  fieldAssigner,
}
