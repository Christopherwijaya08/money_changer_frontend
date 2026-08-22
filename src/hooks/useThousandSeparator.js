// Native <input type="number"> can't display "1.000.000" (browsers reject
// non-digit characters in it), so formatted number fields must be type="text"
// with inputMode="numeric" instead. This hook bridges that: give it a plain
// numeric value + onChange (e.g. an RHF Controller's `field`), get back a
// formatted display string and a change handler that unformats before
// calling onChange, so form state stays a clean number.
export function useThousandSeparator(value, onChange) {
  const display = value === '' || value == null ? '' : Number(value).toLocaleString('id-ID')

  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, '')
    onChange(digits === '' ? '' : Number(digits))
  }

  return [display, handleChange]
}
