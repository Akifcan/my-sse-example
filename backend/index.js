const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = 3000

const clients = []
const facts = []

function sendEventsToAll(newFact, channel) {
    clients.filter(x => x.channel === channel).forEach(client => client.response.write(`data: ${JSON.stringify(newFact)}\n\n`))
}

app.get('/status', (request, response) => response.json({ clients: clients.length }))

app.get('/events/:channel', (request, response) => {
    console.log(request.params.channel)
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
    }
    response.writeHead(200, headers)
    channel = request.params.channel
    const clientId = Date.now()
    const newClient = {
        id: clientId,
        response,
        channel: request.params.channel
    }
    console.log(`joined channel! ${channel}`);
    clients.push(newClient)
    request.on('close', () => {
        console.log(`${clientId} Connection closed`)
        clients.filter(client => client.id !== clientId)
    })
})

app.post('/fact', (request, response) => {
    const newFact = request.body.fact
    const channel = request.body.channel
    facts.push(newFact)
    response.json(newFact)
    return sendEventsToAll(newFact, channel)
})

app.listen(PORT, () => {
    console.log(`Facts Events service listening at http://localhost:${PORT}`)
})
