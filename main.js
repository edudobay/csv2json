const readline = require('readline')
const stream = require('stream')
const { CSVReader } = require('./src/index')

function main() {
  const reader = readline.createInterface({
    input: process.stdin,
    output: stream.Writable(),
    terminal: false,
  })

  const csvReader = new CSVReader({ separator: '\t' })

  function finish(csvReader) {
    let records = csvReader.getRecords().map(record => ({
      events: [{
        ...record.event,
        accessKey: null,
      }],
      pod: record.pod
    }))

    records.forEach(record =>
      console.log(JSON.stringify(record))
    )
  }

  reader.on('line', line => {
    csvReader.readLine(line)
  })

  reader.on('close', () => {
    finish(csvReader)
  })
}

main()
