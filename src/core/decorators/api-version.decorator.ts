export const ApiVersion = (prefix: string) => {
  return (sufix: string) => `${prefix}/${sufix}`
}
