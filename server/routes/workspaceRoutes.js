const express = require('express');
const { getUserWorkspaces, addMemberToWorkspace } = require('../controllers/workspaceControler');
const { protect } = require('../middlewares/authMiddlewares');

const workspaceRouter = express.Router();

workspaceRouter.get('/',protect, getUserWorkspaces);
workspaceRouter.post('/add-member', protect, addMemberToWorkspace)

module.exports = workspaceRouter; 