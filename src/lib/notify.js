"use client";

import { toast } from "@/components/ui/toast";

const DEFAULT_TIMEOUT = 4000;
const ERROR_TIMEOUT = 6000;

export function notifySuccess(title, description) {
  toast.add({
    type: "success",
    title,
    description,
    timeout: DEFAULT_TIMEOUT,
  });
}

export function notifyError(title, description) {
  toast.add({
    type: "error",
    title,
    description,
    timeout: ERROR_TIMEOUT,
  });
}

export function notifyInfo(title, description) {
  toast.add({
    type: "info",
    title,
    description,
    timeout: DEFAULT_TIMEOUT,
  });
}
