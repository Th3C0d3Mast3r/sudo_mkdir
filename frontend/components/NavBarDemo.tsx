"use client";

import { BadgeQuestionMarkIcon, FileText, Home, User } from "lucide-react";
import { NavBar } from "./ui/tubelight-navbar";

export const NavbarDemo = () => {
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Questions", url: "/questions", icon: BadgeQuestionMarkIcon },
    { name: "Contact", url: "/", icon: User },
    { name: "Docs", url: "/", icon: FileText },
  ];

  return <NavBar items={navItems} />;
};
