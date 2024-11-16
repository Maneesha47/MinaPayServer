import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('db.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE ,migrate  )
async function migrate() {
  const userTable = new Promise((resolve, reject) => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT
        )`, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
  })

  return Promise.all([userTable])
}



export default db