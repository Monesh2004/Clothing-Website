import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import SizeManagement from "@/components/admin-view/size-mangement";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: 0,
  averageReview: 0,
  sizes: [
    { name: 'S', stock: 0 },
    { name: 'M', stock: 0 },
    { name: 'L', stock: 0 },
    { name: 'XL', stock: 0 },
    { name: 'XXL', stock: 0 }
  ]
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    if (!uploadedImageUrl && !currentEditedId) {
      toast({
        title: "Error",
        description: "Please upload a product image first",
        variant: "destructive",
      });
      return;
    }

    // Convert size stock values to numbers and validate
    const processedSizes = formData.sizes.map(size => ({
      name: size.name,
      stock: parseInt(size.stock) || 0
    }));

    // Validate required fields
    const requiredFields = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      price: formData.price
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Missing required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Validate at least one size has stock
    if (!processedSizes.some(size => size.stock > 0)) {
      toast({
        title: "Error",
        description: "At least one size must have stock greater than 0",
        variant: "destructive",
      });
      return;
    }

    // If we're editing and no new image was uploaded, use the existing image
    const imageUrl = currentEditedId && !uploadedImageUrl 
      ? formData.image 
      : uploadedImageUrl;

    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Product image is required",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      brand: formData.brand.trim(),
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      sizes: processedSizes,
      image: imageUrl,
      totalStock: processedSizes.reduce((sum, size) => sum + size.stock, 0)
    };

    console.log("Submitting product data:", submissionData);

    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData: submissionData,
        })
      ).then((result) => {
        if (result?.payload?.success) {
          dispatch(fetchAllProducts());
          setFormData(initialFormData);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setUploadedImageUrl("");
          setImageFile(null);
          toast({
            title: "Success",
            description: "Product updated successfully",
          });
        } else {
          toast({
            title: "Error",
            description: result.payload?.message || "Failed to update product",
            variant: "destructive",
          });
        }
      });
    } else {
      dispatch(addNewProduct(submissionData))
        .then((result) => {
          if (result?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setUploadedImageUrl("");
            setFormData(initialFormData);
            toast({
              title: "Success",
              description: "Product added successfully",
            });
          } else {
            toast({
              title: "Error",
              description: result.payload?.message || "Failed to add product",
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          console.error("Error adding product:", error);
          toast({
            title: "Error",
            description: error?.response?.data?.message || "Failed to add product. Please try again.",
            variant: "destructive",
          });
        });
    }
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({
          title: "Product deleted successfully",
        });
      }
    });
  }

  function isFormValid() {
    const isBasicInfoValid = 
      formData.title &&
      formData.description &&
      formData.category &&
      formData.brand &&
      formData.price;

    const hasSizeWithStock = formData.sizes.some(size => size.stock > 0);
    
    // For new products, require image. For edits, it's optional
    const isImageValid = currentEditedId !== null || uploadedImageUrl;

    return isBasicInfoValid && hasSizeWithStock && isImageValid && !imageLoadingState;
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setImageFile(null);
          setUploadedImageUrl("");
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <SheetDescription>
              {currentEditedId !== null 
                ? "Update the product details below. All fields are required except Sale Price."
                : "Fill in the product details below. All fields are required except Sale Price."}
            </SheetDescription>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              formControls={addProductFormElements.filter(control => control.name !== 'totalStock')}
              showButton={false}
            />
            <SizeManagement formData={formData} setFormData={setFormData} />
            <div className="mt-4">
              <Button 
                type="button" 
                className="w-full" 
                onClick={onSubmit}
                disabled={!isFormValid()}
              >
                {currentEditedId !== null ? "Edit Product" : "Add Product"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;