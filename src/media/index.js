import { Router } from 'express'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import fs from 'fs-extra'
import uniqid from 'uniqid'
import multer from 'multer'
import { check, validationResult } from 'express-validator'

const router = Router()

const movieValidator = [
  check("Title").exists().withMessage("The media's title is required"),
  check("Year").isInt().exists().withMessage("A year is required: YYYY"),
  check("Type").exists().withMessage("Let us know what type of media this is"),
];

const mediaJson = join(dirname(fileURLToPath(import.meta.url)), '../data/jsonData/media.json')
const reviewsJson = join(dirname(fileURLToPath(import.meta.url)), '../data/jsonData/reviews.json')

router.get('/', async (req, res, next) => {
  try {
    const media = await fs.readJson(mediaJson)
    res.status(200).send(media)
  } catch(error){
    console.log(error)
    next(error)
  }
})

// {
//   "Title": "The Lord of the Rings: The Fellowship of the Ring",
//   "Year": "2001",
//   "imdbID": "tt0120737", //UNIQUE
//   "Type": "movie",
//   "Poster": "https://m.media-amazon.com/images/M/MV5BMTM5MzcwOTg4MF5BMl5BanBnXkFtZTgwOTQwMzQxMDE@._V1_SX300.jpg"
// }

router.post('/', movieValidator, async (req, res, next) => {
  try {
    const validationErrors = validationResult(req)
    
    if(!validationErrors.isEmpty){
      const error = new Error ()
      error.httpStatusCode = 400
      error.message = validationErrors
      next(error)
    }

    const media = await fs.readJson(mediaJson)
    const newMedium = {
      ...req.body,
      imdbID: uniqid(),
    }
    media.push(newMedium)
    await fs.writeJson(mediaJson, media)
    res.status(201).send('Data send ', newMedium)
  } catch (error) {
    console.lof(error)
    next(error)
  }
})

router.put('/:imdbID', async (req, res, next) => {
  try {
    const media = await fs.readJson(mediaJson)
    const selectedMedium = media.find(medium => medium.imdbID === req.params.imdbID)
    
    if(!selectedMedium) {
      const error = new Error({ errMsg: "Medium not found!"})
      error.httpStatusCode = 404
      next(error)
    }

    const modMedia = media.filter(medium => medium.imdbID !== req.params.imdbID)

    const modMedium = {
      ...req.body,
      imdbID : req.params.imdbID,
      updatedAt : new Date ()
    }

    modMedia.push(modMedium)
    await fs.writeJson(mediaJson, modMedia)
    res.send(modMedium)
  } catch (error) {
    console.lof(error)
    next(error)
  }
})

router.delete('/:imdbID', async (req, res, next) => {
  try {
    const media = await fs.readJson(mediaJson)
    const findMedium = media.find(medium => medium.imdbID === req.params.imdbID)
    if (!findMedium) {
      const error = new Error({ errMsg: "Medium not found!"})
      error.httpStatusCode = 404
      next(error)
    }
    const modMedia = media.filter(medium => medium.imdbID !== req.params.imdbID)
    await fs.writeJson(mediaJson, modMedia)
    res.status(204)
  } catch (error) {

  }
})


export default router