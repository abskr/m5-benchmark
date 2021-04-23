import express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
//ROUTES
import mediaRoutes from './media/index.js'
import reviewRoutes from './reviews/index.js'
//ERRORHANDLER
import {err400BadReqHandler, err404NotFoundHandler, err401UnauthorizedHandler, err403ForbidHandler, genericErrorHandler} from './errorHandlers.js'

const server = express()
const port = process.env.PORT || 5000

const whitelist = [process.env.FE_URL_DEV, process.env.FE_URL_PROD]

const corsOptions = {
  origin: function (origin, next) {
    if (whitelist.indexOf(origin) !== -1) {
      console.log("ORIGIN ", origin)
      // origin found in whitelist
      next(null, true)
    } else {
      // origin not found in the whitelist
      next(new Error("Not allowed by CORS"))
    }
  },
}

server.use(express.json())
server.use(express.urlencoded())
server.use(cors(corsOptions))

server.use('/media', mediaRoutes)
server.use('/reviews', reviewRoutes)

server.use(err400BadReqHandler)
server.use(err404NotFoundHandler)
server.use(err401UnauthorizedHandler)
server.use(err403ForbidHandler)
server.use(genericErrorHandler)

console.log(listEndpoints(server))
server.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    // no need to configure it manually on Heroku
    console.log("Server running on cloud on port: ", port)
  } else {
    console.log("Server running locally on port: ", port)
  }
})