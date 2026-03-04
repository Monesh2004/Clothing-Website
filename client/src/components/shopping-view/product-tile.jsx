import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import StarRatingComponent from "../../components/common/star-rating"; 

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  reviews,
}) {
  // Calculate available sizes
  const sizes = product?.sizes || [];
  const availableSizes = sizes.filter(size => size.stock > 0);
  const sizeCount = availableSizes.length;
  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / reviews.length
    : 0;

  return (
    <Card className="w-full max-w-sm mx-auto">
      <div onClick={() => handleGetProductDetails(product?._id)}>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {`Only ${product?.totalStock} items left`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          ) : null}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-muted-foreground">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[16px] text-muted-foreground">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ₹{product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-semibold text-primary">
                ₹{product?.salePrice}
              </span>
            ) : null}
          </div>

          {/* Add the average review rating display here */}
          <div className="flex items-center gap-2 mt-2">
            <StarRatingComponent rating={averageReview} />
            <span className="text-muted-foreground">
              ({averageReview.toFixed(2)})
            </span>
          </div>
          {sizeCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Available in:</span>
              <div className="flex gap-1">
                {availableSizes.slice(0, 3).map((size) => (
                  <Badge key={size.name} variant="outline" className="text-xs">
                    {size.name}
                  </Badge>
                ))}
                {sizeCount > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{sizeCount - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Out Of Stock
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;