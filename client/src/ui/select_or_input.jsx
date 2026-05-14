// ui/select_or_input.jsx
import React, { useState, useEffect } from "react"
import RangeSelect from "./range_select"
import InputField from "./input_field"

export default function SelectOrInput({ label, value, onChange, options = [], placeholder, optional, note }) {
    const isOther = value && !options.map(o => (typeof o === "object" ? o.value : o)).includes(value)
    const [custom, setCustom] = useState(isOther ? value : "")
    const [showInput, setShowInput] = useState(isOther)

    const allOptions = [...options, "Other (specify)"]

    const handleSelect = (v) => {
        if (v === "Other (specify)") {
            setShowInput(true)
            onChange(custom || "")
        } else {
            setShowInput(false)
            setCustom("")
            onChange(v)
        }
    }

    const handleCustom = (v) => {
        setCustom(v)
        onChange(v)
    }

    return (
        <div className="space-y-2">
            <RangeSelect
                label={label}
                value={showInput ? "Other (specify)" : value}
                onChange={handleSelect}
                options={allOptions}
                placeholder={placeholder}
                optional={optional}
                note={note}
            />
            {showInput && (
                <InputField
                    label={`Custom ${label}`}
                    value={custom}
                    onChange={handleCustom}
                    placeholder={`Type your ${label?.toLowerCase()}...`}
                    optional={optional} note={undefined} max={undefined} />
            )}
        </div>
    )
}