export const convertType = (value: string): unknown => {
  const ofNumberTypeValue = Number(value)

  return !isNaN(ofNumberTypeValue)
    ? ofNumberTypeValue
    : value === 'undefined'
      ? undefined
      : value === 'null'
        ? null
        : value === 'true'
          ? true
          : value === 'false'
            ? false
            : value
}
