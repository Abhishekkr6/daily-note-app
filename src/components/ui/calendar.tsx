// Simple Calendar wrapper for react-day-picker
import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/src/style.css"

// Use the DayPicker's props type to avoid implicit 'any'
export function Calendar(props: React.ComponentProps<typeof DayPicker>) {
  return <DayPicker {...props} />
}
