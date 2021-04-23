export const err404NotFoundHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 404) {
    res.status(404).send(err.message || "Error not found!")
  } else {
    next(err)
  }
}

export const err400BadReqHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 400) {
    res.status(400).send(err.errorList)
  } else {
    next(err)
  }
}

export const err403ForbidHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 403) {
    res.status(403).send("Forbidden!")
  } else {
    next(err)
  }
}

export const err401UnauthorizedHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 401) {
    res.status(401).send("Unauthorized!")
  } else {
    next(err)
  }
}

export const genericErrorHandler = (err, req, res, next) => {
  console.log(err)
  if (!res.headersSent) {
    res.status(500).send("Generic Server Error")
  } else {
    next()
  }
}