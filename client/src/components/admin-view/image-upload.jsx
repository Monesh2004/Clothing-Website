import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "../ui/use-toast";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);
  const { toast } = useToast();

  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(selectedFile);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(droppedFile);
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setUploadedImageUrl("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    setImageLoadingState(true);
    const data = new FormData();
    data.append("file", imageFile);
    
    try {
      const response = await axios.post(
        "http://localhost:5000/api/common/feature/upload",
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.imageUrl);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        throw new Error(response.data?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to upload image",
        variant: "destructive",
      });
      setImageFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } finally {
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) {
      uploadImageToCloudinary();
    }
  }, [imageFile]);

  return (
    <div
      className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}
    >
      <Label className="text-lg font-semibold mb-2 block">Upload Image</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          isEditMode ? "opacity-60" : ""
        } border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
          accept="image/*"
        />
        {!imageFile && !uploadedImageUrl ? (
          <Label
            htmlFor="image-upload"
            className={`${
              isEditMode ? "cursor-not-allowed" : ""
            } flex flex-col items-center justify-center h-32 cursor-pointer`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to upload image</span>
            <span className="text-sm text-muted-foreground">Max size: 5MB</span>
          </Label>
        ) : imageLoadingState ? (
          <div className="flex flex-col items-center justify-center h-32">
            <Skeleton className="h-10 w-full bg-gray-100" />
            <span className="mt-2">Uploading image...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="flex items-center space-x-2">
              <FileIcon className="w-4 h-4" />
              <span className="text-sm truncate max-w-[200px]">
                {imageFile?.name || "Uploaded Image"}
              </span>
            </div>
            {!isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="h-8 w-8 p-0"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      {uploadedImageUrl && (
        <div className="mt-4">
          <img
            src={uploadedImageUrl}
            alt="Product"
            className="max-h-48 rounded-lg mx-auto"
          />
        </div>
      )}
    </div>
  );
}

export default ProductImageUpload;