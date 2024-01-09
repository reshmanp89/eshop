const express=require('express')
const router=express.Router()
const adminController=require('../controller/adminController')

router.get('/',adminController.adminLogin)
router.post('/',adminController.adminAuthenticate)
router.get('/dashboard',adminController.adminDashboard)
router.get('/userManagement',adminController.listUser)
router.post('/blockUser/:id',adminController.blockUser)
router.get('/categoryManagement',adminController.getCategory)
router.post('/addCategory',adminController.addCategory)
router.get('/editCategory/:id',adminController.getCategoryId)
router.post('/editCategory/:id',adminController.editCategory)
router.post('/deleteCategory/:id',adminController.deleteCategory)
router.get('/product',adminController.getProducts)
router.get('/addProduct',adminController.showAddform)
router.post('/addProduct',adminController.uploadOptions.fields([{name:'image',maxCount:1},{name:'images',maxCount:10}]),adminController.addProduct)


module.exports=router;