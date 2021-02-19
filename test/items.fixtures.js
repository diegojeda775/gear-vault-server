function makeItemsArray(){
    return [
        {
            id: 1,
            name: 'Mac Pro',
            brand: 'Apple',
            serial_number: 'afhjieugl568',
            price: 6600.99,
            purchase_date: '2020-11-18',
            purchase_place: 'Apple.com'
          },
          {
            id: 2,
            name: 'Fuji X-t4',
            brand: 'Fujifilm',
            serial_number: 'kuabfleubl768',
            price: 1600.99,
            purchase_date: '2021-01-11',
            purchase_place: 'Samy\'s Camera'
          },
          {
            id: 3,
            name: 'Sandisk Extreme SSD',
            brand: 'Sandisk',
            serial_number: 'balebfugb278',
            price: 159.59,
            purchase_date: '2020-12-24',
            purchase_place: 'Amazon.com'
          }
    ];
    
}

function makeMaliciousItem() {
    const maliciousItem = {
        id: 17,
        name: 'Naughty naughty very naughty <script>alert(\"xss\");</script>',
        brand: `Bad image <img src=\"https://url.to.file.which/does-not.exist\" onerror=\"alert(document.cookie);\">. But not <strong>all</strong> bad.`,
        serial_number: 'Naughty naughty very naughty <script>alert(\"xss\");</script>',
        price: 159.59,
        purchase_date: '2020-12-24',
        purchase_place: `Bad image <img src=\"https://url.to.file.which/does-not.exist\" onerror=\"alert(document.cookie);\">. But not <strong>all</strong> bad.`
     
    }
    const expectedItem = {
      ...maliciousItem,
      name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      brand: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
      serial_number: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      purchase_place: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousItem,
      expectedItem
    }
  }

  module.exports = {
      makeMaliciousItem,
      makeItemsArray
  }