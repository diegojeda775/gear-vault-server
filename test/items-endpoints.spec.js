const knex = require('knex')
const fixtures = require('./items.fixtures')
const app = require('../src/app')
const xss = require('xss')
const supertest = require('supertest')
const { expect } = require('chai')




describe('Items Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })    

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('items').truncate())

    afterEach('cleanup', () => db('items').truncate())

    describe('Get /api/items', () => {

        context('Given there are no items', () => {
            it('it responds with 200 and an empty list', () =>{
                return supertest(app)
                    .get('/api/items')
                    .expect(200, [])
            })
        })

        context('Given there are items in the database', () => {
            const testItems = fixtures.makeItemsArray()

            const sanitizedItem = item => ({
                id: item.id,
                name: xss(item.name),
                brand: xss(item.brand),
                serial_number: xss(item.serial_number),
                price: item.price.toString(),
                purchase_date: new Date(item.purchase_date).toJSON(),
                purchase_place: xss(item.purchase_place)
            })

            beforeEach('insert items', () => {
                return db
                    .into('items')
                    .insert(testItems)
            })

            it('Gets items from the list', () => {
                return supertest(app)
                    .get('/api/items')
                    .expect(200, testItems.map(sanitizedItem))
            })
        })

        context('Given an xss attack on item', () => {
            const { maliciousItem, expectedItem } = fixtures.makeMaliciousItem()

            beforeEach('insert items', () => {
                return db
                    .into('items')
                    .insert([maliciousItem])
            })

            it('removes xss attack content', () => {
                return supertest(app)
                    .get('/api/items')
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].name).to.eql(expectedItem.name)
                        expect(res.body[0].brand).to.eql(expectedItem.brand)
                        expect(res.body[0].serial_number).to.eql(expectedItem.serial_number)
                        expect(res.body[0].purchase_place).to.eql(expectedItem.purchase_place)
                    })
            })

        })

    })

    describe('Post /api/items', () => {

        context('Responds with 400 invalid Price if not a number', () => {
            const newInvalidItem = {
                name: 'test-name',
                brand: 'test-brand',
                serial_number: 'ibgisuabr9359',
                price: 'invalid',
                purchase_date: '2020-02-19',
                purchase_place: 'test-place'
            }

            it('Given an invalid Price', () => {
                return supertest(app)
                    .post('/api/items')
                    .send(newInvalidItem)
                    .expect(400, {
                        error: { message: `'Price' must be a number`}
                    })
            })
        })

        context('Given there are no items in the database', () => {
            

            it('Adds item to database', () => {
                const newItem = {
                    name: 'test-name',
                    brand: 'test-brand',
                    serial_number: 'ibgisuabr9359',
                    price: 399.99,
                    purchase_date: '2020-02-19',
                    purchase_place: 'test-place'
                }

                return supertest(app)
                    .post('/api/items')
                    .send(newItem)
                    .expect(res => {
                        expect(res.body.name).to.eql(newItem.name)
                        expect(res.body.brand).to.eql(newItem.brand)
                        expect(res.body.serial_number).to.eql(newItem.serial_number)
                        expect(res.body.price).to.eql(newItem.price.toString())
                        expect(res.body.purchase_date).to.eql(new Date(newItem.purchase_date).toJSON())
                        expect(res.body.purchase_place).to.eql(newItem.purchase_place)
                        expect(res.body).to.have.property('id')
                    })
                    
            })

        })

    })

})
