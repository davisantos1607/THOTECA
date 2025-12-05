const Book = require('../models/book.model');

class BookController {
    static async getAllBooks(req, res) {
        try {
            const { search, genre, page, limit, sort, order } = req.query;
            const result = await Book.getAllBooks({ search, genre, page: Number(page) || 1, limit: Number(limit) || 10, sort, order });
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching books', error: error.message });
        }
    }

    static async getBookById(req, res) {
        try {
            const book = await Book.getBookById(req.params.id);
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json(book);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching book', error: error.message });
        }
    }

    static async createBook(req, res) {
        try {
            const bookData = {
                ...req.body,
                cover_image: req.file ? req.file.filename : null
            };
            const result = await Book.createBook(bookData);
            res.status(201).json({ message: 'Book created successfully', id: result.insertId });
        } catch (error) {
            res.status(500).json({ message: 'Error creating book', error: error.message });
        }
    }

    static async updateBook(req, res) {
        try {
            const bookData = {
                ...req.body,
                cover_image: req.file ? req.file.filename : req.body.cover_image
            };
            const result = await Book.updateBook(req.params.id, bookData);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json({ message: 'Book updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating book', error: error.message });
        }
    }

    static async deleteBook(req, res) {
        try {
            const result = await Book.deleteBook(req.params.id);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json({ message: 'Book deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting book', error: error.message });
        }
    }
}

module.exports = BookController;