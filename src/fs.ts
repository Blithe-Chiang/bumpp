import fs from 'node:fs'
import path from 'node:path'
import * as jsonc from 'jsonc-parser'

/**
 * Describes a plain-text file.
 */
export interface TextFile {
  path: string
  data: string
}

/**
 * Modifies a JSON file.
 */
type ModifyUnion = [jsonc.JSONPath, unknown]

/**
 * Describes a JSON file.
 */
interface JsonFile {
  path: Readonly<string>
  text: Readonly<string>
  data: Readonly<unknown>
  modified: ModifyUnion[]
}

/**
 * Reads a JSON/JSONC file and returns the parsed data.
 */
export async function readJsoncFile(name: string, cwd: string): Promise<JsonFile> {
  const file = await readTextFile(name, cwd)
  const data = jsonc.parse(file.data)
  const modified: ModifyUnion[] = []

  return { ...file, data, modified, text: file.data }
}

/**
 * Writes the given data to the specified JSON/JSONC file.
 */
export async function writeJsoncFile(file: JsonFile): Promise<void> {
  let newJSON = file.text
  for (const [key, value] of file.modified) {
    const edit = (jsonc.modify(newJSON, key, value, {}))
    newJSON = jsonc.applyEdits(newJSON, edit)
  }

  return writeTextFile({ ...file, data: newJSON })
}

/**
 * Reads a text file and returns its contents.
 */
export function readTextFile(name: string, cwd: string): Promise<TextFile> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(cwd, name)

    fs.readFile(filePath, 'utf8', (err, text) => {
      if (err) {
        reject(err)
      }
      else {
        resolve({
          path: filePath,
          data: text,
        })
      }
    })
  })
}

/**
 * Writes the given text to the specified file.
 */
export function writeTextFile(file: TextFile): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(file.path, file.data, (err) => {
      if (err)
        reject(err)

      else
        resolve()
    })
  })
}
