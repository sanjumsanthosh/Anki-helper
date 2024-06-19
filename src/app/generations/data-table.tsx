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
import { useSearchParams } from 'next/navigation';
import { Logger } from "@/lib/logger"
import { Post, Tag } from "@prisma/client"


const filterTofirstNChars = (str: string, n: number) => {
    return str.length > n ? str.substr(0, n-1) + '...' : str;
}

const emailFormat = (str: string, n: number) => {
    return filterTofirstNChars(str.replace(/(^\w+:|^)\/\//, ''), n);
}


export const columns: ColumnDef<({tags: Tag[]}&Post)>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
            <Link href={`/gpt-reading-list?id=${row.getValue("id")}`} target="_blank" passHref>
                {row.getValue("id")}
            </Link>
        ),
    },
    {
      accessorKey: "content",
      header: "Data",
      cell: ({ row }) => {
          const tags = (row.getValue("tags") as Tag[]).map(tag => tag.tag).join(', ')
          return (
            <div className="flex space-x-2" title={filterTofirstNChars(row.getValue("content"), 150)}>
              {tags && <Badge variant="tag">{tags}</Badge>}
              <span className="max-w-[500px] truncate font-medium">
                {filterTofirstNChars(row.getValue("content"), 60)}
              </span>
            </div>
          )
        },
        filterFn: (row, id, value) => {
            return (value === '' || (row.getValue(id) as string).includes(value) || (row.getValue("title") as string).includes(value));        }
      },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        return (
          <Link href={row.getValue("url")} target="_blank" passHref>
                    <div className="lowercase" title={row.getValue("url")}>
                        {row.getValue("title")}
                    </div>
          </Link>
        );
      }
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
      cell: ({ row }) => {
        return (
          <Link href={row.getValue("url")} target="_blank" passHref>
                    <div className="lowercase" title={row.getValue("url")}>
                        {emailFormat(row.getValue("url"),20)}
                    </div>
          </Link>
        );
      }
  },
    {
        accessorKey: "tags",
        header: "Tags",
        filterFn: (row, id, value: string[]) => {
          const individualTags = (row.getValue(id) as Tag[])?.map(tag => tag.tag) || []
          return individualTags.some((tag) => value.includes(tag))
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
          Logger.log(row.getValue(id), value)
          return value.includes(row.getValue(id) ? "Read" : "Unread") || value.length === 0
        }
    }
]

interface GeneratedDataTableProps {
    getServerGenerations: () => Promise<({tags: Tag[]}&Post)[]>;
}

export function GeneratedDataTable({getServerGenerations}: GeneratedDataTableProps) {

    const [data, setData] = React.useState<({tags: Tag[]}&Post)[]>([])
    const [tagList, setTagList] = React.useState<Tag[]>([])
    const searchParam = useSearchParams();
    const columnSearchParam = tryParseOrDefault(searchParam.get('columnFilters'), '[{"id": "read","value": []}]');
    const columnVisibilitySearchParam = tryParseOrDefault(searchParam.get('columnVisibility'), '{"date":false,"tags":false, "url":false}');
    const sortingSearchParam = tryParseOrDefault(searchParam.get('sorting'), '[]');
    const rowSelectionSearchParam = tryParseOrDefault(searchParam.get('rowSelection'), '{}');
    
    const [rowSelection, setRowSelection] = React.useState(rowSelectionSearchParam)
    const [columnVisibility, setColumnVisibility] = React.useState(columnVisibilitySearchParam)
    const [columnFilters, setColumnFilters] = React.useState(columnSearchParam)
    const [sorting, setSorting] = React.useState(sortingSearchParam)

   const getGenerations = async () => {
      const response = await getServerGenerations();
      setData(response);
    }

    const processTagList = async () => {
      const response = await getTagList();
      setTagList(response);
  }

    React.useEffect(() => {
        const fetchData = async () => {
            await processTagList();
            await getGenerations();
        };

        fetchData();
    }, []);

    React.useEffect(() => {
      setRowSelection(rowSelection);
      setColumnVisibility(columnVisibility);
      setColumnFilters(columnFilters);
      setSorting(sorting);
      const newStateQuery = serializeState({
        columnFilters: JSON.stringify(columnFilters),
        columnVisibility: JSON.stringify(columnVisibility),
        sorting: JSON.stringify(sorting),
        rowSelection: JSON.stringify(rowSelection),
      });
      const newUrl = `${window.location.pathname}?${newStateQuery}`;
      window.history.replaceState({}, '', newUrl);

    }, [rowSelection, columnVisibility, columnFilters, sorting])


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


function serializeState(state: { [s: string]: string } | ArrayLike<string>) {
  return Object.entries(state)
   .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
   .join('&');
}

function tryParseOrDefault(value: string | null, defaultValue: string) {
  try {
    return JSON.parse(value || defaultValue);
  } catch (e) {
    return defaultValue;
  }
} 