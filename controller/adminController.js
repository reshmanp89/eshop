 const Category=require('../models/category')
const User=require('../models/user')
const Product=require('../models/product')
const multer=require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "--" + file.originalname);
    },
  });
exports.adminLogin =(req,res)=>{
    res.render('admin')
}
exports.uploadOptions = multer({ storage: storage });
exports.adminAuthenticate=async (req,res)=>{
    try{
      const{email,password}=req.body;
      if(email === 'npreshmanp@gmail.com' && password ==='reshma123'){
        req.session.adminLoggedIn=true;
        res.redirect('/admin/dashboard')
      }
      else{
        res.render('admin',{error:'Invalid username and password'})
      }
      
    }
    catch(err){
      res.status(500).render('admin',{error:'server error'})
    }
  
  
  }

  exports.adminDashboard=(req,res)=>{
    res.render('adminDashboard')
  }
  //user management // list user
 
exports.listUser= async(req,res)=>{
    try{

         const users= await User.find()
         if(users)
         {
            const verifiedUser= users.filter(user=>user.is_varified === true)
            res.render('userManagement',{users:verifiedUser})
         }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('internal server error')
    }
}
//block unblock user

exports.blockUser= async (req,res)=>{
  const userId=req.params.id;
  console.log(userId);
    try{

        const user=await User.findById(userId)
        user.blocked=!user.blocked;
        await user.save()
       res.status(200).redirect('/admin/userManagement')
    }
    catch(err){
        res.status(500).send('internal server error')
    }
}
//category



//addcategory
exports.addCategory=async(req,res)=>{

const {name}=req.body;
try{
    const existCategory = await Category.findOne({name:{$regex:new RegExp('^' +name +'$'),$options:'i'}})
    if (existCategory){
        const categories = await Category.find();
        return res.status(400).render('category',{categories,message:"The category already exist"})
    }
    const newCategory= new Category({name});
    await newCategory.save();
    const categories = await Category.find();
    return res
      .status(200)
      .render('category', { categories, message: 'Category added successfully' });
}
catch(err)
{
    console.log(err);
    res.status(500).send('internal server error')

}

}

//getcategory
exports.getCategory= async (req,res)=>{
    try{
       const categories= await Category.find();
       return res.render('category',{categories})
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('internal server error')
    }

    res.render('category')
}
//getcategorybyId
exports.getCategoryId= async (req,res)=>
{

    // console.log(req.params.id);
    try{
       const categoryId= req.params.id;

       const category= await Category.findById(categoryId)
       return res.status(200).render('editCategory',{category})
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send('internal server error')
    }
}

//editcategory

exports.editCategory =async(req,res)=>{
console.log(req.body);
const categoryId= req.params.id;
console.log(categoryId);
const name=req.body.name;
console.log(name);
try{
    const existCategory = await Category.findOne({name:{$regex:new RegExp('^' +name +'$'),$options:'i'}})
    if(existCategory)
    {
        return res.redirect('/admin/categoryManagement')
    }
    const updatedCategory={
        name
    }
    // console.log(updatedCategory);
  const category= await Category.findByIdAndUpdate(categoryId,updatedCategory,{new:true})

//   console.log(category);
     res.status(200).redirect('/admin/categoryManagement')
}
catch(err)
{
    console.log(err);
    res.status(500).send("internal server error")

}

}
//list and unlist category

exports.deleteCategory= async (req,res)=>{
    const categoryId=req.params.id;
    try{
     const category=await Category.findById(categoryId)
     category.blocked=!category.blocked;
     await category.save()
     res.status(200).redirect('/admin/categoryManagement')

    }
    catch(err)
    {
        res.status(500).send('internal server error')
    }
}
//product management

exports.getProducts=async(req,res)=>{
    res.render('productManagement')
}

exports.showAddform= async(req,res)=>
  {
    try{
        const categories= await Category.find()
        res.render('addProduct',{categories})
    }
    catch(err)
    {
   console.log(err);
   res.status(500).send('internal server error')
    }
  }
  //addProduct

  exports.addProduct = async (req, res) => {
    // console.log(req.body);
  
    // console.log(req.file.fileName);
    // const fileName = req.file.filename;
    const basePath = `/uploads/`;
    //find the category by name
    console.log(req.body.category);
    const category = await Category.findOne({ name: req.body.category });
    console.log(category);
  
    // if (!category) {
    //   return res.status(400).render("product", { data: "category is not found" });
    // }
    
    //process multiple image 
    const images=req.files.images.map(file=>basePath+file.filename);
  
    
    const product = {
      productName: req.body.productName,
      description: req.body.description,
      // image: `${basePath}${fileName}`,
      image:basePath+req.files.image[0].filename,
      images: images,
      brand: req.body.brand,
      price: req.body.price,
      category: category._id,
      quantity: req.body.quantity,
      rating: req.body.rating,
      dateCreated: req.body.dateCreated,
    };
  
  
    const newProduct = Product.insertMany(product);
       console.log(newProduct);
  
    // res.status(200).render("product", { data: "product addeded" });
    res.status(200).redirect("/admin/product");
    // res.send('product added')
  
    if (!newProduct)
      return res
        .status(500)
        .render("addProduct", { data: "the product cannot be created" });
  };