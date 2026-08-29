import   mongoose  from 'mongoose';
import { lowercase } from 'zod';
import slugify from "slugify";

const productSchema = mongoose.Schema({
     title:{
          type: String,
          required: true,
          trim : true,
     },
     slug:{
          type: String,
          // required:true,
          lowercase:true,
          unique:true,
     },
     description:{
          type: String,
          required: true
     },
     category:{
          type: String,
          required:true,
          lowercase: true,
     },
     price:{
          type:Number,
          required:true,
          min:0,
     },
     stock:{
          type:Number,
          required:true,
          min : 0,
          default:0,
     },
     isActive:{
          type:Boolean,
          default:true,
     },
     images:[{
          url:String,
          publicId:String,
          isPrimary:{
               type:Boolean,
               default:false,
          },
     },]
},{timestamps:true});

productSchema.index({
     title: "text",
     description:"text",
})

productSchema.index({
     category:1,
     isActive:1,
})

productSchema.index({
     price:1,

})

productSchema.pre(
     "save",

     function(){
          if(this.isModified("title")){
               this.slug=slugify(this.title,
                    {
                         lower: true,
                         strict:true,
                    }
               )
          }
          // next();
     }
)

const Product = mongoose.model("Product",productSchema);

export default Product;
