import { Router } from 'express';
import {
  analyzePostController,
  deleteAiProviderController,
  getAiProviderController,
  saveAiProviderController,
  transformSelectionController,
} from '../controllers/ai';

export const router = Router();

router.get('/provider', getAiProviderController);
router.post('/provider', saveAiProviderController);
router.delete('/provider', deleteAiProviderController);

router.post('/editor/analyze', analyzePostController);
router.post('/editor/transform-selection', transformSelectionController);
