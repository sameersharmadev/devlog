import {search} from '../controllers/searchController.js'
import express from 'express'
const router=express.Router();
router.get('/',search)
export default router