import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(connectionString)

async function runMigration() {
  try {
    const migrationFile = readFileSync(join(process.cwd(), 'lib/db/migrations/0000_organic_mathemanic.sql'), 'utf-8')
    
    // Split by statement breakpoint and execute each statement
    const statements = migrationFile.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean)
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement)
        console.log('Executed statement')
      }
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
