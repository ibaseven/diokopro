"use client"

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

const Navbar = () => {
  return (
    <header className="">
      <div className="">
       
        <Separator orientation="vertical" className="" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              {/* <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink> */}
            </BreadcrumbItem>
            {/* <BreadcrumbSeparator className="hidden md:block" /> */}
            {/* <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem> */}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Suppression de LocaleLangageSelected */}
    </header>
  );
};

export default Navbar;