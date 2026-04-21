import express from 'express';
import calculatorRoutes from './calculatorRoutes.js';

const router = express.Router();

router.use('/', calculatorRoutes);

export { router as mainRouter };

