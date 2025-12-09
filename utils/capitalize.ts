export default function capitalize(str: string) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string')
  }
  if (str.length === 0) {
    return ''
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}
