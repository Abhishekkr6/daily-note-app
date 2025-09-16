// Simple Calendar wrapper for react-day-picker
import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/src/style.css"

export function Calendar(props) {
  return <DayPicker {...props} />
}
