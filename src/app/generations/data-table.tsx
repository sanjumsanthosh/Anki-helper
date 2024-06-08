"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import DataTableToolbar from "./data-table-toolbar"


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DBRecordType, getTagList, tagListType } from "../actions"
import Link from "next/link"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableColumnHeader } from "./data-table-column-header"
import { Badge } from "@/components/ui/badge"


const filterTofirstNChars = (str: string, n: number) => {
    return str.length > n ? str.substr(0, n-1) + '...' : str;
}

const emailFormat = (str: string, n: number) => {
    return filterTofirstNChars(str.replace(/(^\w+:|^)\/\//, ''), n);
}


export const columns: ColumnDef<DBRecordType>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
            <Link href={`/gpt-reading-list?id=${row.getValue("id")}`} passHref>
                {row.getValue("id")}
            </Link>
        ),
    },
    {
      accessorKey: "data",
      header: "Data",
      cell: ({ row }) => {
          const tags = row.getValue("tags") as string;
          return (
            <div className="flex space-x-2" title={filterTofirstNChars(row.getValue("data"), 150)}>
              {tags && <Badge variant="tag">{tags}</Badge>}
              <span className="max-w-[500px] truncate font-medium">
                {filterTofirstNChars(row.getValue("data"), 60)}
              </span>
            </div>
          )
        },
  },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
            <div className="capitalize">
                {(row.getValue("date") as string).replace(/T.*/, '')}
            </div>
        ),
    },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => 
          <div className="lowercase" title={row.getValue("url")}>
              {emailFormat(row.getValue("url"),20)}
          </div>,
  },
    {
        accessorKey: "tags",
        header: "Tags",
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
        cell: ({ row }) => (
            <div className="capitalize">
                {row.getValue("tags")||"-"}
            </div>
        ),
    },
    {
        accessorKey: "read",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Read" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">
              {row.getValue("read") ? "✅" : "❌"}
            </div>
        ),
        filterFn: (row, id, value) => {
          return value.includes((row.getValue(id) as number).toString())
        }
    }
]

interface GeneratedDataTableProps {
    getServerGenerations: () => Promise<DBRecordType[]>;
}

export function GeneratedDataTable({getServerGenerations}: GeneratedDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({date: false, tags: false})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [{"id": "read","value": ["0"]}])
  const [sorting, setSorting] = React.useState<SortingState>([])
    const [data, setData] = React.useState<DBRecordType[]>([])
    const [tagList, setTagList] = React.useState<tagListType>([])

   const getGenerations = async () => {
        const response = await getServerGenerations();
        setData(response);
    }

    const processTagList = async () => {
      const response = await getTagList();
      setTagList(response);
  }

    React.useEffect(() => {
        getGenerations();
        processTagList();
    }, [])


    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
        columnVisibility,
        rowSelection,
        columnFilters,
      },
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
    })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <DataTableToolbar table={table} tags={tagList} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

