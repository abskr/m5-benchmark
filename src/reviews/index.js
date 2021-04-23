import { Router } from 'express'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import fs from 'fs-extra'
import uniqid from 'uniqid'
import multer from 'multer'
import { check, validationResult } from 'express-validator'

const router = Router()

const reviewsValidator = [
  check("comment").exists().withMessage("Please type something"),
  check("rate").isInt({min: 1, max:5}).exists().withMessage("Give a rate from 1 to 5!")
];

const mediaJson = join(dirname(fileURLToPath(import.meta.url)), '../data/jsonData/media.json')
const reviewsJson = join(dirname(fileURLToPath(import.meta.url)), '../data/jsonData/reviews.json')

router.get('/:imdbID', async (req, res, next) => {
  try {
    const reviews = await fs.readJson(reviewsJson)
    const reviewIndex = reviews.findIndex(review => review.imdbID === req.params.imdbID)
    if (reviewIndex !== -1) {
      res.status(200).send(reviews[reviewIndex])
    } else { 
      res.send('No comment found!')
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

router.post('/:imdbID', reviewsValidator, async(req, res, next) => {
  try {
    const validationErrors = validationResult(req)

    if (!validationErrors.isEmpty) {
      const error = new Error()
      error.httpStatusCode = 400
      error.message = validationErrors
      next(error)
    }
    const media = await fs.readJson(mediaJson)
    const mediumIndex = media.findIndex(medium => medium.imdbID === req.params.imdbID)
    //console.log(mediumIndex)
    if (mediumIndex !== -1) {
      const reviews = await fs.readJson(reviewsJson)
      const newReview = {
        ...req.body,
        _id: uniqid(),
        imdbID: req.params.imdbID,
        createdAt: new Date()
      }
      reviews.push(newReview)
      await fs.writeJson(reviewsJson, reviews)
      res.status(201).send({
        msg: "comment uploaded"
      })
    } else {
      const error = new Error({
        errMsg: "Medium not found!"
      })
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

router.put('/:imdbID/comment/:_id', async (req, res, next) => {
  try {
    const media = await fs.readJson(mediaJson)
    const mediumIndex = media.findIndex(medium => medium.imdbID === req.params.imdbID)
    if (mediumIndex <= -1) {
      const error = new Error({
        errMsg: "Medium not found!"
      })
      error.httpStatusCode = 404
      next(error)
    }

    const reviews = await fs.readJson(reviewsJson)
    const reviewIndex = reviews.findIndex(review => review.imdbID === req.params.imdbID)
    if (reviewIndex <= -1) {
       const error = new Error({
        errMsg: "Review not found!"
      })
      error.httpStatusCode = 404
      next(error)
    } else {
      const modReview = {
        ...req.body,
        imdbID: req.params.imdbID,
        _id: req.params._id,
        updatedAt: new Date()
      }
      const modReviews = reviews.filter(reviews => reviews._id !== req.params.id)

      modReviews.push(modReview)
      await fs.writeJson(reviewsJson, modReviews)
      res.send(modReview)
    }

    
  } catch (error) {
    console.lof(error)
    next(error)
  }
})

router.delete('/:imdbID/comment/:_id', async (req, res, next) => {
  try {
    const media = await fs.readJson(mediaJson)
    const findMedia = media.find(medium => medium.imdbID === req.params.imdbID)
    if (findMedia.length === 0) {
      const error = new Error({
        errMsg: "Medium not found!"
      })
      error.httpStatusCode = 404
      next(error)
    }

    const reviews = await fs.readJson(reviewsJson)
    const findReview = reviews.find(review => review._id === req.params._id)
    if (findReview.length === 0) {
      const error = new Error({
        errMsg: "Review not found!"
      })
      error.httpStatusCode = 404
      next(error)
    }
    const modReviews = reviews.filter(review => review._id !== req.params._id)
    await fs.writeJson(reviewsJson, modReviews)
    res.status(204)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default router