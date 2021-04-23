import { Router } from 'express'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import fs from 'fs-extra'
import uniqid from 'uniqid'
import multer from 'multer'
import { check, validationResult } from 'express-validator'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import { v2 } from 'cloudinary'

const router = Router()

const movieValidator = [
  check("Title").exists().withMessage("The media's title is required"),
  check("Year").isInt().exists().withMessage("A year is required: YYYY"),
  check("Type").exists().withMessage("Let us know what type of media this is"),
];

const mediaJson = join(dirname(fileURLToPath(import.meta.url)), '../data/jsonData/media.json')

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: v2,
  params: {folder: 'img'},
})
const uploader = multer({storage: cloudinaryStorage})

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
    res.status(201).send(newMedium)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

router.post('/:imdbID', uploader.single('image'), async(req, res, next) => {
  try {
    const media = await fs.readJson(mediaJson)
    const mediumIdx = media.findIndex(medium => medium.imdbID === req.params.imdbID)
    if (mediumIdx !== -1) {
      const modMedia = media.filter(medium => medium.imdbID !== req.params.id)
      let selectedMedium = media.find(medium => medium.imdbID === req.params.imdbID)
      selectedMedium.Poster = req.file.path
      modMedia.push(selectedMedium)
      await fs.writeJson(mediaJson, modMedia)
      res.send({
        selectedMedium
      })
    } else {
      const error = new Error({ errMsg: "Medium not found!"})
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

router.put('/:imdbID', async (req, res, next) => {
  try {
    const media = await fs.readJson(mediaJson)
    const mediumIdx = media.findIndex(medium => medium.imdbID === req.params.imdbID)
    
    if(mediumIdx <= -1) {
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
    const mediumIdx = media.findIndex(medium => medium.imdbID === req.params.imdbID)
    if (mediumIdx <= -1) {
      const error = new Error({ errMsg: "Medium not found!"})
      error.httpStatusCode = 404
      next(error)
    } else {
      const modMedia = media.filter(medium => medium.imdbID !== req.params.imdbID)
      await fs.writeJson(mediaJson, modMedia)
      res.status(204).send()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})


export default router