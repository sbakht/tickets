import {
  createError,
  createEventStream,
  defineEventHandler,
  getMethod,
  getRequestURL,
  getRouterParam,
  readBody
} from 'h3'

Object.assign(globalThis, {
  defineEventHandler,
  getRouterParam,
  createError,
  readBody,
  getMethod,
  getRequestURL,
  createEventStream
})
