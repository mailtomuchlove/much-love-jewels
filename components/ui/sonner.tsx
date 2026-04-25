"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Check, Info, AlertTriangle, X, Loader2 } from "lucide-react"

function IconCircle({ bgColor, children }: { bgColor: string; children: React.ReactNode }) {
  return (
    // Reduced size slightly to h-7 w-7 for better balance
    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${bgColor} mr-1`}>
      {children}
    </div>
  )
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      expand
      visibleToasts={6}
      className="toaster group"
      icons={{
        success: (
          <IconCircle bgColor="bg-[#47d764]">
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />
          </IconCircle>
        ),
        info: (
          <IconCircle bgColor="bg-[#2f86eb]">
            <Info className="h-3.5 w-3.5 text-white" strokeWidth={4} />
          </IconCircle>
        ),
        warning: (
          <IconCircle bgColor="bg-[#ffc021]">
            <AlertTriangle className="h-3.5 w-3.5 text-white" strokeWidth={4} />
          </IconCircle>
        ),
        error: (
          <IconCircle bgColor="bg-[#ff355b]">
            <X className="h-3.5 w-3.5 text-white" strokeWidth={4} />
          </IconCircle>
        ),
        loading: (
          <IconCircle bgColor="bg-gray-400">
            <Loader2 className="h-3.5 w-3.5 text-white animate-spin" strokeWidth={4} />
          </IconCircle>
        ),
      }}
      toastOptions={{
        classNames: {
          // Added !important flags to ensure layout isn't broken by Sonner defaults
          toast: "group !bg-white !rounded-lg !p-4 !shadow-xl !border-none !relative !overflow-hidden !flex !items-center !gap-4 !min-h-[64px] before:content-[''] before:absolute before:left-0 before:inset-y-0 before:w-[6px] !pl-6",
          
          success: "before:bg-[#47d764]",
          error: "before:bg-[#ff355b]",
          warning: "before:bg-[#ffc021]",
          info: "before:bg-[#2f86eb]",
          
          // Clear default margins on text to prevent overlap
          title: "!text-gray-900 !font-bold !text-[15px] !m-0 !p-0",
          description: "!text-gray-500 !text-xs !font-medium !m-0 !p-0 !mt-0.5",
          
          closeButton: "!text-gray-400 hover:!text-gray-900 !border-none !opacity-0 group-hover:!opacity-100 !transition-opacity",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }