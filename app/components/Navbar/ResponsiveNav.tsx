"use client";
import React, { useState } from "react";
import Navbar from "./Navbar";
import MobileNav from "./MobileNavbar";

export default function ResponsiveNav() {
  const [showNav, setShowNav] = useState(false);

  const openNavHandler = () => setShowNav(true);
  const closeNavHandler = () => setShowNav(false);

  return (
    <div>
      <Navbar openNav={openNavHandler} />
      <MobileNav
        showNav={showNav}
        closeNav={closeNavHandler}
      />
    </div>
  );
}