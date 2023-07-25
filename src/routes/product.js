import { Router } from 'express';

import Product from '../controller/product';
const router = Router();
router.route('/product').post(Product.addProduct).get(Product.getAllProduct)
router.route('/product/:id').get(Product.getProductById).delete(Product.deleteProduct).patch(Product.updateProduct)

export default router;