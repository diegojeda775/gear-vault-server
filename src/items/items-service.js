const ItemsService = {
    getAllItems(db) {
      return db('items')
        .select('*');
    },
  
    insertItem(db, data) {
      return db('items')
        .insert(data)
        .returning('*')
        .then(rows => rows[0]);
    },
  
    getItemById(db, id) {
      return db('items')
        .select('*')
        .where({ id })
        .first();
    },
  
    deleteItem(db, id) {
      return db('items')
        .where({ id })
        .delete();
    },
  
    updateItem(db, id, data) {
      return db('items')
        .where({ id })
        .update(data);
    }
  };
  
  module.exports = ItemsService;