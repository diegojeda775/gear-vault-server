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

    .post(bodyParser, (req, res, next) => {

        const { name, brand, serial_number, price, purchase_date, purchase_place } = req.body
        const newItem = { name, brand, serial_number, price, purchase_date, purchase_place }

        for (const field of ['name', 'serial_number', 'price', 'purchase_date']) {
            if (!newItem[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send({
                    error: { message: `'${field}' is required` }
                })
            }
        }

        const numPrice = +price
        
        if(isNaN(numPrice)) {
            logger.error(`Invalid price $'${price}' supplied`);
            return res.status(400).send({
                error: { message: `'Price' must be a number`}
            })
        }

        ItemsService.insertItem(
            req.app.get('db'),
            newItem
            )
            .then(item => {
                logger.info(`Item with id ${item.id} created`)
                res
                    .status(201)
                    .json(sanitizedItem(item))
            })
            .catch(next)
    })

itemsRouter
    .route('/:item_id')

    .all((req, res, next) => {
        const { item_id } = req.params
        
        ItemsService.getItemById(
            req.app.get('db'),
            item_id
        )
        .then(item => {
            if (!item) {
                logger.error(`Item with id ${item_id} not found.`)
                return res.status(404).json({
                  error: { message: `Item Not Found` }
                })
            }

            res.item = item
            next()
        })
        .catch(next)

    })

    .get((req, res) => {
        res.json(sanitizedItem(res.item))
    })

    .delete((req, res, next) => {
        const { item_id } = req.params

        ItemsService.deleteItem(
            req.app.get('db'),
            item_id
        )
        .then(dltd => {
            logger.info(`Item with id ${item_id} deleted.`)
            res.status(204)
                .end()
        })
        .catch(next)    
    })


module.exports = itemsRouter