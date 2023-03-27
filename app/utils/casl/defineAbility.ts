import { createMongoAbility } from '@casl/ability'

export interface RawRule {
    action: string | string[]
    subject: string | string[]
    /** an array of fields to which user has (or not) access */
    fields?: string[]
    /** an object of conditions which restricts the rule scope */
    conditions?: any
    /** indicates whether rule allows or forbids something */
    inverted?: boolean
    /** message which explains why rule is forbidden */
    reason?: string
}

export const createAbility = (rules: RawRule[]) => createMongoAbility(rules)
