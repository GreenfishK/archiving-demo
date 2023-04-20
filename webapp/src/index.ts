import * as express from 'express'
import * as https from 'https'
import * as bodyParser from 'body-parser'
// @ts-expect-error
import * as cors from 'cors'
import { readFileSync } from 'fs'
import * as csv from 'csv-parse/sync'

interface Configuration {
  supportHttps: boolean
  httpsKeyFile: string
  httpsCertFile: string
  endpointAddress: string
  httpPort: number
  httpsPort: number
}

const configuration: Configuration = JSON.parse(readFileSync('./config/config.json').toString('utf8'))

const app: express.Express = express()

app.use('/', express.static('./public'))
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use('/lib/plotly/', express.static('node_modules/plotly.js-dist-min/'))
app.use('/lib/yasgui/', express.static('node_modules/@triply/yasgui/build/'))

if (configuration.supportHttps) {
  const key = readFileSync(configuration.httpsKeyFile)
  const cert = readFileSync(configuration.httpsCertFile)
  const httpsOptions = {
    key: key,
    cert: cert
  }
  https.createServer(httpsOptions, app).listen(configuration.httpsPort)
}

app.listen(configuration.httpPort, () => {
  console.log(`Listening on port ${configuration.httpPort}...`)
})

app.post('/', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`The client says:${req.body.message}`)
  const responseObj = { answer: 'Hello World from the server!' }
  res.send(JSON.stringify(responseObj))
  res.end()
})

app.post('/stats', (req, res) => {
  const statisticsBuffer = readFileSync('./data/stats1.csv').toString('utf8')
  const statistics = csv.parse(statisticsBuffer, { columns: true })
  const responseObj = { answer: statistics }
  res.write(JSON.stringify(responseObj))
  res.end()
})

app.post('/queries', (req, res) => {
  const queriesBuffer = readFileSync('./data/queries.json').toString('utf8')
  const queries = JSON.parse(queriesBuffer)
  const responseObj = { answer: queries }
  res.write(JSON.stringify(responseObj))
  res.end()
})

app.post('/snapshots', (req, res) => {
  const snapshots = [0, 5, 11, 19, 29]
  const versions = []
  for (let i = 0; i <= 32; i++) {
    versions.push(i)
  }
  const responseData = { snapshots, versions }
  const responseObj = { answer: responseData }
  res.write(JSON.stringify(responseObj))
  res.end()
})

// Proxy the sparql endpoint
app.post('/sparql', (req, res) => {
  const response = fetch('http://host.docker.internal:42564/sparql', {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/sparql-query', Accept: 'application/sparql-results+json' },
    body: req.body.query
  })
  response.then(result => {
    result.text().then(txt => {
      res.write(txt)
      res.end()
    }).catch(error => {
      console.error(error)
    })
  }).catch(error => {
    console.error(error)
  })
})
