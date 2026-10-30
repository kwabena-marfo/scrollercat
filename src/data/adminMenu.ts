import {
  BsBoxSeam,
  BsCreditCard,
  BsGrid1X2,
  BsPeople,
  BsReceipt,
  BsSearchHeart,
  BsTruck,
} from "react-icons/bs";

export const adminMenu = [
  { href: "/admin", label: "Dashboard", icon: BsGrid1X2 },
  { href: "/admin/orders", label: "Orders", icon: BsReceipt },
  { href: "/admin/requests", label: "Sourcing requests", icon: BsSearchHeart },
  { href: "/admin/products", label: "Products", icon: BsBoxSeam },
  { href: "/admin/customers", label: "Customers", icon: BsPeople },
  { href: "/admin/shipping", label: "Delivery options", icon: BsTruck },
  { href: "/admin/payments", label: "Payments", icon: BsCreditCard },
];
