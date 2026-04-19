"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

function IconCircle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  )
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      className="toaster group"
      icons={{
        success: (
          <IconCircle color="#22c55e">
            <CircleCheckIcon className="h-3.5 w-3.5 text-white" />
          </IconCircle>
        ),
        info: (
          <IconCircle color="#3b82f6">
            <InfoIcon className="h-3.5 w-3.5 text-white" />
          </IconCircle>
        ),
        warning: (
          <IconCircle color="#f59e0b">
            <TriangleAlertIcon className="h-3.5 w-3.5 text-white" />
          </IconCircle>
        ),
        error: (
          <IconCircle color="#ef4444">
            <OctagonXIcon className="h-3.5 w-3.5 text-white" />
          </IconCircle>
        ),
        loading: (
          <IconCircle color="#6b7280">
            <Loader2Icon className="h-3.5 w-3.5 text-white animate-spin" />
          </IconCircle>
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "mlj-toast",
          success: "mlj-toast--success",
          error: "mlj-toast--error",
          warning: "mlj-toast--warning",
          info: "mlj-toast--info",
          title: "mlj-toast__title",
          description: "mlj-toast__description",
          closeButton: "mlj-toast__close",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
