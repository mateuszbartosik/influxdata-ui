export const calcOffset = (page: number, size: number, total: number) =>
  Math.min(Math.max(0, (page - 1) * size), total - 1)

export const calcNextPageOffset = (
  offset: number,
  size: number,
  total: number
) => (total <= offset + size ? offset : offset + size)

export const calcPrevPageOffset = (offset: number, size: number) =>
  Math.max(offset - size, 0)
