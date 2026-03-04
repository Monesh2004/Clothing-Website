import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, deleteFeatureImage, getFeatureImages } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Trash2 } from "lucide-react";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { toast } = useToast();

  function handleUploadFeatureImage() {
    if (!uploadedImageUrl) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
        toast({
          title: "Success",
          description: "Feature image added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add feature image",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      toast({
        title: "Error",
        description: "Failed to add feature image",
        variant: "destructive",
      });
    });
  }

  function handleDeleteFeatureImage(id) {
    if (window.confirm("Are you sure you want to delete this feature image?")) {
      dispatch(deleteFeatureImage(id))
        .then((data) => {
          if (data.payload.success) {
            dispatch(getFeatureImages());
            toast({
              title: "Success",
              description: "Feature image deleted successfully",
            });
          } else {
            toast({
              title: "Error",
              description: data.payload.message || "Failed to delete feature image",
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          console.error("Delete error:", error);
          toast({
            title: "Error",
            description: "Failed to delete feature image",
            variant: "destructive",
          });
        });
    }
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Feature Images Management</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isCustomStyling={true}
          />
          <Button 
            onClick={handleUploadFeatureImage} 
            className="mt-5 w-full"
            disabled={imageLoadingState}
          >
            {imageLoadingState ? "Uploading..." : "Upload"}
          </Button>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Current Feature Images</h2>
            <div className="space-y-6">
              {featureImageList && featureImageList.length > 0
                ? featureImageList.map((featureImgItem) => (
                    <div key={featureImgItem._id} className="relative group">
                      <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
                        <img
                          src={featureImgItem.image}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          alt="Feature"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                : <p className="text-gray-500 text-center">No feature images found. Add some images to get started.</p>}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default AdminDashboard;
