export function Table({ columns, empty = 'Nothing to show yet.', renderRow, rows = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              {columns.map((column, index) => (
                <th className="px-4 py-3" key={`${column}-${index}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-neutral-500" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map(renderRow)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
