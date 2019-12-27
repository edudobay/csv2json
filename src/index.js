function fieldAssigner(fieldSpec) {
  const parts = fieldSpec.split('.')
  const _assigners = []
  for (const part of parts) {
    if (/^\[.*]$/.test(part)) {
      const index = part.substring(1, part.length - 1)
      _assigners.push(assigners.arrayIndex(index))
    } else {
      _assigners.push(assigners.attr(part))
    }
  }

  if (!_assigners.length)
    return assigners.empty()

  return assigners.pipe(..._assigners)
}

const getters = {
  attribute(name) {
    return record => record != null ? record[name] : null
  },
}

const assigners = {
  empty() {
    return (record, value) => record
  },

  overwrite() {
    return (record, value) => value
  },

  attr(name) {
    return [
      (record, value) => ({ ...record, [name]: value }),
      getters.attribute(name)
    ]
  },

  arrayIndex(index) {
    return [
      (record, value) => {
        const output = record == null ? [] : [...record]
        output[index] = value
        return output
      },
      getters.attribute(index)
    ]
  },

  pipe(...elements) {
    // TODO: Behave correctly when only one (or zero) element is given
    const [lastAssigner, _] = elements.pop()
    const [assigner, getter] = elements.reduce(
      ([accAssigner, accGetter], [assigner, getter]) => [
        (record, value) => accAssigner(
          record,
          assigner(accGetter(record), value)
        ),
        getter
      ],
    )
    return (record, value) => assigner(record, lastAssigner(getter(record), value))
  },
}

class CSVReader {
  constructor({ separator } = {}) {
    this.separator = separator
    this.fields = null
    this.records = []
  }

  get headerWasRead() {
    return this.fields != null
  }

  readLine(line) {
    if (this.headerWasRead) {
      this._readRecord(line)
    } else {
      this._readHeader(line)
    }
  }

  _readHeader(line) {
    this.fields = line.split(this.separator).map(fieldSpec => fieldAssigner(fieldSpec))
  }

  _readRecord(line) {
    this.records.push(line.split(this.separator))
  }

  get rawRecords() {
    return [...this.records]
  }

  _assignRecord(record, field, value) {
    return {...record, [field]: value}
  }

  _formatRecord(rawRecord) {
    return this.fields.reduce((record, assigner, index) => assigner(record, rawRecord[index]), {})
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
