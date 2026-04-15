// ----------------------------------------------------------------------

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy];
  const valB = b[orderBy];

  if (valA === null || valA === undefined) return 1;
  if (valB === null || valB === undefined) return -1;

  if (typeof valA === 'number' && typeof valB === 'number') {
    return valB - valA; // Numeric comparison (descending)
  }

  if (typeof valA === 'string' && typeof valB === 'string') {
    return valB.localeCompare(valA, undefined, { sensitivity: 'base' }); // String comparison (case-insensitive)
  }

  return 0;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => -descendingComparator(a, b, orderBy)
    : (a, b) => descendingComparator(a, b, orderBy);
}
