import * as express from 'express'
import * as bodyParser from 'body-parser'
// @ts-expect-error
import * as cors from 'cors'
import { readFileSync } from 'fs'
import * as csv from 'csv-parse/sync'

const app: express.Express = express()
const port = process.env.PORT ?? 3000

app.use('/', express.static('./public'))
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.listen(port, () => {
  console.log(`Listening on port ${port}...`)
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
  const statistics = csv.parse(statisticsBuffer)
  const responseObj = { answer: statistics }
  res.write(JSON.stringify(responseObj))
  res.end()
})
