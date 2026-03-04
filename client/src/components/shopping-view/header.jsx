import { HousePlug, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";

const categorySuggestions = {
  Products: {
    brands: ["Puma", "Reebok", "Under Armour", "Uniqlo"],
    products: ["T-Shirts", "Jeans", "Formal Wear", "Outerwear"],
  },
  Men: {
    brands: ["Nike", "Adidas", "Levi's", "Tommy Hilfiger"],
    products: ["Jackets", "Sneakers", "Jeans", "Watches"],
  },
  Women: {
    brands: ["Zara", "H&M", "Forever 21", "Mango"],
    products: ["Dresses", "Handbags", "Heels", "Jewelry"],
  },
  Kids: {
    brands: ["GAP Kids", "Carter's", "Mothercare", "Uniqlo Kids"],
    products: ["Toys", "Shoes", "T-shirts", "School Bags"],
  },
  Accessories: {
    brands: ["Ray-Ban", "Michael Kors", "Fossil", "Coach"],
    products: ["Sunglasses", "Wallets", "Belts", "Hats"],
  },
};

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hoveredItem, setHoveredItem] = useState(null);

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          className="relative group"
          onMouseEnter={() => setHoveredItem(menuItem.label)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Label
            onClick={() => handleNavigate(menuItem)}
            className="text-sm font-medium cursor-pointer hover:text-blue-500 hover:bg-gray-200 px-3 py-2 rounded transition"
          >
            {menuItem.label}
          </Label>

          {/* Show suggestion only when hovered */}
          {categorySuggestions[menuItem.label] && hoveredItem === menuItem.label && (
            <div className="absolute left-0 top-full w-80 bg-white border border-gray-300 shadow-lg opacity-100 scale-100 transition-all duration-300 z-20 rounded-lg p-5">
              <div className="animate-fadeInUp">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg border-b pb-2">
                  Popular Brands
                </h3>
                <ul className="text-sm space-y-2 mb-4">
                  {categorySuggestions[menuItem.label].brands.map((brand) => (
                    <li
                      key={brand}
                      className="hover:text-blue-500 transition cursor-pointer"
                    >
                      {brand}
                    </li>
                  ))}
                </ul>
                <h3 className="font-semibold text-gray-800 mb-3 text-lg border-b pb-2">
                  Popular Products
                </h3>
                <ul className="text-sm space-y-2">
                  {categorySuggestions[menuItem.label].products.map(
                    (product) => (
                      <li
                        key={product}
                        className="hover:text-blue-500 transition cursor-pointer"
                      >
                        {product}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
    dispatch(clearCart()); // Reset the cart items on logout
  }

  function handleCartClick() {
    if (!isAuthenticated) {
      navigate("/auth/login"); // Redirect to login if not authenticated
    } else {
      setOpenCartSheet(true);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={handleCartClick}
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
            {isAuthenticated ? cartItems?.items?.length || 0 : 0}
          </span>
          <span className="sr-only">User cart</span>
        </Button>
        {isAuthenticated && (
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            cartItems={
              cartItems && cartItems.items && cartItems.items.length > 0
                ? cartItems.items
                : []
            }
          />
        )}
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black">
            <AvatarFallback className="bg-black text-white font-extrabold">
              {isAuthenticated ? user?.userName[0].toUpperCase() : "G"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          {isAuthenticated ? (
            <>
              <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/shop/account")}>
                <UserCog className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => navigate("/auth/login")}>
              <LogOut className="mr-2 h-4 w-4" />
              Login
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2">
          <HousePlug className="h-6 w-6" />
          <span className="font-bold">Fabrica</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
