import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import 'dotenv/config'
// import db from './db/dbhelper.js'
import db from './db/helperv2.js'
import { generateKeyPair } from './utils/mina.js'
import { transpilePage } from './utils/transpiler.js'

const app = new Hono()

app.use('/*', cors())
app.post("/api/parsePage", async (c) => {
  const body = await c.req.json();
  const result = await transpilePage(body.apiUrl);
  return c.json({ success: true, message: result });
});

app.post("/api/get/address", async (c) => {
  const body = await c.req.json()
  const { username, name, email } = body
  console.log({ body });

  const user = await db.get('SELECT * FROM users WHERE username = ?', username)
  if (user) {
    return c.json({ user }, 200)
  }

  const keyPair = generateKeyPair()

  await db.run('INSERT INTO users (username,name, email, private_key, address) VALUES (?, ?, ?,?, ?)', 
  username, name||"" , email || "", keyPair.privateKey.toBase58(), keyPair.publicKey.toBase58())

  return c.json({ success: true, user : {
    username,
    private_key : keyPair.privateKey.toBase58(),
    address : keyPair.publicKey.toBase58()
  } }, 201)
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})