import { Static, Type } from '@sinclair/typebox'
import { EmailSchema, StringSchema } from './common.js'

export const CredentialsSchema = Type.Object({
  email: EmailSchema,
  password: StringSchema
})

export type Credentials = Static<typeof CredentialsSchema>

export interface Auth {
  id: number
  username: string
  email: string
  roles: string[]
}
