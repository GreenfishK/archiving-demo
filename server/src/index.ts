import * as express from 'express'
import * as bodyParser from 'body-parser'
// @ts-expect-error
import * as cors from 'cors'

const app: express.Express = express()
const port = process.env.PORT ?? 3000

app.use('/', express.static('../client'))
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
  const responseObj = { answer: 'Your server will soon implement this functionality. Be patient!' }
  res.write(JSON.stringify(responseObj))
  res.end()
})
