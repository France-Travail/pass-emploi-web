import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'

/**
 * ⚠️ VULNERABILITY TEST FILE - FOR SAST TESTING ONLY
 * This file contains intentional security vulnerabilities to test CodeQL detection.
 * DO NOT USE IN PRODUCTION - DELETE AFTER TESTING
 */

// VULNERABILITY 1: Command Injection
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userInput = searchParams.get('filename')

  if (!userInput) {
    return NextResponse.json({ error: 'Missing filename parameter' })
  }

  // ⚠️ CRITICAL VULNERABILITY: Command injection via unsanitized user input
  // CodeQL should detect this as CWE-078 (OS Command Injection)
  return new Promise((resolve) => {
    exec(`ls -la ${userInput}`, (error, stdout, stderr) => {
      if (error) {
        resolve(
          NextResponse.json(
            { error: 'Command failed', details: error.message },
            { status: 500 }
          )
        )
      } else {
        resolve(
          NextResponse.json({
            output: stdout,
            warning: 'This endpoint has a critical security vulnerability!',
          })
        )
      }
    })
  })
}

// VULNERABILITY 2: Hardcoded credentials
const API_KEY = 'sk-1234567890abcdef-SECRET-TOKEN-HARDCODED' // CWE-798
const DATABASE_PASSWORD = 'SuperSecretPassword123!' // CWE-798

export async function POST(request: NextRequest) {
  // Simulate using the hardcoded credentials
  console.log('Using API key:', API_KEY)
  console.log('Database password:', DATABASE_PASSWORD)

  return NextResponse.json({
    message: 'This endpoint also contains hardcoded secrets!',
  })
}