const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getTemplatesHandler,
  getUserTemplatesHandler,
  getDefaultTemplatesHandler,
  createTemplateHandler,
  getTemplateHandler,
  updateTemplateHandler,
  deleteTemplateHandler,
} = require('../controllers/templateController');

// Get all templates (user + default)
router.get('/', verifyToken, getTemplatesHandler);

// Get user templates only
router.get('/user', verifyToken, getUserTemplatesHandler);

// Get default templates
router.get('/defaults', getDefaultTemplatesHandler);

// Create template
router.post('/', verifyToken, createTemplateHandler);

// Get single template
router.get('/:id', verifyToken, getTemplateHandler);

// Update template
router.put('/:id', verifyToken, updateTemplateHandler);

// Delete template
router.delete('/:id', verifyToken, deleteTemplateHandler);

module.exports = router;
