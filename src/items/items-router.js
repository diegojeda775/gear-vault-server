const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const ItemsService = require('./items-service')

const itemsRouter = express.Router()
const bodyParser = express.json()

const sanitizedItem = item => ({
    id: item.id,
    name: xss(item.name),
    brand: xss(item.brand),
    serial_number: xss(item.serial_number),
    price: item.price,
    purchase_date: item.purchase_date,
    purchase_place: xss(item.purchase_place)
})

itemsRouter
    .route('/')

    .get((req, res, next) => {
        ItemsService.getAllItems(req.app.get('db'))
        .then(items => {
            res.json(items.map(sanitizedItem))
        })
        .catch(next)
    })


module.exports = itemsRouter