import { json } from "@remix-run/node"
import { validate } from "./validators/validate"
import { Response } from "./handler.server"
import type { z } from "zod"

/**
 * Parses a multipart form data and validates it against the specified schema.
 * @async
 * @function formHandler
 * @param {Request} request - The HTTP request containing the form data to parse.
 * @param {z.ZodObject} schema - The Zod schema to validate the form data against.
 * @returns {Promise<object>} - A Promise that resolves to an object containing the parsed and validated form data.
 * @throws {Error} - Throws an error if the validation fails.
 */
export const formHandler = async (
  request: Request,
  schema: z.ZodObject<any>
) => {
  const form = await request.formData()
  let formData = Object.fromEntries(form) as any

  formData = JSON.parse(formData.data)
  console.dir(formData, { depth: null })
  const hasPhone = formData.hasOwnProperty("phone")
  Object.entries(formData).map(async ([key, value]: any) => {
    if (key === "roleId") {
      formData[key] = JSON.parse(value)
    }
  })
  if (hasPhone) {
    const parsedPhone = formData.phone.startsWith("+")
      ? formData.phone.slice(1)
      : formData.phone
    const phone = `251${
      parsedPhone.startsWith("0")
        ? parsedPhone.slice(1)
        : parsedPhone.startsWith("251")
        ? parsedPhone.slice(3)
        : parsedPhone
    }`
    formData = { ...formData, phone }
  }
  const { success, data, ...fieldError } = await validate(formData, schema)
  console.dir(fieldError, { depth: null })
  if (!success) {
    return json(
      Response({
        error: {
          fieldError,
          error: { message: "Validation error" },
        },
      }),
      { status: 422 }
    )
  }
  return { success, data }
}

/**
 * Parses a request's form data, optionally transforming a phone number to the Ethiopian format.
 *
 * @param {Request} request The incoming HTTP request.
 * @returns {Promise<{ data: any }>} A Promise that resolves to an object with a `data` property containing the parsed form data.
 */
export const requestFormHandler = async (request: Request) => {
  const form = await request.formData()
  let formData = Object.fromEntries(form) as any

  formData = JSON.parse(formData.data)
  console.dir(formData, { depth: null })
  const hasPhone = formData.hasOwnProperty("phone")

  if (hasPhone) {
    const parsedPhone = formData.phone.startsWith("+")
      ? formData.phone.slice(1)
      : formData.phone
    const phone = `251${
      parsedPhone.startsWith("0")
        ? parsedPhone.slice(1)
        : parsedPhone.startsWith("251")
        ? parsedPhone.slice(3)
        : parsedPhone
    }`
    formData = { ...formData, phone }
  }

  if (!Object.keys(formData).length) {
    return json(
      Response({
        error: {
          error: { message: "Invalid data" },
        },
      }),
      { status: 422 }
    )
  }
  return {
    data: formData,
  }
}
